/**
 * TemplateLoader - Loads HTML templates and CSS for screens
 * Handles both template and stylesheet loading with proper error handling
 */
class TemplateLoader {
    constructor() {
        this.loadedTemplates = new Map();
        this.loadedStylesheets = new Map();
        console.log('📄 TemplateLoader initialized');
    }

    /**
     * Load a screen template (HTML + CSS)
     * @param {string} screenPath - Path to screen folder (e.g., 'screens/mainmenu')
     * @param {string} screenName - Name of the screen files (e.g., 'mainMenuScreen')
     * @returns {Promise<string>} - HTML content
     */
    async loadScreenTemplate(screenPath, screenName) {
        const templateKey = `${screenPath}/${screenName}`;
        
        try {
            // Check if already loaded
            if (this.loadedTemplates.has(templateKey)) {
                console.log(`📄 Using cached template: ${templateKey}`);
                return this.loadedTemplates.get(templateKey);
            }

            // Load HTML and CSS in parallel
            const [htmlContent] = await Promise.all([
                this.loadHTML(`${screenPath}/${screenName}.html`),
                this.loadCSS(`${screenPath}/${screenName}.css`, screenName)
            ]);

            // Cache the template
            this.loadedTemplates.set(templateKey, htmlContent);
            console.log(`✅ Template loaded successfully: ${templateKey}`);
            
            return htmlContent;
        } catch (error) {
            console.error(`❌ Failed to load template ${templateKey}:`, error);
            throw error;
        }
    }

    /**
     * Load HTML content from file
     * @param {string} htmlPath - Path to HTML file
     * @returns {Promise<string>} - HTML content
     */
    async loadHTML(htmlPath) {
        try {
            const response = await fetch(htmlPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const html = await response.text();
            console.log(`📄 HTML loaded: ${htmlPath}`);
            return html;
        } catch (error) {
            console.error(`❌ Failed to load HTML from ${htmlPath}:`, error);
            throw error;
        }
    }

    /**
     * Load and inject CSS stylesheet
     * @param {string} cssPath - Path to CSS file
     * @param {string} screenName - Screen name for ID
     * @returns {Promise<void>}
     */
    async loadCSS(cssPath, screenName) {
        const cssId = `${screenName}-styles`;
        
        try {
            // Check if already loaded
            if (this.loadedStylesheets.has(cssId)) {
                console.log(`🎨 CSS already loaded: ${cssId}`);
                return;
            }

            // Remove existing stylesheet if present
            const existingStyle = document.getElementById(cssId);
            if (existingStyle) {
                existingStyle.remove();
            }

            // Load CSS content with cache busting
            const cacheBuster = `?v=${Date.now()}`;
            const response = await fetch(cssPath + cacheBuster);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const cssContent = await response.text();
            
            // Create and inject stylesheet
            const styleElement = document.createElement('style');
            styleElement.id = cssId;
            styleElement.textContent = cssContent;
            document.head.appendChild(styleElement);
            
            // Mark as loaded
            this.loadedStylesheets.set(cssId, true);
            console.log(`🎨 CSS loaded and injected: ${cssPath}`);
            
        } catch (error) {
            console.error(`❌ Failed to load CSS from ${cssPath}:`, error);
            throw error;
        }
    }

    /**
     * Preload multiple templates
     * @param {Array} templates - Array of {screenPath, screenName} objects
     */
    async preloadTemplates(templates) {
        console.log(`📄 Preloading ${templates.length} templates...`);
        
        const loadPromises = templates.map(({screenPath, screenName}) => 
            this.loadScreenTemplate(screenPath, screenName).catch(error => {
                console.warn(`⚠️ Failed to preload ${screenPath}/${screenName}:`, error);
                return null;
            })
        );
        
        await Promise.all(loadPromises);
        console.log('✅ Template preloading complete');
    }

    /**
     * Clear all cached templates and stylesheets
     */
    clearCache() {
        this.loadedTemplates.clear();
        
        // Remove all loaded stylesheets
        this.loadedStylesheets.forEach((_, cssId) => {
            const element = document.getElementById(cssId);
            if (element) {
                element.remove();
            }
        });
        this.loadedStylesheets.clear();
        
        console.log('🗑️ Template cache cleared');
    }

    /**
     * Get loading status
     */
    getStatus() {
        return {
            templatesLoaded: this.loadedTemplates.size,
            stylesheetsLoaded: this.loadedStylesheets.size,
            templates: Array.from(this.loadedTemplates.keys()),
            stylesheets: Array.from(this.loadedStylesheets.keys())
        };
    }
}

// Create global instance
window.templateLoader = new TemplateLoader();

// Export to global scope
window.TemplateLoader = TemplateLoader;