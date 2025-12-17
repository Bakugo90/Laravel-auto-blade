/**
 * Service for detecting Laravel projects
 */

import * as path from 'path';
import { LaravelProjectInfo } from '../types';
import { fileExists, readFileContent, getWorkspacePath } from '../utils';
import { LARAVEL_PATTERNS } from '../constants';

export class LaravelDetector {
    /**
     * Detect if the workspace contains a Laravel project
     */
    async detectLaravelProject(): Promise<LaravelProjectInfo> {
        const workspacePath = getWorkspacePath();
        
        if (!workspacePath) {
            return { isLaravelProject: false };
        }
        
        return await this.detectInDirectory(workspacePath);
    }
    
    /**
     * Detect Laravel project in a specific directory
     */
    async detectInDirectory(dirPath: string): Promise<LaravelProjectInfo> {
        // Check for composer.json with Laravel dependency
        const composerPath = path.join(dirPath, 'composer.json');
        const hasComposer = await fileExists(composerPath);
        
        if (hasComposer) {
            const composerContent = await readFileContent(composerPath);
            const hasLaravelFramework = LARAVEL_PATTERNS.COMPOSER_LARAVEL.test(composerContent);
            
            if (hasLaravelFramework) {
                const version = this.extractLaravelVersion(composerContent);
                return {
                    isLaravelProject: true,
                    projectRoot: dirPath,
                    laravelVersion: version,
                    composerPath,
                };
            }
        }
        
        // Check for artisan file
        const artisanPath = path.join(dirPath, LARAVEL_PATTERNS.ARTISAN_FILE);
        const hasArtisan = await fileExists(artisanPath);
        
        if (hasArtisan) {
            // Check for common Laravel directories
            const hasLaravelDirs = await this.checkLaravelDirectories(dirPath);
            
            if (hasLaravelDirs) {
                return {
                    isLaravelProject: true,
                    projectRoot: dirPath,
                    composerPath: hasComposer ? composerPath : undefined,
                };
            }
        }
        
        return { isLaravelProject: false };
    }
    
    /**
     * Extract Laravel version from composer.json content
     */
    private extractLaravelVersion(composerContent: string): string | undefined {
        try {
            const composer = JSON.parse(composerContent);
            const laravelVersion = composer.require?.['laravel/framework'];
            return laravelVersion;
        } catch {
            return undefined;
        }
    }
    
    /**
     * Check if common Laravel directories exist
     */
    private async checkLaravelDirectories(dirPath: string): Promise<boolean> {
        let foundCount = 0;
        
        for (const dir of LARAVEL_PATTERNS.LARAVEL_DIRS) {
            const fullPath = path.join(dirPath, dir);
            if (await fileExists(fullPath)) {
                foundCount++;
            }
        }
        
        // Consider it a Laravel project if at least 3 common directories exist
        return foundCount >= 3;
    }
}
