class SpellCasterGame {
    constructor() {
        this.playerHand = [];
        this.currentMana = 1;
        this.maxMana = 1;
        this.playerHealth = 30;
        this.playerShield = 0;
        this.currentTurn = 1;
        this.enemies = [];
        this.enemyIdCounter = 1;
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
        this.isPlayerTurn = true;
        this.cardManager = new CardManager();
        this.soundManager = new SoundManager();
        
        this.initializeGame();
    }

    async initializeGame() {
        // Load cards first
        await this.cardManager.loadCards();
        
        // Then initialize game
        this.createSpellCards();
        this.spawnInitialEnemies();
        this.renderPlayerHand();
        this.bindEvents();
        this.updateUI();
        
        // Start background music after first user interaction
        this.backgroundMusicStarted = false;
    }

    createSpellCards() {
        // Get starting hand from CardManager
        this.playerHand = this.cardManager.getRandomCards(3);
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
                attack: enemyType.attack
            });
        }
        
        this.renderEnemies();
    }

    renderPlayerHand() {
        const handContainer = document.getElementById('player-hand');
        handContainer.innerHTML = '';

        this.playerHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            handContainer.appendChild(cardElement);
        });
    }

    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${card.type} ${card.rarity}`;
        cardDiv.dataset.cardId = card.id;
        cardDiv.dataset.handIndex = index;

        // Check if card is playable
        if (card.mana > this.currentMana) {
            cardDiv.style.opacity = '0.5';
            cardDiv.style.cursor = 'not-allowed';
        }

        // Mana cost
        const manaDiv = document.createElement('div');
        manaDiv.className = 'card-mana';
        manaDiv.textContent = card.mana;

        // Card art
        const artDiv = document.createElement('div');
        artDiv.className = 'card-art';
        artDiv.textContent = card.art;

        // Card name
        const nameDiv = document.createElement('div');
        nameDiv.className = 'card-name';
        nameDiv.textContent = card.name;

        // Card text
        const textDiv = document.createElement('div');
        textDiv.className = 'card-text';
        textDiv.textContent = card.text;

        // Assemble card
        cardDiv.appendChild(manaDiv);
        cardDiv.appendChild(artDiv);
        cardDiv.appendChild(nameDiv);
        cardDiv.appendChild(textDiv);

        return cardDiv;
    }

    createEnemyElement(enemy) {
        const enemyDiv = document.createElement('div');
        enemyDiv.className = 'enemy';
        enemyDiv.dataset.enemyId = enemy.id;

        const artDiv = document.createElement('div');
        artDiv.className = 'enemy-art';
        artDiv.textContent = enemy.art;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'enemy-name';
        nameDiv.textContent = enemy.name;

        const statsDiv = document.createElement('div');
        statsDiv.className = 'enemy-stats';

        const attackDiv = document.createElement('div');
        attackDiv.className = 'enemy-attack';
        attackDiv.textContent = enemy.attack;

        const healthDiv = document.createElement('div');
        healthDiv.className = 'enemy-health';
        healthDiv.textContent = enemy.health;

        statsDiv.appendChild(attackDiv);
        statsDiv.appendChild(healthDiv);

        enemyDiv.appendChild(artDiv);
        enemyDiv.appendChild(nameDiv);
        enemyDiv.appendChild(statsDiv);

        return enemyDiv;
    }

    spawnWave() {
        const waveEnemies = this.generateWaveEnemies(this.currentWave);
        this.enemies = [...this.enemies, ...waveEnemies];
        this.renderEnemies();
        this.updateUI();
        
        // Disable next wave button during wave
        document.getElementById('next-wave').disabled = true;
    }

    generateWaveEnemies(waveNumber) {
        const enemyTypes = [
            { name: "Goblin", art: "👹", baseHealth: 2 },
            { name: "Orc", art: "🧌", baseHealth: 4 },
            { name: "Troll", art: "👺", baseHealth: 6 },
            { name: "Dragon", art: "🐉", baseHealth: 10 }
        ];

        const enemies = [];
        const enemyCount = Math.min(2 + waveNumber, 8); // Max 8 enemies

        for (let i = 0; i < enemyCount; i++) {
            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const scaledHealth = enemyType.baseHealth + Math.floor(waveNumber / 2);
            
            enemies.push({
                id: this.enemyIdCounter++,
                name: enemyType.name,
                art: enemyType.art,
                health: scaledHealth,
                maxHealth: scaledHealth
            });
        }

        return enemies;
    }

    renderEnemies() {
        const battlefield = document.getElementById('enemy-battlefield');
        battlefield.innerHTML = '';

        this.enemies.forEach(enemy => {
            const enemyElement = this.createEnemyElement(enemy);
            battlefield.appendChild(enemyElement);
        });
    }

    bindEvents() {
        // Card click events
        document.addEventListener('click', (e) => {
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
        document.getElementById('end-turn').addEventListener('click', () => {
            this.soundManager.play('button_click');
            this.endTurn();
        });

        // Card hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.card')) {
                this.showCardDetails(e.target.closest('.card'));
            }
        });

        // Audio control buttons
        document.getElementById('toggle-sound').addEventListener('click', () => {
            const enabled = this.soundManager.toggle();
            const button = document.getElementById('toggle-sound');
            button.textContent = enabled ? '🔊' : '🔇';
            button.classList.toggle('disabled', !enabled);
            this.soundManager.play('button_click');
        });

        document.getElementById('toggle-music').addEventListener('click', () => {
            const button = document.getElementById('toggle-music');
            const isPlaying = !button.classList.contains('disabled');
            
            if (isPlaying) {
                this.soundManager.stopBackgroundMusic();
                button.textContent = '🎵';
                button.classList.add('disabled');
            } else {
                this.soundManager.playBackgroundMusic();
                button.textContent = '🎶';
                button.classList.remove('disabled');
            }
            this.soundManager.play('button_click');
        });
    }

    startBackgroundMusicIfNeeded() {
        if (!this.backgroundMusicStarted && !this.soundManager.backgroundMusicPlaying) {
            this.backgroundMusicStarted = true;
            setTimeout(() => {
                this.soundManager.playBackgroundMusic();
                // Update music button to show it's playing
                const musicButton = document.getElementById('toggle-music');
                musicButton.textContent = '🎶';
                musicButton.classList.remove('disabled');
            }, 500);
        }
    }

    handleCardClick(cardElement) {
        if (this.gameState !== 'playing' || !this.isPlayerTurn) return;
        
        const handIndex = parseInt(cardElement.dataset.handIndex);
        const card = this.playerHand[handIndex];

        if (card.mana <= this.currentMana) {
            this.selectedCard = card;
            this.selectedCardIndex = handIndex;
            
            // Highlight card selection
            document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
            cardElement.classList.add('selected');
            
            // Play card selection sound
            this.soundManager.play('card_select');
            
            if (card.targetType === 'self' || card.targetType === 'all' || card.targetType === 'random') {
                // Auto-cast spells that don't need targeting
                this.castSpell(card, handIndex);
            } else {
                // Enable enemy targeting
                this.enableEnemyTargeting();
                this.showMessage("Select a target enemy!");
            }
        } else {
            this.showMessage(`Not enough mana! Need ${card.mana}, have ${this.currentMana}`);
        }
    }

    handleEnemyClick(enemyElement) {
        if (this.selectedCard && (this.selectedCard.targetType === 'single')) {
            const enemyId = parseInt(enemyElement.dataset.enemyId);
            this.disableEnemyTargeting();
            this.castSpell(this.selectedCard, this.selectedCardIndex, enemyId);
        }
    }

    enableEnemyTargeting() {
        // Add targetable class to all enemies
        document.querySelectorAll('.enemy').forEach(enemy => {
            enemy.classList.add('targetable');
        });
    }

    disableEnemyTargeting() {
        // Remove targetable class from all enemies
        document.querySelectorAll('.enemy').forEach(enemy => {
            enemy.classList.remove('targetable');
        });
    }

    castSpell(card, handIndex, targetEnemyId = null) {
        // Add casting animation to card
        const cardElement = document.querySelector(`[data-hand-index="${handIndex}"]`);
        if (cardElement) {
            cardElement.classList.add('casting');
            
            // Play spell casting sound
            this.soundManager.playSpellSound(card.id, 'cast');
            this.soundManager.play('card_play');
            
            // Create particle trail from card to target
            if (targetEnemyId) {
                this.createParticleTrail(cardElement, targetEnemyId, this.getSpellEffectType(card.id));
            } else if (card.targetType === 'all') {
                this.createAOEParticles(this.getSpellEffectType(card.id));
            }
        }
        
        // Deduct mana
        this.currentMana -= card.mana;
        
        // Clear selection
        this.selectedCard = null;
        this.selectedCardIndex = null;
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        this.disableEnemyTargeting();

        // Apply spell effect with delay for animation
        setTimeout(() => {
            this.applySpellEffect(card, targetEnemyId);
            
            // Remove card from hand after effect
            this.playerHand.splice(handIndex, 1);
            this.renderPlayerHand();
            this.updateUI();
        }, 500);
        
        // Victory check now happens in damageEnemyWithEffects after enemy removal
    }

    applySpellEffect(card, targetEnemyId) {
        // Get spell effect type for visual effects
        const spellType = this.getSpellEffectType(card.id);
        
        switch(card.targetType) {
            case 'single':
                if (targetEnemyId) {
                    this.createSpellImpact(targetEnemyId, spellType);
                    this.damageEnemyWithEffects(targetEnemyId, card.damage);
                    // Play impact sound
                    setTimeout(() => {
                        this.soundManager.playSpellSound(card.id, 'impact');
                    }, 800);
                    this.showMessage(`${card.name} deals ${card.damage} damage!`);
                }
                break;
                
            case 'all':
                this.enemies.forEach((enemy, index) => {
                    this.createSpellImpact(enemy.id, spellType);
                    this.damageEnemyWithEffects(enemy.id, card.damage);
                    // Play impact sounds with slight delay
                    setTimeout(() => {
                        this.soundManager.playSpellSound(card.id, 'impact');
                    }, 800 + index * 100);
                });
                this.createScreenShake();
                this.soundManager.play('screen_shake');
                this.showMessage(`${card.name} deals ${card.damage} damage to all enemies!`);
                break;
                
            case 'random':
                for (let i = 0; i < card.hits; i++) {
                    if (this.enemies.length > 0) {
                        const randomEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
                        setTimeout(() => {
                            this.createSpellImpact(randomEnemy.id, spellType);
                            this.damageEnemyWithEffects(randomEnemy.id, card.damage);
                            this.soundManager.playSpellSound(card.id, 'impact');
                        }, i * 200);
                    }
                }
                this.showMessage(`${card.name} hits ${card.hits} times!`);
                break;
                
            case 'self':
                let message = '';
                
                // Handle healing
                if (card.healing) {
                    this.playerHealth = Math.min(30, this.playerHealth + card.healing);
                    this.createHealingEffect();
                    this.showHealingNumber(card.healing);
                    message += `${card.name} heals you for ${card.healing}! `;
                }
                
                // Handle card draw
                if (card.cardDraw) {
                    this.drawMultipleCards(card.cardDraw);
                    message += `Draw ${card.cardDraw} cards! `;
                }
                
                // Handle mana boost
                if (card.manaBoost) {
                    this.currentMana += card.manaBoost;
                    this.showManaBoostEffect();
                    message += `+${card.manaBoost} mana this turn! `;
                }
                
                // Handle shield
                if (card.shield) {
                    this.playerShield += card.shield;
                    this.createShieldEffect();
                    this.showShieldNumber(card.shield);
                    message += `Gain ${card.shield} shield! `;
                }
                
                this.soundManager.playSpellSound(card.id, 'cast');
                this.showMessage(message.trim());
                break;
        }
    }

    damageEnemy(enemyId, damage) {
        const enemy = this.enemies.find(e => e.id === enemyId);
        if (enemy) {
            enemy.health -= damage;
            
            if (enemy.health <= 0) {
                // Remove dead enemy
                this.enemies = this.enemies.filter(e => e.id !== enemyId);
            }
            
            this.renderEnemies();
        }
    }

    damageEnemyWithEffects(enemyId, damage) {
        const enemy = this.enemies.find(e => e.id === enemyId);
        if (enemy) {
            // Show damage number
            this.showDamageNumber(enemyId, damage);
            
            // Add damage animation to enemy
            const enemyElement = document.querySelector(`[data-enemy-id="${enemyId}"]`);
            if (enemyElement) {
                enemyElement.classList.add('taking-damage');
                setTimeout(() => {
                    enemyElement.classList.remove('taking-damage');
                }, 600);
            }
            
            enemy.health -= damage;
            
            if (enemy.health <= 0) {
                // Add dying animation
                if (enemyElement) {
                    enemyElement.classList.add('dying');
                }
                // Play enemy death sound
                this.soundManager.play('enemy_death');
                // Remove dead enemy after animation
                setTimeout(() => {
                    this.enemies = this.enemies.filter(e => e.id !== enemyId);
                    this.renderEnemies();
                    // Check for victory immediately after enemy removal
                    this.checkGameEnd();
                }, 1000);
            } else {
                this.renderEnemies();
            }
        }
    }

    getSpellEffectType(spellId) {
        // Map spell IDs to visual effect types
        const spellEffects = {
            'fire_bolt': 'fire',
            'flame_burst': 'fire',
            'meteor': 'fire',
            'lightning_storm': 'lightning',
            'divine_wrath': 'lightning',
            'frost_nova': 'frost',
            'arcane_missiles': 'arcane',
            'magic_missile': 'arcane',
            'healing_light': 'healing',
            'minor_heal': 'healing'
        };
        return spellEffects[spellId] || 'arcane';
    }

    createSpellImpact(enemyId, spellType) {
        const enemyElement = document.querySelector(`[data-enemy-id="${enemyId}"]`);
        if (enemyElement) {
            const rect = enemyElement.getBoundingClientRect();
            const impact = document.createElement('div');
            impact.className = `spell-impact ${spellType}`;
            impact.style.left = `${rect.left + rect.width / 2 - 30}px`;
            impact.style.top = `${rect.top + rect.height / 2 - 30}px`;
            
            document.body.appendChild(impact);
            
            // Remove impact after animation
            setTimeout(() => {
                if (document.body.contains(impact)) {
                    document.body.removeChild(impact);
                }
            }, 1000);
        }
    }

    showDamageNumber(enemyId, damage) {
        const enemyElement = document.querySelector(`[data-enemy-id="${enemyId}"]`);
        if (enemyElement) {
            const rect = enemyElement.getBoundingClientRect();
            const damageDiv = document.createElement('div');
            damageDiv.className = 'damage-number';
            damageDiv.textContent = `-${damage}`;
            damageDiv.style.left = `${rect.left + rect.width / 2}px`;
            damageDiv.style.top = `${rect.top}px`;
            
            document.body.appendChild(damageDiv);
            
            // Remove damage number after animation
            setTimeout(() => {
                if (document.body.contains(damageDiv)) {
                    document.body.removeChild(damageDiv);
                }
            }, 1500);
        }
    }

    showHealingNumber(healing) {
        const playerElement = document.querySelector('.player-hero');
        if (playerElement) {
            const rect = playerElement.getBoundingClientRect();
            const healingDiv = document.createElement('div');
            healingDiv.className = 'healing-number';
            healingDiv.textContent = `+${healing}`;
            healingDiv.style.left = `${rect.left + rect.width / 2}px`;
            healingDiv.style.top = `${rect.top}px`;
            
            document.body.appendChild(healingDiv);
            
            // Remove healing number after animation
            setTimeout(() => {
                if (document.body.contains(healingDiv)) {
                    document.body.removeChild(healingDiv);
                }
            }, 1500);
        }
    }

    createHealingEffect() {
        const playerHero = document.querySelector('.player-hero');
        if (playerHero) {
            playerHero.classList.add('healing');
            setTimeout(() => {
                playerHero.classList.remove('healing');
            }, 1000);
        }
    }

    createScreenShake() {
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.classList.add('screen-shake');
            setTimeout(() => {
                gameBoard.classList.remove('screen-shake');
            }, 500);
        }
    }

    createParticleTrail(cardElement, targetEnemyId, spellType) {
        const cardRect = cardElement.getBoundingClientRect();
        const targetElement = document.querySelector(`[data-enemy-id="${targetEnemyId}"]`);
        
        if (!targetElement) return;
        
        const targetRect = targetElement.getBoundingClientRect();
        
        // Calculate trajectory
        const startX = cardRect.left + cardRect.width / 2;
        const startY = cardRect.top + cardRect.height / 2;
        const endX = targetRect.left + targetRect.width / 2;
        const endY = targetRect.top + targetRect.height / 2;
        
        // Create particle projectile
        const projectile = document.createElement('div');
        projectile.className = `spell-projectile ${spellType}`;
        projectile.style.cssText = `
            position: fixed;
            left: ${startX}px;
            top: ${startY}px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            z-index: 1000;
            pointer-events: none;
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        
        // Set projectile appearance based on spell type
        switch(spellType) {
            case 'fire':
                projectile.style.background = 'radial-gradient(circle, #ff4500 0%, #ff8c00 50%, #ffa500 100%)';
                projectile.style.boxShadow = '0 0 20px #ff4500, 0 0 40px #ff4500';
                break;
            case 'lightning':
                projectile.style.background = 'radial-gradient(circle, #ffff00 0%, #87ceeb 50%, #4169e1 100%)';
                projectile.style.boxShadow = '0 0 20px #ffff00, 0 0 40px #87ceeb';
                break;
            case 'frost':
                projectile.style.background = 'radial-gradient(circle, #add8e6 0%, #b0e0e6 50%, #87ceeb 100%)';
                projectile.style.boxShadow = '0 0 20px #add8e6, 0 0 40px #b0e0e6';
                break;
            case 'arcane':
                projectile.style.background = 'radial-gradient(circle, #8a2be2 0%, #9370db 50%, #dda0dd 100%)';
                projectile.style.boxShadow = '0 0 20px #8a2be2, 0 0 40px #9370db';
                break;
        }
        
        
        document.body.appendChild(projectile);
        
        // Create particle trail
        this.createTrailParticles(startX, startY, endX, endY, spellType);
        
        // Animate projectile to target
        setTimeout(() => {
            projectile.style.left = `${endX}px`;
            projectile.style.top = `${endY}px`;
            projectile.style.transform = 'scale(1.5)';
        }, 50);
        
        // Remove projectile after animation
        setTimeout(() => {
            if (document.body.contains(projectile)) {
                document.body.removeChild(projectile);
            }
        }, 900);
    }

    createTrailParticles(startX, startY, endX, endY, spellType) {
        const particleCount = 15;
        const deltaX = (endX - startX) / particleCount;
        const deltaY = (endY - startY) / particleCount;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'trail-particle';
                particle.style.cssText = `
                    position: fixed;
                    left: ${startX + deltaX * i + (Math.random() - 0.5) * 20}px;
                    top: ${startY + deltaY * i + (Math.random() - 0.5) * 20}px;
                    width: ${4 + Math.random() * 6}px;
                    height: ${4 + Math.random() * 6}px;
                    border-radius: 50%;
                    z-index: 999;
                    pointer-events: none;
                    opacity: 0.8;
                    animation: trailParticle 1s ease-out forwards;
                `;
                
                // Set particle color based on spell type
                switch(spellType) {
                    case 'fire':
                        particle.style.background = `hsl(${Math.random() * 60}, 100%, ${50 + Math.random() * 30}%)`;
                        break;
                    case 'lightning':
                        particle.style.background = `hsl(${180 + Math.random() * 60}, 100%, ${70 + Math.random() * 30}%)`;
                        break;
                    case 'frost':
                        particle.style.background = `hsl(${180 + Math.random() * 40}, 60%, ${70 + Math.random() * 30}%)`;
                        break;
                    case 'arcane':
                        particle.style.background = `hsl(${270 + Math.random() * 60}, 70%, ${50 + Math.random() * 30}%)`;
                        break;
                }
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    if (document.body.contains(particle)) {
                        document.body.removeChild(particle);
                    }
                }, 1000);
            }, i * 40);
        }
    }

    createAOEParticles(spellType) {
        const battlefield = document.getElementById('enemy-battlefield');
        const battlefieldRect = battlefield.getBoundingClientRect();
        
        // Create area effect particles
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'aoe-particle';
                particle.style.cssText = `
                    position: fixed;
                    left: ${battlefieldRect.left + Math.random() * battlefieldRect.width}px;
                    top: ${battlefieldRect.top + Math.random() * battlefieldRect.height}px;
                    width: ${6 + Math.random() * 10}px;
                    height: ${6 + Math.random() * 10}px;
                    border-radius: 50%;
                    z-index: 999;
                    pointer-events: none;
                    opacity: 0.9;
                    animation: aoeParticle 2s ease-out forwards;
                `;
                
                // Set particle appearance based on spell type
                switch(spellType) {
                    case 'lightning':
                        particle.style.background = 'radial-gradient(circle, #ffff00 0%, #87ceeb 100%)';
                        particle.style.boxShadow = '0 0 10px #ffff00';
                        break;
                    case 'frost':
                        particle.style.background = 'radial-gradient(circle, #add8e6 0%, #ffffff 100%)';
                        particle.style.boxShadow = '0 0 8px #add8e6';
                        break;
                    case 'fire':
                        particle.style.background = 'radial-gradient(circle, #ff4500 0%, #ffa500 100%)';
                        particle.style.boxShadow = '0 0 12px #ff4500';
                        break;
                }
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    if (document.body.contains(particle)) {
                        document.body.removeChild(particle);
                    }
                }, 2000);
            }, i * 50);
        }
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
        document.getElementById('end-turn').disabled = true;
        
        // Enemy attack phase
        setTimeout(() => {
            this.enemyAttackPhase();
        }, 1000);
    }

    enemyAttackPhase() {
        if (this.enemies.length === 0) {
            this.checkGameEnd();
            return;
        }

        let attackIndex = 0;
        const attackInterval = setInterval(() => {
            if (attackIndex >= this.enemies.length) {
                clearInterval(attackInterval);
                this.startNewTurn();
                return;
            }

            const enemy = this.enemies[attackIndex];
            let damage = enemy.attack;
            
            // Apply shield protection
            if (this.playerShield > 0) {
                const shieldAbsorbed = Math.min(this.playerShield, damage);
                this.playerShield -= shieldAbsorbed;
                damage -= shieldAbsorbed;
                
                if (shieldAbsorbed > 0) {
                    this.showMessage(`${enemy.name} attacks for ${enemy.attack} damage! Shield absorbs ${shieldAbsorbed}!`);
                } else {
                    this.showMessage(`${enemy.name} attacks for ${enemy.attack} damage!`);
                }
            } else {
                this.showMessage(`${enemy.name} attacks for ${enemy.attack} damage!`);
            }
            
            // Apply remaining damage
            this.playerHealth -= damage;
            
            // Play player hurt sound only if damage was taken
            if (damage > 0) {
                this.soundManager.play('player_hurt');
            }
            
            // Check if player died
            if (this.playerHealth <= 0) {
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
        this.soundManager.play('mana_restore');
        
        // Draw a card
        this.drawCard();
        
        this.updateGameStatus('Your Turn');
        document.getElementById('end-turn').disabled = false;
        this.renderPlayerHand();
        this.updateUI();
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
        this.gameState = playerWon ? 'won' : 'lost';
        this.isPlayerTurn = false;
        document.getElementById('end-turn').disabled = true;
        
        if (playerWon) {
            this.updateGameStatus('Victory!');
            this.soundManager.play('victory');
            this.showMessage('🎉 Congratulations! You defeated all enemies! 🎉');
        } else {
            this.updateGameStatus('Defeat!');
            this.soundManager.play('defeat');
            this.showMessage('💀 Game Over! Your hero has fallen! 💀');
        }
        
        // Show restart option
        setTimeout(() => {
            const restart = confirm(playerWon ? 
                'You won! Would you like to play again?' : 
                'You lost! Would you like to try again?');
            if (restart) {
                location.reload();
            }
        }, 3000);
    }

    drawCard() {
        // Draw a new random spell card from CardManager
        if (this.playerHand.length < 10) {
            const newCard = this.cardManager.getRandomCard();
            if (newCard) {
                this.playerHand.push(newCard);
                this.renderPlayerHand();
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
        this.createCardDrawEffect(count);
    }

    createCardDrawEffect(count) {
        // Visual effect for drawing cards
        const handElement = document.getElementById('player-hand');
        if (handElement) {
            handElement.classList.add('card-draw-effect');
            setTimeout(() => {
                handElement.classList.remove('card-draw-effect');
            }, 1000);
        }
    }

    showManaBoostEffect() {
        const manaElement = document.getElementById('current-mana');
        if (manaElement) {
            manaElement.classList.add('mana-boost-effect');
            setTimeout(() => {
                manaElement.classList.remove('mana-boost-effect');
            }, 1000);
        }
    }

    createShieldEffect() {
        const playerHero = document.querySelector('.player-hero');
        if (playerHero) {
            playerHero.classList.add('shield-effect');
            setTimeout(() => {
                playerHero.classList.remove('shield-effect');
            }, 1000);
        }
    }

    showShieldNumber(shield) {
        const playerElement = document.querySelector('.player-hero');
        if (playerElement) {
            const rect = playerElement.getBoundingClientRect();
            const shieldDiv = document.createElement('div');
            shieldDiv.className = 'shield-number';
            shieldDiv.textContent = `+${shield} 🛡️`;
            shieldDiv.style.left = `${rect.left + rect.width / 2}px`;
            shieldDiv.style.top = `${rect.top}px`;
            
            document.body.appendChild(shieldDiv);
            
            // Remove shield number after animation
            setTimeout(() => {
                if (document.body.contains(shieldDiv)) {
                    document.body.removeChild(shieldDiv);
                }
            }, 1500);
        }
    }

    updateUI() {
        document.getElementById('current-mana').textContent = this.currentMana;
        document.getElementById('player-health').textContent = this.playerHealth;
        document.getElementById('turn-number').textContent = this.currentTurn;
        document.getElementById('enemies-count').textContent = this.enemies.length;
        
        // Update max mana display
        document.getElementById('max-mana').textContent = `/${this.maxMana}`;
        
        // Update shield display
        const shieldElement = document.getElementById('player-shield');
        if (shieldElement) {
            if (this.playerShield > 0) {
                shieldElement.textContent = `🛡️${this.playerShield}`;
                shieldElement.style.display = 'block';
            } else {
                shieldElement.style.display = 'none';
            }
        }
        
        // Update player health color based on damage
        const healthElement = document.getElementById('player-health');
        if (this.playerHealth <= 10) {
            healthElement.style.color = '#FF4444';
        } else if (this.playerHealth <= 20) {
            healthElement.style.color = '#FFA500';
        } else {
            healthElement.style.color = '#fff';
        }
        
        // Update end turn button based on playable cards
        this.updateEndTurnButton();
    }

    updateEndTurnButton() {
        const endTurnButton = document.getElementById('end-turn');
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

    updateGameStatus(status) {
        document.getElementById('game-status').textContent = status;
    }

    showCardDetails(cardElement) {
        cardElement.style.zIndex = '100';
    }

    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            z-index: 1000;
            text-align: center;
            border: 2px solid #FFD700;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 2000);
    }
}


// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpellCasterGame();
});