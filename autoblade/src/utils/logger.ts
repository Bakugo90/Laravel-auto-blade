/**
 * Utility logger for consistent logging across the extension
 */

import * as vscode from 'vscode';
import { OUTPUT_CHANNEL_NAME } from '../constants';

class Logger {
    private outputChannel: vscode.OutputChannel;
    
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
    }
    
    /**
     * Log an info message
     */
    info(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        this.outputChannel.appendLine(`[${timestamp}] ℹ️ ${message}`);
    }
    
    /**
     * Log a success message
     */
    success(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        this.outputChannel.appendLine(`[${timestamp}] ✅ ${message}`);
    }
    
    /**
     * Log a warning message
     */
    warn(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        this.outputChannel.appendLine(`[${timestamp}] ⚠️ ${message}`);
    }
    
    /**
     * Log an error message
     */
    error(message: string, error?: Error): void {
        const timestamp = new Date().toLocaleTimeString();
        this.outputChannel.appendLine(`[${timestamp}] ❌ ${message}`);
        if (error) {
            this.outputChannel.appendLine(`   Stack: ${error.stack}`);
        }
    }
    
    /**
     * Show the output channel
     */
    show(): void {
        this.outputChannel.show();
    }
    
    /**
     * Clear the output channel
     */
    clear(): void {
        this.outputChannel.clear();
    }
    
    /**
     * Dispose the output channel
     */
    dispose(): void {
        this.outputChannel.dispose();
    }
}

// Export a singleton instance
export const logger = new Logger();
