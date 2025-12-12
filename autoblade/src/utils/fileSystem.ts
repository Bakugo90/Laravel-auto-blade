/**
 * Utility functions for file system operations
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { HTML_EXTENSION, BLADE_EXTENSION, BACKUP_EXTENSION } from '../constants';

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if a path is a directory
 */
export async function isDirectory(dirPath: string): Promise<boolean> {
    try {
        const stats = await fs.stat(dirPath);
        return stats.isDirectory();
    } catch {
        return false;
    }
}

/**
 * Convert HTML file path to Blade file path
 */
export function htmlToBladeFilePath(htmlPath: string): string {
    if (!htmlPath.endsWith(HTML_EXTENSION)) {
        throw new Error('File is not an HTML file');
    }
    return htmlPath.slice(0, -HTML_EXTENSION.length) + BLADE_EXTENSION;
}

/**
 * Create backup of a file
 */
export async function createBackup(filePath: string): Promise<string> {
    const backupPath = filePath + BACKUP_EXTENSION;
    await fs.copyFile(filePath, backupPath);
    return backupPath;
}

/**
 * Read file content
 */
export async function readFileContent(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
}

/**
 * Write file content
 */
export async function writeFileContent(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Delete a file
 */
export async function deleteFile(filePath: string): Promise<void> {
    await fs.unlink(filePath);
}

/**
 * Rename a file
 */
export async function renameFile(oldPath: string, newPath: string): Promise<void> {
    await fs.rename(oldPath, newPath);
}

/**
 * Find all HTML files in a directory recursively
 */
export async function findHtmlFiles(
    dirPath: string,
    excludePatterns: string[] = []
): Promise<string[]> {
    const htmlFiles: string[] = [];
    
    const findFiles = async (currentPath: string) => {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            
            // Check if path matches any exclude pattern
            const shouldExclude = excludePatterns.some(pattern => {
                const regex = new RegExp(
                    pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')
                );
                return regex.test(fullPath);
            });
            
            if (shouldExclude) {
                continue;
            }
            
            if (entry.isDirectory()) {
                await findFiles(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(HTML_EXTENSION)) {
                htmlFiles.push(fullPath);
            }
        }
    };
    
    await findFiles(dirPath);
    return htmlFiles;
}

/**
 * Get workspace folder path
 */
export function getWorkspacePath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return undefined;
    }
    return workspaceFolders[0].uri.fsPath;
}

/**
 * Get relative path from workspace root
 */
export function getRelativePath(filePath: string): string {
    const workspacePath = getWorkspacePath();
    if (!workspacePath) {
        return path.basename(filePath);
    }
    return path.relative(workspacePath, filePath);
}

/**
 * Normalize path separators for the current platform
 */
export function normalizePath(filePath: string): string {
    return filePath.replace(/[\/\\]/g, path.sep);
}
