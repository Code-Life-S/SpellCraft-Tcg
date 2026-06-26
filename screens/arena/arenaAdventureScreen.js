class ArenaAdventureScreen extends BaseScreen {
    // Enemy scaling constants (easy to tweak)
    static ENEMY_BASE_COUNT = 1;
    static ENEMY_COUNT_PER_ROUNDS = 4; // +1 enemy every N rounds
    static ENEMY_BASE_HP = 1;
    static ENEMY_HP_PER_ROUND = 0.5;
    static ENEMY_BASE_ATTACK = 1;
    static ENEMY_ATTACK_PER_ROUND = 0.3;

    constructor(screenManager) {
        super(screenManager);
        this.cardManager = null;
        this.arenaState = null;
        this.playerHand = [];
        this.arenaDeck = [];
        this.enemies = [];
        this.enemyIdCounter = 1;
        this.currentMana = 1;
        this.maxMana = 1;
        this.playerShield = 0;
        this.selectedCard = null;
        this.selectedCardIndex = null;
        this.gameState = 'playing';
        this.isPlayerTurn = true;
        this.roundTransitioning = false;
        this.soundManager = null;
        this.currentTurn = 0;
        this.actionHistory = [];
        this.arenaXPAccumulator = 0;
        this.deckTracker = null;
        this.actionHistoryComp = null;
        this.headerComp = null;
        this._lastSpellCast = null;
    }

    async setupContent() {
        try {
            const html = await window.templateLoader.loadScreenTemplate('screens/arena', 'arenaAdventureScreen');
            this.element.innerHTML = html;
        } catch (error) {
            console.error('Failed to load arena adventure template:', error);
            this.element.innerHTML = this.getFallbackHTML();
        }

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
            mode: 'arena',
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
        this.sidebarManager = new SidebarManagerComponent(this.element, {
            getHistoryButton: () => this.headerComp?.getHistoryButton(),
            getDeckButton: () => this.headerComp?.getDeckButton()
        });
        this.audioCtrl = new AudioController(this.soundManager);
        this.gameOverOverlay = new GameOverOverlayComponent(this.element, {
            defaultTitle: 'Victory!',
            defaultMessage: 'You conquered the arena!',
            buttonText: 'Back to Menu',
            onButtonClick: () => {
                ArenaStateManager.clearState();
                this.navigateTo('mainmenu');
            }
        });
        var arenaGB = this.element.querySelector('.game-board');
        if (arenaGB) {
            arenaGB.appendChild(this.gameOverOverlay.render());
        }
        this.sidebarManager.init();
        this.audioCtrl.init();
        this.audioCtrl.updateButtons(this.headerComp);
        this.visualEffects = new VisualEffectsComponent(this.element);
        this.enemyBoard = new EnemyBoardComponent(this.element, '#enemy-area');
        this.enemyInfoPanel = new EnemyInfoPanelComponent(this.element, '#enemy-info-panel');
        this.mulliganComp = new MulliganComponent(this.element);
        this.playerHandComp = new PlayerHandComponent(this.element, '#player-hand');
        this.deckTracker = new DeckTrackerComponent(this.element, '.deck-tracker');
        this.actionHistoryComp = new ActionHistoryComponent(this.element, '#action-history');

        await this.initializeManagers();

        // Force .hero-stats to display flex (prevent CSS override issues)
        const heroStats = this.element.querySelector('.hero-stats');
        if (heroStats) {
            heroStats.style.cssText = 'display:flex!important;gap:15px!important;align-items:center!important;justify-content:center!important;flex-direction:row!important;';
        }

        // Set up deck tracker data sources
        this.deckTracker.setDataSources(
            () => ({ remainingCards: this.arenaDeck.length }),
            () => {
                const counts = {};
                this.arenaDeck.forEach(card => {
                    const key = card.id || card.name;
                    counts[key] = (counts[key] || 0) + 1;
                });
                return counts;
            },
            (id) => {
                // First try cardManager
                if (this.cardManager) {
                    const card = this.cardManager.getCardById(id);
                    if (card) return card;
                }
                // Fallback: find card directly from arenaDeck
                const found = this.arenaDeck.find(c => (c.id || c.name) === id);
                return found || null;
            }
        );

        // Load state - startRound is called in onBeforeShow to avoid double initialization
        const state = ArenaStateManager.getState();
        if (state && state.phase === 'adventure') {
            this.arenaState = state;
        } else {
            console.warn('No active arena adventure - will redirect on show');
        }
    }

    getFallbackHTML() {
        return '<div class="arena-adventure" style="width:100%;height:100%;display:flex;flex-direction:column;background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;overflow:hidden;">' +
            '<div class="game-board" style="width:100%;height:100%;display:flex;flex-direction:column;">' +
                '<div class="main-game-area" style="display:flex;height:auto;min-height:220px;max-height:300px;margin:10px 20px;gap:15px;width:calc(100% - 40px);">' +
                    '<div class="left-sidebar" id="left-sidebar" style="width:200px;background:linear-gradient(135deg,rgba(30,30,50,0.8),rgba(50,50,80,0.8));border:2px solid rgba(255,215,0,0.3);border-radius:10px;padding:10px;overflow-y:auto;display:flex;flex-direction:column;">' +
                        '<div class="history-panel" style="display:flex;flex-direction:column;height:100%;">' +
                            '<h3 style="color:#FFD700;font-size:16px;margin-bottom:10px;text-align:center;">Action History</h3>' +
                            '<div class="history-content" id="action-history" style="flex:1;overflow-y:auto;font-size:12px;"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="center-battlefield" style="flex:1;display:flex;flex-direction:column;">' +
                        '<div class="enemy-battlefield" id="enemy-battlefield" style="flex:1;min-height:200px;max-height:280px;background:linear-gradient(135deg,rgba(139,0,0,0.2),rgba(75,0,130,0.2));border:3px solid rgba(255,69,0,0.4);border-radius:15px;padding:10px;display:flex;flex-wrap:wrap;gap:15px;align-items:flex-start;justify-content:center;overflow-y:auto;position:relative;">' +
                            '<div class="enemy-area" id="enemy-area" style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap;width:100%;min-height:100%;"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="right-sidebar" id="right-sidebar" style="width:200px;background:linear-gradient(135deg,rgba(30,30,50,0.8),rgba(50,50,80,0.8));border:2px solid rgba(255,215,0,0.3);border-radius:10px;padding:10px;overflow-y:auto;display:flex;flex-direction:column;">' +
                        '<div class="deck-tracker" style="display:flex;flex-direction:column;height:100%;">' +
                            '<h3 style="color:#FFD700;font-size:16px;margin-bottom:10px;text-align:center;">Deck Tracker</h3>' +
                            '<div class="deck-info" style="margin-bottom:15px;text-align:center;flex-shrink:0;">' +
                                '<div class="deck-count" style="font-size:18px;font-weight:bold;color:#00FF7F;">' +
                                    '<span id="deck-remaining" style="color:#FF6B6B;">0</span>' +
                                    '<span style="color:#FFD700;"> / 0</span>' +
                                '</div>' +
                            '</div>' +
                            '<div class="deck-cards" id="deck-cards" style="flex:1;overflow-y:auto;"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="player-area" style="flex:1;display:flex;flex-direction:column;align-items:center;padding:20px;min-height:300px;width:100%;">' +
                    '<div class="player-hero" style="display:flex;align-items:center;gap:15px;margin-bottom:15px;">' +
                        '<div class="hero-portrait" id="hero-portrait" style="display:flex;align-items:center;justify-content:center;">' +
                            '<div class="hero-stats" style="display:flex;gap:15px;align-items:center;justify-content:center;">' +
                                '<span class="hero-hp-to-mana" id="hp-to-mana-btn" title="Sacrifice 2 HP for 1 Mana" style="cursor:pointer;font-size:20px;">' + '\u{1F489}\u2192\u{1F48E}' + '</span>' +
                                '<span class="hero-health" id="player-health" style="min-width:80px;height:50px;border-radius:12px;background:linear-gradient(45deg,#32CD32,#228B22);display:flex;align-items:center;justify-content:center;border:3px solid #FFD700;font-weight:bold;font-size:16px;color:#fff;padding:8px 12px;">30</span>' +
                                '<span class="hero-shield" id="player-shield" style="display:none;min-width:80px;height:50px;border-radius:12px;background:linear-gradient(45deg,#4169E1,#1E90FF);color:white;align-items:center;justify-content:center;border:3px solid #FFD700;font-weight:bold;font-size:16px;padding:8px 12px;">0</span>' +
                                '<span class="hero-spell-counter" id="spell-counter" style="display:none;font-size:14px;color:#87CEEB;font-weight:bold;">0/3</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="player-hand" id="player-hand" style="display:flex;gap:15px;margin-bottom:25px;min-height:160px;align-items:flex-end;justify-content:center;flex-wrap:wrap;"></div>' +
                    '<div class="player-info" style="display:flex;align-items:center;gap:20px;">' +
                        '<div class="mana-crystals" style="font-size:18px;font-weight:bold;color:#4169E1;">' +
                            '<span id="current-mana" style="color:#87CEEB;font-size:22px;">1</span>' +
                            '<span id="max-mana" style="color:#888;font-size:14px;">/10</span>' +
                        '</div>' +
                        '<button id="end-turn-btn" style="padding:12px 24px;background:linear-gradient(45deg,#FFD700,#FFA500);border:none;border-radius:20px;font-weight:bold;color:#8B4513;cursor:pointer;font-size:16px;">End Turn</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="round-overlay hidden" id="round-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:10000;">' +
                '<div class="round-overlay-content" style="text-align:center;max-width:600px;width:90%;">' +
                    '<h2 class="victory-title" style="font-size:36px;color:#FFD700;margin-bottom:20px;">Round Complete!</h2>' +
                    '<div class="upgrade-section">' +
                        '<h3 class="upgrade-phase-title" id="phase-title" style="font-size:24px;color:#FFD700;margin-bottom:15px;">Upgrade a Card</h3>' +
                        '<div class="upgrade-choices" id="upgrade-choices" style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;"></div>' +
                    '</div>' +
                '</div>' +
        '</div>';
    }

    getErrorHTML(message) {
        return '<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a2e,#16213e);color:#DC143C;padding:20px;text-align:center;">' +
            '<h1>Error</h1>' +
            '<p style="margin:20px 0;color:#ccc;">' + message + '</p>' +
            '<button onclick="window.ArenaStateManager && ArenaStateManager.clearState(); window.location.reload();" style="background:linear-gradient(145deg,rgba(255,215,0,0.2),rgba(255,165,0,0.2));border:2px solid #FFD700;border-radius:8px;color:#FFD700;padding:12px 24px;cursor:pointer;font-size:16px;">Reset and Reload</button>' +
        '</div>';
    }

    async initializeManagers() {
        if (window.CardManager) {
            this.cardManager = new CardManager();
            await this.cardManager.loadCards();
        }
        if (window.SoundManager) {
            if (window.globalSoundManager) {
                this.soundManager = window.globalSoundManager;
            } else {
                this.soundManager = new SoundManager();
                this.soundManager.setAsGlobalInstance();
            }
        }
    }

    saveState() {
        delete this.arenaState.midRound;
        ArenaStateManager.saveState(this.arenaState);
    }

    saveMidRoundState() {
        this.arenaState.midRound = {
            saved: true,
            currentTurn: this.currentTurn,
            currentMana: this.currentMana,
            maxMana: this.maxMana,
            playerShield: this.playerShield,
            playerHand: this.playerHand.map(function(c) { return Object.assign({}, c); }),
            arenaDeck: this.arenaDeck.map(function(c) { return Object.assign({}, c); }),
            enemies: JSON.parse(JSON.stringify(this.enemies)),
            enemyIdCounter: this.enemyIdCounter
        };
        ArenaStateManager.saveState(this.arenaState);
    }

    restoreGame() {
        var snapshot = this.arenaState.midRound;
        if (!snapshot || !snapshot.saved) {
            this.startRound();
            return;
        }

        this.gameState = 'playing';
        this.isPlayerTurn = true;
        this.roundTransitioning = false;
        this.currentTurn = snapshot.currentTurn;
        this.currentMana = snapshot.currentMana;
        this.maxMana = snapshot.maxMana;
        this.playerShield = snapshot.playerShield;
        this.selectedCard = null;
        this.selectedCardIndex = null;
        this.phase = null;

        this.playerHand = snapshot.playerHand.map(function(c) { return Object.assign({}, c); });
        this.arenaDeck = snapshot.arenaDeck.map(function(c) { return Object.assign({}, c); });

        this.enemies = JSON.parse(JSON.stringify(snapshot.enemies)).filter(function(e) { return !(e.isDying && e.health <= 0); });
        this.enemyIdCounter = snapshot.enemyIdCounter;

        this.updateUI();
        this.renderPlayerHand();
        this.renderEnemies();

        var el = this.element;
        var endTurnBtn = el.querySelector('#end-turn-btn');
        if (endTurnBtn) endTurnBtn.disabled = false;

        if (this.headerComp) {
            this.headerComp.update({
                round: this.arenaState.currentRound,
                enemies: this.enemies.filter(function(e) { return !e.isDying; }).length,
                status: 'Your Turn - Round ' + this.arenaState.currentRound
            });
        }

        this.addToHistory('Arena run resumed - Round ' + this.arenaState.currentRound + ', Turn ' + this.currentTurn, true);
        this.audioCtrl.updateButtons(this.headerComp);
    }

    /* ------ ROUND MANAGEMENT ------ */

    startRound() {
        const round = this.arenaState.currentRound;
        this.gameState = 'playing';
        this.isPlayerTurn = true;
        this.roundTransitioning = false;
        this.currentTurn = 1;
        this.currentMana = 1;
        this.maxMana = 1;
        this.playerShield = this.arenaState.currentShield || 0;
        this.selectedCard = null;
        this.selectedCardIndex = null;
        this.phase = null;

        const handSize = ArenaStateManager.getHandSize(round);
        this.arenaDeck = this.buildShuffledDeck();
        this.playerHand = this.drawCards(handSize);
        this._checkHandAchievements();

        this.spawnEnemies(round);
        this.updateUI();
        this.renderPlayerHand();
        this.renderEnemies();

        const el = this.element;
        if (this.headerComp) {
            this.headerComp.update({ round: round, status: 'Your Turn - Round ' + round });
        }
        el.querySelector('#end-turn-btn').disabled = false;

        // Mulligan at the start of round 1
        if (round === 1) {
            var _this = this;
            this.gameState = 'mulligan';
            this.isPlayerTurn = false;
            this.mulliganComp.start(this.playerHand, {
                returnCards: function(cards) {
                    cards.forEach(function(c) { _this.arenaDeck.push(c); });
                    _this.shuffleArray(_this.arenaDeck);
                },
                drawCards: function(count) { return _this.drawCards(count); }
            }, {
                onComplete: function(newHand) {
                    _this.playerHand = newHand;
                    _this.gameState = 'playing';
                    _this.isPlayerTurn = true;
                    _this.renderPlayerHand();
                    _this.updateUI();
                    _this._checkHandAchievements();
                    _this.addToHistory('Mulligan complete - Round ' + _this.arenaState.currentRound + ' begins!', true);
                }
            });
        }
    }

    buildShuffledDeck() {
        const deck = this.arenaState.arenaCards.map(card => {
            return ArenaStateManager.getUpgradedCard({ ...card }, this.arenaState.deckUpgrades);
        });
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    drawCards(count) {
        const drawn = [];
        for (let i = 0; i < count; i++) {
            if (this.arenaDeck.length === 0) break;
            const card = this.arenaDeck.pop();
            drawn.push({ ...card, instanceId: card.instanceId });
        }
        return drawn;
    }

    _checkHandAchievements() {
        if (!window.AchievementManager) return;
        if (!AchievementManager.isUnlocked('full_hand')) {
            var maxSize = AchievementManager.getCombatStat('maxHandSize') || 0;
            if (this.playerHand.length > maxSize) {
                AchievementManager.setCombatStat('maxHandSize', this.playerHand.length);
            }
        }
        if (!AchievementManager.isUnlocked('triple_copy')) {
            var counts = {};
            for (var i = 0; i < this.playerHand.length; i++) {
                var cid = this.playerHand[i].id || this.playerHand[i].cardId;
                counts[cid] = (counts[cid] || 0) + 1;
                if (counts[cid] >= 3) {
                    AchievementManager.setCombatStat('hasHad3CopiesOfSameCard', true);
                    break;
                }
            }
        }
    }

    /* ------ ENEMY SYSTEM ------ */

    spawnEnemies(round) {
        this.enemies = [];
        this.enemyIdCounter = 1;

        // Boss round at round 12 (or test boss override)
        if (round >= 12 && typeof getRandomBoss === 'function') {
            var bossTemplate;
            if (this.arenaState && this.arenaState.testBossId) {
                var testId = this.arenaState.testBossId;
                bossTemplate = BOSSES.find(function(b) { return b.id === testId; }) || getRandomBoss();
            } else {
                bossTemplate = getRandomBoss();
            }
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
            return;
        }

        var count = ArenaAdventureScreen.ENEMY_BASE_COUNT + Math.floor(round / ArenaAdventureScreen.ENEMY_COUNT_PER_ROUNDS);

        var enemyTypes = [
            { name: 'Goblin', art: '👹' },
            { name: 'Skeleton', art: '💀' },
            { name: 'Spider', art: '🕷️' },
            { name: 'Bandit', art: '🗡️' },
            { name: 'Wolf', art: '🐺' },
            { name: 'Dark Mage', art: '🧙‍♂️' },
            { name: 'Orc', art: '👿' },
            { name: 'Gargoyle', art: '🗿' },
            { name: 'Demon', art: '😈' },
            { name: 'Wraith', art: '👻' },
            { name: 'Vampire', art: '🧛' },
            { name: 'Minotaur', art: '🐂' }
        ];

        for (var i = 0; i < count; i++) {
            var baseHp = Math.round(ArenaAdventureScreen.ENEMY_BASE_HP + (round * ArenaAdventureScreen.ENEMY_HP_PER_ROUND) + (Math.random() * 3 - 1));
            var baseAttack = Math.max(1, Math.round(ArenaAdventureScreen.ENEMY_BASE_ATTACK + (round * ArenaAdventureScreen.ENEMY_ATTACK_PER_ROUND) + (Math.random() * 2 - 1)));
            var type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            var ability = typeof getAbilityForRound === 'function' ? getAbilityForRound(round) : null;
            this.enemies.push({
                id: this.enemyIdCounter++,
                name: type.name,
                art: type.art,
                health: baseHp,
                maxHealth: baseHp,
                attack: baseAttack,
                isDying: false,
                ability: ability,
                divineShieldActive: ability === 'divineShield' ? true : undefined,
                shrouded: ability === 'shroud' ? false : undefined
            });
        }
    }

    /* ------ UI UPDATE ------ */

    updateUI() {
        const el = this.element;
        const hp = this.arenaState.playerHealth;
        const maxHp = this.arenaState.maxHealth;
        const shield = this.playerShield || 0;
        const aliveEnemies = this.enemies.filter(e => !e.isDying);

        // Player health
        const healthEl = el.querySelector('#player-health');
        if (healthEl) healthEl.textContent = '❤️ ' + hp + '/' + maxHp;

        // Shield
        const shieldEl = el.querySelector('#player-shield');
        if (shieldEl) {
            if (shield > 0) {
                shieldEl.style.display = '';
                shieldEl.textContent = '🛡️' + shield;
            } else {
                shieldEl.style.display = 'none';
            }
        }

        // Mana
        el.querySelector('#current-mana').textContent = this.currentMana;
        el.querySelector('#max-mana').textContent = this.maxMana;

        // Header info
        if (this.headerComp) {
            let status;
            if (this.gameState === 'playing') {
                status = this.isPlayerTurn ? 'Your Turn - Round ' + this.arenaState.currentRound : 'Enemy Turn';
            } else {
                status = this.gameState === 'won' ? 'Round Complete!' : this.gameState === 'lost' ? 'Defeated' : 'Complete';
            }
            this.headerComp.update({
                round: this.arenaState.currentRound,
                enemies: aliveEnemies.length,
                status: status
            });
        }

        // Update end turn button state
        this.updateEndTurnButton();

        // Update deck tracker
        if (this.deckTracker) this.deckTracker.update();

        // Update Archimage counter and Ombrelumiere button
        this._updateArchimageCounter();
        this._updateHpToManaButton();
    }

    backToMenu() {
        this.soundManager?.play('button_click');
        if (confirm('Return to main menu? You can continue this arena run later.')) {
            this.saveMidRoundState();
            this.soundManager?.stopBackgroundMusic();
            this.navigateTo('mainmenu');
        }
    }

    renderPlayerHand() {
        this.playerHandComp.render(this.playerHand, this.currentMana);
    }

    renderEnemies() {
        this.enemyBoard.renderEnemies(this.enemies);
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
    }

    addToHistory(action, isPlayerAction) {
        if (this.actionHistoryComp) {
            this.actionHistoryComp.addEntry(action, isPlayerAction, this.currentTurn || 1);
            this.actionHistory = this.actionHistoryComp.entries;
        }
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    updateEndTurnButton() {
        const endTurnButton = this.element.querySelector('#end-turn-btn');
        if (!endTurnButton) return;
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

    /* ------ EVENTS ------ */

    bindEvents() {
        const q = (sel) => this.element.querySelector(sel);

        const endTurnBtn = q('#end-turn-btn');
        if (endTurnBtn) {
            this.addEventListenerSafe(endTurnBtn, 'click', () => this.endPlayerTurn());
        }

        // HP to Mana button (Ombrelumiere)
        const hpToManaBtn = q('#hp-to-mana-btn');
        if (hpToManaBtn) {
            this.addEventListenerSafe(hpToManaBtn, 'click', () => this.handleHpToMana());
        }

        this.addEventListenerSafe(this.element, 'click', (e) => {
            const cardEl = e.target.closest('.card');
            if (cardEl && this.gameState === 'playing' && this.isPlayerTurn) {
                this.handleCardClick(cardEl);
            }
            const enemyEl = e.target.closest('.enemy');
            if (enemyEl && this.selectedCard) {
                this.handleEnemyClick(enemyEl);
            }
        });

        const upgradeChoices = q('#upgrade-choices');
        if (upgradeChoices) {
            this.addEventListenerSafe(upgradeChoices, 'click', (e) => {
                const choiceEl = e.target.closest('.upgrade-choice');
                if (choiceEl && this.roundTransitioning) {
                    this.handleChoiceClick(parseInt(choiceEl.dataset.index));
                }
            });
        }

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


    }

    handleCardClick(cardEl) {
        if (this.gameState !== 'playing' || !this.isPlayerTurn) return;

        const handIndex = parseInt(cardEl.dataset.handIndex);
        const card = this.playerHand[handIndex];
        if (!card) return;

        if (card.mana > this.currentMana) {
            this.showMessage('Not enough mana! Need ' + card.mana + ', have ' + this.currentMana);
            return;
        }

        // Deja Vu check: can't be used if no previous spell was cast
        if (card.recall && !this._lastSpellCast) {
            this.showMessage('No previous spell to recall!');
            return;
        }

        this.selectedCard = card;
        this.selectedCardIndex = handIndex;
        this.playerHandComp.selectCard(handIndex);

        if (card.targetType === 'self' || card.targetType === 'all' || card.targetType === 'random') {
            this.castSpell(card, handIndex);
        } else {
            if (typeof hasActiveProvoker === 'function' && hasActiveProvoker(this.enemies)) {
                var provoker = this.enemies.find(function(e) {
                    return e.ability === 'provoke' && !e.isDying && e.health > 0;
                });
                if (provoker) {
                    this.enemyBoard.enableTargetingForEnemy(provoker.id);
                    this.showMessage('This enemy has Provocation! Target it first!');
                    return;
                }
            }
            this.enemyBoard.enableTargeting();
            // Remove targeting from shrouded enemies (Camouflage)
            var _this2 = this;
            this.enemies.forEach(function(e) {
                if (e.shrouded) {
                    var el = _this2.enemyBoard.container.querySelector('[data-enemy-id="' + e.id + '"]');
                    if (el) el.classList.remove('targetable');
                }
            });
        }
    }

    handleEnemyClick(enemyEl) {
        var enemyId = parseInt(enemyEl.dataset.enemyId);
        var targetEnemy = this.enemies.find(function(e) { return e.id === enemyId; });

        if (this.selectedCard && this.selectedCard.targetType === 'single') {
            // During spell targeting: panel already shown by hover, just proceed
            if (targetEnemy && targetEnemy.shrouded) {
                this.showMessage('This enemy is camouflaged and cannot be targeted!');
                return;
            }

            if (typeof hasActiveProvoker === 'function' && hasActiveProvoker(this.enemies)) {
                var provoker = this.enemies.find(function(e) {
                    return e.ability === 'provoke' && !e.isDying && e.health > 0;
                });
                if (provoker && enemyId !== provoker.id) {
                    this.showMessage('This enemy is protected by Provocation!');
                    return;
                }
            }

            this.enemyBoard.disableTargeting();
            this.playerHandComp.deselectAll();

            this.castSpell(this.selectedCard, this.selectedCardIndex, enemyId);
        } else {
            // No spell selected: update info panel with clicked enemy
            if (targetEnemy && this.enemyInfoPanel) {
                this.enemyInfoPanel.update(targetEnemy);
            }
        }
    }

    /* ------ SPELL CASTING ------ */

    castSpell(card, handIndex, targetEnemyId = null) {
        this.playerHandComp.addCastingEffect(handIndex);
        this.soundManager?.playSpellSound(card.id, 'cast');

        this.currentMana -= card.mana;
        this.selectedCard = null;
        this.selectedCardIndex = null;

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

        setTimeout(() => {
            this.applySpellEffect(card, targetEnemyId);

            // Handle copy (need to do before splice to get instanceId from card)
            if (card.copy) {
                SpellResolverComponent.handleCopy(this, card);
            }

            this.playerHand.splice(handIndex, 1);
            this.renderPlayerHand();
            this.updateUI();

            // Archimage: check if we should draw from spell count
            if (ClassManager.shouldDrawFromSpellCount()) {
                var drawn = this.drawCards(1);
                if (drawn.length > 0) {
                    this.playerHand = this.playerHand.concat(drawn);
                }
                this.renderPlayerHand();
                this.updateUI();
                this._checkHandAchievements();
                this.addToHistory('\uD83D\uDD2E Spell counter complete! Draw 1', true);
            }

            // Update counter display
            if (ClassManager.getActiveClassId() === 'archimage') {
                this._updateArchimageCounter();
            }

            const targetText = targetEnemyId ? ' on enemy ' + targetEnemyId : '';
            this.addToHistory('Cast ' + card.name + targetText, true);

            const hasPlayableCards = this.playerHand.some(c => c.mana <= this.currentMana);
            if (!hasPlayableCards && this.isPlayerTurn && this.gameState === 'playing') {
                setTimeout(() => this.endPlayerTurn(), 800);
            }
        }, 400);
    }

    applySpellEffect(card, targetEnemyId) {
        // Guard against stale effects after round transition
        if (this.roundTransitioning || this.gameState !== 'playing') return;

        this.soundManager?.playSpellSound(card.id, 'impact');
        const spellType = VisualEffectsComponent.getSpellEffectType(card.id);

        const guard = () => this.roundTransitioning || this.gameState !== 'playing';

        switch (card.targetType) {
            case 'single':
                if (targetEnemyId) {
                    const enemyEl = this.element.querySelector(`[data-enemy-id="${targetEnemyId}"]`);
                    this.visualEffects.createSpellImpact(enemyEl, spellType);
                    this.applyDamageWithElement(targetEnemyId, card.damage || 0, card.element || spellType);
                    if (card.lifesteal && card.damage > 0) {
                        this.applyLifesteal(card.damage);
                    }

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
                                    this.applyDamageWithElement(leftEnemy.id, adjDmg, card.element || spellType);
                                }
                            }, 250);
                        }
                        if (targetIdx < aliveEnemies.length - 1) {
                            const rightEnemy = aliveEnemies[targetIdx + 1];
                            setTimeout(() => {
                                const rightEl = this.element.querySelector(`[data-enemy-id="${rightEnemy.id}"]`);
                                if (rightEl) {
                                    this.visualEffects.createSpellImpact(rightEl, spellType);
                                    this.applyDamageWithElement(rightEnemy.id, adjDmg, card.element || spellType);
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
                const battlefieldEl = this.element.querySelector('.game-board');
                this.visualEffects.createScreenShake(battlefieldEl);
                var totalLifestealAll = 0;
                [...this.enemies].forEach((enemy, i) => {
                    setTimeout(() => {
                        if (guard()) return;
                        const enemyEl = this.element.querySelector(`[data-enemy-id="${enemy.id}"]`);
                        this.visualEffects.createSpellImpact(enemyEl, spellType);
                        this.applyDamageWithElement(enemy.id, aoeDamage, card.element || spellType);
                    }, i * 150);
                    totalLifestealAll += Math.min(aoeDamage, enemy.health);
                });
                if (card.lifesteal && totalLifestealAll > 0) {
                    var selfAll = this;
                    setTimeout(function() {
                        selfAll.applyLifesteal(totalLifestealAll);
                    }, this.enemies.length * 150 + 100);
                }
                if (card.damageFormula === 'missingHp') {
                    this.addToHistory('Missing HP: ' + ((this.arenaState.maxHealth || 30) - (this.arenaState.playerHealth || 30)) + ' -> ' + aoeDamage + ' dmg', true);
                }
                break;
            case 'random':
                var totalLifestealRandom = 0;
                for (let i = 0; i < (card.hits || 3); i++) {
                    setTimeout(() => {
                        if (guard()) return;
                        const alive = this.enemies.filter(e => e.health > 0);
                        if (alive.length > 0) {
                            const target = alive[Math.floor(Math.random() * alive.length)];
                            const enemyEl = this.element.querySelector(`[data-enemy-id="${target.id}"]`);
                            this.visualEffects.createSpellImpact(enemyEl, spellType);
                            this.applyDamageWithElement(target.id, card.damage || 1, card.element || spellType);
                            totalLifestealRandom += Math.min(card.damage || 1, target.health);
                        }
                    }, i * 200);
                }
                break;
            case 'self':
                if (card.damage && card.damage > 0) {
                    if (this.enemies.length > 0) {
                        const target = this.enemies[Math.floor(Math.random() * this.enemies.length)];
                        const enemyEl = this.element.querySelector(`[data-enemy-id="${target.id}"]`);
                        this.visualEffects.createSpellImpact(enemyEl, spellType);
                        this.applyDamageWithElement(target.id, card.damage, card.element || spellType);
                    }
                }

                // Handle selfDamage (Ombrelumiere - Dark Pact)
                if (card.selfDamage) {
                    this.arenaState.playerHealth -= card.selfDamage;
                    var heroElDmg = this.element.querySelector('.hero-portrait');
                    if (heroElDmg && this.visualEffects) {
                        this.visualEffects.showDamageNumber(heroElDmg, card.selfDamage);
                    }
                    this.addToHistory(card.art + ' Lose ' + card.selfDamage + ' HP', true);
                }

                if (card.healing) {
                    this.applyHeal(card.healing);
                }
                if (card.shield) {
                    this.playerShield += card.shield;
                    const heroEl = this.element.querySelector('.hero-portrait');
                    this.visualEffects.showShieldNumber(heroEl, card.shield);

                    // Achievement tracking: max shield in combat
                    if (window.AchievementManager) {
                        var maxShield = AchievementManager.getCombatStat('maxShieldInCombat') || 0;
                        if (this.playerShield > maxShield) {
                            AchievementManager.setCombatStat('maxShieldInCombat', this.playerShield);
                        }
                    }
                }

                // Static draw (Electromancien)
                if (card.id === 'electro_static_draw') {
                    const shockedEnemies = this.enemies.filter(function(e) {
                        return !e.isDying && e.health > 0 && ElementalReactionsManager.hasStatus(e, 'shocked');
                    });
                    if (shockedEnemies.length > 0) {
                        const drawn = this.drawCards(shockedEnemies.length);
                        if (drawn.length > 0) {
                            this.playerHand = this.playerHand.concat(drawn);
                        }
                        this.renderPlayerHand();
                        this.updateUI();
                        this._checkHandAchievements();
                    }
                }

                // Handle recall (Archimage - Deja Vu)
                if (card.recall) {
                    SpellResolverComponent.handleRecall(this);
                }
                break;
        }

        // Draw and mana boost apply regardless of target type
        if (card.cardDraw) {
            const drawn = this.drawCards(card.cardDraw);
            if (drawn.length > 0) {
                this.playerHand = this.playerHand.concat(drawn);
            }
            this.renderPlayerHand();
            this.updateUI();
            this._checkHandAchievements();
        }
        if (card.manaBoost) {
            this.currentMana = Math.min(this.currentMana + card.manaBoost, 10);
            this.updateUI();
        }
    }

    applyLifesteal(amount) {
        this.arenaState.playerHealth = Math.min(this.arenaState.maxHealth, this.arenaState.playerHealth + amount);
        var heroEl = this.element.querySelector('.hero-portrait');
        if (heroEl) {
            this.visualEffects.showHealingNumber(heroEl, amount);
        }
        this.updateUI();
    }

    applyDamageWithElement(enemyId, baseDamage, elementType) {
        SpellResolverComponent.applyDamageWithElement(this, enemyId, baseDamage, elementType);
    }

    damageEnemy(enemyId, damage) {
        const enemy = this.enemies.find(e => e.id === enemyId);
        if (!enemy || enemy.health <= 0) return;

        // Divine Shield: blocks all damage once
        if (enemy.divineShieldActive) {
            enemy.divineShieldActive = false;
            this.addToHistory('\u{1F947} ' + enemy.name + '\'s Divine Shield blocks the spell!', false);
            this.enemyBoard.addDamageEffect(enemyId);
            return;
        }

        const el = this.enemyBoard.container.querySelector(`[data-enemy-id="${enemyId}"]`);
        this.visualEffects.showDamageNumber(el, damage);
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

            this.arenaXPAccumulator += 10;
            var deathResult = ClassManager.onEnemyDeath(this.arenaState.playerHealth, this.arenaState.maxHealth);
            this.arenaState.playerHealth = deathResult.health;
            this.arenaState.maxHealth = deathResult.maxHealth;

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
            this.soundManager?.play('enemy_death');
            this.enemyBoard.startSimpleDeathEffect(enemyId, () => {
                this.enemies = this.enemies.filter(e => e.id !== enemyId);
                this.enemyBoard.removeEnemyElement(enemyId);
                this.checkWinCondition();
            });
        } else {
            this.renderEnemies();
        }
    }

    applyHeal(amount) {
        const before = this.arenaState.playerHealth;
        this.arenaState.playerHealth = Math.min(this.arenaState.maxHealth, before + amount);
        const actual = this.arenaState.playerHealth - before;
        if (actual > 0) {
            const heroEl = this.element.querySelector('.hero-portrait');
            this.visualEffects.showHealingNumber(heroEl, actual);
            this.updateUI();
        }
    }

    /* ------ TURN & COMBAT FLOW ------ */

    endPlayerTurn() {
        if (!this.isPlayerTurn || this.gameState !== 'playing') return;
        this.isPlayerTurn = false;
        this.element.querySelector('#end-turn-btn').disabled = true;
        this.enemyBoard.disableTargeting();
        this.playerHandComp.deselectAll();
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
                onDefeat: () => {
                    this.gameState = 'lost';
                    setTimeout(() => this.showDefeat(), 500);
                },
                onPhaseEnd: () => this.startPlayerTurn()
            });
        }, 400);
    }

    processEnemyStatusEffects() {
        if (!ElementalReactionsManager.isEnabled()) return;
        const aliveEnemies = this.enemies.filter(e => !e.isDying && e.health > 0);
        aliveEnemies.forEach(enemy => {
            const result = ElementalReactionsManager.processTurnStart(enemy);
            if (result.damage > 0) {
                this.damageEnemy(enemy.id, result.damage);
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



    handleHpToMana() {
        if (ClassManager.getActiveClassId() !== 'ombrelumiere') return;
        if (!ClassManager.canUseHpToMana()) return;
        if (!this.arenaState || this.arenaState.playerHealth <= 2) {
            this.showMessage('Not enough health!');
            return;
        }
        if (this.currentMana >= 10) {
            this.showMessage('Mana is already full!');
            return;
        }
        ClassManager.useHpToMana();
        this.arenaState.playerHealth -= 2;
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
            var canUse = ClassManager.canUseHpToMana() && this.arenaState && this.arenaState.playerHealth > 2 && this.currentMana < 10;
            if (canUse) {
                btn.classList.remove('disabled');
            } else {
                btn.classList.add('disabled');
            }
        } else {
            btn.style.display = 'none';
        }
    }

    startPlayerTurn() {
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

        // Reset per-turn class state
        ClassManager.resetPerTurnState();

        CombatEngineComponent.startTurn(this, {
            maxManaCap: 10,
            onTurnStart: () => {
                this.addToHistory('Turn ' + this.currentTurn + ' - Mana: ' + this.currentMana + '/' + this.maxMana, true);
            }
        });
    }

    checkWinCondition() {
        if (this.gameState === 'won' || this.roundTransitioning) return;
        const alive = this.enemies.filter(e => !e.isDying);
        if (alive.length === 0) {
            this.gameState = 'won';
            this.element.querySelector('#end-turn-btn').disabled = true;
            if (window.AchievementManager && this.currentTurn <= 2) {
                AchievementManager.setCombatStat('hasWonIn2TurnsOrLess', true);
            }
            setTimeout(() => this.onRoundVictory(), 500);
        }
    }

    /* ------ BETWEEN ROUNDS ------ */

    onRoundVictory() {
        const round = this.arenaState.currentRound;

        // Heal
        const healAmount = ArenaStateManager.calculateHealAmount(this.arenaState);
        if (healAmount > 0) {
            this.arenaState.playerHealth = Math.min(this.arenaState.maxHealth, this.arenaState.playerHealth + healAmount);
        }

        // Max HP upgrade at milestones
        let hpIncrease = false;
        if (round === 3 || round === 6 || round === 9) {
            this.arenaState.maxHealth += 10;
            hpIncrease = true;
        }

        this.arenaXPAccumulator += 25;
        this.arenaState.currentShield = this.playerShield;

        // Final round check BEFORE moving to next
        if (round >= 12) {
            this.saveState();
            this.showVictory();
            return;
        }

        // Increment round NOW and save (prevents double-start on refresh during add/upgrade)
        this.arenaState.currentRound++;
        this.saveState();

        this.showAddCardPhase(healAmount, hpIncrease);
    }

    showAddCardPhase(healAmount, hpIncrease) {
        this.roundTransitioning = true;
        this.phase = 'add_card';
        const overlay = this.element.querySelector('#round-overlay');
        overlay.classList.remove('hidden');
        overlay.style.display = '';

        overlay.querySelector('#heal-amount').textContent = '+' + healAmount;

        const hpDisplay = overlay.querySelector('#hp-increase-display');
        if (hpIncrease) {
            hpDisplay.classList.remove('hidden');
            hpDisplay.querySelector('#hp-up-text').textContent = 'Max HP +10';
        } else {
            hpDisplay.classList.add('hidden');
        }

        // Phase 1: add a new card to deck (neutral or current class only)
        const allSpells = this.cardManager?.allSpells || [];
        const choices = ArenaStateManager.generateAddCardChoices(
            this.arenaState.arenaCards,
            allSpells,
            this.arenaState.deckUpgrades,
            this.arenaState.chosenClass
        );

        this.renderChoiceCards('#upgrade-choices', choices, 'add_card');
        const phaseTitle = this.element.querySelector('#phase-title');
        if (phaseTitle) phaseTitle.textContent = 'Add a Card to Your Deck';
        this.pendingAddCardChoices = choices;
        this.pendingUpgradeChoices = null;
    }

    showUpgradePhase() {
        this.phase = 'upgrade';

        // Phase 2: upgrade an existing card (including newly added ones)
        const choices = ArenaStateManager.generateUpgradeChoices(
            this.arenaState.arenaCards,
            this.arenaState.deckUpgrades
        );

        this.renderChoiceCards('#upgrade-choices', choices, 'upgrade');
        const phaseTitle = this.element.querySelector('#phase-title');
        if (phaseTitle) phaseTitle.textContent = 'Upgrade a Card';
        this.pendingUpgradeChoices = choices;
    }

    renderChoiceCards(containerSelector, choices, phase) {
        const container = this.element.querySelector(containerSelector);
        container.innerHTML = '';

        choices.forEach((choice, i) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'upgrade-choice';
            wrapper.dataset.index = i;
            wrapper.dataset.phase = phase;

            // Card preview (use previewCard which includes existing upgrades)
            const cardData = choice.previewCard;

            if (cardData) {
                const cardEl = SpellCardComponent.createCardElement(cardData);
                cardEl.style.cursor = 'pointer';
                cardEl.classList.add('choice-card-preview');
                wrapper.appendChild(cardEl);
            }

            // Description (only for upgrade phase - add_card is obvious)
            if (phase === 'upgrade') {
                const desc = document.createElement('div');
                desc.className = 'upgrade-choice-desc';
                desc.textContent = choice.description;
                wrapper.appendChild(desc);
            }

            container.appendChild(wrapper);
        });
    }

    handleChoiceClick(index) {
        if (this.phase === 'add_card' && this.pendingAddCardChoices) {
            this.pickAddCard(index);
        } else if (this.phase === 'upgrade' && this.pendingUpgradeChoices) {
            this.pickUpgrade(index);
        }
    }

    pickAddCard(index) {
        if (!this.pendingAddCardChoices) return;
        const choice = this.pendingAddCardChoices[index];
        if (!choice) return;

        this.arenaState = ArenaStateManager.applyUpgradeChoice(this.arenaState, choice);
        this.saveState();
        this.pendingAddCardChoices = null;

        // Phase 1 done, move to Phase 2: upgrade
        this.showUpgradePhase();
    }

    pickUpgrade(index) {
        if (!this.pendingUpgradeChoices) return;
        const choice = this.pendingUpgradeChoices[index];
        if (!choice) return;

        this.arenaState = ArenaStateManager.applyUpgradeChoice(this.arenaState, choice);
        this.saveState();
        this.pendingUpgradeChoices = null;

        // Hide overlay and start next round (round already incremented in onRoundVictory)
        const overlay = this.element.querySelector('#round-overlay');
        overlay.classList.add('hidden');

        if (this.arenaState.currentRound > 12) {
            this.showVictory();
        } else {
            this.startRound();
        }
    }

    /* ------ END OF RUN ------ */

    showVictory() {
        this.gameState = 'complete';
        this.arenaState.runResult = 'won';
        this.arenaState.phase = 'completed';
        this.saveState();

        var isTestBoss = !!this.arenaState.testBossId;

        if (!isTestBoss && window.PlayerProgressionManager) {
            var totalXP = this.arenaXPAccumulator + 50;
            PlayerProgressionManager.addXP(totalXP);
            PlayerProgressionManager.recordArenaWin(this.arenaState.chosenClass);
        }

        // Achievement tracking: arena victory
        if (window.AchievementManager && !isTestBoss) {
            AchievementManager.incrementStat('totalGamesWon');
            AchievementManager.incrementStat('totalGamesPlayed');
            AchievementManager.incrementStat('totalArenaRunsWon');
            AchievementManager.incrementStat('arenaWinsConsecutive');

            // Track arena win by class
            var classId = this.arenaState.chosenClass;
            if (classId) {
                AchievementManager.updateStat('arenaWinsByClass.' + classId, true);
            }

            // Check if no damage was taken (full HP)
            if (this.arenaState.playerHealth >= this.arenaState.maxHealth) {
                AchievementManager.setCombatStat('hasWonArenaWithoutDamage', true);
            }

            // Sans egratignure: win final round without losing HP
            if (this.arenaState.playerHealth >= this.arenaState.maxHealth) {
                AchievementManager.setCombatStat('hasWonWithoutDamage', true);
            }
            // Survivant: win final round with 1 HP remaining
            if (this.arenaState.playerHealth === 1) {
                AchievementManager.setCombatStat('hasWonAt1HP', true);
            }

            AchievementManager.resetCombatStats();

            // Check if entire deck is neutral (Full deck achievement)
            if (this.arenaState.arenaCards && this.arenaState.arenaCards.length > 0) {
                var allNeutral = this.arenaState.arenaCards.every(function(card) {
                    return !card.class;
                });
                if (allNeutral) {
                    var state = AchievementManager.getState();
                    state.stats.combatStats.hasDraftedAllNeutral = true;
                    AchievementManager.saveState(state);
                    AchievementManager._checkAllAchievements(state);
                }
            }
        }

        this.gameOverOverlay.show({
            isVictory: true,
            title: 'Victory!',
            message: isTestBoss ? 'Boss defeated in test mode!' : 'You conquered all 12 rounds!'
        });
        this.gameOverOverlay.setStats(
            '<div>Rounds survived: 12/12</div>' +
            '<div>Final HP: ' + this.arenaState.playerHealth + '/' + this.arenaState.maxHealth + '</div>' +
            '<div>Min Heal Bonus: +' + (this.arenaState.minHealBonus || 0) + '</div>'
        );
    }

    showDefeat() {
        this.gameState = 'complete';
        this.arenaState.runResult = 'lost';
        this.arenaState.phase = 'completed';
        this.saveState();

        var isTestBoss = !!this.arenaState.testBossId;

        if (!isTestBoss && window.PlayerProgressionManager) {
            var totalXP = this.arenaXPAccumulator + 20;
            PlayerProgressionManager.addXP(totalXP);
        }

        // Achievement tracking: arena defeat
        if (window.AchievementManager && !isTestBoss) {
            AchievementManager.incrementStat('totalGamesPlayed');
            AchievementManager.updateStat('arenaWinsConsecutive', 0);
            AchievementManager.resetCombatStats();
        }

        this.gameOverOverlay.show({
            isVictory: false,
            title: 'Defeated!',
            message: isTestBoss ? 'The boss was too strong!' : 'Your arena run has ended.'
        });
        this.gameOverOverlay.setStats(
            '<div>Reached round: ' + this.arenaState.currentRound + '/12</div>' +
            '<div>Deck size: ' + this.arenaState.arenaCards.length + ' cards</div>' +
            '<div>Min Heal Bonus: +' + (this.arenaState.minHealBonus || 0) + '</div>'
        );
    }

    /* ------ SCREEN LIFECYCLE ------ */

    async onBeforeShow(data) {
        if (!this.isInitialized) return;

        const state = ArenaStateManager.getState();
        if (state && state.phase === 'adventure') {
            // Restore class from arena state
            if (state.chosenClass) {
                ClassManager.setActiveClass(state.chosenClass);
            }
            // Hide any lingering overlays from previous run
            this.gameOverOverlay.hide();
            this.element.querySelector('#round-overlay')?.classList.add('hidden');
            this.arenaState = state;

            if (state.midRound && state.midRound.saved) {
                this.restoreGame();
            } else {
                this.startRound();
            }
        } else {
            // Defer redirect to avoid blocking (isTransitioning is true during show())
            const self = this;
            setTimeout(() => self.navigateTo('arena-builder'), 0);
        }
    }

    getScreenClass() {
        return 'arena-adventure';
    }

    getScreenId() {
        return 'arena-adventure';
    }
}

window.ArenaAdventureScreen = ArenaAdventureScreen;
