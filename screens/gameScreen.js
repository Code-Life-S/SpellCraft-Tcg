/**
 * GameScreen - The main gameplay screen
 * Contains the spell casting wave defense game logic
 */
class GameScreen extends BaseScreen {
    constructor(screenManager) {
        super(screenManager);
        
        // Game state
        this.playerHand = [];
        this.currentMana = 1;
        this.maxMana = 1;
        this.playerHealth = 30;
        this.maxHealth = 30;
        this.playerShield = 0;
        this.currentTurn = 1;
        this.enemies = [];
        this.enemyIdCounter = 1;
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
        this.isPlayerTurn = true;
        
        // Managers
        this.cardManager = null;
        this.soundManager = null;
        
        // UI state
        this.selectedCard = null;
        this.selectedCardIndex = null;
        this.actionHistory = [];
        this.sidebarStates = {
            history: true,
            deck: true
        };
        
        // Audio state
        this.backgroundMusicStarted = false;
    }

    async setupContent() {
        try {
            // Load HTML template from external file
            if (window.templateLoader && typeof window.templateLoader.loadScreenTemplate === 'function') {
                const html = await window.templateLoader.loadScreenTemplate('screens/game', 'gameScreen');
                this.element.innerHTML = html;
            } else {
                console.warn('Template loader not available, using fallback HTML');
                this.loadFallbackHTML();
            }
        } catch (error) {
            console.error('Failed to load game screen template, using fallback:', error);
            this.loadFallbackHTML();
        }

        // CSS should now be loaded automatically by template loader

        // Load shared component CSS
        const componentCSS = [
            'screens/components/spell-card/spellCardComponent.css',
            'screens/components/visual-effects/visualEffectsComponent.css',
            'screens/components/enemy-board/enemyBoardComponent.css',
            'screens/components/mulligan/mulligan.css'
        ];
        for (const cssPath of componentCSS) {
            try {
                if (window.templateLoader && typeof window.templateLoader.loadCSS === 'function') {
                    await window.templateLoader.loadCSS(cssPath, cssPath.replace(/[\/\.]/g, '-'));
                }
            } catch (error) {
                console.warn('Failed to load component CSS:', error);
            }
        }

        // Create shared component instances
        this.visualEffects = new VisualEffectsComponent(this.element);
        this.enemyBoard = new EnemyBoardComponent(this.element, '#enemy-battlefield');
        this.playerHandComp = new PlayerHandComponent(this.element, '#player-hand');
        this.deckTracker = new DeckTrackerComponent(this.element, '.deck-tracker');
        this.actionHistoryComp = new ActionHistoryComponent(this.element, '#action-history');

        // Initialize managers
        await this.initializeManagers();
        
        // Set up deck tracker data sources
        this.deckTracker.setDataSources(
            () => this.cardManager.getDeckInfo(),
            () => this.cardManager.getRemainingCardCounts(),
            (id) => this.cardManager.getCardById(id)
        );

        // Initialize game
        await this.initializeGame();
        
        // Don't start mulligan yet - wait for deck to be loaded in onBeforeShow
    }

