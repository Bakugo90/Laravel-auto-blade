/**
 * Configuration service for managing extension settings
 */

import * as vscode from 'vscode';
import { ConversionConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';

export class ConfigurationService {
    private static readonly SECTION = 'autoblade';
    
    /**
     * Get the current configuration
     */
    getConfig(): ConversionConfig {
        const config = vscode.workspace.getConfiguration(ConfigurationService.SECTION);
        
        return {
            createBackup: config.get('createBackup', DEFAULT_CONFIG.createBackup),
            showPreview: config.get('showPreview', DEFAULT_CONFIG.showPreview),
            assetPathPrefix: config.get('assetPathPrefix', DEFAULT_CONFIG.assetPathPrefix),
            preserveComments: config.get('preserveComments', DEFAULT_CONFIG.preserveComments),
            excludePatterns: config.get('excludePatterns', DEFAULT_CONFIG.excludePatterns),
        };
    }
    
    /**
     * Update a configuration value
     */
    async updateConfig<K extends keyof ConversionConfig>(
        key: K,
        value: ConversionConfig[K],
        global: boolean = false
    ): Promise<void> {
        const config = vscode.workspace.getConfiguration(ConfigurationService.SECTION);
        await config.update(key, value, global);
    }
    
    /**
     * Reset configuration to defaults
     */
    async resetToDefaults(): Promise<void> {
        const config = vscode.workspace.getConfiguration(ConfigurationService.SECTION);
        
        for (const key of Object.keys(DEFAULT_CONFIG)) {
            await config.update(key, undefined, true);
        }
    }
    
    /**
     * Listen for configuration changes
     */
    onConfigurationChanged(callback: (config: ConversionConfig) => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration(ConfigurationService.SECTION)) {
                callback(this.getConfig());
            }
        });
    }
}
