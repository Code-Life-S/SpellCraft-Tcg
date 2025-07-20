class SpellCasterGame {
    constructor() {
        this.playerHand = [];
        this.currentMana = 3;
        this.maxMana = 10;
        this.playerHealth = 30;
        this.currentWave = 1;
        this.enemies = [];
        this.enemyIdCounter = 1;
        
        this.initializeGame();
    }

    initializeGame() {
        this.createSpellCards();
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
                name: "Arcane Missiles",
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

        // Add 5 random spell cards to player's hand
        for (let i = 0; i < 5; i++) {
            const randomCard = spellCards[Math.floor(Math.random() * spellCards.length)];
            this.playerHand.push({...randomCard, handIndex: i});
        }
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

        const healthDiv = document.createElement('div');
        healthDiv.className = 'enemy-health';
        healthDiv.textContent = enemy.health;

        enemyDiv.appendChild(artDiv);
        enemyDiv.appendChild(nameDiv);
        enemyDiv.appendChild(healthDiv);

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

        // Next wave button
        document.getElementById('next-wave').addEventListener('click', () => {
            this.nextWave();
        });

        // Card hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.card')) {
                this.showCardDetails(e.target.closest('.card'));
            }
        });
    }

    handleCardClick(cardElement) {
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
        
        // Check if wave is complete
        setTimeout(() => {
            this.checkWaveComplete();
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

    checkWaveComplete() {
        if (this.enemies.length === 0) {
            this.showMessage(`Wave ${this.currentWave} complete! Prepare for the next wave.`);
            document.getElementById('next-wave').disabled = false;
            
            // Restore some mana
            this.currentMana = Math.min(this.maxMana, this.currentMana + 2);
            this.updateUI();
        }
    }

    nextWave() {
        this.currentWave++;
        this.spawnWave();
        this.drawCard();
    }

    drawCard() {
        // Draw a new random spell card
        const newSpells = [
            {
                id: Date.now(),
                name: "Magic Missile",
                type: "spell",
                mana: Math.floor(Math.random() * 4) + 1,
                rarity: "common",
                text: "A basic spell attack.",
                art: "✨",
                damage: 2,
                targetType: "single"
            }
        ];

        if (this.playerHand.length < 10) {
            this.playerHand.push(newSpells[0]);
            this.renderPlayerHand();
        }
    }

    updateUI() {
        document.getElementById('current-mana').textContent = this.currentMana;
        document.getElementById('player-health').textContent = this.playerHealth;
        document.getElementById('wave-number').textContent = this.currentWave;
        document.getElementById('enemies-count').textContent = this.enemies.length;
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