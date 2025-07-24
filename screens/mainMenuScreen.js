/**
 * MainMenuScreen - The main menu of the game
 * Provides navigation to different game modes and options
 */
class MainMenuScreen extends BaseScreen {
    constructor(screenManager) {
        super(screenManager);
        this.soundManager = null;
        this.backgroundMusicStarted = false;
    }

    async setupContent() {
        try {
            // Load HTML template from external file
            const html = await window.templateLoader.loadScreenTemplate('screens/mainmenu', 'mainMenuScreen');
            this.element.innerHTML = html;
        } catch (error) {
            console.error('Failed to load main menu template, using fallback:', error);
            // Fallback to inline HTML if template loading fails
            this.element.innerHTML = `
                <div class="main-menu">
                    <div class="menu-content">
                        <div class="game-title">
                            <h1 class="title-text">
                                <span class="title-spell">🔮</span>
                                <span class="title-main">Spell Caster</span>
                                <span class="title-subtitle">Wave Defense TCG</span>
                            </h1>
                        </div>
                        <div class="menu-options">
                            <button class="menu-btn primary" id="start-adventure">
                                <span class="btn-icon">⚔️</span>
                                <span class="btn-text">Start Adventure</span>
                            </button>
                            <button class="menu-btn" id="exit-game">
                                <span class="btn-icon">❌</span>
                                <span class="btn-text">Exit Game</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            // Add fallback styles
            this.addMenuStyles();
        }
        
        // Initialize sound manager
        this.initializeSoundManager();
        
        // Load and display game stats
        this.loadGameStats();
        
        // Create background effects
        this.createBackgroundEffects();
    }

    addMenuStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .main-menu {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                position: relative;
                overflow: hidden;
            }

            .menu-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            }

            .floating-particles {
                position: absolute;
                width: 100%;
                height: 100%;
                background-image: 
                    radial-gradient(2px 2px at 20px 30px, #FFD700, transparent),
                    radial-gradient(2px 2px at 40px 70px, #87CEEB, transparent),
                    radial-gradient(1px 1px at 90px 40px, #FF69B4, transparent),
                    radial-gradient(1px 1px at 130px 80px, #98FB98, transparent);
                background-repeat: repeat;
                background-size: 200px 100px;
                animation: float 20s linear infinite;
                opacity: 0.6;
            }

            .magic-circles {
                position: absolute;
                width: 100%;
                height: 100%;
                background: 
                    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(135, 206, 235, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(255, 105, 180, 0.1) 0%, transparent 50%);
                animation: pulse 8s ease-in-out infinite;
            }

            @keyframes float {
                0% { transform: translateY(0px) rotate(0deg); }
                100% { transform: translateY(-100px) rotate(360deg); }
            }

            @keyframes pulse {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.1); }
            }

            .menu-content {
                position: relative;
                z-index: 2;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 40px;
                max-width: 600px;
                width: 90%;
            }

            .game-title {
                text-align: center;
                position: relative;
                margin-bottom: 20px;
            }

            .title-text {
                font-size: clamp(2.5rem, 5vw, 4rem);
                font-weight: bold;
                margin: 0;
                text-shadow: 
                    0 0 10px rgba(255, 215, 0, 0.8),
                    0 0 20px rgba(255, 215, 0, 0.6),
                    0 0 30px rgba(255, 215, 0, 0.4);
                animation: titleGlow 3s ease-in-out infinite;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }

            .title-spell {
                font-size: 1.2em;
                animation: spin 4s linear infinite;
            }

            .title-main {
                background: linear-gradient(45deg, #FFD700, #FFA500, #FF6347, #FFD700);
                background-size: 300% 300%;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: gradientShift 3s ease-in-out infinite;
            }

            .title-subtitle {
                font-size: 0.4em;
                color: #87CEEB;
                font-weight: normal;
                letter-spacing: 2px;
            }

            @keyframes titleGlow {
                0%, 100% { text-shadow: 0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6); }
                50% { text-shadow: 0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 215, 0, 0.8); }
            }

            @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .menu-options {
                display: flex;
                flex-direction: column;
                gap: 15px;
                width: 100%;
                max-width: 400px;
            }

            .menu-btn {
                background: linear-gradient(145deg, rgba(30, 30, 50, 0.9), rgba(50, 50, 80, 0.9));
                border: 2px solid rgba(255, 215, 0, 0.6);
                border-radius: 12px;
                color: #fff;
                padding: 15px 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 15px;
                text-align: left;
                position: relative;
                overflow: hidden;
                font-family: inherit;
            }

            .menu-btn:hover {
                background: linear-gradient(145deg, rgba(50, 50, 80, 0.9), rgba(70, 70, 100, 0.9));
                border-color: #FFD700;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
            }

            .menu-btn.primary {
                background: linear-gradient(145deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2));
                border-color: #FFD700;
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
            }

            .menu-btn.primary:hover {
                background: linear-gradient(145deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.3));
                box-shadow: 0 8px 30px rgba(255, 215, 0, 0.4);
            }

            .menu-btn.danger {
                border-color: rgba(220, 20, 60, 0.6);
            }

            .menu-btn.danger:hover {
                border-color: #DC143C;
                box-shadow: 0 8px 25px rgba(220, 20, 60, 0.3);
            }

            .btn-icon {
                font-size: 24px;
                min-width: 30px;
                text-align: center;
            }

            .btn-text {
                font-size: 18px;
                font-weight: bold;
                flex: 1;
            }

            .btn-description {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                display: block;
                margin-top: 2px;
            }

            .game-stats {
                display: flex;
                gap: 30px;
                margin-top: 20px;
                flex-wrap: wrap;
                justify-content: center;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(0, 0, 0, 0.3);
                padding: 10px 15px;
                border-radius: 8px;
                border: 1px solid rgba(255, 215, 0, 0.3);
            }

            .stat-icon {
                font-size: 16px;
            }

            .stat-label {
                font-size: 14px;
                color: #FFD700;
            }

            .stat-value {
                font-size: 14px;
                font-weight: bold;
                color: #fff;
                min-width: 30px;
                text-align: center;
            }

            .version-info {
                position: absolute;
                bottom: 20px;
                left: 20px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
                display: flex;
                gap: 10px;
                z-index: 2;
            }

            .menu-audio-controls {
                position: absolute;
                top: 20px;
                right: 20px;
                display: flex;
                gap: 10px;
                z-index: 2;
            }

            .audio-btn {
                width: 40px;
                height: 40px;
                background: linear-gradient(145deg, rgba(30, 30, 50, 0.9), rgba(50, 50, 80, 0.9));
                border: 2px solid rgba(255, 215, 0, 0.6);
                border-radius: 8px;
                color: #FFD700;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .audio-btn:hover {
                background: linear-gradient(145deg, rgba(50, 50, 80, 0.9), rgba(70, 70, 100, 0.9));
                border-color: #FFD700;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
            }

            .audio-btn.disabled {
                opacity: 0.5;
                color: #888;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .menu-content {
                    gap: 30px;
                }

                .game-stats {
                    gap: 15px;
                }

                .stat-item {
                    padding: 8px 12px;
                }

                .menu-btn {
                    padding: 12px 15px;
                }

                .btn-text {
                    font-size: 16px;
                }

                .version-info {
                    bottom: 10px;
                    left: 10px;
                }

                .menu-audio-controls {
                    top: 10px;
                    right: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // Menu navigation buttons
        this.addEventListenerSafe(
            this.element.querySelector('#start-adventure'),
            'click',
            () => this.startAdventure()
        );

        this.addEventListenerSafe(
            this.element.querySelector('#deck-builder'),
            'click',
            () => this.openDeckBuilder()
        );

        this.addEventListenerSafe(
            this.element.querySelector('#options'),
            'click',
            () => this.openOptions()
        );

        this.addEventListenerSafe(
            this.element.querySelector('#achievements'),
            'click',
            () => this.openAchievements()
        );

        this.addEventListenerSafe(
            this.element.querySelector('#credits'),
            'click',
            () => this.openCredits()
        );

        this.addEventListenerSafe(
            this.element.querySelector('#exit-game'),
            'click',
            () => this.exitGame()
        );

        // Audio controls
        this.addEventListenerSafe(
            this.element.querySelector('#menu-toggle-sound'),
            'click',
            () => this.toggleSound()
        );

        this.addEventListenerSafe(
            this.element.querySelector('#menu-toggle-music'),
            'click',
            () => this.toggleMusic()
        );

        // Keyboard navigation
        this.addEventListenerSafe(document, 'keydown', (e) => this.handleKeyboard(e));
    }

    async onAfterShow() {
        // Start background music after a short delay
        if (!this.backgroundMusicStarted) {
            setTimeout(() => {
                this.startBackgroundMusic();
            }, 1000);
        }

        // Update audio button states
        this.updateAudioButtons();
    }

    initializeSoundManager() {
        if (window.SoundManager) {
            // Use global sound manager instance to prevent multiple background music
            if (window.globalSoundManager) {
                this.soundManager = window.globalSoundManager;
            } else {
                this.soundManager = new SoundManager();
                this.soundManager.setAsGlobalInstance();
            }
            
            // Load and apply saved audio preferences
            this.initializeAudioPreferences();
        } else {
            console.warn('SoundManager not available');
        }
    }

    initializeAudioPreferences() {
        // Load saved audio preferences
        const soundEnabled = localStorage.getItem('soundEnabled');
        const musicEnabled = localStorage.getItem('musicEnabled');
        
        // Apply sound preference
        if (soundEnabled !== null && this.soundManager) {
            const enabled = soundEnabled === 'true';
            // Set sound manager state to match saved preference
            if (this.soundManager.enabled !== enabled) {
                this.soundManager.toggle();
            }
        }
        
        // Music preference will be applied when startBackgroundMusic is called
    }

    startBackgroundMusic() {
        if (this.soundManager && !this.backgroundMusicStarted) {
            const musicEnabled = localStorage.getItem('musicEnabled');
            const shouldPlayMusic = musicEnabled === null || musicEnabled === 'true';
            
            if (shouldPlayMusic) {
                this.soundManager.playBackgroundMusic();
            }
            
            this.backgroundMusicStarted = true;
        }
    }

    updateAudioButtons() {
        const soundBtn = this.element.querySelector('#menu-toggle-sound');
        const musicBtn = this.element.querySelector('#menu-toggle-music');

        if (this.soundManager && soundBtn && musicBtn) {
            // Update sound button
            const soundEnabled = this.soundManager.enabled;
            soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
            soundBtn.classList.toggle('disabled', !soundEnabled);

            // Update music button
            const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
            const isPlaying = this.soundManager.backgroundMusicPlaying;
            musicBtn.textContent = (musicEnabled && isPlaying) ? '🎶' : '🎵';
            musicBtn.classList.toggle('disabled', !musicEnabled);
        }
    }

    loadGameStats() {
        // Load stats from localStorage
        const stats = {
            bestWave: localStorage.getItem('bestWave') || '0',
            totalVictories: localStorage.getItem('totalVictories') || '0',
            spellsCast: localStorage.getItem('spellsCast') || '0'
        };

        // Update display
        this.element.querySelector('#best-wave').textContent = stats.bestWave;
        this.element.querySelector('#total-victories').textContent = stats.totalVictories;
        this.element.querySelector('#spells-cast').textContent = stats.spellsCast;
    }

    createBackgroundEffects() {
        // Add some dynamic particle effects
        const particlesContainer = this.element.querySelector('.floating-particles');
        
        // Create additional floating elements
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${2 + Math.random() * 4}px;
                height: ${2 + Math.random() * 4}px;
                background: ${['#FFD700', '#87CEEB', '#FF69B4', '#98FB98'][Math.floor(Math.random() * 4)]};
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${10 + Math.random() * 20}s linear infinite;
                opacity: ${0.3 + Math.random() * 0.4};
            `;
            particlesContainer.appendChild(particle);
        }
    }

