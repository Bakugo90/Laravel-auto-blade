/**
 * Constants and configuration values for Laravel Auto Blade extension
 */

/**
 * Extension-wide constants
 */
export const EXTENSION_NAME = 'Laravel Auto Blade';
export const EXTENSION_ID = 'autoblade';

/**
 * File extensions
 */
export const HTML_EXTENSION = '.html';
export const BLADE_EXTENSION = '.blade.php';
export const BACKUP_EXTENSION = '.backup';

/**
 * Regular expressions for parsing
 */
export const REGEX_PATTERNS = {
    /** Match asset references in HTML (src, href attributes) */
    ASSET_REFERENCES: /((?:src|href|data-src|data-href)\s*=\s*["'])([^"']+)(["'])/gi,
    
    /** Match external URLs (http, https, //, mailto, tel, etc.) */
    EXTERNAL_URL: /^(https?:\/\/|\/\/|mailto:|tel:|#|data:)/i,
    
    /** Match HTML comments */
    HTML_COMMENTS: /<!--([\s\S]*?)-->/g,
    
    /** Match inline scripts */
    INLINE_SCRIPTS: /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
    
    /** Match inline styles */
    INLINE_STYLES: /<style\b[^>]*>([\s\S]*?)<\/style>/gi,
};

/**
 * Laravel-specific patterns
 */
export const LARAVEL_PATTERNS = {
    /** Composer.json Laravel framework dependency */
    COMPOSER_LARAVEL: /"laravel\/framework"\s*:\s*"[^"]+"/,
    
    /** Artisan file presence */
    ARTISAN_FILE: 'artisan',
    
    /** Common Laravel directories */
    LARAVEL_DIRS: ['app', 'resources', 'routes', 'config', 'database'],
};

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
    excludePatterns: [
        '**/node_modules/**',
        '**/vendor/**',
        '**/storage/**',
        '**/public/**',
    ],
    createBackup: true,
    showPreview: true,
    assetPathPrefix: '',
    preserveComments: true,
};

/**
 * Output channel name for logging
 */
export const OUTPUT_CHANNEL_NAME = 'Laravel Auto Blade';

/**
 * Commands IDs
 */
export const COMMANDS = {
    CONVERT_CURRENT_FILE: 'autoblade.convertCurrentFile',
    CONVERT_FOLDER: 'autoblade.convertFolder',
    CONVERT_WORKSPACE: 'autoblade.convertWorkspace',
};

/**
 * Messages
 */
export const MESSAGES = {
    SUCCESS: {
        SINGLE_FILE: (fileName: string) => `✅ Successfully converted ${fileName} to Blade template`,
        MULTIPLE_FILES: (count: number) => `✅ Successfully converted ${count} file(s) to Blade templates`,
    },
    ERROR: {
        NO_ACTIVE_FILE: 'No active HTML file found',
        NOT_HTML_FILE: 'Current file is not an HTML file',
        NOT_LARAVEL_PROJECT: 'No Laravel project detected in workspace',
        CONVERSION_FAILED: (fileName: string, error: string) => `❌ Failed to convert ${fileName}: ${error}`,
        NO_FILES_FOUND: 'No HTML files found to convert',
    },
    WARNING: {
        BACKUP_DISABLED: 'Backup is disabled. Original files will be deleted.',
        EXTERNAL_ASSETS: (count: number) => `⚠️ Found ${count} external asset(s) that were not converted`,
    },
    INFO: {
        STARTING_CONVERSION: 'Starting conversion...',
        DETECTING_LARAVEL: 'Detecting Laravel project...',
        PROCESSING_FILE: (fileName: string) => `Processing ${fileName}...`,
    },
};
