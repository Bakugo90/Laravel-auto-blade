/**
 * Command handler for converting all HTML files in a folder
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { HtmlToBladeConverter } from '../services/htmlToBladeConverter';
import { LaravelDetector } from '../services/laravelDetector';
import { ConfigurationService } from '../services/configurationService';
import { ConversionStats } from '../types';
import { findHtmlFiles, logger } from '../utils';
import { MESSAGES } from '../constants';

export class ConvertFolderCommand {
    private converter: HtmlToBladeConverter;
    private detector: LaravelDetector;
    private configService: ConfigurationService;
    
    constructor() {
        this.converter = new HtmlToBladeConverter();
        this.detector = new LaravelDetector();
        this.configService = new ConfigurationService();
    }
    
    /**
     * Execute the convert folder command
     */
    async execute(uri?: vscode.Uri): Promise<void> {
        try {
            let folderPath: string | undefined;
            
            // If URI is provided (from context menu), use it
            if (uri) {
                folderPath = uri.fsPath;
            } else {
                // Otherwise, ask the user to select a folder
                const selected = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: 'Select Folder',
                });
                
                if (!selected || selected.length === 0) {
                    return;
                }
                
                folderPath = selected[0].fsPath;
            }
            
            // Detect Laravel project
            logger.info(MESSAGES.INFO.DETECTING_LARAVEL);
            const laravelInfo = await this.detector.detectLaravelProject();
            
            if (!laravelInfo.isLaravelProject) {
                const proceed = await vscode.window.showWarningMessage(
                    MESSAGES.ERROR.NOT_LARAVEL_PROJECT,
                    'Convert Anyway',
                    'Cancel'
                );
                
                if (proceed !== 'Convert Anyway') {
                    return;
                }
            }
            
            // Get configuration
            const config = this.configService.getConfig();
            
            // Find all HTML files in the folder
            logger.info(`Searching for HTML files in: ${folderPath}`);
            const htmlFiles = await findHtmlFiles(folderPath, config.excludePatterns);
            
            if (htmlFiles.length === 0) {
                vscode.window.showInformationMessage(MESSAGES.ERROR.NO_FILES_FOUND);
                return;
            }
            
            // Confirm conversion
            const proceed = await vscode.window.showInformationMessage(
                `Found ${htmlFiles.length} HTML file(s). Convert to Blade?`,
                'Convert',
                'Cancel'
            );
            
            if (proceed !== 'Convert') {
                return;
            }
            
            // Convert files with progress
            const stats = await this.convertMultipleFiles(htmlFiles, config);
            
            // Show results
            this.showResults(stats);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Folder conversion failed: ${errorMessage}`);
            logger.error('Folder conversion failed', error as Error);
        }
    }
    
    /**
     * Convert multiple files with progress tracking
     */
    private async convertMultipleFiles(
        filePaths: string[],
        config: any
    ): Promise<ConversionStats> {
        const stats: ConversionStats = {
            totalFiles: filePaths.length,
            successfulConversions: 0,
            failedConversions: 0,
            totalAssetsConverted: 0,
            totalCommentsConverted: 0,
            failures: [],
        };
        
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Converting HTML files to Blade',
                cancellable: false,
            },
            async (progress) => {
                for (let i = 0; i < filePaths.length; i++) {
                    const filePath = filePaths[i];
                    const fileName = path.basename(filePath);
                    
                    progress.report({
                        message: `${i + 1}/${filePaths.length}: ${fileName}`,
                        increment: (100 / filePaths.length),
                    });
                    
                    logger.info(MESSAGES.INFO.PROCESSING_FILE(fileName));
                    
                    const result = await this.converter.convertFile(filePath, config);
                    
                    if (result.success) {
                        stats.successfulConversions++;
                        stats.totalAssetsConverted += result.assetsConverted || 0;
                        stats.totalCommentsConverted += result.commentsConverted || 0;
                    } else {
                        stats.failedConversions++;
                        stats.failures.push({
                            path: filePath,
                            error: result.error || 'Unknown error',
                        });
                    }
                }
            }
        );
        
        return stats;
    }
    
    /**
     * Show conversion results
     */
    private showResults(stats: ConversionStats): void {
        const message = `Conversion complete!\n\n` +
            `✅ Successful: ${stats.successfulConversions}\n` +
            `❌ Failed: ${stats.failedConversions}\n` +
            `📁 Assets converted: ${stats.totalAssetsConverted}\n` +
            `💬 Comments converted: ${stats.totalCommentsConverted}`;
        
        if (stats.failedConversions > 0) {
            vscode.window.showWarningMessage(message, 'Show Log').then(choice => {
                if (choice === 'Show Log') {
                    logger.show();
                }
            });
        } else {
            vscode.window.showInformationMessage(
                MESSAGES.SUCCESS.MULTIPLE_FILES(stats.successfulConversions)
            );
        }
        
        logger.success(
            `Conversion complete - Success: ${stats.successfulConversions}, Failed: ${stats.failedConversions}`
        );
    }
}
