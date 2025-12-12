/**
 * Types and interfaces for Laravel Auto Blade extension
 */

/**
 * Configuration options for the converter
 */
export interface ConversionConfig {
    /** Whether to create backup files before conversion */
    createBackup: boolean;
    /** Whether to show preview before conversion */
    showPreview: boolean;
    /** Path prefix to add to assets */
    assetPathPrefix: string;
    /** Whether to preserve HTML comments as Blade comments */
    preserveComments: boolean;
    /** Patterns to exclude from conversion */
    excludePatterns: string[];
}

/**
 * Result of a file conversion operation
 */
export interface ConversionResult {
    /** Whether the conversion was successful */
    success: boolean;
    /** Original file path */
    originalPath: string;
    /** New file path after conversion */
    newPath?: string;
    /** Error message if conversion failed */
    error?: string;
    /** Number of asset references converted */
    assetsConverted?: number;
    /** Number of comments converted */
    commentsConverted?: number;
}

/**
 * Statistics for batch conversion operations
 */
export interface ConversionStats {
    /** Total files processed */
    totalFiles: number;
    /** Successfully converted files */
    successfulConversions: number;
    /** Failed conversions */
    failedConversions: number;
    /** Total assets converted */
    totalAssetsConverted: number;
    /** Total comments converted */
    totalCommentsConverted: number;
    /** List of failed files with errors */
    failures: Array<{ path: string; error: string }>;
}

/**
 * Asset reference found in HTML
 */
export interface AssetReference {
    /** Full matched string */
    fullMatch: string;
    /** Attribute name (src, href, etc.) */
    attribute: string;
    /** Original path value */
    originalPath: string;
    /** Whether the path is external (CDN, http, etc.) */
    isExternal: boolean;
    /** Start position in file */
    startIndex: number;
    /** End position in file */
    endIndex: number;
}

/**
 * Laravel project detection result
 */
export interface LaravelProjectInfo {
    /** Whether a Laravel project was detected */
    isLaravelProject: boolean;
    /** Path to the Laravel project root */
    projectRoot?: string;
    /** Laravel version if detectable */
    laravelVersion?: string;
    /** Path to composer.json */
    composerPath?: string;
}

/**
 * Preview information for conversion
 */
export interface ConversionPreview {
    /** Original file content */
    originalContent: string;
    /** Converted file content */
    convertedContent: string;
    /** Original file path */
    originalPath: string;
    /** New file path */
    newPath: string;
    /** Changes summary */
    changes: {
        assetsConverted: number;
        commentsConverted: number;
        otherChanges: string[];
    };
}
