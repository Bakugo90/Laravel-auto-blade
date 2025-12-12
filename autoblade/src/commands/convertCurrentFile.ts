/**
 * Command handler for converting the current active HTML file
 */

import * as vscode from 'vscode';
import { HtmlToBladeConverter } from '../services/htmlToBladeConverter';
import { LaravelDetector } from '../services/laravelDetector';
import { ConfigurationService } from '../services/configurationService';
import { logger } from '../utils';
import { MESSAGES, HTML_EXTENSION } from '../constants';

export class ConvertCurrentFileCommand {
    private converter: HtmlToBladeConverter;
    private detector: LaravelDetector;
    private configService: ConfigurationService;
    
    constructor() {
        this.converter = new HtmlToBladeConverter();
        this.detector = new LaravelDetector();
        this.configService = new ConfigurationService();
    }
    
    /**
     * Execute the convert current file command
     */
    async execute(): Promise<void> {
        try {
            // Get the active text editor
            const editor = vscode.window.activeTextEditor;
            
            if (!editor) {
                vscode.window.showErrorMessage(MESSAGES.ERROR.NO_ACTIVE_FILE);
                return;
            }
            
            const document = editor.document;
            const filePath = document.uri.fsPath;
            
            // Check if it's an HTML file
            if (!filePath.endsWith(HTML_EXTENSION)) {
                vscode.window.showErrorMessage(MESSAGES.ERROR.NOT_HTML_FILE);
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
            
            // Show preview if enabled
            if (config.showPreview) {
                const shouldProceed = await this.showPreview(filePath, config);
                if (!shouldProceed) {
                    return;
                }
            }
            
            // Show progress
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Converting HTML to Blade',
                    cancellable: false,
                },
                async (progress) => {
                    progress.report({ message: 'Processing...' });
                    
                    // Convert the file
                    const result = await this.converter.convertFile(filePath, config);
                    
                    if (result.success) {
                        // Show success message
                        const fileName = filePath.split(/[\\/]/).pop() || filePath;
                        vscode.window.showInformationMessage(
                            MESSAGES.SUCCESS.SINGLE_FILE(fileName)
                        );
                        
                        // Open the new Blade file
                        if (result.newPath) {
                            const doc = await vscode.workspace.openTextDocument(result.newPath);
                            await vscode.window.showTextDocument(doc);
                        }
                        
                        logger.success(
                            `Converted ${fileName} - Assets: ${result.assetsConverted}, Comments: ${result.commentsConverted}`
                        );
                    } else {
                        const fileName = filePath.split(/[\\/]/).pop() || filePath;
                        vscode.window.showErrorMessage(
                            MESSAGES.ERROR.CONVERSION_FAILED(fileName, result.error || 'Unknown error')
                        );
                    }
                }
            );
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Conversion failed: ${errorMessage}`);
            logger.error('Conversion failed', error as Error);
        }
    }
    
    /**
     * Show preview of the conversion
     */
    private async showPreview(filePath: string, config: any): Promise<boolean> {
        const preview = await this.converter.previewConversion(filePath, config);
        
        const message = `Convert to Blade?\n\n` +
            `• ${preview.assetsConverted} asset(s) will be converted\n` +
            `• ${preview.commentsConverted} comment(s) will be converted`;
        
        const choice = await vscode.window.showInformationMessage(
            message,
            { modal: true },
            'Convert',
            'Show Diff',
            'Cancel'
        );
        
        if (choice === 'Show Diff') {
            await this.showDiff(preview.originalContent, preview.convertedContent, filePath);
            
            // Ask again after showing diff
            const proceed = await vscode.window.showInformationMessage(
                'Proceed with conversion?',
                'Convert',
                'Cancel'
            );
            return proceed === 'Convert';
        }
        
        return choice === 'Convert';
    }
    
    /**
     * Show diff between original and converted content
     */
    private async showDiff(
        originalContent: string,
        convertedContent: string,
        originalPath: string
    ): Promise<void> {
        const originalUri = vscode.Uri.parse(`untitled:Original HTML`);
        const convertedUri = vscode.Uri.parse(`untitled:Converted Blade`);
        
        // Create temporary documents
        const originalDoc = await vscode.workspace.openTextDocument({
            content: originalContent,
            language: 'html',
        });
        
        const convertedDoc = await vscode.workspace.openTextDocument({
            content: convertedContent,
            language: 'blade',
        });
        
        // Show diff
        await vscode.commands.executeCommand(
            'vscode.diff',
            originalDoc.uri,
            convertedDoc.uri,
            'Original ↔ Converted'
        );
    }
}
