/**
 * Laravel Auto Blade Extension
 * 
 * Automatically converts HTML files to Laravel Blade templates with asset helper integration
 * 
 * @author Bakugo90
 * @license MIT
 */

import * as vscode from 'vscode';
import {
    ConvertCurrentFileCommand,
    ConvertFolderCommand,
    ConvertWorkspaceCommand,
} from './commands';
import { logger } from './utils';
import { COMMANDS, EXTENSION_NAME } from './constants';

/**
 * Extension activation entry point
 * Called when the extension is first activated
 */
export function activate(context: vscode.ExtensionContext): void {
    logger.info(`${EXTENSION_NAME} extension is now active!`);
    
    // Initialize command handlers
    const convertCurrentFileCmd = new ConvertCurrentFileCommand();
    const convertFolderCmd = new ConvertFolderCommand();
    const convertWorkspaceCmd = new ConvertWorkspaceCommand();
    
    // Register commands
    const commands = [
        vscode.commands.registerCommand(
            COMMANDS.CONVERT_CURRENT_FILE,
            () => convertCurrentFileCmd.execute()
        ),
        vscode.commands.registerCommand(
            COMMANDS.CONVERT_FOLDER,
            (uri: vscode.Uri) => convertFolderCmd.execute(uri)
        ),
        vscode.commands.registerCommand(
            COMMANDS.CONVERT_WORKSPACE,
            () => convertWorkspaceCmd.execute()
        ),
    ];
    
    // Add all commands to subscriptions for proper cleanup
    context.subscriptions.push(...commands);
    
    // Log successful activation
    logger.info('All commands registered successfully');
    
    // Show welcome message on first activation
    showWelcomeMessage(context);
}

/**
 * Extension deactivation
 * Called when the extension is deactivated
 */
export function deactivate(): void {
    logger.info(`${EXTENSION_NAME} extension is now deactivated`);
    logger.dispose();
}

/**
 * Show welcome message on first activation
 */
function showWelcomeMessage(context: vscode.ExtensionContext): void {
    const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome');
    
    if (!hasShownWelcome) {
        vscode.window
            .showInformationMessage(
                `${EXTENSION_NAME} is ready! Convert HTML files to Blade templates with ease.`,
                'Learn More',
                'Got it'
            )
            .then(choice => {
                if (choice === 'Learn More') {
                    vscode.env.openExternal(
                        vscode.Uri.parse('https://github.com/Bakugo90/laravel-auto-blade')
                    );
                }
            });
        
        context.globalState.update('hasShownWelcome', true);
    }
}