    loadFallbackHTML() {
        console.log('🔧 Loading fallback HTML for game screen');
        this.element.innerHTML = `
            <div class="game-container">
                <div class="game-board">
                    <div class="game-info">
                        <div class="turn-counter">
                            <span class="turn-label">Turn</span>
                            <span class="turn-number" id="turn-number">1</span>
                        </div>
                        <div class="enemies-remaining">
                            <span class="enemies-label">Enemies:</span>
                            <span class="enemies-count" id="enemies-count">0</span>
                        </div>
                        <div class="game-status">
                            <span class="status-text" id="game-status">Your Turn</span>
                        </div>
                        <div class="ui-controls">
                            <button class="ui-btn" id="back-to-menu" title="Back to Main Menu">🏠</button>
                            <button class="ui-btn" id="toggle-history" title="Toggle Action History">📜</button>
                            <button class="ui-btn" id="toggle-deck" title="Toggle Deck Tracker">🃏</button>
                            <div class="audio-controls">
                                <button class="ui-btn audio-btn" id="toggle-sound" title="Toggle Sound">🔊</button>
                                <button class="ui-btn audio-btn" id="toggle-music" title="Toggle Music">🎵</button>
                            </div>
                        </div>
                    </div>

                    <div class="main-game-area">
                        <div class="left-sidebar" id="left-sidebar">
                            <div class="history-panel">
                                <h3>Action History</h3>
                                <div class="history-content" id="action-history"></div>
                            </div>
                        </div>

                        <div class="center-battlefield">
                            <div class="enemy-battlefield" id="enemy-battlefield"></div>
                        </div>

                        <div class="right-sidebar" id="right-sidebar">
                            <div class="deck-tracker">
                                <h3>Deck Tracker</h3>
                                <div class="deck-info">
                                    <div class="deck-count">
                                        <span class="deck-remaining" id="deck-remaining">30</span>
                                        <span class="deck-total">/ 30</span>
                                    </div>
                                </div>
                                <div class="deck-cards" id="deck-cards"></div>
                            </div>
                        </div>
                    </div>

                    <div class="player-area">
                        <div class="player-hero">
                            <div class="hero-portrait">
                                <div class="hero-stats">
                                    <span class="hero-health" id="player-health">❤️ 30/30</span>
                                    <span class="hero-shield" id="player-shield" style="display: none;">🛡️0</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="player-hand" id="player-hand"></div>
                        
                        <div class="player-info">
                            <div class="mana-crystals">
                                <span class="current-mana" id="current-mana">3</span>
                                <span class="max-mana" id="max-mana">/10</span>
                            </div>
                            <button class="end-turn-btn" id="end-turn">End Turn</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }


    async initializeManagers() {
        // Initialize card manager
        if (window.CardManager) {
            this.cardManager = new CardManager();
            await this.cardManager.loadCards();
        } else {
            throw new Error('CardManager not available');
        }

        // Initialize sound manager - use global instance if available
        if (window.SoundManager) {
            if (window.globalSoundManager) {
                this.soundManager = window.globalSoundManager;
            } else {
                this.soundManager = new SoundManager();
                this.soundManager.setAsGlobalInstance();
            }
        } else {
            console.warn('SoundManager not available');
        }
    }

    async onBeforeShow(data) {
        // Ensure active class is set (from deck if available)
        if (data && data.deckId && this.cardManager) {
            var deck = this.cardManager.deckStorage.getDeck(data.deckId);
            if (deck && deck.class) {
                ClassManager.setActiveClass(deck.class);
            }
        }

        // Load the selected deck if provided
        if (data && data.deckId) {
            const success = this.cardManager.loadDeck(data.deckId);
            if (success) {
                console.log(`✅ Loaded deck for game: ${data.deckId}`);
            } else {
                console.warn(`⚠️ Failed to load deck ${data.deckId}, using default`);
                this.cardManager.loadDeck('starter_deck');
            }
        } else {
            // Fallback to starter deck if no deck specified
            console.log('🎯 No deck specified, using starter deck');
            this.cardManager.loadDeck('starter_deck');
        }
        
        // Inject class cards into deck
        this.injectClassCards();
        
        // Now that deck is loaded, create cards and start mulligan
        this.createSpellCards();
        this.renderPlayerHand();
        this.updateDeckTracker();
        this.startMulliganPhase();
    }

    async initializeGame() {
        // Initialize UI toggles
        this.initializeUIToggles();
        
        // Initialize audio preferences
        this.initializeAudioPreferences();
        
        // Initialize game state (but don't create cards yet - wait for deck selection)
        this.spawnInitialEnemies();
        this.updateUI();
        
        // Initialize history display
        this.updateHistoryDisplay();
        
        // Initialize mulligan state
        this.selectedCardsForMulligan = new Set();
    }

    bindEvents() {
        // Card and enemy click events
        this.addEventListenerSafe(document, 'click', (e) => {
            // Start background music on first click
            this.startBackgroundMusicIfNeeded();
            
            if (e.target.closest('.card')) {
                const card = e.target.closest('.card');
                this.handleCardClick(card);
            }
            
            if (e.target.closest('.enemy')) {
                const enemy = e.target.closest('.enemy');
                this.handleEnemyClick(enemy);
            }
        });

        // End turn button
        this.addEventListenerSafe(
            this.element.querySelector('#end-turn'),
            'click',
            () => {
                this.soundManager?.play('button_click');
                this.endTurn();
            }
        );

        // Back to menu button
        this.addEventListenerSafe(
            this.element.querySelector('#back-to-menu'),
            'click',
            () => this.backToMenu()
        );

        // UI toggle buttons
        this.addEventListenerSafe(
            this.element.querySelector('#toggle-history'),
            'click',
            () => this.toggleSidebar('history')
        );

        this.addEventListenerSafe(
            this.element.querySelector('#toggle-deck'),
            'click',
            () => this.toggleSidebar('deck')
        );

        // Audio control buttons
        this.addEventListenerSafe(
            this.element.querySelector('#toggle-sound'),
            'click',
            () => this.toggleSound()
        );

        this.addEventListenerSafe(
            this.element.querySelector('#toggle-music'),
            'click',
            () => this.toggleMusic()
        );

        // Animation system is working properly!

        // Card hover effects
        this.addEventListenerSafe(document, 'mouseover', (e) => {
            if (e.target.closest('.card')) {
                this.showCardDetails(e.target.closest('.card'));
            }
        });
    }

    async onAfterShow() {
        // Stop any existing background music from other screens
        if (this.soundManager) {
            this.soundManager.stopBackgroundMusic();
        }
        
        // Start background music if needed
        this.startBackgroundMusicIfNeeded();
        
        // Update audio button states
        this.updateAudioButtons();
        
        // Update sidebar visibility
        this.updateSidebarVisibility();
    }

    // Game Logic Methods (extracted from original script.js)
    injectClassCards() {
        var classCards = ClassManager.getClassCardIds(ClassManager.getActiveClassId());
        var _this = this;
        classCards.forEach(function(cardId) {
            var cardData = _this.cardManager.getCardById(cardId);
            if (cardData) {
                _this.cardManager.currentDeck.push({
                    ...cardData,
                    deckIndex: _this.cardManager.currentDeck.length
                });
            }
        });
        _this.cardManager.resetDeck();
    }

    createSpellCards() {
        // Get starting hand from deck (4 cards for mulligan)
        this.playerHand = this.cardManager.getStartingHand(4);
        
        // Set initial game state to mulligan phase
        this.gameState = 'mulligan';
        this.isPlayerTurn = false; // Disable normal gameplay during mulligan
    }

    spawnInitialEnemies() {
        // Spawn a small group of enemies for the battle
        const enemyTypes = [
            { name: "Goblin", art: "👹", health: 3, attack: 2 },
            { name: "Orc", art: "👿", health: 5, attack: 3 },
            { name: "Skeleton", art: "💀", health: 2, attack: 1 },
            { name: "Wolf", art: "🐺", health: 4, attack: 2 },
            { name: "Bandit", art: "🗡️", health: 3, attack: 2 },
            { name: "Spider", art: "🕷️", health: 2, attack: 1 },
            { name: "Dark Mage", art: "🧙‍♂️", health: 4, attack: 3 },
            { name: "Minotaur", art: "🐂", health: 6, attack: 4 },
            { name: "Wraith", art: "👻", health: 3, attack: 2 },
            { name: "Gargoyle", art: "🗿", health: 5, attack: 2 },
            { name: "Demon", art: "😈", health: 4, attack: 3 },
            { name: "Vampire", art: "🧛", health: 4, attack: 3 }
        ];

        // Spawn 3-4 enemies for the battle
        const enemyCount = Math.floor(Math.random() * 2) + 3; // 3-4 enemies
        
        for (let i = 0; i < enemyCount; i++) {
            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            this.enemies.push({
                id: this.enemyIdCounter++,
                name: enemyType.name,
                art: enemyType.art,
                health: enemyType.health,
                maxHealth: enemyType.health,
                attack: enemyType.attack,
                ability: typeof getRandomAbilityChance === 'function' ? getRandomAbilityChance() : null
            });
        }
        
        this.renderEnemies();
    }

    renderPlayerHand() {
        this.playerHandComp.render(this.playerHand, this.currentMana);
    }

    renderEnemies() {
        const dyingEnemies = this.enemies.filter(e => e.isDying);
        if (dyingEnemies.length === 0) {
            this.enemyBoard.renderEnemies(this.enemies);
        } else {
            // Selective update: only update non-dying enemies
            this.enemies.forEach(enemy => {
                if (!enemy.isDying) {
                    const existingElement = this.enemyBoard.container.querySelector(`[data-enemy-id="${enemy.id}"]`);
                    if (existingElement) {
                        const healthDiv = existingElement.querySelector('.enemy-health');
                        if (healthDiv) healthDiv.textContent = enemy.health;
                    } else {
                        const el = this.enemyBoard.createEnemyElement(enemy);
                        this.enemyBoard.container.appendChild(el);
                    }
                }
            });
            this.enemyBoard.updateAllStatusOverlays(this.enemies);
        }
    }

    // UI Management Methods
    async backToMenu() {
        this.soundManager?.play('button_click');
        
        const confirmExit = confirm('Are you sure you want to return to the main menu? Your progress will be lost.');
        if (confirmExit) {
            // Save any stats before leaving
            this.saveGameStats();
            
            // Stop background music before leaving
            if (this.soundManager) {
                this.soundManager.stopBackgroundMusic();
            }
            
            // Navigate back to main menu
            await this.navigateTo('mainmenu');
        }
    }

    saveGameStats() {
        // Save current game stats to localStorage
        const currentBest = parseInt(localStorage.getItem('bestWave') || '0');
        if (this.currentTurn > currentBest) {
            localStorage.setItem('bestWave', this.currentTurn.toString());
        }
        
        // Increment spells cast counter
        const currentSpellsCast = parseInt(localStorage.getItem('spellsCast') || '0');
        // We would track spells cast during the game and add them here
        // For now, just increment by the number of turns (rough estimate)
        localStorage.setItem('spellsCast', (currentSpellsCast + this.currentTurn).toString());
    }

    updateAudioButtons() {
        const soundBtn = this.element.querySelector('#toggle-sound');
        const musicBtn = this.element.querySelector('#toggle-music');

        if (this.soundManager && soundBtn && musicBtn) {
            // Update sound button
            const soundEnabled = this.soundManager.enabled;
            soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
            soundBtn.classList.toggle('disabled', !soundEnabled);

            // Update music button based on localStorage and current playing state
            const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
            const isPlaying = this.soundManager.backgroundMusicPlaying;
            musicBtn.textContent = (musicEnabled && isPlaying) ? '🎶' : '🎵';
            musicBtn.classList.toggle('disabled', !musicEnabled || !isPlaying);
        }
    }

    startBackgroundMusicIfNeeded() {
        if (!this.backgroundMusicStarted && this.soundManager) {
            // Always stop any existing music first to prevent overlapping
            this.soundManager.stopBackgroundMusic();
            
            this.backgroundMusicStarted = true;
            
            // Check if music is enabled in localStorage before auto-starting
            const musicEnabled = localStorage.getItem('musicEnabled');
            const shouldPlayMusic = musicEnabled === null || musicEnabled === 'true';
            
            if (shouldPlayMusic) {
                setTimeout(() => {
                    // Double-check that no music is playing before starting
                    if (!this.soundManager.backgroundMusicPlaying) {
                        this.soundManager.playBackgroundMusic();
                        // Update music button to show it's playing
                        const musicButton = this.element.querySelector('#toggle-music');
                        if (musicButton) {
                            musicButton.textContent = '🎶';
                            musicButton.classList.remove('disabled');
                        }
                    }
                }, 500);
            }
        }
    }

    // Audio Control Methods
    toggleSound() {
        if (this.soundManager) {
            const enabled = this.soundManager.toggle();
            const button = this.element.querySelector('#toggle-sound');
            button.textContent = enabled ? '🔊' : '🔇';
            button.classList.toggle('disabled', !enabled);
            
            localStorage.setItem('soundEnabled', enabled);
            this.soundManager.play('button_click');
        }
    }

    toggleMusic() {
        const button = this.element.querySelector('#toggle-music');
        const isPlaying = !button.classList.contains('disabled');
        
        if (isPlaying) {
            if (this.soundManager) {
                this.soundManager.stopBackgroundMusic();
            }
            button.textContent = '🎵';
            button.classList.add('disabled');
            localStorage.setItem('musicEnabled', false);
        } else {
            if (this.soundManager) {
                this.soundManager.playBackgroundMusic();
            }
            button.textContent = '🎶';
            button.classList.remove('disabled');
            localStorage.setItem('musicEnabled', true);
        }
        
        if (this.soundManager) {
            this.soundManager.play('button_click');
        }
    }

    // Sidebar Management
    initializeUIToggles() {
        // Load saved preferences or set defaults based on screen size
        const isMobile = window.innerWidth <= 768;
        
        // Default visibility: hidden on mobile, visible on desktop
        this.sidebarStates = {
            history: localStorage.getItem('historyVisible') !== null ? 
                localStorage.getItem('historyVisible') === 'true' : !isMobile,
            deck: localStorage.getItem('deckVisible') !== null ? 
                localStorage.getItem('deckVisible') === 'true' : !isMobile
        };
        
        // Handle window resize to auto-adjust on mobile
        this.addEventListenerSafe(window, 'resize', () => this.handleResize());
    }

    toggleSidebar(type) {
        this.sidebarStates[type] = !this.sidebarStates[type];
        
        // Save preference
        localStorage.setItem(type === 'history' ? 'historyVisible' : 'deckVisible', 
            this.sidebarStates[type]);
        
        this.updateSidebarVisibility();
        
        // Add haptic feedback for mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    updateSidebarVisibility() {
        const leftSidebar = this.element.querySelector('#left-sidebar');
        const rightSidebar = this.element.querySelector('#right-sidebar');
        const mainGameArea = this.element.querySelector('.main-game-area');
        const historyBtn = this.element.querySelector('#toggle-history');
        const deckBtn = this.element.querySelector('#toggle-deck');
        
        // Update left sidebar (history)
        if (this.sidebarStates.history) {
            leftSidebar.classList.remove('hidden');
            leftSidebar.classList.add('visible');
            historyBtn.classList.add('active');
        } else {
            leftSidebar.classList.add('hidden');
            leftSidebar.classList.remove('visible');
            historyBtn.classList.remove('active');
        }
        
        // Update right sidebar (deck)
        if (this.sidebarStates.deck) {
            rightSidebar.classList.remove('hidden');
            rightSidebar.classList.add('visible');
            deckBtn.classList.add('active');
        } else {
            rightSidebar.classList.add('hidden');
            rightSidebar.classList.remove('visible');
            deckBtn.classList.remove('active');
        }
        
        // Update main game area classes for better spacing
        mainGameArea.classList.toggle('left-hidden', !this.sidebarStates.history);
        mainGameArea.classList.toggle('right-hidden', !this.sidebarStates.deck);
        mainGameArea.classList.toggle('sidebars-hidden', 
            !this.sidebarStates.history && !this.sidebarStates.deck);
    }

    handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        // On mobile, auto-hide sidebars if they weren't explicitly shown
        if (isMobile) {
            if (localStorage.getItem('historyVisible') === null) {
                this.sidebarStates.history = false;
            }
            if (localStorage.getItem('deckVisible') === null) {
                this.sidebarStates.deck = false;
            }
        } else {
            if (localStorage.getItem('historyVisible') === null) {
                this.sidebarStates.history = true;
            }
            if (localStorage.getItem('deckVisible') === null) {
                this.sidebarStates.deck = true;
            }
        }
        
        this.updateSidebarVisibility();
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
        
        // Update audio button states to reflect current settings
        this.updateAudioButtons();
    }

    // Card and Enemy Interaction Methods
    handleCardClick(cardElement) {
        // Mulligan cards are handled separately in the overlay
        // Regular hand cards are not clickable during mulligan
        
        if (this.gameState !== 'playing' || !this.isPlayerTurn) return;
        
        const handIndex = parseInt(cardElement.dataset.handIndex);
        const card = this.playerHand[handIndex];

        if (card.mana <= this.currentMana) {
            this.selectedCard = card;
            this.selectedCardIndex = handIndex;
            this.playerHandComp.selectCard(handIndex);
            
            // Play card selection sound
            this.soundManager?.play('card_select');
            
            if (card.targetType === 'self' || card.targetType === 'all' || card.targetType === 'random') {
                // Auto-cast spells that don't need targeting
                this.castSpell(card, handIndex);
            } else {
                // Enable enemy targeting with enhanced animations
                this.enableEnemyTargeting();
                this.showTargetingInstruction(`🎯 Select a target for ${card.name}!`);
            }
        } else {
            this.showMessage(`Not enough mana! Need ${card.mana}, have ${this.currentMana}`);
        }
    }

    handleEnemyClick(enemyElement) {
        if (this.selectedCard && (this.selectedCard.targetType === 'single')) {
            var enemyId = parseInt(enemyElement.dataset.enemyId);
            
            if (typeof hasActiveProvoker === 'function' && hasActiveProvoker(this.enemies)) {
                var provoker = this.enemies.find(function(e) {
                    return e.ability === 'provoke' && !e.isDying && e.health > 0;
                });
                if (provoker && enemyId !== provoker.id) {
                    this.showMessage('This enemy is protected by Provocation!');
                    return;
                }
            }
            
            this.enemyBoard.addTargetSelectionEffect(enemyId);
            this.disableEnemyTargeting();
            this.playerHandComp.deselectAll();
            
            setTimeout(function() {
                this.castSpell(this.selectedCard, this.selectedCardIndex, enemyId);
            }.bind(this), 200);
        }
    }

    enableEnemyTargeting() {
        if (typeof hasActiveProvoker === 'function' && hasActiveProvoker(this.enemies)) {
            var provoker = this.enemies.find(function(e) {
                return e.ability === 'provoke' && !e.isDying && e.health > 0;
            });
            if (provoker) {
                this.enemyBoard.enableTargetingForEnemy(provoker.id);
                this.showTargetingInstruction('This enemy has Provocation! Target it first!');
                return;
            }
        }
        this.enemyBoard.enableTargeting();
    }

    disableEnemyTargeting() {
        this.enemyBoard.disableTargeting();
        this.hideTargetingInstruction();
    }

    showTargetingInstruction(message) {
        // Remove any existing instruction
        this.hideTargetingInstruction();
        
        const instruction = document.createElement('div');
        instruction.className = 'targeting-instruction';
        instruction.id = 'targeting-instruction';
        instruction.textContent = message;
        document.body.appendChild(instruction);
    }

    hideTargetingInstruction() {
        const instruction = document.getElementById('targeting-instruction');
        if (instruction) {
            instruction.style.animation = 'instructionFadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (document.body.contains(instruction)) {
                    document.body.removeChild(instruction);
                }
            }, 300);
        }
    }

    castSpell(card, handIndex, targetEnemyId = null) {
        // Add casting animation to card
        const cardElement = this.element.querySelector(`[data-hand-index="${handIndex}"]`);
        this.playerHandComp.addCastingEffect(handIndex);
            
            // Play spell casting sound
            this.soundManager?.playSpellSound(card.id, 'cast');
            this.soundManager?.play('card_play');
            
            // Create particle trail from card to target
            const spellType = VisualEffectsComponent.getSpellEffectType(card.id);
            if (targetEnemyId) {
                const targetElement = this.element.querySelector(`[data-enemy-id="${targetEnemyId}"]`);
                this.visualEffects.createParticleTrail(cardElement, targetElement, spellType);
            } else if (card.targetType === 'all') {
                const battlefield = this.element.querySelector('#enemy-battlefield');
                this.visualEffects.createAOEParticles(battlefield, spellType);
            }
        
        // Deduct mana
        this.currentMana -= card.mana;
        
        // Clear selection
        this.selectedCard = null;
        this.selectedCardIndex = null;
        this.playerHandComp.deselectAll();
        this.disableEnemyTargeting();

        // Apply spell effect with delay for animation
        setTimeout(() => {
            this.applySpellEffect(card, targetEnemyId);

            // Remove card from hand after effect
            this.playerHand.splice(handIndex, 1);
            this.renderPlayerHand();
            this.updateUI();
            this.updateDeckTracker();

            // Auto-end turn if player has no mana left and game is still active
            if (this.currentMana === 0 && this.isPlayerTurn && this.gameState === 'playing') {
                setTimeout(() => {
                    this.endTurn();
                }, 1000);
            }
        }, 500);
    }

    applySpellEffect(card, targetEnemyId) {
        // Get spell effect type for visual effects
        const spellType = VisualEffectsComponent.getSpellEffectType(card.id);
        
        switch(card.targetType) {
            case 'single':
                if (targetEnemyId) {
                    const enemy = this.enemies.find(e => e.id === targetEnemyId);
                    const enemyEl = this.element.querySelector(`[data-enemy-id="${targetEnemyId}"]`);
                    this.visualEffects.createSpellImpact(enemyEl, spellType);
                    this.applyDamageWithElement(targetEnemyId, card.damage, card.element || spellType);
                    if (enemy) {
                        this.addToHistory(`${card.art} - ${card.damage} ${enemy.art}`, true);
                    }
                    // Lifesteal
                    if (card.lifesteal && card.damage > 0) {
                        this.playerHealth = Math.min(this.maxHealth || 30, this.playerHealth + card.damage);
                        const playerHero = this.element.querySelector('.player-hero');
                        this.visualEffects.createHealingEffect(playerHero);
                        this.visualEffects.showHealingNumber(playerHero, card.damage);
                        this.addToHistory(`+${card.damage} ❤️ (lifesteal)`, true);
                    }
                    // Play impact sound with delay
                    setTimeout(() => {
                        this.soundManager?.playSpellSound(card.id, 'impact');
                    }, 800);
                }
                break;
                
            case 'all':
                this.addToHistory(`${card.art} - ${card.damage} 🌍`, true);
                // Create a copy of enemies array to avoid modification during iteration
                const enemiesSnapshot = [...this.enemies];
                var totalDamage = 0;
                enemiesSnapshot.forEach((enemy, index) => {
                    setTimeout(() => {
                        const enemyEl = this.element.querySelector(`[data-enemy-id="${enemy.id}"]`);
                        this.visualEffects.createSpellImpact(enemyEl, spellType);
                        this.applyDamageWithElement(enemy.id, card.damage, card.element || spellType);
                        // Play impact sounds with slight delay
                        setTimeout(() => {
                            this.soundManager?.playSpellSound(card.id, 'impact');
                        }, 300);
                    }, index * 150); // Stagger the damage application
                    totalDamage += Math.min(card.damage, enemy.health || 999);
                });
                // Lifesteal for AOE
                if (card.lifesteal && totalDamage > 0) {
                    var self = this;
                    setTimeout(function() {
                        self.playerHealth = Math.min(self.maxHealth || 30, self.playerHealth + totalDamage);
                        var playerHero = self.element.querySelector('.player-hero');
                        self.visualEffects.createHealingEffect(playerHero);
                        self.visualEffects.showHealingNumber(playerHero, totalDamage);
                        self.addToHistory(`+${totalDamage} ❤️ (lifesteal)`, true);
                    }, enemiesSnapshot.length * 150 + 100);
                }
                const gameBoard = this.element.querySelector('.game-board');
                this.visualEffects.createScreenShake(gameBoard);
                this.soundManager?.play('screen_shake');
                break;
                
            case 'random':
                this.addToHistory(`${card.art} - ${card.damage}x${card.hits} 🌍`, true);
                
                // Track which enemies died during this spell to avoid duplicate death messages
                const enemiesKilledThisSpell = new Set();
                var totalLifestealDamage = 0;
                
                for (let i = 0; i < card.hits; i++) {
                    setTimeout(() => {
                        // Filter out dead enemies before each hit
                        const aliveEnemies = this.enemies.filter(e => e.health > 0);
                        if (aliveEnemies.length > 0) {
                            const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                            const enemyEl = this.element.querySelector(`[data-enemy-id="${randomEnemy.id}"]`);
                            this.visualEffects.createSpellImpact(enemyEl, spellType);
                            
                            // Check if enemy will die from this hit
                            const enemy = this.enemies.find(e => e.id === randomEnemy.id);
                            const willDie = enemy && (enemy.health - card.damage <= 0);
                            const alreadyMarkedDead = enemiesKilledThisSpell.has(randomEnemy.id);
                            
                            if (willDie && !alreadyMarkedDead) {
                                enemiesKilledThisSpell.add(randomEnemy.id);
                                // Add death message for this enemy
                                setTimeout(() => {
                                    this.addToHistory(`${enemy.art} dies`, true);
                                }, 1000);
                            }
                            
                            // Damage enemy but skip automatic death history
                            this.applyDamageWithElement(randomEnemy.id, card.damage, card.element || spellType, true);
                            totalLifestealDamage += Math.min(card.damage, (enemy ? enemy.health : card.damage));
                            this.soundManager?.playSpellSound(card.id, 'impact');
                        }
                    }, i * 200);
                }
                break;
                
            case 'self':
                let message = '';
                
                // Handle healing
                if (card.healing) {
                    this.playerHealth = Math.min(this.maxHealth || 30, this.playerHealth + card.healing);
                    const playerHero = this.element.querySelector('.player-hero');
                    this.visualEffects.createHealingEffect(playerHero);
                    this.visualEffects.showHealingNumber(playerHero, card.healing);
                    this.addToHistory(`${card.art} - +${card.healing} ❤️`, true);
                    message += `${card.name} heals you for ${card.healing}! `;
                }
                
                // Handle card draw
                if (card.cardDraw) {
                    this.drawMultipleCards(card.cardDraw);
                    this.addToHistory(`${card.art} - +${card.cardDraw} 📖`, true);
                    message += `Draw ${card.cardDraw} cards! `;
                }
                
                // Handle mana boost
                if (card.manaBoost) {
                    this.currentMana += card.manaBoost;
                    const manaElement = this.element.querySelector('#current-mana');
                    this.visualEffects.showManaBoostEffect(manaElement);
                    this.addToHistory(`${card.art} - +${card.manaBoost} 💎`, true);
                    message += `+${card.manaBoost} mana this turn! `;
                }
                
                // Handle shield
                if (card.shield) {
                    this.playerShield += card.shield;
                    const playerHero = this.element.querySelector('.player-hero');
                    this.visualEffects.createShieldEffect(playerHero);
                    this.visualEffects.showShieldNumber(playerHero, card.shield);
                    this.addToHistory(`${card.art} - +${card.shield} 🛡️`, true);
                    message += `Gain ${card.shield} shield! `;
                }
                
                this.soundManager?.playSpellSound(card.id, 'cast');
                this.showMessage(message.trim());
                break;
        }
    }

    applyDamageWithElement(enemyId, baseDamage, elementType, skipDeathHistory = false) {
        // Class passive: Pyromancien +1 fire damage
        if (elementType === 'fire' && ClassManager.getFireDamageBonus() > 0) {
            baseDamage += ClassManager.getFireDamageBonus();
        }

        if (!ElementalReactionsManager.isEnabled()) {
            this.damageEnemyWithEffects(enemyId, baseDamage, skipDeathHistory);
            return;
        }
        const enemy = this.enemies.find(e => e.id === enemyId);
        if (!enemy) return;

        const result = ElementalReactionsManager.processReaction(enemy, elementType, baseDamage);

        if (result.reaction) {
            const reactionEl = this.element.querySelector(`[data-enemy-id="${enemyId}"]`);
            if (reactionEl) {
                reactionEl.classList.add('reaction-flash');
                setTimeout(() => reactionEl.classList.remove('reaction-flash'), 600);
            }
            this.addToHistory(result.reaction.icon + ' ' + result.reaction.name + '!', false);
        }

        this.damageEnemyWithEffects(enemyId, result.damage, skipDeathHistory);

        if (result.aoeDamage > 0) {
            this.enemies.forEach(other => {
                if (other.id !== enemyId && !other.isDying && other.health > 0) {
                    this.damageEnemyWithEffects(other.id, result.aoeDamage, true);
                }
            });
        }

        ElementalReactionsManager.applyElementalStatus(enemy, null, elementType, ClassManager.getFrozenDurationBonus());
        this.enemyBoard.updateStatusOverlay(enemyId, enemy);
    }

    damageEnemyWithEffects(enemyId, damage, skipDeathHistory = false) {
        const enemy = this.enemies.find(e => e.id === enemyId);
        if (enemy) {
            const enemyElement = this.enemyBoard.container.querySelector(`[data-enemy-id="${enemyId}"]`);
            this.visualEffects.showDamageNumber(enemyElement, damage);
            this.enemyBoard.addDamageEffect(enemyId);
            enemy.health -= damage;
            
            if (typeof checkAndTriggerEnrage === 'function' && checkAndTriggerEnrage(enemy)) {
                this.addToHistory(enemy.art + ' ' + enemy.name + ' is ENRAGED! +2 ATK', false);
            }
            
            if (enemy.health <= 0) {
                var deathResult = ClassManager.onEnemyDeath(this.playerHealth, this.maxHealth || 30);
                this.playerHealth = deathResult.health;
                this.maxHealth = deathResult.maxHealth;
                this.soundManager?.play('enemy_death');
                enemy.isDying = true;
                this.enemyBoard.startDeathAnimation(enemyId, 1800, () => {
                    if (!skipDeathHistory) {
                        this.addToHistory(`${enemy.art} dies`, true);
                    }
                    if (this.enemies.find(e => e.id === enemyId)) {
                        this.enemies = this.enemies.filter(e => e.id !== enemyId);
                        this.enemyBoard.removeEnemyElement(enemyId);
                        setTimeout(() => this.checkGameEnd(), 100);
                    }
                });
            } else {
                if (!enemy.isDying) {
                    this.renderEnemies();
                }
            }
        }
    }

    drawMultipleCards(count) {
        for (let i = 0; i < count; i++) {
            if (this.playerHand.length < 10) {
                const newCard = this.cardManager.getRandomCard();
                if (newCard) {
                    this.playerHand.push(newCard);
                }
            }
        }
        this.renderPlayerHand();
        const handElement = this.element.querySelector('#player-hand');
        this.visualEffects.createCardDrawEffect(handElement);
    }

    endTurn() {
        if (this.gameState !== 'playing' || !this.isPlayerTurn) return;
        
        // Check for victory before ending turn
        if (this.enemies.length === 0) {
            this.checkGameEnd();
            return;
        }
        
        this.isPlayerTurn = false;
        this.updateGameStatus('Enemy Turn');
        this.element.querySelector('#end-turn').disabled = true;
        
        // Enemy attack phase
        setTimeout(() => {
            this.enemyAttackPhase();
        }, 1000);
    }

    processEnemyStatusEffects() {
        if (!ElementalReactionsManager.isEnabled()) return;
        const aliveEnemies = this.enemies.filter(e => !e.isDying && e.health > 0);
        aliveEnemies.forEach(enemy => {
            const result = ElementalReactionsManager.processTurnStart(enemy);
            if (result.damage > 0) {
                this.damageEnemyWithEffects(enemy.id, result.damage, true);
                const enemyEl = this.element.querySelector(`[data-enemy-id="${enemy.id}"]`);
                if (enemyEl) {
                    this.visualEffects.showDamageNumber(enemyEl, result.damage);
                }
                this.addToHistory(STATUS_EFFECTS.burning.icon + ' ' + enemy.name + ' takes ' + result.damage + ' burn damage', false);
            }
            this.enemyBoard.updateStatusOverlay(enemy.id, enemy);
        });
    }

    processEnemyAbilities() {
        var _this = this;
        var healers = this.enemies.filter(function(e) {
            return e.ability === 'healer' && !e.isDying && e.health > 0 && !e.isBoss;
        });
        healers.forEach(function(healer) {
            var target = typeof getBestHealTarget === 'function' ? getBestHealTarget(_this.enemies) : null;
            if (target && target.health < target.maxHealth) {
                target.health = Math.min(target.maxHealth, target.health + 2);
                _this.addToHistory(healer.art + ' ' + healer.name + ' heals ' + target.name + ' for 2', false);
                _this.enemyBoard.updateStatusOverlay(target.id, target);
            }
        });
        var summoners = this.enemies.filter(function(e) {
            return e.ability === 'summoner' && !e.isDying && e.health > 0 && !e.isBoss;
        });
        summoners.forEach(function(summoner) {
            if (typeof createSummonMinion === 'function') {
                var minion = createSummonMinion(_this.enemyIdCounter);
                _this.enemyIdCounter++;
                _this.enemies.push(minion);
                _this.addToHistory(summoner.art + ' ' + summoner.name + ' summons a ' + minion.name, false);
            }
        });
        if (healers.length > 0 || summoners.length > 0) {
            this.renderEnemies();
        }
    }

    enemyAttackPhase() {
        if (this.enemies.length === 0) {
            this.checkGameEnd();
            return;
        }
        
        this.enemies.forEach(function(e) { delete e.canAttack; });

        this.processEnemyStatusEffects();

        let attackIndex = 0;
        const attackInterval = setInterval(() => {
            if (attackIndex >= this.enemies.length) {
                clearInterval(attackInterval);
                this.processEnemyAbilities();
                this.startNewTurn();
                return;
            }

            var enemy = this.enemies[attackIndex];

            if (enemy.canAttack === false) {
                attackIndex++;
                return;
            }

            // Skip frozen enemies
            if (ElementalReactionsManager.shouldSkipAttack(enemy)) {
                attackIndex++;
                this.addToHistory(STATUS_EFFECTS.frozen.icon + ' ' + enemy.name + ' is frozen and cannot attack!', false);
                this.enemyBoard.updateStatusOverlay(enemy.id, enemy);
                this.updateUI();
                return;
            }

            let damage = enemy.attack;
            let shieldAbsorbed = 0;

            // Trigger enemy attack animation
            const enemyElement = this.element.querySelector(`[data-enemy-id="${enemy.id}"]`);
            if (enemyElement) {
                enemyElement.classList.add('attacking');
                // Remove the class after animation completes (600ms)
                setTimeout(() => {
                    if (enemyElement) {
                        enemyElement.classList.remove('attacking');
                    }
                }, 600);
            }

            // Apply shield protection
            if (this.playerShield > 0) {
                shieldAbsorbed = Math.min(this.playerShield, damage);
                this.playerShield -= shieldAbsorbed;
                damage -= shieldAbsorbed;
                
                if (shieldAbsorbed > 0) {
                    this.soundManager?.play('shield_block');
                }
            }
            
            // Apply remaining damage
            this.playerHealth -= damage;
            
            // Add enemy attack to history
            if (shieldAbsorbed > 0 && damage === 0) {
                this.addToHistory(`${enemy.art} - ${enemy.attack} 🛡️`, false);
            } else if (shieldAbsorbed > 0 && damage > 0) {
                this.addToHistory(`${enemy.art} - ${enemy.attack} ❤️`, false);
            } else {
                this.addToHistory(`${enemy.art} - ${damage} ❤️`, false);
            }
            
            // Play player hurt sound only if damage was taken
            if (damage > 0) {
                this.soundManager?.play('player_hurt');
            }
            
            // Check if player died
            if (this.playerHealth <= 0) {
                this.updateUI();
                clearInterval(attackInterval);
                this.gameOver(false);
                return;
            }
            
            this.updateUI();
            attackIndex++;
        }, 1500);
    }

    startNewTurn() {
        this.currentTurn++;
        this.maxMana = Math.min(10, this.currentTurn);
        this.currentMana = this.maxMana;
        this.isPlayerTurn = true;
        
        // Play mana restore sound
        this.soundManager?.play('mana_restore');
        
        // Draw a card
        this.drawCard();
        
        this.updateGameStatus('Your Turn');
        this.element.querySelector('#end-turn').disabled = false;
        this.renderPlayerHand();
        this.updateUI();
    }

    drawCard() {
        // Draw a new random spell card from CardManager
        if (this.playerHand.length < 10) {
            const newCard = this.cardManager.getRandomCard();
            if (newCard) {
                this.playerHand.push(newCard);
                this.renderPlayerHand();
                // Don't add natural card draw to history - happens every turn
            }
        }
    }

    checkGameEnd() {
        if (this.enemies.length === 0) {
            // Victory! End the game immediately
            setTimeout(() => {
                this.gameOver(true);
            }, 1000); // Small delay to let animations finish
        } else if (this.playerHealth <= 0) {
            this.gameOver(false);
        }
    }

    gameOver(playerWon) {
        // Prevent multiple game over calls
        if (this.gameState === 'won' || this.gameState === 'lost') {
            return;
        }
        
        this.gameState = playerWon ? 'won' : 'lost';
        this.isPlayerTurn = false;
        this.element.querySelector('#end-turn').disabled = true;
        
        if (playerWon) {
            this.updateGameStatus('Victory!');
            this.soundManager?.play('victory');
            this.showMessage('🎉 Congratulations! You defeated all enemies! 🎉', 'success');
            
            // Update victory stats
            const currentVictories = parseInt(localStorage.getItem('totalVictories') || '0');
            localStorage.setItem('totalVictories', (currentVictories + 1).toString());
        } else {
            this.updateGameStatus('Defeat!');
            this.soundManager?.play('defeat');
            this.showMessage('💀 Game Over! Your hero has fallen! 💀', 'error');
        }
        
        // Show restart option only once
        if (!this.gameOverDialogShown) {
            this.gameOverDialogShown = true;
            setTimeout(() => {
                const restart = confirm(playerWon ? 
                    'You won! Would you like to play again?' : 
                    'You lost! Would you like to try again?');
                if (restart) {
                    // Reset game state and restart
                    this.resetGame();
                } else {
                    // Stop background music before leaving
                    if (this.soundManager) {
                        this.soundManager.stopBackgroundMusic();
                    }
                    // Return to main menu
                    this.navigateTo('mainmenu');
                }
            }, 3000);
        }
    }

    resetGame() {
        // Reset all game state
        this.playerHand = [];
        this.currentMana = 1;
        this.maxMana = 1;
        this.playerHealth = 30;
        this.maxHealth = 30;
        this.playerShield = 0;
        this.currentTurn = 1;
        this.enemies = [];
        this.enemyIdCounter = 1;
        this.gameState = 'playing';
        this.isPlayerTurn = true;
        this.selectedCard = null;
        this.selectedCardIndex = null;
        this.actionHistory = [];
        this.actionHistoryComp.clear();
        
        // Reset the deck to full state
        if (this.cardManager) {
            this.cardManager.resetDeck();
        }
        
        // Reset background music state so it can restart properly
        this.backgroundMusicStarted = false;
        
        // Reset game over dialog flag
        this.gameOverDialogShown = false;
        
        // Re-enable end turn button
        const endTurnButton = this.element.querySelector('#end-turn');
        if (endTurnButton) {
            endTurnButton.disabled = false;
        }
        
        // Update game status
        this.updateGameStatus('Your Turn');
        
        // Reinitialize game
        this.createSpellCards();
        this.spawnInitialEnemies();
        this.renderPlayerHand();
        this.updateUI();
        this.updateDeckTracker();
        this.updateHistoryDisplay();
        
        // Start mulligan phase for the new game
        this.startMulliganPhase();
    }

    updateGameStatus(status) {
        const statusElement = this.element.querySelector('#game-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    addToHistory(action, isPlayerAction = true) {
        this.actionHistoryComp.addEntry(action, isPlayerAction, this.currentTurn);
        this.actionHistory = this.actionHistoryComp.entries;
    }

    updateUI() {
        this.element.querySelector('#current-mana').textContent = this.currentMana;
        this.element.querySelector('#player-health').textContent = `❤️ ${this.playerHealth}/${this.maxHealth}`;
        this.element.querySelector('#turn-number').textContent = this.currentTurn;
        this.element.querySelector('#enemies-count').textContent = this.enemies.length;
        this.element.querySelector('#max-mana').textContent = `/${this.maxMana}`;
        
        // Update shield display
        const shieldElement = this.element.querySelector('#player-shield');
        if (shieldElement) {
            if (this.playerShield > 0) {
                shieldElement.textContent = `🛡️ ${this.playerShield}`;
                shieldElement.style.display = 'block';
            } else {
                shieldElement.style.display = 'none';
            }
        }
        
        // Update player health background color based on damage
        const healthElement = this.element.querySelector('#player-health');
        if (this.playerHealth <= 10) {
            healthElement.style.background = 'linear-gradient(45deg, #DC143C, #B22222)'; // Red for critical
        } else if (this.playerHealth <= 20) {
            healthElement.style.background = 'linear-gradient(45deg, #FF8C00, #FF6347)'; // Orange for low
        } else {
            healthElement.style.background = 'linear-gradient(45deg, #32CD32, #228B22)'; // Green for healthy
        }
        
        // Update end turn button based on playable cards
        this.updateEndTurnButton();
    }

    updateEndTurnButton() {
        const endTurnButton = this.element.querySelector('#end-turn');
        const hasPlayableCards = this.playerHand.some(card => card.mana <= this.currentMana);
        
        if (hasPlayableCards) {
            endTurnButton.classList.remove('no-plays-available');
            endTurnButton.style.backgroundColor = '';
            endTurnButton.style.borderColor = '';
        } else {
            endTurnButton.classList.add('no-plays-available');
            endTurnButton.style.backgroundColor = 'rgba(34, 139, 34, 0.8)';
            endTurnButton.style.borderColor = '#32CD32';
        }
    }

    updateDeckTracker() {
        this.deckTracker.update();
    }

    updateHistoryDisplay() {
        this.actionHistoryComp.setEntries(this.actionHistory, this.currentTurn);
    }

    showCardDetails(cardElement) {
        // TODO: Implement card details display
        cardElement.style.zIndex = '100';
    }

    showMessage(message, type = 'info', duration = 2000) {
        // Initialize message queue if it doesn't exist
        if (!window.gameMessageQueue) {
            window.gameMessageQueue = [];
            window.gameMessageActive = false;
        }

        // Add message to queue
        window.gameMessageQueue.push({ message, type, duration });
        
        // Process queue if not already processing
        if (!window.gameMessageActive) {
            this.processMessageQueue();
        }
    }

    processMessageQueue() {
        if (window.gameMessageQueue.length === 0) {
            window.gameMessageActive = false;
            return;
        }

        window.gameMessageActive = true;
        const { message, type, duration } = window.gameMessageQueue.shift();

        // Find the end turn button to position message below it
        const endTurnButton = this.element.querySelector('#end-turn');
        let positionStyle = '';
        
        if (endTurnButton) {
            const buttonRect = endTurnButton.getBoundingClientRect();
            positionStyle = `
                position: fixed;
                left: 50%;
                top: ${buttonRect.bottom + 20}px;
                transform: translateX(-50%);
            `;
        } else {
            // Fallback to center if button not found
            positionStyle = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            `;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'game-message';
        messageDiv.style.cssText = `
            ${positionStyle}
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
            animation: gameMessageSlideIn 0.3s ease-out;
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

        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        // Add CSS animations if not already added
        this.addMessageAnimations();

        setTimeout(() => {
            messageDiv.style.animation = 'gameMessageSlideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (document.body.contains(messageDiv)) {
                    document.body.removeChild(messageDiv);
                }
                // Process next message in queue
                this.processMessageQueue();
            }, 300);
        }, duration);
    }

    addMessageAnimations() {
        // Check if animations are already added
        if (document.querySelector('#game-message-animations')) return;

        const style = document.createElement('style');
        style.id = 'game-message-animations';
        style.textContent = `
            @keyframes gameMessageSlideIn {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                    scale: 0.9;
                }
                100% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                    scale: 1;
                }
            }

            @keyframes gameMessageSlideOut {
                0% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                    scale: 1;
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                    scale: 0.9;
                }
            }
        `;
        document.head.appendChild(style);
    }

    getScreenClass() {
        return 'game-screen';
    }

    getScreenId() {
        return 'game';
    }

    // Mulligan System
    startMulliganPhase() {
        // Prevent duplicate mulligan phases (only check for existing overlay)
        if (this.element.querySelector('#mulligan-overlay')) {
            console.log('🎴 Mulligan overlay already exists, skipping');
            return;
        }
        
        console.log('🎴 Starting mulligan phase');
        this.gameState = 'mulligan';
        this.isPlayerTurn = false;
        this.selectedCardsForMulligan = new Set();
        
        // Update UI (no special status needed - mulligan is self-explanatory)
        this.showMulliganInterface();
        this.renderPlayerHand(); // Re-render with mulligan styling
    }

    showMulliganInterface() {
        // Create mulligan UI overlay
        const mulliganOverlay = document.createElement('div');
        mulliganOverlay.id = 'mulligan-overlay';
        mulliganOverlay.className = 'mulligan-overlay';
        mulliganOverlay.innerHTML = `
            <div class="mulligan-panel">
                <div class="mulligan-hand" id="mulligan-hand">
                    <!-- Mulligan cards will be rendered here -->
                </div>
                <div class="mulligan-bottom">
                    <h2 class="mulligan-title">Choose the cards to replace</h2>
                    <button class="mulligan-confirm-btn" id="confirm-mulligan">
                        Confirm
                    </button>
                </div>
            </div>
        `;
        
        const gameBoard = this.element.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.appendChild(mulliganOverlay);
        } else {
            this.element.appendChild(mulliganOverlay);
        }
        
        // Render mulligan cards
        this.renderMulliganCards();
        
        // Bind mulligan button events
        this.bindMulliganEvents();
    }

    renderMulliganCards() {
        const mulliganHandContainer = this.element.querySelector('#mulligan-hand');
        mulliganHandContainer.innerHTML = '';

        this.playerHand.forEach((card, index) => {
            const cardElement = this.createMulliganCardElement(card, index);
            mulliganHandContainer.appendChild(cardElement);
        });
    }

    createMulliganCardElement(card, index) {
        const cardDiv = SpellCardComponent.createCardElement(card, {
            baseClass: 'mulligan-card',
            extraClasses: [card.type]
        });
        cardDiv.dataset.cardId = card.id;
        cardDiv.dataset.handIndex = index;
        cardDiv.onclick = () => this.handleMulliganCardClick(cardDiv);

        return cardDiv;
    }

    bindMulliganEvents() {
        // Confirm mulligan
        this.addEventListenerSafe(
            this.element.querySelector('#confirm-mulligan'),
            'click',
            () => this.confirmMulligan()
        );
    }

    handleMulliganCardClick(cardElement) {
        if (this.gameState !== 'mulligan') return;
        
        const handIndex = parseInt(cardElement.dataset.handIndex);
        
        if (this.selectedCardsForMulligan.has(handIndex)) {
            // Deselect card (back to green - keep)
            this.selectedCardsForMulligan.delete(handIndex);
            cardElement.classList.remove('mulligan-selected');
        } else {
            // Select card (red - replace)
            this.selectedCardsForMulligan.add(handIndex);
            cardElement.classList.add('mulligan-selected');
        }
        
        // Play selection sound
        this.soundManager?.play('card_select');
    }

    updateMulliganCount() {
        const countElement = this.element.querySelector('#mulligan-count');
        if (countElement) {
            countElement.textContent = this.selectedCardsForMulligan.size;
        }
    }

    confirmMulligan() {
        console.log('🎴 Confirming mulligan');
        
        // If no cards selected, skip mulligan
        if (this.selectedCardsForMulligan.size === 0) {
            console.log('🎴 No cards selected - keeping all cards');
            this.endMulliganPhase();
            return;
        }
        
        // Replace the selected (red) cards
        const cardsToReplace = Array.from(this.selectedCardsForMulligan);
        this.performMulligan(cardsToReplace);
    }

    skipMulligan() {
        console.log('🎴 Skipping mulligan - keeping all cards');
        this.endMulliganPhase();
    }

    performMulligan(indicesToReplace) {
        console.log('🎴 Performing mulligan for indices:', indicesToReplace);
        
        // Store the cards being replaced
        const replacedCards = [];
        indicesToReplace.forEach(index => {
            replacedCards.push(this.playerHand[index]);
        });
        
        // Put the replaced cards back into the deck first
        this.cardManager.returnCardsToDeck(replacedCards);
        
        // Now draw new cards from deck
        const newCards = [];
        indicesToReplace.forEach(index => {
            const newCard = this.cardManager.getRandomCard();
            if (newCard) {
                newCards.push({ index, card: newCard });
            }
        });
        
        console.log(`🎴 Mulligan: Returned ${replacedCards.length} cards to deck, drew ${newCards.length} new cards`);
        
        // Apply replacements with animation
        this.animateMulliganReplacements(newCards);
    }

    animateMulliganReplacements(replacements) {
        // Add replacement animation to selected cards
        replacements.forEach(({ index }, i) => {
            const cardElement = this.element.querySelector(`[data-hand-index="${index}"]`);
            if (cardElement) {
                setTimeout(() => {
                    cardElement.classList.add('mulligan-replacing');
                }, i * 100);
            }
        });
        
        // Replace cards after animation
        setTimeout(() => {
            replacements.forEach(({ index, card }) => {
                this.playerHand[index] = card;
            });
            
            this.renderPlayerHand();
            this.updateDeckTracker(); // Update deck tracker to reflect mulligan changes
            
            // End mulligan phase
            setTimeout(() => {
                this.endMulliganPhase();
            }, 1000);
        }, 800);
    }

    endMulliganPhase() {
        console.log('🎴 Ending mulligan phase');
        
        // Remove mulligan overlay
        const overlay = this.element.querySelector('#mulligan-overlay');
        if (overlay) {
            overlay.style.animation = 'mulliganFadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 500);
        }
        
        // Reset game state to normal
        this.gameState = 'playing';
        this.isPlayerTurn = true;
        this.selectedCardsForMulligan.clear();
        
        // Update UI
        this.updateGameStatus('Your Turn');
        this.renderPlayerHand(); // Remove mulligan styling
        this.updateUI();
        
        // Add to history
        this.addToHistory('🎴 Mulligan complete - Game begins!', true);
    }
}

// Export to global scope
window.GameScreen = GameScreen;