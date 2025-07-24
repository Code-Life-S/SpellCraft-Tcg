/**
 * BaseScreen - Abstract base class for all game screens
 * Provides common functionality and lifecycle management
 */
class BaseScreen {
    constructor(screenManager) {
        this.screenManager = screenManager;
        this.element = null;
        this.isVisible = false;
        this.isInitialized = false;
        this.eventListeners = [];
        
        // Screen-specific data
        this.screenData = {};
        
        // Performance tracking
        this.showStartTime = 0;
        this.hideStartTime = 0;
    }

    /**
     * Initialize the screen - called once when screen is first created
     * Override this method in child classes
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn(`${this.constructor.name} already initialized`);
            return;
        }

        try {
            // Create screen element first
            this.createElement();
            
            // Ensure element was created successfully
            if (!this.element) {
                throw new Error('Failed to create screen element');
            }
            
            // Setup screen content
            await this.setupContent();
            
            // Bind events
            this.bindEvents();
            
            this.isInitialized = true;
            console.log(`Screen ${this.constructor.name} initialized successfully`);
            
        } catch (error) {
            console.error(`Failed to initialize ${this.constructor.name}:`, error);
            throw error;
        }
    }

    /**
     * Create the main screen element
     */
    createElement() {
        this.element = document.createElement('div');
        this.element.className = `screen ${this.getScreenClass()}`;
        this.element.id = `screen-${this.getScreenId()}`;
        
        // Add to screen container
        const container = this.screenManager.getScreenContainer();
        if (!container) {
            throw new Error('Screen container not available');
        }
        container.appendChild(this.element);
    }

    /**
     * Setup screen content - override in child classes
     */
    async setupContent() {
        // Default implementation - child classes should override
        this.element.innerHTML = `
            <div class="screen-placeholder">
                <h1>${this.constructor.name}</h1>
                <p>This screen is not yet implemented.</p>
            </div>
        `;
    }

    /**
     * Show the screen with optional data
     */
    async show(data = {}) {
        if (this.isVisible) {
            console.warn(`${this.constructor.name} is already visible`);
            return;
        }

        this.showStartTime = performance.now();
        this.screenData = { ...this.screenData, ...data };

        try {
            // Call pre-show hook
            await this.onBeforeShow(data);
            
            // Make screen visible
            this.element.classList.add('active');
            this.isVisible = true;
            
            // Call post-show hook
            await this.onAfterShow(data);
            
            const showTime = performance.now() - this.showStartTime;
            console.log(`Screen ${this.constructor.name} shown in ${showTime.toFixed(2)}ms`);
            
        } catch (error) {
            console.error(`Failed to show ${this.constructor.name}:`, error);
            throw error;
        }
    }

    /**
     * Hide the screen
     */
    async hide() {
        if (!this.isVisible) {
            console.warn(`${this.constructor.name} is already hidden`);
            return;
        }

        this.hideStartTime = performance.now();

        try {
            // Call pre-hide hook
            await this.onBeforeHide();
            
            // Add transition class
            this.element.classList.add('transitioning-out');
            
            // Wait for transition
            await this.waitForTransition();
            
            // Hide screen
            this.element.classList.remove('active', 'transitioning-out');
            this.isVisible = false;
            
            // Call post-hide hook
            await this.onAfterHide();
            
            const hideTime = performance.now() - this.hideStartTime;
            console.log(`Screen ${this.constructor.name} hidden in ${hideTime.toFixed(2)}ms`);
            
        } catch (error) {
            console.error(`Failed to hide ${this.constructor.name}:`, error);
            throw error;
        }
    }

    /**
     * Wait for CSS transition to complete
     */
    waitForTransition() {
        return new Promise(resolve => {
            const transitionDuration = 300; // Match CSS transition duration
            setTimeout(resolve, transitionDuration);
        });
    }

    /**
     * Bind event listeners - override in child classes
     */
    bindEvents() {
        // Default implementation - child classes should override
        // Use addEventListenerSafe for automatic cleanup
    }

    /**
     * Safely add event listener with automatic cleanup tracking
     */
    addEventListenerSafe(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        // Track for cleanup
        this.eventListeners.push({
            element,
            event,
            handler,
            options
        });
    }

    /**
     * Remove all tracked event listeners
     */
    removeAllEventListeners() {
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.eventListeners = [];
    }

    /**
     * Navigate to another screen
     */
    navigateTo(screenName, data = {}) {
        return this.screenManager.navigateToScreen(screenName, data);
    }

