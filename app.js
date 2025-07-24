/**
 * Spell Caster - Wave Defense TCG
 * Main Application Entry Point
 * 
 * This file initializes the screen management system and starts the game
 */

class SpellCasterApp {
    constructor() {
        this.screenManager = null;
        this.initialized = false;
        this.loadingStartTime = 0;
        
        console.log('🎮 Spell Caster App starting...');
    }

    /**
     * Initialize the application
     */
    async initialize() {
        if (this.initialized) {
            console.warn('App already initialized');
            return;
        }

        this.loadingStartTime = performance.now();

        try {
            // Show initial loading
            this.showInitialLoading();

            // Wait for DOM to be ready
            await this.waitForDOM();

            // Load all required dependencies
            await this.loadDependencies();

            // Initialize screen manager
            await this.initializeScreenManager();

            // Register all screens
            this.registerScreens();

            // Start the application
            await this.startApplication();

            this.initialized = true;
            
            const loadTime = performance.now() - this.loadingStartTime;
            console.log(`✅ Spell Caster App initialized in ${loadTime.toFixed(2)}ms`);

        } catch (error) {
            console.error('❌ Failed to initialize Spell Caster App:', error);
            this.showErrorMessage('Failed to load the game. Please refresh the page.');
            throw error;
        }
    }

    /**
     * Show initial loading screen
     */
    showInitialLoading() {
        document.body.innerHTML = `
            <div id="app-loading" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #FFD700;
                font-family: Arial, sans-serif;
                z-index: 10000;
            ">
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="font-size: 4rem; margin-bottom: 20px; animation: spin 2s linear infinite;">🔮</div>
                    <h1 style="font-size: 3rem; margin: 0; text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);">
                        Spell Caster
                    </h1>
                    <p style="font-size: 1.2rem; margin: 10px 0; color: #87CEEB;">
                        Wave Defense TCG
                    </p>
                </div>
                
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                    <div style="
                        width: 200px;
                        height: 4px;
                        background: rgba(255, 215, 0, 0.3);
                        border-radius: 2px;
                        overflow: hidden;
                    ">
                        <div id="loading-progress" style="
                            width: 0%;
                            height: 100%;
                            background: linear-gradient(90deg, #FFD700, #FFA500);
                            border-radius: 2px;
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                    
                    <div id="loading-status" style="
                        font-size: 1rem;
                        color: #87CEEB;
                        text-align: center;
                        min-height: 24px;
                    ">
                        Initializing...
                    </div>
                </div>

                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
    }

    /**
     * Update loading progress
     */
    updateLoadingProgress(percentage, status) {
        const progressBar = document.getElementById('loading-progress');
        const statusText = document.getElementById('loading-status');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        if (statusText) {
            statusText.textContent = status;
        }
    }

    /**
     * Wait for DOM to be ready
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Load all required dependencies
     */
    async loadDependencies() {
        const dependencies = [
            { name: 'Screen Manager', check: () => window.ScreenManager },
            { name: 'Base Screen', check: () => window.BaseScreen },
            { name: 'Main Menu Screen', check: () => window.MainMenuScreen },
            { name: 'Game Screen', check: () => window.GameScreen },
            { name: 'Card Manager', check: () => window.CardManager },
            { name: 'Sound Manager', check: () => window.SoundManager }
        ];

        for (let i = 0; i < dependencies.length; i++) {
            const dep = dependencies[i];
            const progress = ((i + 1) / dependencies.length) * 50; // First 50% for dependency loading
            
            this.updateLoadingProgress(progress, `Loading ${dep.name}...`);
            
            // Check if dependency is available
            if (!dep.check()) {
                throw new Error(`${dep.name} not loaded`);
            }
            
            // Small delay to show progress
            await this.delay(100);
        }
    }

    /**
     * Initialize the screen manager
     */
    async initializeScreenManager() {
        this.updateLoadingProgress(60, 'Initializing Screen Manager...');
        
        this.screenManager = new ScreenManager();
        await this.screenManager.initialize();
        
        await this.delay(100);
    }

    /**
     * Register all game screens
     */
    registerScreens() {
        this.updateLoadingProgress(70, 'Registering Screens...');
        
        // Register main menu screen
        this.screenManager.registerScreen('mainmenu', MainMenuScreen);
        
        // Register game screen
        this.screenManager.registerScreen('game', GameScreen);
        
        // TODO: Register additional screens as they're implemented
        // this.screenManager.registerScreen('deckbuilder', DeckBuilderScreen);
        // this.screenManager.registerScreen('options', OptionsScreen);
        // this.screenManager.registerScreen('achievements', AchievementsScreen);
        // this.screenManager.registerScreen('credits', CreditsScreen);
    }

    /**
     * Start the application by navigating to the main menu
     */
    async startApplication() {
        this.updateLoadingProgress(90, 'Starting Application...');
        
        // Small delay for final loading steps
        await this.delay(200);
        
        this.updateLoadingProgress(100, 'Ready!');
        
        // Hide loading screen
        await this.delay(300);
        this.hideInitialLoading();
        
        // TESTING MODE: Skip menu and go directly to game
        // TODO: Remove this testing code after debugging
        const TESTING_MODE = false;
        
        if (TESTING_MODE) {
            console.log('🧪 TESTING MODE: Going directly to game screen');
            await this.screenManager.navigateToScreen('game');
        } else {
            // Navigate to main menu
            await this.screenManager.navigateToScreen('mainmenu');
        }
    }

    /**
     * Hide the initial loading screen
     */
    hideInitialLoading() {
        const loadingElement = document.getElementById('app-loading');
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            loadingElement.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                if (loadingElement.parentNode) {
                    loadingElement.parentNode.removeChild(loadingElement);
                }
            }, 500);
        }
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div style="font-size: 4rem; margin-bottom: 20px; color: #DC143C;">⚠️</div>
                <h1 style="color: #DC143C; margin-bottom: 20px;">Error</h1>
                <p style="font-size: 1.2rem; margin-bottom: 30px; max-width: 600px;">
                    ${message}
                </p>
                <button onclick="location.reload()" style="
                    background: linear-gradient(145deg, rgba(220, 20, 60, 0.8), rgba(139, 0, 0, 0.8));
                    border: 2px solid #DC143C;
                    border-radius: 8px;
                    color: white;
                    padding: 12px 24px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    Reload Page
                </button>
            </div>
        `;
    }

    /**
     * Utility method for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get the screen manager instance
     */
    getScreenManager() {
        return this.screenManager;
    }

    /**
     * Check if app is initialized
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Cleanup and destroy the application
     */
    destroy() {
        if (this.screenManager) {
            this.screenManager.destroy();
            this.screenManager = null;
        }
        
        this.initialized = false;
        console.log('🗑️ Spell Caster App destroyed');
    }
}

// Global app instance
let spellCasterApp = null;

/**
 * Initialize the application when the page loads
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        spellCasterApp = new SpellCasterApp();
        await spellCasterApp.initialize();
    } catch (error) {
        console.error('Failed to start Spell Caster App:', error);
    }
});

// Export app instance to global scope for debugging
window.SpellCasterApp = SpellCasterApp;
window.getSpellCasterApp = () => spellCasterApp;