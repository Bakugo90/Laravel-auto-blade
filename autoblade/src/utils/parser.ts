/**
 * Utility functions for parsing and transforming HTML/Blade content
 */

import { AssetReference } from '../types';
import { REGEX_PATTERNS } from '../constants';

/**
 * Extract all asset references from HTML content
 */
export function extractAssetReferences(content: string): AssetReference[] {
    const references: AssetReference[] = [];
    const regex = new RegExp(REGEX_PATTERNS.ASSET_REFERENCES);
    let match: RegExpExecArray | null;
    
    while ((match = regex.exec(content)) !== null) {
        const [fullMatch, prefix, path, suffix] = match;
        const attribute = prefix.split('=')[0].trim();
        const isExternal = REGEX_PATTERNS.EXTERNAL_URL.test(path);
        
        references.push({
            fullMatch,
            attribute,
            originalPath: path,
            isExternal,
            startIndex: match.index,
            endIndex: match.index + fullMatch.length,
        });
    }
    
    return references;
}

/**
 * Convert HTML comments to Blade comments
 */
export function convertCommentsToBladeComments(content: string): { content: string; count: number } {
    let count = 0;
    const convertedContent = content.replace(
        REGEX_PATTERNS.HTML_COMMENTS,
        (match, commentText) => {
            count++;
            return `{{--${commentText}--}}`;
        }
    );
    
    return { content: convertedContent, count };
}

/**
 * Replace asset references with Laravel asset() helper
 */
export function replaceAssetReferences(
    content: string,
    references: AssetReference[],
    assetPathPrefix: string = ''
): string {
    // Sort references by start index in reverse order to maintain correct positions
    const sortedRefs = [...references]
        .filter(ref => !ref.isExternal)
        .sort((a, b) => b.startIndex - a.startIndex);
    
    let modifiedContent = content;
    
    for (const ref of sortedRefs) {
        const cleanPath = cleanAssetPath(ref.originalPath);
        const finalPath = assetPathPrefix 
            ? `${assetPathPrefix}/${cleanPath}`.replace(/\/+/g, '/')
            : cleanPath;
        
        const replacement = `${ref.attribute}="{{ asset('${finalPath}') }}"`;
        
        modifiedContent = 
            modifiedContent.slice(0, ref.startIndex) +
            replacement +
            modifiedContent.slice(ref.endIndex);
    }
    
    return modifiedContent;
}

/**
 * Clean asset path (remove leading slashes, dots, etc.)
 */
export function cleanAssetPath(assetPath: string): string {
    // Remove leading ./ and /
    let cleaned = assetPath.replace(/^\.?\/+/, '');
    
    // Remove query strings and fragments
    cleaned = cleaned.split('?')[0].split('#')[0];
    
    return cleaned;
}

/**
 * Detect if content contains Laravel Blade syntax
 */
export function containsBladeSyntax(content: string): boolean {
    const bladePatterns = [
        /@extends/,
        /@section/,
        /@yield/,
        /@include/,
        /\{\{.*?\}\}/,
        /@if/,
        /@foreach/,
        /@for/,
        /\{\!\!.*?\!\!\}/,
    ];
    
    return bladePatterns.some(pattern => pattern.test(content));
}

/**
 * Escape special characters for regex
 */
export function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Count occurrences of a pattern in content
 */
export function countOccurrences(content: string, pattern: RegExp): number {
    const matches = content.match(pattern);
    return matches ? matches.length : 0;
}

/**
 * Validate if content is valid HTML
 */
export function isValidHTML(content: string): boolean {
    // Basic validation - check for matching tags
    const openTags = content.match(/<(\w+)[^>]*>/g) || [];
    const closeTags = content.match(/<\/(\w+)>/g) || [];
    
    // This is a simplified check
    return content.trim().length > 0 && (openTags.length >= closeTags.length);
}