    /**
     * Go back to previous screen
     */
    goBack() {
        return this.screenManager.goBack();
    }

    /**
     * Get screen-specific CSS class - override in child classes
     */
    getScreenClass() {
        return this.constructor.name.toLowerCase().replace('screen', '');
    }

    /**
     * Get screen ID - override in child classes
     */
    getScreenId() {
        return this.getScreenClass();
    }

    /**
     * Lifecycle hooks - override in child classes
     */
    async onBeforeShow(data) {
        // Called before screen becomes visible
    }

    async onAfterShow(data) {
        // Called after screen becomes visible
    }

    async onBeforeHide() {
        // Called before screen becomes hidden
    }

    async onAfterHide() {
        // Called after screen becomes hidden
    }

    /**
     * Update screen content - override in child classes
     */
    async update(data = {}) {
        this.screenData = { ...this.screenData, ...data };
        // Child classes should override to update their content
    }

    /**
     * Get current screen data
     */
    getScreenData() {
        return { ...this.screenData };
    }

    /**
     * Check if screen is currently visible
     */
    getIsVisible() {
        return this.isVisible;
    }

    /**
     * Get screen element
     */
    getElement() {
        return this.element;
    }

    /**
     * Cleanup and destroy screen
     */
    destroy() {
        try {
            // Remove event listeners
            this.removeAllEventListeners();
            
            // Remove element from DOM
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            
            // Reset state
            this.element = null;
            this.isVisible = false;
            this.isInitialized = false;
            this.screenData = {};
            
            console.log(`Screen ${this.constructor.name} destroyed`);
            
        } catch (error) {
            console.error(`Failed to destroy ${this.constructor.name}:`, error);
        }
    }

    /**
     * Utility method to create HTML elements with classes and content
     */
    createElementHelper(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    /**
     * Utility method to show temporary messages
     */
    showMessage(message, type = 'info', duration = 3000) {
        // Initialize message queue if it doesn't exist
        if (!window.screenMessageQueue) {
            window.screenMessageQueue = [];
            window.screenMessageActive = false;
        }

        // Add message to queue
        window.screenMessageQueue.push({ message, type, duration });
        
        // Process queue if not already processing
        if (!window.screenMessageActive) {
            this.processScreenMessageQueue();
        }
    }

    processScreenMessageQueue() {
        if (window.screenMessageQueue.length === 0) {
            window.screenMessageActive = false;
            return;
        }

        window.screenMessageActive = true;
        const { message, type, duration } = window.screenMessageQueue.shift();

        const messageDiv = this.createElementHelper('div', `screen-message ${type}`, message);
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #FFD700;
            color: #000;
            padding: 15px 25px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            z-index: 10001;
            text-align: center;
            border: 2px solid #FFD700;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
            min-width: 200px;
            max-width: 400px;
            animation: screenMessageSlideIn 0.3s ease-out;
        `;

        // Add type-specific styling
        switch(type) {
            case 'error':
                messageDiv.style.background = '#DC143C';
                messageDiv.style.borderColor = '#DC143C';
                messageDiv.style.color = '#fff';
                break;
            case 'success':
                messageDiv.style.background = '#32CD32';
                messageDiv.style.borderColor = '#32CD32';
                messageDiv.style.color = '#000';
                break;
            case 'warning':
                messageDiv.style.background = '#FFA500';
                messageDiv.style.borderColor = '#FFA500';
                messageDiv.style.color = '#000';
                break;
            default: // info
                messageDiv.style.background = '#FFD700';
                messageDiv.style.borderColor = '#FFD700';
                messageDiv.style.color = '#000';
                break;
        }

        document.body.appendChild(messageDiv);

        // Add CSS animations if not already added
        this.addScreenMessageAnimations();

        setTimeout(() => {
            messageDiv.style.animation = 'screenMessageSlideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (document.body.contains(messageDiv)) {
                    document.body.removeChild(messageDiv);
                }
                // Process next message in queue
                this.processScreenMessageQueue();
            }, 300);
        }, duration);
    }

    addScreenMessageAnimations() {
        // Check if animations are already added
        if (document.querySelector('#screen-message-animations')) return;

        const style = document.createElement('style');
        style.id = 'screen-message-animations';
        style.textContent = `
            @keyframes screenMessageSlideIn {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.9);
                }
                100% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }

            @keyframes screenMessageSlideOut {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.9);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Export to global scope
window.BaseScreen = BaseScreen;