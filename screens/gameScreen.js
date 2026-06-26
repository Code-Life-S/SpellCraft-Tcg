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
        this.currentWave = 0;
        this.enemies = [];
        this.enemyIdCounter = 1;
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
        this.isPlayerTurn = true;
        this.totalEnemiesKilled = 0;
        
        // Managers
        this.cardManager = null;
        this.soundManager = null;
        
        // UI state
        this.selectedCard = null;
        this.selectedCardIndex = null;
        this.actionHistory = [];
        
        // Audio state
        this.backgroundMusicStarted = false;

        // XP tracking
        this.gameXPAccumulator = 0;

        // Archimage / Ombrelumiere state
        this._lastSpellCast = null;
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

        // Load shared game CSS
        try {
            if (window.templateLoader && typeof window.templateLoader.loadCSS === 'function') {
                await window.templateLoader.loadCSS('screens/shared/gameCommon.css', 'screens-shared-gameCommon-css');
            }
        } catch (error) {
            console.warn('Failed to load shared game CSS:', error);
        }

        // Load shared component CSS
        const componentCSS = [
            'screens/components/spell-card/spellCardComponent.css',
            'screens/components/visual-effects/visualEffectsComponent.css',
            'screens/components/enemy-board/enemyBoardComponent.css',
            'screens/components/mulligan/mulligan.css',
            'screens/components/game-header/gameHeaderComponent.css',
            'screens/components/enemy-info-panel/enemyInfoPanelComponent.css'
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
        this.headerComp = new GameHeaderComponent({
            mode: 'adventure',
            onHomeClick: () => this.backToMenu(),
            onToggleHistory: () => this.sidebarManager.toggle('history'),
            onToggleDeck: () => this.sidebarManager.toggle('deck'),
            onToggleSound: () => this.audioCtrl.toggleSound(),
            onToggleMusic: () => this.audioCtrl.toggleMusic()
        });
        const gameBoard = this.element.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.prepend(this.headerComp.render());
        }
        this.visualEffects = new VisualEffectsComponent(this.element);
        this.enemyBoard = new EnemyBoardComponent(this.element, '#enemy-battlefield');
        this.enemyInfoPanel = new EnemyInfoPanelComponent(this.element, '#enemy-info-panel');
        this.sidebarManager = new SidebarManagerComponent(this.element, {
            getHistoryButton: () => this.headerComp?.getHistoryButton(),
            getDeckButton: () => this.headerComp?.getDeckButton()
        });
        this.audioCtrl = new AudioController(this.soundManager);
        this.gameOverOverlay = new GameOverOverlayComponent(this.element, {
            defaultTitle: 'Defeated!',
            defaultMessage: 'Your adventure has ended.',
            buttonText: 'Back to Menu',
            onButtonClick: () => {
                AdventureStateManager.clearState();
                if (this.soundManager) {
                    this.soundManager.stopBackgroundMusic();
                }
                this.backToMenu();
            }
        });
        var gameBoardEl = this.element.querySelector('.game-board');
        if (gameBoardEl) {
            gameBoardEl.appendChild(this.gameOverOverlay.render());
        }
        this.mulliganComp = new MulliganComponent(this.element);
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
                                    <span class="hero-hp-to-mana" id="hp-to-mana-btn" title="Sacrifice 2 HP for 1 Mana">💉→💎</span>
                                    <span class="hero-health" id="player-health">❤️ 30</span>
                                    <span class="hero-shield" id="player-shield" style="display: none;">🛡️0</span>
                                    <span class="hero-spell-counter" id="spell-counter" style="display: none;">0/3</span>
                                </div>
                            </div>
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
        if (data && data.resume) {
            await this._resumeAdventureRun();
        } else {
            await this._startNewAdventureRun(data);
        }
    }

    async _startNewAdventureRun(data) {
        // Reset state for a new run
        this.playerHand = [];
        this.currentMana = 1;
        this.maxMana = 1;
        this.playerHealth = 30;
        this.maxHealth = 30;
        this.playerShield = 0;
        this.currentTurn = 1;
        this.currentWave = 0;
        this.enemies = [];
        this.enemyIdCounter = 1;
        this.gameState = 'playing';
        this.isPlayerTurn = true;
        this.totalEnemiesKilled = 0;
        this.selectedCard = null;
        this.selectedCardIndex = null;
        this.gameXPAccumulator = 0;
        this._pendingWaveTransition = false;
        this._spellsCastThisTurn = 0;
        this._turnStartHealth = 30;
        this._combatReactions = 0;
        this._combatFrozenEnemies = new Set();
        this._combatEnemiesFrozenThisTurn = 0;
        this._currentDeckId = null;
        this.actionHistoryComp?.clear();

        // Hide game over overlay if visible from previous run
        this.gameOverOverlay.hide();

        // Clear any saved adventure state
        AdventureStateManager.clearState();

        var deckId = 'starter_deck';
        if (data && data.deckId) {
            deckId = data.deckId;
        }

        // Ensure active class is set (from deck if available)
        if (this.cardManager) {
            var deck = this.cardManager.deckStorage.getDeck(deckId);
            if (deck && deck.class) {
                ClassManager.setActiveClass(deck.class);
            }

            var success = this.cardManager.loadDeck(deckId);
            if (success) {
                console.log('Loaded deck for adventure: ' + deckId);
            } else {
                console.warn('Failed to load deck ' + deckId + ', using starter deck');
                this.cardManager.loadDeck('starter_deck');
            }
            this._currentDeckId = deckId;
        }
        
        // Spawn initial enemies for wave 1
        this.spawnInitialEnemies();
        this.updateUI();
        this.updateHistoryDisplay();

        // Now that deck is loaded, create cards and start mulligan
        this.createSpellCards();
        this.renderPlayerHand();
        this.updateDeckTracker();

        var _this = this;
        this.gameState = 'mulligan';
        this.isPlayerTurn = false;
        this.mulliganComp.start(this.playerHand, {
            returnCards: function(cards) { _this.cardManager.returnCardsToDeck(cards); },
            drawCards: function(count) {
                var drawn = [];
                for (var i = 0; i < count; i++) {
                    var card = _this.cardManager.getRandomCard();
                    if (card) drawn.push(card);
                }
                return drawn;
            }
        }, {
            onComplete: function(newHand) {
                _this.playerHand = newHand;
                _this.gameState = 'playing';
                _this.isPlayerTurn = true;
                _this.renderPlayerHand();
                _this.updateDeckTracker();
                _this.updateUI();
                _this.addToHistory('Mulligan complete - Game begins!', true);
            }
        });
    }

    async _resumeAdventureRun() {
        var savedState = AdventureStateManager.getState();
        if (!savedState || savedState.phase !== 'adventure') {
            console.log('No saved adventure state found, starting fresh');
            await this._startNewAdventureRun({ deckId: 'starter_deck' });
            return;
        }

        console.log('Resuming adventure run, wave ' + savedState.currentWave);

        this._currentDeckId = savedState.deckId || 'starter_deck';

        // Restore deck state
        if (this.cardManager) {
            this.cardManager.loadDeck(this._currentDeckId);
            this.cardManager.remainingDeck = savedState.remainingDeck || [];

            var deck = this.cardManager.deckStorage.getDeck(this._currentDeckId);
            if (deck && deck.class) {
                ClassManager.setActiveClass(deck.class);
            }
        }

        // Restore game state
        this.currentWave = savedState.currentWave || 1;
        this.currentTurn = savedState.currentTurn || 1;
        this.playerHealth = savedState.playerHealth != null ? savedState.playerHealth : 30;
        this.maxHealth = savedState.maxHealth || 30;
        this.playerShield = savedState.playerShield || 0;
        this.currentMana = savedState.currentMana || 1;
        this.maxMana = savedState.maxMana || 1;
        this.totalEnemiesKilled = savedState.totalEnemiesKilled || 0;
        this.gameXPAccumulator = savedState.gameXPAccumulator || 0;
        this.enemies = savedState.enemies || [];
        this.enemyIdCounter = savedState.enemyIdCounter || 1;
        this.playerHand = savedState.playerHand || [];
        this.selectedCard = null;
        this.selectedCardIndex = null;
        this.gameState = 'playing';
        this.isPlayerTurn = true;
        this._pendingWaveTransition = false;

        // Hide overlays
        this.gameOverOverlay.hide();
        var roundOverlay = this.element.querySelector('#round-overlay');
        if (roundOverlay) roundOverlay.classList.add('hidden');

        // Restore UI
        this.renderPlayerHand();
        this.renderEnemies();
        this.updateUI();
        this.updateDeckTracker();
        this.updateHistoryDisplay();
        this.updateGameStatus('Your Turn');
    }

    async initializeGame() {
        // Initialize UI toggles
        this.sidebarManager.init();
        
        // Initialize audio
        this.audioCtrl.init();
        this.audioCtrl.updateButtons(this.headerComp);
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

        // HP to Mana button (Ombrelumiere)
        this.addEventListenerSafe(
            this.element.querySelector('#hp-to-mana-btn'),
            'click',
            () => this.handleHpToMana()
        );

        // Animation system is working properly!

        // Card hover effects
        this.addEventListenerSafe(document, 'mouseover', (e) => {
            if (e.target.closest('.card')) {
                this.showCardDetails(e.target.closest('.card'));
            }
        });

        // Enemy hover: show info panel
        this.addEventListenerSafe(document, 'mouseover', (e) => {
            var enemyEl = e.target.closest('.enemy');
            if (enemyEl) {
                var enemyId = parseInt(enemyEl.dataset.enemyId);
                var enemy = this.enemies.find(function(e) { return e.id === enemyId; });
                if (enemy && this.enemyInfoPanel) {
                    this.enemyInfoPanel.update(enemy);
                }
            }
        });

        // Window resize handler for sidebar visibility
        this.addEventListenerSafe(window, 'resize', () => {
            this.sidebarManager.handleResize();
        });
    }

    handleHpToMana() {
        if (ClassManager.getActiveClassId() !== 'ombrelumiere') return;
        if (!ClassManager.canUseHpToMana()) return;
        if (this.playerHealth <= 2) {
            this.showMessage('Not enough health!');
            return;
        }
        if (this.currentMana >= 10) {
            this.showMessage('Mana is already full!');
            return;
        }
        ClassManager.useHpToMana();
        this.playerHealth -= 2;
        this.currentMana = Math.min(this.currentMana + 1, 10);
        this.updateUI();
        this._updateHpToManaButton();
        var heroEl = this.element.querySelector('.hero-portrait');
        if (heroEl && this.visualEffects) {
            this.visualEffects.showDamageNumber(heroEl, 2);
            this.visualEffects.showManaBoostEffect(this.element.querySelector('#current-mana'));
        }
        this.addToHistory('\u{1F489} Sacrifice 2 HP for 1 Mana', true);
    }

    _updateArchimageCounter() {
        var counterEl = this.element.querySelector('#spell-counter');
        if (!counterEl) return;
        if (ClassManager.getActiveClassId() === 'archimage') {
            var progress = ClassManager.getSpellCountProgress();
            counterEl.textContent = progress + '/3';
            counterEl.style.display = '';
        } else {
            counterEl.style.display = 'none';
        }
    }

    _updateHpToManaButton() {
        var btn = this.element.querySelector('#hp-to-mana-btn');
        if (!btn) return;
        if (ClassManager.getActiveClassId() === 'ombrelumiere') {
            btn.style.display = '';
            if (ClassManager.canUseHpToMana() && this.playerHealth > 2 && this.currentMana < 10) {
                btn.classList.remove('disabled');
            } else {
                btn.classList.add('disabled');
            }
        } else {
            btn.style.display = 'none';
        }
    }

    async onAfterShow() {
        // Stop any existing background music from other screens
        if (this.soundManager) {
            this.soundManager.stopBackgroundMusic();
        }
        
        // Start background music if needed
        this.startBackgroundMusicIfNeeded();
        
        // Update audio button states
        this.audioCtrl.updateButtons(this.headerComp);
        
        // Update sidebar visibility
        this.sidebarManager.updateVisibility();
    }

    // Game Logic Methods (extracted from original script.js)
    createSpellCards() {
        // Get starting hand from deck (4 cards for mulligan)
        this.playerHand = this.cardManager.getStartingHand(4);
        
        // Set initial game state to mulligan phase
        this.gameState = 'mulligan';
        this.isPlayerTurn = false; // Disable normal gameplay during mulligan
    }

    spawnInitialEnemies() {
        this.currentWave = 1;
        this.spawnWave(this.currentWave);
    }

    spawnWave(wave) {
        this.enemies = [];
        this.currentWave = wave;

        // Boss every 10 waves
        if (wave % 10 === 0 && typeof getRandomBoss === 'function') {
            var bossTemplate = getRandomBoss();
            var boss = {
                id: this.enemyIdCounter++,
                name: bossTemplate.name,
                art: bossTemplate.art,
                health: bossTemplate.health,
                maxHealth: bossTemplate.health,
                attack: bossTemplate.attack,
                ability: bossTemplate.ability || null,
                isBoss: true,
                bossId: bossTemplate.id,
                bossMechanics: bossTemplate.bossMechanics,
                isDying: false
            };
            this.enemies.push(boss);
            this.renderEnemies();
            this.addToHistory('👑 BOSS: ' + boss.name + ' appears!', false);
            return;
        }

        // Enemy count: 2-3 base, +1 every 10 waves
        var baseCount = 2;
        var bonusCount = Math.floor(wave / 10);
        var enemyCount = Math.min(7, baseCount + bonusCount + Math.floor(Math.random() * 2));

        // Scaling bonuses
        var hpBonus = Math.floor(wave / 10);
        var atkBonus = Math.floor(wave / 20);

        var enemyTypes = [
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

        for (var i = 0; i < enemyCount; i++) {
            var type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            var ability = typeof getRandomAbilityChance === 'function' ? getRandomAbilityChance(this.currentWave) : null;
            this.enemies.push({
                id: this.enemyIdCounter++,
                name: type.name,
                art: type.art,
                health: type.health + hpBonus,
                maxHealth: type.health + hpBonus,
                attack: type.attack + atkBonus,
                ability: ability,
                divineShieldActive: ability === 'divineShield' ? true : undefined,
                shrouded: ability === 'shroud' ? false : undefined
            });
        }

        this.renderEnemies();
    }

    nextWave() {
        var newWave = this.currentWave + 1;

        // Disable end turn button immediately during transition
        var btn = this.element.querySelector('#end-turn');
        if (btn) btn.disabled = true;

        // Heal between waves (same formula as arena)
        var healAmount = CombatEngineComponent.calculateHealAmount(
            newWave, this.playerHealth, this.maxHealth
        );
        if (healAmount > 0) {
            this.playerHealth = Math.min(this.maxHealth, this.playerHealth + healAmount);
        }

        // Reset mana to 1 for fresh start (ramps each turn from here)
        this.currentTurn = 1;
        this.maxMana = 1;
        this.currentMana = 1;

        // Refill deck and give fresh hand of 4 cards
        if (this.cardManager) {
            this.cardManager.resetDeck();
            this.playerHand = this.cardManager.drawMultipleCardsFromDeck(4);
        }

        // Short delay before spawning next wave
        var _this = this;
        setTimeout(function() {
            _this.spawnWave(newWave);
            _this.renderPlayerHand();
            _this.updateUI();
            _this.updateDeckTracker();
            _this.isPlayerTurn = true;

            var endTurnBtn = _this.element.querySelector('#end-turn');
            if (endTurnBtn) endTurnBtn.disabled = false;

            // Save state after wave spawn for resume support
            _this.saveAdventureState();
        }, 1500);
    }

    renderPlayerHand() {
        this.playerHandComp.render(this.playerHand, this.currentMana);
    }

    renderEnemies() {
        var firstAlive = null;
        for (var i = 0; i < this.enemies.length; i++) {
            if (!this.enemies[i].isDying && this.enemies[i].health > 0) {
                firstAlive = this.enemies[i];
                break;
            }
        }
        if (this.enemyInfoPanel) {
            this.enemyInfoPanel.update(firstAlive);
        }
        var dyingEnemies = this.enemies.filter(function(e) { return e.isDying; });
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
        
        const confirmExit = confirm('Are you sure you want to return to the main menu? Your progress will be saved.');
        if (confirmExit) {
            // Save current state before leaving (mid-wave save)
            this.saveAdventureState();
            
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
        if (this.currentWave > currentBest) {
            localStorage.setItem('bestWave', this.currentWave.toString());
        }
        
        // Increment spells cast counter
        const currentSpellsCast = parseInt(localStorage.getItem('spellsCast') || '0');
        // We would track spells cast during the game and add them here
        // For now, just increment by the number of turns (rough estimate)
        localStorage.setItem('spellsCast', (currentSpellsCast + this.currentTurn).toString());
    }

    saveAdventureState() {
        if (!this.cardManager || this.gameState === 'mulligan') return;
        var state = {
            phase: 'adventure',
            deckId: this._currentDeckId,
            currentWave: this.currentWave,
            currentTurn: this.currentTurn,
            playerHealth: this.playerHealth,
            maxHealth: this.maxHealth,
            playerShield: this.playerShield,
            currentMana: this.currentMana,
            maxMana: this.maxMana,
            totalEnemiesKilled: this.totalEnemiesKilled,
            gameXPAccumulator: this.gameXPAccumulator,
            enemies: this.enemies.map(function(e) {
                return {
                    id: e.id,
                    name: e.name,
                    art: e.art,
                    health: e.health,
                    maxHealth: e.maxHealth,
                    attack: e.attack,
                    ability: e.ability,
                    divineShieldActive: e.divineShieldActive,
                    shrouded: e.shrouded,
                    isDying: e.isDying,
                    isBoss: e.isBoss,
                    skipAttack: e.skipAttack,
                    bossMechanics: e.bossMechanics
                };
            }),
            enemyIdCounter: this.enemyIdCounter,
            playerHand: JSON.parse(JSON.stringify(this.playerHand)),
            remainingDeck: JSON.parse(JSON.stringify(this.cardManager.remainingDeck)),
            runResult: null
        };
        AdventureStateManager.saveState(state);
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
                        this.audioCtrl.updateButtons(this.headerComp);
                    }
                }, 500);
            }
        }
    }

    // Card and Enemy Interaction Methods

    // Card and Enemy Interaction Methods
    handleCardClick(cardElement) {
        // Mulligan cards are handled separately in the overlay
        // Regular hand cards are not clickable during mulligan
        
        if (this.gameState !== 'playing' || !this.isPlayerTurn) return;
        
        const handIndex = parseInt(cardElement.dataset.handIndex);
        const card = this.playerHand[handIndex];

        // Deja Vu check: can't be used if no previous spell was cast
        if (card.recall && !this._lastSpellCast) {
            this.showMessage('No previous spell to recall!');
            return;
        }

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
        var enemyId = parseInt(enemyElement.dataset.enemyId);
        var clickedEnemy = this.enemies.find(function(e) {
            return e.id === enemyId;
        });

        if (this.selectedCard && (this.selectedCard.targetType === 'single')) {
            // During spell targeting: panel already shown by hover, just proceed
            
            // Camouflage: shrouded enemies cannot be targeted
            if (clickedEnemy && clickedEnemy.shrouded) {
                this.showMessage('This enemy is camouflaged and cannot be targeted!');
                return;
            }
            
            if (typeof hasActiveProvoker === 'function' && hasActiveProvoker(this.enemies)) {
                // Block clicks on non-provoker enemies; allow clicking any provoker
                if (clickedEnemy && clickedEnemy.ability !== 'provoke') {
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
        } else {
            // No spell selected: update info panel with clicked enemy
            if (clickedEnemy && this.enemyInfoPanel) {
                this.enemyInfoPanel.update(clickedEnemy);
            }
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
        // Remove targeting from shrouded enemies (Camouflage)
        var _this = this;
        this.enemies.forEach(function(e) {
            if (e.shrouded) {
                var el = _this.enemyBoard.container.querySelector('[data-enemy-id="' + e.id + '"]');
                if (el) el.classList.remove('targetable');
            }
        });
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

        // Track last spell cast (before this card is removed from hand)
        if (!card.recall) {
            this._lastSpellCast = card;
        }

        // Archimage: increment spell counter
        ClassManager.incrementSpellCount();

        // Achievement tracking: spell cast
        this._spellsCastThisTurn = (this._spellsCastThisTurn || 0) + 1;
        if (window.AchievementManager) {
            AchievementManager.incrementStat('totalSpellsCast');
        }

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

            // Archimage: check if we should draw from spell count
            if (ClassManager.shouldDrawFromSpellCount()) {
                this.drawCard();
                this.addToHistory('\uD83D\uDD2E Spell counter complete! Draw 1', true);
                this.showMessage('Spell counter complete! Draw 1');
            }

            // Update counter display
            if (ClassManager.getActiveClassId() === 'archimage') {
                this._updateArchimageCounter();
            }

            // Auto-end turn if player has no playable cards left and game is still active
            var hasPlayableCard = this.playerHand.some(function(c) { return c.mana <= this.currentMana; }.bind(this));
            if (!hasPlayableCard && this.isPlayerTurn && this.gameState === 'playing') {
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

                    // Chain lightning: hit adjacent enemies with stagger
                    if (card.id === 'electro_chain_lightning' || card.id === 'electro_lightning_bolt') {
                        var aliveEnemies = this.enemies.filter(function(e) { return !e.isDying && e.health > 0; });
                        var targetIdx = aliveEnemies.findIndex(function(e) { return e.id === targetEnemyId; });
                        var adjDmg = (card.id === 'electro_chain_lightning') ? 2 : card.damage;

                        if (targetIdx > 0) {
                            const leftEnemy = aliveEnemies[targetIdx - 1];
                            setTimeout(() => {
                                const leftEl = this.element.querySelector(`[data-enemy-id="${leftEnemy.id}"]`);
                                if (leftEl) {
                                    this.visualEffects.createSpellImpact(leftEl, spellType);
                                    this.applyDamageWithElement(leftEnemy.id, adjDmg, card.element || spellType, true);
                                    this.addToHistory(`\u26A1 ${adjDmg} ${leftEnemy.art} (chain)`, true);
                                }
                            }, 250);
                        }
                        if (targetIdx < aliveEnemies.length - 1) {
                            const rightEnemy = aliveEnemies[targetIdx + 1];
                            setTimeout(() => {
                                const rightEl = this.element.querySelector(`[data-enemy-id="${rightEnemy.id}"]`);
                                if (rightEl) {
                                    this.visualEffects.createSpellImpact(rightEl, spellType);
                                    this.applyDamageWithElement(rightEnemy.id, adjDmg, card.element || spellType, true);
                                    this.addToHistory(`\u26A1 ${adjDmg} ${rightEnemy.art} (chain)`, true);
                                }
                            }, 450);
                        }
                    }
                }
                break;
                
            case 'all':
                // Handle damageFormula (e.g. missingHp for Shadow Explosion)
                var aoeDamage = card.damageFormula === 'missingHp'
                    ? SpellResolverComponent.getFormulaDamage(this, card)
                    : (card.damage || 0);
                this.addToHistory(`${card.art} - ${aoeDamage} 🌍`, true);
                if (card.damageFormula === 'missingHp') {
                    this.addToHistory('Missing HP: ' + ((this.maxHealth || 30) - this.playerHealth) + ' -> ' + aoeDamage + ' dmg', true);
                }
                // Create a copy of enemies array to avoid modification during iteration
                const enemiesSnapshot = [...this.enemies];
                var totalDamage = 0;
                enemiesSnapshot.forEach((enemy, index) => {
                    setTimeout(() => {
                        const enemyEl = this.element.querySelector(`[data-enemy-id="${enemy.id}"]`);
                        this.visualEffects.createSpellImpact(enemyEl, spellType);
                        this.applyDamageWithElement(enemy.id, aoeDamage, card.element || spellType);
                        // Play impact sounds with slight delay
                        setTimeout(() => {
                            this.soundManager?.playSpellSound(card.id, 'impact');
                        }, 300);
                    }, index * 150); // Stagger the damage application
                    totalDamage += Math.min(aoeDamage, enemy.health || 999);
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
                // Copy mechanic (Arcane Explosion)
                if (card.copy) {
                    SpellResolverComponent.handleCopy(this, card);
                }
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

                // Handle selfDamage (Ombrelumiere - Dark Pact)
                if (card.selfDamage) {
                    var currentHealth = this.playerHealth;
                    this.playerHealth -= card.selfDamage;
                    var playerHeroEl = this.element.querySelector('.hero-portrait');
                    if (this.visualEffects && playerHeroEl) {
                        this.visualEffects.showDamageNumber(playerHeroEl, card.selfDamage);
                    }
                    this.addToHistory(`${card.art} - Lose ${card.selfDamage} HP`, true);
                    message += `Lose ${card.selfDamage} health! `;
                }
                
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

                    // Achievement tracking: max shield in combat
                    if (window.AchievementManager) {
                        var maxShield = AchievementManager.getCombatStat('maxShieldInCombat') || 0;
                        if (this.playerShield > maxShield) {
                            AchievementManager.setCombatStat('maxShieldInCombat', this.playerShield);
                        }
                    }
                }
                
                // Handle static draw (Electromancien)
                if (card.id === 'electro_static_draw') {
                    const shockedEnemies = this.enemies.filter(function(e) {
                        return !e.isDying && e.health > 0 && ElementalReactionsManager.hasStatus(e, 'shocked');
                    });
                    if (shockedEnemies.length > 0) {
                        this.drawMultipleCards(shockedEnemies.length);
                        this.addToHistory(`\u26A1 +${shockedEnemies.length} \uD83D\uDCD6 (static draw)`, true);
                        message += `Draw ${shockedEnemies.length} cards! `;
                    } else {
                        this.addToHistory(`\u26A1 No Electrified enemies`, true);
                        message += 'No Electrified enemies! ';
                    }
                }

                // Handle recall (Archimage - Deja Vu)
                if (card.recall) {
                    var recalled = SpellResolverComponent.handleRecall(this);
                    if (recalled) {
                        message += ' Previous spell recalled! ';
                    } else {
                        message += ' No previous spell to recall! ';
                    }
                }
                
                // Handle copy (post-resolution, e.g. if a self-targeting spell also has copy)
                if (card.copy) {
                    SpellResolverComponent.handleCopy(this, card);
                    message += ' Spell copied to hand! ';
                }

                this.soundManager?.playSpellSound(card.id, 'cast');
                this.showMessage(message.trim());
                break;
        }
    }

    applyDamageWithElement(enemyId, baseDamage, elementType, skipDeathHistory) {
        SpellResolverComponent.applyDamageWithElement(this, enemyId, baseDamage, elementType, skipDeathHistory);
    }

    damageEnemyWithEffects(enemyId, damage, skipDeathHistory = false) {
        const enemy = this.enemies.find(e => e.id === enemyId);
        if (enemy) {
            // Divine Shield: blocks all damage once
            if (enemy.divineShieldActive) {
                enemy.divineShieldActive = false;
                this.addToHistory('\u{1F947} ' + enemy.name + '\'s Divine Shield blocks the spell!', false);
                this.enemyBoard.addDamageEffect(enemyId);
                return;
            }

            const enemyElement = this.enemyBoard.container.querySelector(`[data-enemy-id="${enemyId}"]`);
            this.visualEffects.showDamageNumber(enemyElement, damage);
            this.enemyBoard.addDamageEffect(enemyId);
            enemy.health -= damage;

        if (typeof checkAndTriggerEnrage === 'function' && checkAndTriggerEnrage(enemy)) {
                this.addToHistory(enemy.art + ' ' + enemy.name + ' is ENRAGED! +2 ATK', false);
            }
            
            if (enemy.health <= 0) {
                // Sacrifice: on death, buff a random ally
                if (enemy.ability === 'sacrifice') {
                    var allies = this.enemies.filter(function(e) { return e.id !== enemy.id && !e.isDying && e.health > 0; });
                    if (allies.length > 0) {
                        var target = allies[Math.floor(Math.random() * allies.length)];
                        target.attack += (window.ENEMY_ABILITIES ? window.ENEMY_ABILITIES.sacrifice.bonusAttack : 2);
                        this.addToHistory('\u{1F525} ' + enemy.name + ' sacrifices! ' + target.name + ' gains +2 ATK', false);
                    }
                }

                this.gameXPAccumulator += 10;
                this.totalEnemiesKilled++;
                var deathResult = ClassManager.onEnemyDeath(this.playerHealth, this.maxHealth || 30);
                this.playerHealth = deathResult.health;
                this.maxHealth = deathResult.maxHealth;
                this.soundManager?.play('enemy_death');

                // Achievement tracking: enemy killed
                if (window.AchievementManager) {
                    AchievementManager.incrementStat('totalEnemiesKilled');
                    if (enemy.isBoss) {
                        AchievementManager.incrementStat('totalBossDefeated.' + (enemy.bossId || 'unknown'));
                        if (this.currentTurn <= 5) {
                            AchievementManager.setCombatStat('hasKilledBossIn5TurnsOrLess', true);
                        }
                    }
                }

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

        // Achievement tracking: max hand size
        if (window.AchievementManager && this.playerHand.length > 0) {
            if (!AchievementManager.isUnlocked('full_hand')) {
                var maxSize = AchievementManager.getCombatStat('maxHandSize') || 0;
                if (this.playerHand.length > maxSize) {
                    AchievementManager.setCombatStat('maxHandSize', this.playerHand.length);
                }
            }
            if (!AchievementManager.isUnlocked('triple_copy')) {
                var _counts = {};
                for (var _i = 0; _i < this.playerHand.length; _i++) {
                    var _cid = this.playerHand[_i].id || this.playerHand[_i].cardId;
                    _counts[_cid] = (_counts[_cid] || 0) + 1;
                    if (_counts[_cid] >= 3) {
                        AchievementManager.setCombatStat('hasHad3CopiesOfSameCard', true);
                        break;
                    }
                }
            }
        }
    }

    endTurn() {
        if (this.gameState !== 'playing' || !this.isPlayerTurn) return;
        
        // Check for alive enemies (exclude dying ones still in death animation)
        var aliveEnemies = this.enemies.filter(function(e) {
            return !e.isDying && e.health > 0;
        });
        if (aliveEnemies.length === 0) {
            this.isPlayerTurn = false;
            this.element.querySelector('#end-turn').disabled = true;
            this.updateGameStatus('Wave Complete!');
            this.checkGameEnd();
            return;
        }
        
        this.isPlayerTurn = false;
        this.updateGameStatus('Enemy Turn');
        this.element.querySelector('#end-turn').disabled = true;
        this.selectedCard = null;
        
        // Toggle shroud for enemies with Camouflage ability
        this.enemies.forEach(function(e) {
            if (e.ability === 'shroud') {
                e.shrouded = !e.shrouded;
            }
        });
        if (this.enemyBoard && typeof this.enemyBoard.updateAllStatusOverlays === 'function') {
            this.enemyBoard.updateAllStatusOverlays(this.enemies);
        }

        // Enemy attack phase via shared combat engine
        setTimeout(() => {
            CombatEngineComponent.executeEnemyAttackPhase(this, {
                intervalMs: 350,
                beforeAttack: (screen) => screen.processBossPreMechanics(),
                afterAttack: (screen) => screen.processBossPostMechanics(),
                onDefeat: () => this.gameOver(false),
                onPhaseEnd: () => this.startNewTurn()
            });
        }, 1000);
    }

    /* ------ BOSS MECHANICS ------ */

    processBossPreMechanics() {
        var boss = this.enemies.find(function(e) { return e.isBoss && !e.isDying; });
        if (!boss) return;

        boss.skipAttack = false;
        var mech = boss.bossMechanics;
        if (!mech) return;

        switch (mech.type) {
            case 'dark_mage':
                boss.health = Math.min(boss.maxHealth, boss.health + mech.healPerTurn);
                this.enemyBoard.updateEnemyHealth(boss.id, boss.health, boss.maxHealth);
                this.updateUI();
                this.addToHistory(boss.art + ' ' + boss.name + ' heals ' + mech.healPerTurn + ' HP', false);
                break;

            case 'dragon':
                boss.attack += mech.attackRamp;
                this.renderEnemies();
                this.updateUI();
                this.addToHistory(boss.art + ' ' + boss.name + ' rampages! ATK rises to ' + boss.attack, false);
                break;
        }
    }

    processBossPostMechanics() {
        var boss = this.enemies.find(function(e) { return e.isBoss && !e.isDying; });
        if (!boss) return;

        var mech = boss.bossMechanics;
        if (!mech) return;

        switch (mech.type) {
            case 'skeleton_king':
                var bossIndex = this.enemies.indexOf(boss);
                if (bossIndex >= 0) {
                    if (!this.enemyIdCounter) this.enemyIdCounter = 0;
                    // Left skeleton
                    this.enemies.splice(bossIndex, 0, {
                        id: this.enemyIdCounter++, name: 'Skeleton', art: '\u{1F480}',
                        health: 1, maxHealth: 1, attack: 1, isDying: false
                    });
                    // Right skeleton (boss shifted right by 1 after splice)
                    this.enemies.splice(bossIndex + 2, 0, {
                        id: this.enemyIdCounter++, name: 'Skeleton', art: '\u{1F480}',
                        health: 1, maxHealth: 1, attack: 1, isDying: false
                    });
                }
                this.renderEnemies();
                this.addToHistory(boss.art + ' ' + boss.name + ' summons 2 Skeletons!', false);
                break;
        }
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
        CombatEngineComponent.executeEnemyAttackPhase(this, {
            intervalMs: 350,
            onDefeat: () => this.gameOver(false),
            onPhaseEnd: () => this.startNewTurn()
        });
    }

    startNewTurn() {
        // Achievement tracking: check max spells last turn
        if (window.AchievementManager) {
            var spellsThisTurn = this._spellsCastThisTurn || 0;
            var maxSpells = AchievementManager.getCombatStat('maxSpellsInOneTurn') || 0;
            if (spellsThisTurn > maxSpells) {
                AchievementManager.setCombatStat('maxSpellsInOneTurn', spellsThisTurn);
            }
        }

        // Reset per-turn counters
        this._spellsCastThisTurn = 0;
        this._combatEnemiesFrozenThisTurn = 0;

        // Reset per-turn class state
        ClassManager.resetPerTurnState();

        CombatEngineComponent.startTurn(this, {
            maxManaCap: 10,
            onTurnStart: () => {
                this.updateGameStatus('Your Turn');
            }
        });
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
        if (window.AchievementManager) {
            if (!AchievementManager.isUnlocked('full_hand')) {
                var maxSize = AchievementManager.getCombatStat('maxHandSize') || 0;
                if (this.playerHand.length > maxSize) {
                    AchievementManager.setCombatStat('maxHandSize', this.playerHand.length);
                }
            }
            if (!AchievementManager.isUnlocked('triple_copy')) {
                var _counts = {};
                for (var _i = 0; _i < this.playerHand.length; _i++) {
                    var _cid = this.playerHand[_i].id || this.playerHand[_i].cardId;
                    _counts[_cid] = (_counts[_cid] || 0) + 1;
                    if (_counts[_cid] >= 3) {
                        AchievementManager.setCombatStat('hasHad3CopiesOfSameCard', true);
                        break;
                    }
                }
            }
        }
    }

    checkGameEnd() {
        if (this._pendingWaveTransition) return;
        if (this.gameState === 'won' || this.gameState === 'lost') return;

        // Check for alive enemies
        var alive = this.enemies.filter(function(e) {
            return !e.isDying && e.health > 0;
        });
        if (alive.length > 0) return;

        // Check for dying enemies still playing death animation
        var dying = this.enemies.filter(function(e) {
            return e.isDying;
        });
        if (dying.length > 0) return;

        if (this.enemies.length === 0) {
            if (window.AchievementManager) {
                if (this.playerHealth >= (this.maxHealth || 30)) {
                    AchievementManager.setCombatStat('hasWonWithoutDamage', true);
                }
                if (this.playerHealth === 1) {
                    AchievementManager.setCombatStat('hasWonAt1HP', true);
                }
            }
            // All enemies confirmed dead -> go to next wave
            this._pendingWaveTransition = true;
            setTimeout(() => {
                this._pendingWaveTransition = false;
                this.gameXPAccumulator += 25;
                this.nextWave();
            }, 500);
        } else if (this.playerHealth <= 0) {
            this.gameOver(false);
        }
    }

    gameOver(playerWon) {
        if (this.gameState === 'won' || this.gameState === 'lost') {
            return;
        }

        this.gameState = 'lost';
        this.isPlayerTurn = false;
        var endTurnBtn = this.element.querySelector('#end-turn');
        if (endTurnBtn) endTurnBtn.disabled = true;

        this.updateGameStatus('Defeat!');
        this.soundManager?.play('defeat');

        // Save game stats
        this.saveGameStats();

        // Achievement tracking: game over (defeat)
        if (window.AchievementManager) {
            AchievementManager.incrementStat('totalGamesPlayed');
            AchievementManager.resetCombatStats();
        }

        // Clear saved state so the run can't be resumed
        AdventureStateManager.clearState();

        if (window.PlayerProgressionManager) {
            var totalXP = this.gameXPAccumulator + 20;
            PlayerProgressionManager.addXP(totalXP);
        }

        this.showEndRunScreen();
    }

    showEndRunScreen() {
        this.gameOverOverlay.show({
            isVictory: false,
            title: 'Defeated!',
            message: 'Your adventure has ended.'
        });
        this.gameOverOverlay.setStats(
            '<div>Waves reached: ' + this.currentWave + '</div>' +
            '<div>Enemies killed: ' + this.totalEnemiesKilled + '</div>' +
            '<div>Turns survived: ' + this.currentTurn + '</div>' +
            '<div>XP earned: ' + (this.gameXPAccumulator + 20) + '</div>'
        );
    }



    updateGameStatus(status) {
        const statusElement = this.element.querySelector('#game-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
        if (this.headerComp) {
            this.headerComp.update({ status: status });
        }
    }

    addToHistory(action, isPlayerAction = true) {
        this.actionHistoryComp.addEntry(action, isPlayerAction, this.currentTurn);
        this.actionHistory = this.actionHistoryComp.entries;
    }

    updateUI() {
        this.element.querySelector('#current-mana').textContent = this.currentMana;
        this.element.querySelector('#player-health').textContent = `❤️ ${this.playerHealth}/${this.maxHealth}`;
        this.element.querySelector('#max-mana').textContent = `/${this.maxMana}`;
        if (this.headerComp) {
            this.headerComp.update({
                round: this.currentWave,
                enemies: this.enemies.length,
                status: this.element.querySelector('#game-status')?.textContent || ''
            });
        }
        
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

        // Update Archimage counter and Ombrelumiere button
        this._updateArchimageCounter();
        this._updateHpToManaButton();
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
}

// Export to global scope
window.GameScreen = GameScreen;