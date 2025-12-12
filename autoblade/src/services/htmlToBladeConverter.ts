/**
 * Service for converting HTML files to Blade templates
 */

import * as vscode from 'vscode';
import { ConversionResult, ConversionConfig, AssetReference } from '../types';
import {
    readFileContent,
    writeFileContent,
    createBackup,
    deleteFile,
    renameFile,
    htmlToBladeFilePath,
    logger,
} from '../utils';
import {
    extractAssetReferences,
    replaceAssetReferences,
    convertCommentsToBladeComments,
    isValidHTML,
} from '../utils/parser';

export class HtmlToBladeConverter {
    /**
     * Convert a single HTML file to Blade template
     */
    async convertFile(
        filePath: string,
        config: ConversionConfig
    ): Promise<ConversionResult> {
        try {
            logger.info(`Converting file: ${filePath}`);
            
            // Read original content
            const originalContent = await readFileContent(filePath);
            
            // Validate HTML
            if (!isValidHTML(originalContent)) {
                throw new Error('Invalid HTML content');
            }
            
            // Create backup if enabled
            if (config.createBackup) {
                await createBackup(filePath);
                logger.info(`Backup created for: ${filePath}`);
            }
            
            // Convert content
            const { convertedContent, assetsConverted, commentsConverted } = 
                await this.transformContent(originalContent, config);
            
            // Generate new file path
            const newFilePath = htmlToBladeFilePath(filePath);
            
            // Write converted content to new file
            await writeFileContent(newFilePath, convertedContent);
            logger.success(`Blade file created: ${newFilePath}`);
            
            // Delete original HTML file
            await deleteFile(filePath);
            logger.info(`Original HTML file deleted: ${filePath}`);
            
            return {
                success: true,
                originalPath: filePath,
                newPath: newFilePath,
                assetsConverted,
                commentsConverted,
            };
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to convert ${filePath}`, error as Error);
            
            return {
                success: false,
                originalPath: filePath,
                error: errorMessage,
            };
        }
    }
    
    /**
     * Transform HTML content to Blade content
     */
    private async transformContent(
        content: string,
        config: ConversionConfig
    ): Promise<{
        convertedContent: string;
        assetsConverted: number;
        commentsConverted: number;
    }> {
        let transformedContent = content;
        let commentsConverted = 0;
        
        // Extract asset references
        const assetReferences = extractAssetReferences(transformedContent);
        const internalAssets = assetReferences.filter(ref => !ref.isExternal);
        
        // Replace asset references with Laravel asset() helper
        if (internalAssets.length > 0) {
            transformedContent = replaceAssetReferences(
                transformedContent,
                assetReferences,
                config.assetPathPrefix
            );
        }
        
        // Convert HTML comments to Blade comments if enabled
        if (config.preserveComments) {
            const { content: contentWithBladeComments, count } = 
                convertCommentsToBladeComments(transformedContent);
            transformedContent = contentWithBladeComments;
            commentsConverted = count;
        }
        
        return {
            convertedContent: transformedContent,
            assetsConverted: internalAssets.length,
            commentsConverted,
        };
    }
    
    /**
     * Preview conversion without actually converting the file
     */
    async previewConversion(
        filePath: string,
        config: ConversionConfig
    ): Promise<{
        originalContent: string;
        convertedContent: string;
        assetsConverted: number;
        commentsConverted: number;
    }> {
        const originalContent = await readFileContent(filePath);
        const { convertedContent, assetsConverted, commentsConverted } = 
            await this.transformContent(originalContent, config);
        
        return {
            originalContent,
            convertedContent,
            assetsConverted,
            commentsConverted,
        };
    }
}
