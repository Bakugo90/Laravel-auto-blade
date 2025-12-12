/**
 * Command handler for converting all HTML files in the workspace
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { HtmlToBladeConverter } from '../services/htmlToBladeConverter';
import { LaravelDetector } from '../services/laravelDetector';
import { ConfigurationService } from '../services/configurationService';
import { ConversionStats } from '../types';
import { findHtmlFiles, getWorkspacePath, logger } from '../utils';
import { MESSAGES } from '../constants';

export class ConvertWorkspaceCommand {
    private converter: HtmlToBladeConverter;
    private detector: LaravelDetector;
    private configService: ConfigurationService;
    
    constructor() {
        this.converter = new HtmlToBladeConverter();
        this.detector = new LaravelDetector();
        this.configService = new ConfigurationService();
    }
    
    /**
     * Execute the convert workspace command
     */
    async execute(): Promise<void> {
        try {
            const workspacePath = getWorkspacePath();
            
            if (!workspacePath) {
                vscode.window.showErrorMessage('No workspace folder is open');
                return;
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
            
            // Find all HTML files in the workspace
            logger.info(`Searching for HTML files in workspace: ${workspacePath}`);
            const htmlFiles = await findHtmlFiles(workspacePath, config.excludePatterns);
            
            if (htmlFiles.length === 0) {
                vscode.window.showInformationMessage(MESSAGES.ERROR.NO_FILES_FOUND);
                return;
            }
            
            // Show confirmation with file list preview
            const proceed = await this.confirmConversion(htmlFiles);
            
            if (!proceed) {
                return;
            }
            
            // Convert files with progress
            const stats = await this.convertMultipleFiles(htmlFiles, config);
            
            // Show results
            this.showResults(stats);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Workspace conversion failed: ${errorMessage}`);
            logger.error('Workspace conversion failed', error as Error);
        }
    }
    
    /**
     * Confirm conversion with file list preview
     */
    private async confirmConversion(htmlFiles: string[]): Promise<boolean> {
        const workspacePath = getWorkspacePath() || '';
        const fileList = htmlFiles
            .slice(0, 10)
            .map(f => path.relative(workspacePath, f))
            .join('\n• ');
        
        const more = htmlFiles.length > 10 ? `\n• ... and ${htmlFiles.length - 10} more` : '';
        
        const message = `Found ${htmlFiles.length} HTML file(s) to convert:\n\n• ${fileList}${more}\n\nConvert all to Blade?`;
        
        const choice = await vscode.window.showInformationMessage(
            message,
            { modal: true },
            'Convert All',
            'Cancel'
        );
        
        return choice === 'Convert All';
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
                title: 'Converting workspace HTML files to Blade',
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
        const message = `Workspace conversion complete!\n\n` +
            `✅ Successful: ${stats.successfulConversions}\n` +
            `❌ Failed: ${stats.failedConversions}\n` +
            `📁 Assets converted: ${stats.totalAssetsConverted}\n` +
            `💬 Comments converted: ${stats.totalCommentsConverted}`;
        
        if (stats.failedConversions > 0) {
            vscode.window.showWarningMessage(message, 'Show Log', 'Show Failures').then(choice => {
                if (choice === 'Show Log') {
                    logger.show();
                } else if (choice === 'Show Failures') {
                    this.showFailures(stats.failures);
                }
            });
        } else {
            vscode.window.showInformationMessage(
                MESSAGES.SUCCESS.MULTIPLE_FILES(stats.successfulConversions)
            );
        }
        
        logger.success(
            `Workspace conversion complete - Success: ${stats.successfulConversions}, Failed: ${stats.failedConversions}`
        );
    }
    
    /**
     * Show detailed failure information
     */
    private showFailures(failures: Array<{ path: string; error: string }>): void {
        const workspacePath = getWorkspacePath() || '';
        const failureList = failures
            .map(f => `• ${path.relative(workspacePath, f.path)}: ${f.error}`)
            .join('\n');
        
        const channel = vscode.window.createOutputChannel('Auto Blade - Failures');
        channel.appendLine('Failed Conversions:\n');
        channel.appendLine(failureList);
        channel.show();
    }
}
