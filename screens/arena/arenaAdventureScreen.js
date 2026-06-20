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
        this.deckTracker = null;
        this.actionHistoryComp = null;
        this.mulliganActive = false;
        this.selectedCardsForMulligan = null;
    }

    async setupContent() {
        try {
            const html = await window.templateLoader.loadScreenTemplate('screens/arena', 'arenaAdventureScreen');
            this.element.innerHTML = html;
        } catch (error) {
            console.error('Failed to load arena adventure template:', error);
            this.element.innerHTML = this.getFallbackHTML();
        }

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
        this.enemyBoard = new EnemyBoardComponent(this.element, '#enemy-area');
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
                if (this.cardManager) {
                    const card = this.cardManager.getCardById(id);
                    if (card) return card;
                }
                return null;
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
                '<div class="game-info" style="height:6%;display:flex;justify-content:space-between;align-items:center;padding:8px 40px;background:linear-gradient(90deg,rgba(139,69,19,0.3),rgba(210,105,30,0.3));border-bottom:2px solid rgba(255,215,0,0.5);">' +
                    '<div class="turn-counter" style="display:flex;align-items:center;gap:8px;font-size:16px;font-weight:bold;">' +
                        '<span style="color:#FFD700;">Round</span>' +
                        '<span id="round-number" style="color:#FF6B6B;font-size:20px;">1</span>' +
                        '<span style="color:#555;">/</span>' +
                        '<span style="color:#888;font-size:14px;">12</span>' +
                    '</div>' +
                    '<div class="enemies-remaining" style="display:flex;align-items:center;gap:8px;font-size:16px;font-weight:bold;">' +
                        '<span style="color:#FFD700;">Enemies:</span>' +
                        '<span id="enemies-count" style="color:#FF6B6B;font-size:20px;">0</span>' +
                    '</div>' +
                    '<div class="game-status" style="display:flex;align-items:center;gap:8px;font-size:16px;font-weight:bold;">' +
                        '<span id="game-status" style="color:#00FF7F;font-size:18px;">Round 1</span>' +
                    '</div>' +
                    '<div class="ui-controls" style="display:flex;align-items:center;gap:10px;">' +
                        '<button id="concede-btn" style="background:rgba(220,20,60,0.2);border:2px solid rgba(220,20,60,0.6);border-radius:8px;color:#DC143C;padding:6px 14px;cursor:pointer;font-weight:bold;font-size:13px;">Concede</button>' +
                    '</div>' +
                '</div>' +
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
                                '<span class="hero-health" id="player-health" style="min-width:80px;height:50px;border-radius:12px;background:linear-gradient(45deg,#32CD32,#228B22);display:flex;align-items:center;justify-content:center;border:3px solid #FFD700;font-weight:bold;font-size:16px;color:#fff;padding:8px 12px;">30</span>' +
                                '<span class="hero-shield" id="player-shield" style="display:none;min-width:80px;height:50px;border-radius:12px;background:linear-gradient(45deg,#4169E1,#1E90FF);color:white;align-items:center;justify-content:center;border:3px solid #FFD700;font-weight:bold;font-size:16px;padding:8px 12px;">0</span>' +
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
            '</div>' +
            '<div class="gameover-overlay hidden" id="gameover-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:10001;display:none;">' +
                '<button class="gameover-btn" id="gameover-btn" style="background:linear-gradient(145deg,rgba(255,215,0,0.2),rgba(255,165,0,0.2));border:2px solid #FFD700;border-radius:10px;color:#FFD700;padding:14px 30px;font-size:18px;font-weight:bold;cursor:pointer;">Back to Menu</button>' +
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
        ArenaStateManager.saveState(this.arenaState);
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
        this.playerShield = 0;
        this.selectedCard = null;
        this.selectedCardIndex = null;
        this.phase = null;

        const handSize = ArenaStateManager.getHandSize(round);
        this.arenaDeck = this.buildShuffledDeck();
        this.injectClassCards();
        this.playerHand = this.drawCards(handSize);

        this.spawnEnemies(round);
        this.updateUI();
        this.renderPlayerHand();
        this.renderEnemies();

        const el = this.element;
        el.querySelector('#round-number').textContent = round;
        el.querySelector('#concede-btn').style.display = '';
        el.querySelector('#end-turn-btn').disabled = false;

        // Mulligan at the start of round 1
        if (round === 1) {
            this.startMulliganPhase();
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

    injectClassCards() {
        var classCardIds = ClassManager.getClassCardIds(ClassManager.getActiveClassId());
        var _this = this;
        classCardIds.forEach(function(cardId) {
            var cardData = _this.cardManager.getCardById(cardId);
            if (cardData) {
                _this.arenaDeck.push({ ...cardData, instanceId: Date.now() + Math.random() });
            }
        });
        this.shuffleArray(this.arenaDeck);
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

    /* ------ ENEMY SYSTEM ------ */

    spawnEnemies(round) {
        this.enemies = [];
        this.enemyIdCounter = 1;

        // Boss round at round 12
        if (round >= 12 && typeof getRandomBoss === 'function') {
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
                bossMechanics: bossTemplate.bossMechanics,
                bossShield: 0,
                stunnedNextTurn: false,
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
            this.enemies.push({
                id: this.enemyIdCounter++,
                name: type.name,
                art: type.art,
                health: baseHp,
                maxHealth: baseHp,
                attack: baseAttack,
                isDying: false,
                ability: typeof getAbilityForRound === 'function' ? getAbilityForRound(round) : null
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

        // Enemies remaining
        const enemiesEl = el.querySelector('#enemies-count');
        if (enemiesEl) enemiesEl.textContent = aliveEnemies.length;

        // Game status
        const statusEl = el.querySelector('#game-status');
        if (statusEl) {
            if (this.gameState === 'playing') {
                statusEl.textContent = this.isPlayerTurn ? 'Your Turn - Round ' + this.arenaState.currentRound : 'Enemy Turn';
            } else {
                statusEl.textContent = this.gameState === 'won' ? 'Round Complete!' : this.gameState === 'lost' ? 'Defeated' : 'Complete';
            }
        }

        // Update end turn button state
        this.updateEndTurnButton();

        // Update deck tracker
        if (this.deckTracker) this.deckTracker.update();
    }

    renderPlayerHand() {
        this.playerHandComp.render(this.playerHand, this.currentMana);
    }

    renderEnemies() {
        this.enemyBoard.renderEnemies(this.enemies);
    }

    addToHistory(action, isPlayerAction) {
        if (this.actionHistoryComp) {
            this.actionHistoryComp.addEntry(action, isPlayerAction, this.currentTurn || 1);
            this.actionHistory = this.actionHistoryComp.entries;
        }
    }

    /* ------ MULLIGAN SYSTEM ------ */

    startMulliganPhase() {
        if (this.element.querySelector('#mulligan-overlay')) return;

        this.mulliganActive = true;
        this.gameState = 'mulligan';
        this.selectedCardsForMulligan = new Set();

        this.showMulliganInterface();
        this.renderPlayerHand();
    }

    showMulliganInterface() {
        const overlay = document.createElement('div');
        overlay.id = 'mulligan-overlay';
        overlay.className = 'mulligan-overlay';
        overlay.innerHTML =
            '<div class="mulligan-panel">' +
                '<div class="mulligan-hand" id="mulligan-hand"></div>' +
                '<div class="mulligan-bottom">' +
                    '<h2 class="mulligan-title">Choose cards to replace (click to toggle)</h2>' +
                    '<button class="mulligan-confirm-btn" id="confirm-mulligan">Confirm</button>' +
                '</div>' +
            '</div>';

        const gameBoard = this.element.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.appendChild(overlay);
        } else {
            this.element.appendChild(overlay);
        }

        this.renderMulliganCards();
        this.bindMulliganEvents();
    }

    renderMulliganCards() {
        const container = this.element.querySelector('#mulligan-hand');
        if (!container) return;
        container.innerHTML = '';
        this.playerHand.forEach((card, index) => {
            const el = this.createMulliganCardElement(card, index);
            container.appendChild(el);
        });
    }

    createMulliganCardElement(card, index) {
        const div = SpellCardComponent.createCardElement(card, {
            baseClass: 'mulligan-card'
        });
        div.dataset.handIndex = index;
        div.onclick = () => this.handleMulliganCardClick(div);
        return div;
    }

    bindMulliganEvents() {
        const btn = this.element.querySelector('#confirm-mulligan');
        if (btn) {
            btn.onclick = () => this.confirmMulligan();
        }
    }

    handleMulliganCardClick(el) {
        if (!this.mulliganActive) return;
        const index = parseInt(el.dataset.handIndex);
        if (this.selectedCardsForMulligan.has(index)) {
            this.selectedCardsForMulligan.delete(index);
            el.classList.remove('mulligan-selected');
        } else {
            this.selectedCardsForMulligan.add(index);
            el.classList.add('mulligan-selected');
        }
        this.soundManager?.play('card_select');
    }

    confirmMulligan() {
        if (this.selectedCardsForMulligan.size === 0) {
            this.endMulliganPhase();
            return;
        }
        this.performMulligan(Array.from(this.selectedCardsForMulligan));
    }

    performMulligan(indicesToReplace) {
        // Sort descending to splice safely
        const sorted = [...indicesToReplace].sort((a, b) => b - a);
        const replacedCards = [];
        sorted.forEach(idx => {
            replacedCards.push(this.playerHand[idx]);
            this.playerHand.splice(idx, 1);
        });

        // Return replaced cards to deck
        replacedCards.forEach(card => this.arenaDeck.push(card));
        this.shuffleArray(this.arenaDeck);

        // Draw new cards
        for (let i = 0; i < replacedCards.length; i++) {
            const drawn = this.drawCards(1);
            if (drawn.length > 0) {
                this.playerHand.push(drawn[0]);
            }
        }

        this.renderPlayerHand();
        this.updateUI();
        this.endMulliganPhase();
    }

    endMulliganPhase() {
        this.mulliganActive = false;
        this.gameState = 'playing';
        this.isPlayerTurn = true;
        this.selectedCardsForMulligan = null;

        const overlay = this.element.querySelector('#mulligan-overlay');
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }

        this.renderPlayerHand();
        this.updateUI();
        this.addToHistory('Mulligan complete - Round ' + this.arenaState.currentRound + ' begins!', true);
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

        const concedeBtn = q('#concede-btn');
        if (concedeBtn) {
            this.addEventListenerSafe(concedeBtn, 'click', () => this.concedeRun());
        }

        const endTurnBtn = q('#end-turn-btn');
        if (endTurnBtn) {
            this.addEventListenerSafe(endTurnBtn, 'click', () => this.endPlayerTurn());
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

        const gameoverBtn = q('#gameover-btn');
        if (gameoverBtn) {
            this.addEventListenerSafe(gameoverBtn, 'click', () => {
                ArenaStateManager.clearState();
                this.navigateTo('mainmenu');
            });
        }
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
        }
    }

    handleEnemyClick(enemyEl) {
        if (!this.selectedCard || this.selectedCard.targetType !== 'single') return;

        var enemyId = parseInt(enemyEl.dataset.enemyId);

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
    }

    /* ------ SPELL CASTING ------ */

    castSpell(card, handIndex, targetEnemyId = null) {
        this.playerHandComp.addCastingEffect(handIndex);
        this.soundManager?.playSpellSound(card.id, 'cast');

        this.currentMana -= card.mana;
        this.selectedCard = null;
        this.selectedCardIndex = null;

        setTimeout(() => {
            this.applySpellEffect(card, targetEnemyId);
            this.playerHand.splice(handIndex, 1);
            this.renderPlayerHand();
            this.updateUI();

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
                    this.applyDamageWithElement(targetEnemyId, card.damage || 0, spellType);
                }
                break;
            case 'all':
                const battlefieldEl = this.element.querySelector('.game-board');
                this.visualEffects.createScreenShake(battlefieldEl);
                [...this.enemies].forEach((enemy, i) => {
                    setTimeout(() => {
                        if (guard()) return;
                        const enemyEl = this.element.querySelector(`[data-enemy-id="${enemy.id}"]`);
                        this.visualEffects.createSpellImpact(enemyEl, spellType);
                        this.applyDamageWithElement(enemy.id, card.damage || 0, spellType);
                    }, i * 150);
                });
                break;
            case 'random':
                for (let i = 0; i < (card.hits || 3); i++) {
                    setTimeout(() => {
                        if (guard()) return;
                        const alive = this.enemies.filter(e => e.health > 0);
                        if (alive.length > 0) {
                            const target = alive[Math.floor(Math.random() * alive.length)];
                            const enemyEl = this.element.querySelector(`[data-enemy-id="${target.id}"]`);
                            this.visualEffects.createSpellImpact(enemyEl, spellType);
                            this.applyDamageWithElement(target.id, card.damage || 1, spellType);
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
                        this.applyDamageWithElement(target.id, card.damage, spellType);
                    }
                }
                if (card.healing) {
                    this.applyHeal(card.healing);
                }
                if (card.shield) {
                    this.playerShield += card.shield;
                    const heroEl = this.element.querySelector('.hero-portrait');
                    this.visualEffects.showShieldNumber(heroEl, card.shield);
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
        }
        if (card.manaBoost) {
            this.currentMana = Math.min(this.currentMana + card.manaBoost, 10);
            this.updateUI();
        }
    }

    applyDamageWithElement(enemyId, baseDamage, elementType) {
        if (elementType === 'fire' && ClassManager.getFireDamageBonus() > 0) {
            baseDamage += ClassManager.getFireDamageBonus();
        }

        if (!ElementalReactionsManager.isEnabled()) {
            this.damageEnemy(enemyId, baseDamage);
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

        this.damageEnemy(enemyId, result.damage);

        if (result.aoeDamage > 0) {
            this.enemies.forEach(other => {
                if (other.id !== enemyId && !other.isDying && other.health > 0) {
                    this.damageEnemy(other.id, result.aoeDamage);
                }
            });
        }

        ElementalReactionsManager.applyElementalStatus(enemy, null, elementType, ClassManager.getFrozenDurationBonus());
        this.enemyBoard.updateStatusOverlay(enemyId, enemy);
    }

    damageEnemy(enemyId, damage) {
        const enemy = this.enemies.find(e => e.id === enemyId);
        if (!enemy || enemy.health <= 0) return;

        // Boss shield absorption
        if (enemy.bossShield > 0) {
            var absorbed = Math.min(enemy.bossShield, damage);
            enemy.bossShield -= absorbed;
            damage -= absorbed;
            var maxShield = enemy.bossMechanics && enemy.bossMechanics.shieldPerTurn ? enemy.bossMechanics.shieldPerTurn * 3 : 10;
            this.enemyBoard.updateBossShieldBar(enemy.id, enemy.bossShield, maxShield);
            if (enemy.bossShield === 0 && absorbed > 0) {
                enemy.stunnedNextTurn = true;
                this.addToHistory(enemy.art + ' ' + enemy.name + '\'s shield shatters!', false);
            }
            if (damage <= 0) {
                this.enemyBoard.addDamageEffect(enemyId);
                return;
            }
        }

        const el = this.enemyBoard.container.querySelector(`[data-enemy-id="${enemyId}"]`);
        this.visualEffects.showDamageNumber(el, damage);
        this.enemyBoard.addDamageEffect(enemyId);

        enemy.health -= damage;

        if (typeof checkAndTriggerEnrage === 'function' && checkAndTriggerEnrage(enemy)) {
            this.addToHistory(enemy.art + ' ' + enemy.name + ' is ENRAGED! +2 ATK', false);
        }

        if (enemy.health <= 0) {
            this.arenaState.playerHealth = ClassManager.onEnemyDeath(this.arenaState.playerHealth, this.arenaState.maxHealth);
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

        // Enemy attack phase
        setTimeout(() => {
            this.enemyAttackPhase();
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

    processBossMechanics() {
        var boss = this.enemies.find(function(e) { return e.isBoss && !e.isDying; });
        if (!boss) return;

        boss.skipAttack = false;

        if (boss.stunnedNextTurn) {
            boss.stunnedNextTurn = false;
            boss.skipAttack = true;
            this.addToHistory(boss.art + ' ' + boss.name + ' is stunned and cannot act!', false);
            return;
        }

        var mech = boss.bossMechanics;
        if (!mech) return;

        switch (mech.type) {
            case 'skeleton_king':
                for (var si = 0; si < mech.summonCount; si++) {
                    if (typeof createSummonMinion === 'function') {
                        var minion = createSummonMinion(this.enemyIdCounter);
                        this.enemyIdCounter++;
                        delete minion.canAttack;
                        this.enemies.push(minion);
                        this.addToHistory(boss.art + ' ' + boss.name + ' summons a ' + minion.name, false);
                    }
                }
                this.renderEnemies();
                break;

            case 'dark_mage':
                boss.bossShield += mech.shieldPerTurn;
                var drain = mech.lifeDrain;
                boss.health = Math.min(boss.maxHealth, boss.health + drain);
                this.arenaState.playerHealth -= drain;
                this.updateUI();
                var maxShield = mech.shieldPerTurn * 3;
                this.enemyBoard.updateBossShieldBar(boss.id, boss.bossShield, maxShield);
                this.addToHistory(boss.art + ' ' + boss.name + ' drains ' + drain + ' HP and gains ' + mech.shieldPerTurn + ' shield', false);
                break;

            case 'dragon':
                var breathDmg = mech.breathDamage;
                this.arenaState.playerHealth -= breathDmg;
                this.addToHistory(boss.art + ' ' + boss.name + ' uses Breath! -' + breathDmg + ' HP', false);
                this.updateUI();
                break;
        }
    }

    enemyAttackPhase() {
        this.enemies.forEach(function(e) { delete e.canAttack; });
        
        this.processEnemyStatusEffects();
        this.processBossMechanics();

        const aliveEnemies = this.enemies.filter(e => !e.isDying);
        if (aliveEnemies.length === 0) {
            this.startPlayerTurn();
            return;
        }

        var attackIndex = 0;
        const doNextAttack = () => {
            if (attackIndex >= aliveEnemies.length || this.gameState !== 'playing') {
                this.processEnemyAbilities();
                this.startPlayerTurn();
                return;
            }
            var enemy = aliveEnemies[attackIndex];
            attackIndex++;

            if (enemy.canAttack === false || enemy.skipAttack) {
                setTimeout(doNextAttack, 350);
                return;
            }

            // Skip frozen enemies
            if (ElementalReactionsManager.shouldSkipAttack(enemy)) {
                this.addToHistory(STATUS_EFFECTS.frozen.icon + ' ' + enemy.name + ' is frozen and cannot attack!', false);
                this.enemyBoard.updateStatusOverlay(enemy.id, enemy);
                this.updateUI();
                setTimeout(doNextAttack, 350);
                return;
            }

            // Enemy attack animation
            this.enemyBoard.addAttackEffect(enemy.id);

            // Apply damage to player (shield absorbs first)
            let remainingDamage = enemy.attack;
            if (this.playerShield > 0) {
                const absorbed = Math.min(this.playerShield, remainingDamage);
                this.playerShield -= absorbed;
                remainingDamage -= absorbed;
            }
            if (remainingDamage > 0) {
                this.arenaState.playerHealth -= remainingDamage;
                this.soundManager?.play('player_hurt');
                const heroEl = this.element.querySelector('.hero-portrait');
                this.visualEffects.showDamageNumber(heroEl, remainingDamage);
                this.updateUI();

                // Check loss
                if (this.arenaState.playerHealth <= 0) {
                    this.arenaState.playerHealth = 0;
                    this.updateUI();
                    this.gameState = 'lost';
                    setTimeout(() => this.showDefeat(), 500);
                    return;
                }
            }

            setTimeout(doNextAttack, 350);
        };

        doNextAttack();
    }

    startPlayerTurn() {
        if (this.gameState !== 'playing') return;

        this.isPlayerTurn = true;

        // Mana ramps each turn: +1 max mana, capped at 10
        this.currentTurn++;
        this.maxMana = Math.min(this.currentTurn, 10);
        this.currentMana = this.maxMana;

        // Draw a card
        const drawn = this.drawCards(1);
        if (drawn.length > 0) {
            this.playerHand = this.playerHand.concat(drawn);
        }

        this.addToHistory('Turn ' + this.currentTurn + ' - Mana: ' + this.currentMana + '/' + this.maxMana, true);

        this.element.querySelector('#end-turn-btn').disabled = false;
        this.renderPlayerHand();
        this.updateUI();
    }

    checkWinCondition() {
        if (this.gameState === 'won' || this.roundTransitioning) return;
        const alive = this.enemies.filter(e => !e.isDying);
        if (alive.length === 0) {
            this.gameState = 'won';
            const concedeBtn = this.element.querySelector('#concede-btn');
            if (concedeBtn) concedeBtn.style.display = 'none';
            this.element.querySelector('#end-turn-btn').disabled = true;
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

        this.saveState();

        // Skip upgrade/add card phases on the final round
        if (round >= 12) {
            this.showVictory();
            return;
        }

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

        // Phase 1: add a new card to deck
        const allSpells = this.cardManager?.allSpells || [];
        const choices = ArenaStateManager.generateAddCardChoices(
            this.arenaState.arenaCards,
            allSpells,
            this.arenaState.deckUpgrades
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

        // Hide overlay and start next round
        const overlay = this.element.querySelector('#round-overlay');
        overlay.classList.add('hidden');

        this.arenaState.currentRound++;

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

        const overlay = this.element.querySelector('#gameover-overlay');
        overlay.classList.remove('hidden');
        overlay.querySelector('#gameover-title').textContent = 'Victory!';
        overlay.querySelector('#gameover-title').className = 'gameover-title victory';
        overlay.querySelector('#gameover-message').textContent = 'You conquered all 12 rounds!';

        const stats = overlay.querySelector('#gameover-stats');
        stats.innerHTML = '<div>Rounds survived: 12/12</div>' +
            '<div>Final HP: ' + this.arenaState.playerHealth + '/' + this.arenaState.maxHealth + '</div>' +
            '<div>Min Heal Bonus: +' + (this.arenaState.minHealBonus || 0) + '</div>';
    }

    showDefeat() {
        this.gameState = 'complete';
        this.arenaState.runResult = 'lost';
        this.arenaState.phase = 'completed';
        this.saveState();

        const overlay = this.element.querySelector('#gameover-overlay');
        overlay.classList.remove('hidden');
        overlay.querySelector('#gameover-title').textContent = 'Defeated!';
        overlay.querySelector('#gameover-title').className = 'gameover-title defeat';
        overlay.querySelector('#gameover-message').textContent = 'Your arena run has ended.';

        const stats = overlay.querySelector('#gameover-stats');
        stats.innerHTML = '<div>Reached round: ' + this.arenaState.currentRound + '/12</div>' +
            '<div>Deck size: ' + this.arenaState.arenaCards.length + ' cards</div>' +
            '<div>Min Heal Bonus: +' + (this.arenaState.minHealBonus || 0) + '</div>';
    }

    concedeRun() {
        if (!confirm('Concede the arena run? You will lose all progress.')) return;
        this.showDefeat();
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
            this.element.querySelector('#gameover-overlay')?.classList.add('hidden');
            this.element.querySelector('#round-overlay')?.classList.add('hidden');
            this.arenaState = state;
            this.startRound();
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
