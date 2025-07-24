/**
 * ScreenManager - Core screen navigation and management system
 * Handles screen transitions, loading states, and proper cleanup
 */
class ScreenManager {
    constructor() {
        this.screens = new Map();
        this.currentScreen = null;
        this.previousScreen = null;
        this.isTransitioning = false;
        this.loadingStates = new Map();
        
        // Screen container will be created dynamically
        this.screenContainer = null;
        this.initialized = false;
        
        // Performance monitoring
        this.transitionStartTime = 0;
        
        console.log('🎮 ScreenManager initialized');
    }

    /**
     * Initialize the screen manager and create the main container
     */
    async initialize() {
        if (this.initialized) {
            console.warn('ScreenManager already initialized');
            return;
        }

        try {
            this.createScreenContainer();
            this.setupGlobalStyles();
            this.initialized = true;
            console.log('✅ ScreenManager ready');
        } catch (error) {
            console.error('❌ Failed to initialize ScreenManager:', error);
            throw error;
        }
    }

    /**
     * Create the main screen container
     */
    createScreenContainer() {
        // Clear existing content
        document.body.innerHTML = '';
        
        // Create main screen container
        this.screenContainer = document.createElement('div');
        this.screenContainer.id = 'screen-container';
        this.screenContainer.className = 'screen-container';
        
        // Add loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'loading-overlay hidden';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading...</div>
            </div>
        `;
        
        document.body.appendChild(this.screenContainer);
        document.body.appendChild(loadingOverlay);
    }

    /**
     * Setup global styles for screen management
     */
    setupGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .screen-container {
                width: 100vw;
                height: 100vh;
                position: relative;
                overflow: hidden;
            }
            
            .screen {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease-in-out;
                pointer-events: none;
            }
            
            .screen.active {
                opacity: 1;
                transform: translateY(0);
                pointer-events: auto;
            }
            
            .screen.transitioning-out {
                opacity: 0;
                transform: translateY(-20px);
                pointer-events: none;
            }
            
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(26, 26, 46, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                transition: opacity 0.3s ease;
            }
            
            .loading-overlay.hidden {
                opacity: 0;
                pointer-events: none;
            }
            
            .loading-content {
                text-align: center;
                color: #FFD700;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255, 215, 0, 0.3);
                border-top: 3px solid #FFD700;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            .loading-text {
                font-size: 18px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Register a screen with the manager
     */
    registerScreen(name, screenClass) {
        if (this.screens.has(name)) {
            console.warn(`Screen '${name}' already registered, overwriting`);
        }
        
        this.screens.set(name, {
            class: screenClass,
            instance: null,
            loaded: false
        });
        
        console.log(`📱 Screen '${name}' registered`);
    }

    /**
     * Navigate to a specific screen
     */
    async navigateToScreen(screenName, data = {}) {
        if (this.isTransitioning) {
            console.warn('Navigation blocked: transition in progress');
            return false;
        }

        if (!this.screens.has(screenName)) {
            console.error(`Screen '${screenName}' not found`);
            return false;
        }

        this.transitionStartTime = performance.now();
        this.isTransitioning = true;

        try {
            // Show loading if needed
            const needsLoading = !this.screens.get(screenName).loaded;
            if (needsLoading) {
                this.showLoading(`Loading ${screenName}...`);
            }

            // Hide current screen
            if (this.currentScreen) {
                await this.hideCurrentScreen();
            }

            // Load and show new screen
            const success = await this.showScreen(screenName, data);
            
            if (success) {
                this.previousScreen = this.currentScreen;
                this.currentScreen = screenName;
                
                const transitionTime = performance.now() - this.transitionStartTime;
                console.log(`✅ Navigated to '${screenName}' in ${transitionTime.toFixed(2)}ms`);
            }

            this.hideLoading();
            return success;

        } catch (error) {
            console.error(`❌ Failed to navigate to '${screenName}':`, error);
            this.hideLoading();
            return false;
        } finally {
            this.isTransitioning = false;
        }
    }

    /**
     * Load and show a screen
     */
    async showScreen(screenName, data) {
        const screenInfo = this.screens.get(screenName);
        
        try {
            // Create screen instance if needed
            if (!screenInfo.instance) {
                screenInfo.instance = new screenInfo.class(this);
                await screenInfo.instance.initialize();
                screenInfo.loaded = true;
            }

            // Show the screen
            await screenInfo.instance.show(data);
            return true;

        } catch (error) {
            console.error(`Failed to show screen '${screenName}':`, error);
            return false;
        }
    }

    /**
     * Hide the current screen
     */
    async hideCurrentScreen() {
        if (!this.currentScreen) return;

        const screenInfo = this.screens.get(this.currentScreen);
        if (screenInfo && screenInfo.instance) {
            await screenInfo.instance.hide();
        }
    }

    /**
     * Go back to previous screen
     */
    async goBack() {
        if (this.previousScreen) {
            return await this.navigateToScreen(this.previousScreen);
        }
        return false;
    }

    /**
     * Show loading overlay
     */
    showLoading(text = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const textElement = overlay.querySelector('.loading-text');
        
        if (textElement) {
            textElement.textContent = text;
        }
        
        overlay.classList.remove('hidden');
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.add('hidden');
    }

    /**
     * Get screen container element
     */
    getScreenContainer() {
        return this.screenContainer;
    }

    /**
     * Get current screen name
     */
    getCurrentScreen() {
        return this.currentScreen;
    }

    /**
     * Check if a screen is registered
     */
    hasScreen(screenName) {
        return this.screens.has(screenName);
    }

    /**
     * Cleanup and destroy screen manager
     */
    destroy() {
        // Hide current screen
        if (this.currentScreen) {
            this.hideCurrentScreen();
        }

        // Cleanup all screen instances
        this.screens.forEach((screenInfo, name) => {
            if (screenInfo.instance && typeof screenInfo.instance.destroy === 'function') {
                screenInfo.instance.destroy();
            }
        });

        this.screens.clear();
        this.currentScreen = null;
        this.previousScreen = null;
        this.initialized = false;

        console.log('🗑️ ScreenManager destroyed');
    }
}

// Export to global scope
window.ScreenManager = ScreenManager;