    // Menu Action Methods
    async startAdventure() {
        this.playButtonSound();
        this.showMessage('Starting adventure...', 'info', 1000);
        
        // Navigate to game screen
        await this.navigateTo('game');
    }

    async openDeckBuilder() {
        this.playButtonSound();
        this.showMessage('Deck Builder coming soon!', 'info');
        // TODO: Navigate to deck builder when implemented
        // await this.navigateTo('deckbuilder');
    }

    async openOptions() {
        this.playButtonSound();
        this.showMessage('Options coming soon!', 'info');
        // TODO: Navigate to options when implemented
        // await this.navigateTo('options');
    }

    async openAchievements() {
        this.playButtonSound();
        this.showMessage('Achievements coming soon!', 'info');
        // TODO: Navigate to achievements when implemented
        // await this.navigateTo('achievements');
    }

    async openCredits() {
        this.playButtonSound();
        this.showMessage('Credits coming soon!', 'info');
        // TODO: Navigate to credits when implemented
        // await this.navigateTo('credits');
    }

    exitGame() {
        this.playButtonSound();
        
        const confirmExit = confirm('Are you sure you want to exit the game?');
        if (confirmExit) {
            // In a web browser, we can't actually close the window
            // But we can show a message or redirect
            this.showMessage('Thanks for playing! Close this tab to exit.', 'info', 5000);
        }
    }

