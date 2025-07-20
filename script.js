class SpellCasterGame {
    constructor() {
        this.playerHand = [];
        this.currentMana = 1;
        this.maxMana = 1;
        this.playerHealth = 30;
        this.currentTurn = 1;
        this.enemies = [];
        this.enemyIdCounter = 1;
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
        this.isPlayerTurn = true;
        
        this.initializeGame();
    }

    initializeGame() {
        this.createSpellCards();
        this.spawnInitialEnemies();
        this.renderPlayerHand();
        this.bindEvents();
        this.updateUI();
    }

    createSpellCards() {
        // Only spell cards for our wave defense game
        const spellCards = [
            {
                id: 1,
                name: "Fire Bolt",
                type: "spell",
                mana: 1,
                rarity: "common",
                text: "Deal 3 damage to target enemy.",
                art: "🔥",
                damage: 3,
                targetType: "single"
            },
            {
                id: 2,
                name: "Lightning Storm",
                type: "spell",
                mana: 3,
                rarity: "rare",
                text: "Deal 2 damage to all enemies.",
                art: "⚡",
                damage: 2,
                targetType: "all"
            },
            {
                id: 3,
                name: "Healing Light",
                type: "spell",
                mana: 2,
                rarity: "common",
                text: "Restore 5 health to yourself.",
                art: "✨",
                healing: 5,
                targetType: "self"
            },
            {
                id: 4,
                name: "Meteor",
                type: "spell",
                mana: 5,
                rarity: "epic",
                text: "Deal 8 damage to target enemy.",
                art: "☄️",
                damage: 8,
                targetType: "single"
            },
            {
                id: 5,
                name: "Frost Nova",
                type: "spell",
                mana: 2,
                rarity: "rare",
                text: "Deal 1 damage to all enemies.",
                art: "❄️",
                damage: 1,
                targetType: "all"
            },
            {
                id: 6,
                name: "Arcane Missile",
                type: "spell",
                mana: 1,
                rarity: "common",
                text: "Deal 1 damage 3 times randomly.",
                art: "🌟",
                damage: 1,
                targetType: "random",
                hits: 3
            },
            {
                id: 7,
                name: "Divine Wrath",
                type: "spell",
                mana: 6,
                rarity: "legendary",
                text: "Deal 5 damage to all enemies.",
                art: "⚡",
                damage: 5,
                targetType: "all"
            }
        ];

        // Add 3 random spell cards to player's hand (starting smaller)
        for (let i = 0; i < 3; i++) {
            const randomCard = spellCards[Math.floor(Math.random() * spellCards.length)];
            this.playerHand.push({...randomCard, handIndex: i});
        }
    }

    spawnInitialEnemies() {
        // Spawn a small group of enemies for the battle
        const enemyTypes = [
            { name: "Goblin", art: "👹", health: 3, attack: 2 },
            { name: "Orc", art: "👿", health: 5, attack: 3 },
            { name: "Skeleton", art: "💀", health: 2, attack: 1 },
            { name: "Wolf", art: "🐺", health: 4, attack: 2 },
            { name: "Bandit", art: "🗡️", health: 3, attack: 2 },
            { name: "Spider", art: "🕷️", health: 2, attack: 1 }
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
            this.endTurn();
        });

        // Card hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.card')) {
                this.showCardDetails(e.target.closest('.card'));
            }
        });
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
            
            if (card.targetType === 'self' || card.targetType === 'all' || card.targetType === 'random') {
                // Auto-cast spells that don't need targeting
                this.castSpell(card, handIndex);
            } else {
                this.showMessage("Select a target enemy!");
            }
        } else {
            this.showMessage(`Not enough mana! Need ${card.mana}, have ${this.currentMana}`);
        }
    }

    handleEnemyClick(enemyElement) {
        if (this.selectedCard && (this.selectedCard.targetType === 'single')) {
            const enemyId = parseInt(enemyElement.dataset.enemyId);
            this.castSpell(this.selectedCard, this.selectedCardIndex, enemyId);
        }
    }

    castSpell(card, handIndex, targetEnemyId = null) {
        // Deduct mana
        this.currentMana -= card.mana;
        
        // Remove card from hand
        this.playerHand.splice(handIndex, 1);
        
        // Clear selection
        this.selectedCard = null;
        this.selectedCardIndex = null;
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));

        // Apply spell effect
        this.applySpellEffect(card, targetEnemyId);
        
        // Re-render hand and update UI
        this.renderPlayerHand();
        this.updateUI();
        
        // Check if all enemies are defeated
        setTimeout(() => {
            this.checkGameEnd();
        }, 1000);
    }

    applySpellEffect(card, targetEnemyId) {
        switch(card.targetType) {
            case 'single':
                if (targetEnemyId) {
                    this.damageEnemy(targetEnemyId, card.damage);
                    this.showMessage(`${card.name} deals ${card.damage} damage!`);
                }
                break;
                
            case 'all':
                this.enemies.forEach(enemy => {
                    this.damageEnemy(enemy.id, card.damage);
                });
                this.showMessage(`${card.name} deals ${card.damage} damage to all enemies!`);
                break;
                
            case 'random':
                for (let i = 0; i < card.hits; i++) {
                    if (this.enemies.length > 0) {
                        const randomEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
                        this.damageEnemy(randomEnemy.id, card.damage);
                    }
                }
                this.showMessage(`${card.name} hits ${card.hits} times!`);
                break;
                
            case 'self':
                this.playerHealth = Math.min(30, this.playerHealth + card.healing);
                this.showMessage(`${card.name} heals you for ${card.healing}!`);
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

    endTurn() {
        if (this.gameState !== 'playing' || !this.isPlayerTurn) return;
        
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
            this.playerHealth -= enemy.attack;
            
            // Show attack animation/message
            this.showMessage(`${enemy.name} attacks for ${enemy.attack} damage!`);
            
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
        
        // Draw a card
        this.drawCard();
        
        this.updateGameStatus('Your Turn');
        document.getElementById('end-turn').disabled = false;
        this.renderPlayerHand();
        this.updateUI();
    }

    checkGameEnd() {
        if (this.enemies.length === 0) {
            this.gameOver(true);
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
            this.showMessage('🎉 Congratulations! You defeated all enemies! 🎉');
        } else {
            this.updateGameStatus('Defeat!');
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
        // Draw a new random spell card from the spell pool
        const spellPool = [
            {
                id: Date.now() + Math.random(),
                name: "Magic Missile",
                type: "spell",
                mana: 1,
                rarity: "common",
                text: "Deal 2 damage to target enemy.",
                art: "✨",
                damage: 2,
                targetType: "single"
            },
            {
                id: Date.now() + Math.random(),
                name: "Flame Burst",
                type: "spell",
                mana: 2,
                rarity: "common",
                text: "Deal 1 damage to all enemies.",
                art: "🔥",
                damage: 1,
                targetType: "all"
            },
            {
                id: Date.now() + Math.random(),
                name: "Minor Heal",
                type: "spell",
                mana: 1,
                rarity: "common",
                text: "Restore 3 health.",
                art: "💚",
                healing: 3,
                targetType: "self"
            }
        ];

        if (this.playerHand.length < 10) {
            const randomSpell = spellPool[Math.floor(Math.random() * spellPool.length)];
            this.playerHand.push(randomSpell);
            this.renderPlayerHand();
        }
    }

    updateUI() {
        document.getElementById('current-mana').textContent = this.currentMana;
        document.getElementById('player-health').textContent = this.playerHealth;
        document.getElementById('turn-number').textContent = this.currentTurn;
        document.getElementById('enemies-count').textContent = this.enemies.length;
        
        // Update max mana display
        document.getElementById('max-mana').textContent = `/${this.maxMana}`;
        
        // Update player health color based on damage
        const healthElement = document.getElementById('player-health');
        if (this.playerHealth <= 10) {
            healthElement.style.color = '#FF4444';
        } else if (this.playerHealth <= 20) {
            healthElement.style.color = '#FFA500';
        } else {
            healthElement.style.color = '#fff';
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

// Add selected card styling
const style = document.createElement('style');
style.textContent = `
    .card.selected {
        border-color: #00FF00 !important;
        box-shadow: 0 0 30px rgba(0,255,0,0.9) !important;
        transform: translateY(-15px) scale(1.08) !important;
        animation: pulse-glow 1.5s infinite;
    }
    
    @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 30px rgba(0,255,0,0.9); }
        50% { box-shadow: 0 0 40px rgba(0,255,0,1), 0 0 60px rgba(0,255,0,0.5); }
    }
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpellCasterGame();
});