    toggleSound() {
        if (this.soundManager) {
            const enabled = this.soundManager.toggle();
            const button = this.element.querySelector('#menu-toggle-sound');
            button.textContent = enabled ? '🔊' : '🔇';
            button.classList.toggle('disabled', !enabled);
            
            // Save preference to localStorage
            localStorage.setItem('soundEnabled', enabled.toString());
            this.playButtonSound();
        }
    }

    toggleMusic() {
        const button = this.element.querySelector('#menu-toggle-music');
        const isPlaying = !button.classList.contains('disabled');
        
        if (isPlaying) {
            if (this.soundManager) {
                this.soundManager.stopBackgroundMusic();
            }
            button.textContent = '🎵';
            button.classList.add('disabled');
            // Save preference to localStorage
            localStorage.setItem('musicEnabled', 'false');
        } else {
            if (this.soundManager) {
                this.soundManager.playBackgroundMusic();
            }
            button.textContent = '🎶';
            button.classList.remove('disabled');
            // Save preference to localStorage
            localStorage.setItem('musicEnabled', 'true');
        }
        
        this.playButtonSound();
    }

    handleKeyboard(e) {
        // Handle keyboard shortcuts
        switch(e.key) {
            case 'Enter':
                // Start adventure with Enter key
                this.startAdventure();
                break;
            case 'Escape':
                // Exit game with Escape key
                this.exitGame();
                break;
        }
    }

    playButtonSound() {
        if (this.soundManager) {
            this.soundManager.play('button_click');
        }
    }

    getScreenClass() {
        return 'main-menu';
    }

    getScreenId() {
        return 'main-menu';
    }
}

// Export to global scope
window.MainMenuScreen = MainMenuScreen;