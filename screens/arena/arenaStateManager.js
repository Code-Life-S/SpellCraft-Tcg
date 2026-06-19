class ArenaStateManager {
    static STORAGE_KEY = 'arenaBuilderState';

    static getState() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error('Failed to load arena state:', e);
            return null;
        }
    }

    static saveState(state) {
        state.timestamp = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    }

    static clearState() {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    static getHandSize(round) {
        if (round <= 3) return 3;
        if (round <= 6) return 4;
        return 5;
    }

    static getMaxHealth(round) {
        let hp = 30;
        if (round >= 3) hp += 10;
        if (round >= 6) hp += 10;
        if (round >= 9) hp += 10;
        return hp;
    }

    static getUpgradedCard(card, deckUpgrades) {
        if (!card || !card.instanceId || !deckUpgrades) return card;
        const upgrades = deckUpgrades[card.instanceId];
        if (!upgrades) return card;
        const upgraded = { ...card };
        if (upgrades.damageBonus) upgraded.damage = (upgraded.damage || 0) + upgrades.damageBonus;
        if (upgrades.healBonus) upgraded.healing = (upgraded.healing || 0) + upgrades.healBonus;
        if (upgrades.shieldBonus) upgraded.shield = (upgraded.shield || 0) + upgrades.shieldBonus;
        if (upgrades.manaReduction) upgraded.mana = Math.max(1, (upgraded.mana || 1) - upgrades.manaReduction);
        if (upgrades.cardDrawBonus) upgraded.cardDraw = (upgraded.cardDraw || 0) + upgrades.cardDrawBonus;
        if (upgrades.bonusHealEffect) upgraded.healing = (upgraded.healing || 0) + 2;
        if (upgrades.extraHitBonus) upgraded.hits = (upgraded.hits || 1) + upgrades.extraHitBonus;
        return upgraded;
    }

    static getUpgradeEffectDescription(upgradeType) {
        const descriptions = {
            damageBoost: '+X damage',
            healBoost: '+X healing',
            shieldBoost: '+X shield',
            manaReduction: '-1 mana cost',
            cardDrawBonus: 'Also draw 1 card',
            bonusHealEffect: 'Also heal 2 HP',
            extraHitBonus: '+1 hit'
        };
        return descriptions[upgradeType] || 'Unknown upgrade';
    }

    static generateUpgradeChoices(arenaCards, allSpells, deckUpgrades, minHealBonus) {
        const choices = [];
        const usedTypes = new Set();

        // Option 1: Add a new random card
        if (!usedTypes.has('add_card') && allSpells.length > 0) {
            const usedCardIds = new Set(arenaCards.map(c => c.id));
            const availableNew = allSpells.filter(s => !usedCardIds.has(s.id));
            const pool = availableNew.length > 0 ? availableNew : allSpells;
            const newCard = pool[Math.floor(Math.random() * pool.length)];
            if (newCard) {
                choices.push({
                    type: 'add_card',
                    description: 'Add ' + newCard.name + ' to your deck',
                    card: newCard,
                    icon: newCard.art
                });
                usedTypes.add('add_card');
            }
        }

        // Option 2: Upgrade a random card in deck
        if (!usedTypes.has('upgrade_card') && arenaCards.length > 0) {
            const eligibleCards = arenaCards.filter(c => {
                const upg = deckUpgrades[c.instanceId] || {};
                return !upg.manaReduction || upg.manaReduction < 2;
            });
            if (eligibleCards.length > 0) {
                const targetCard = eligibleCards[Math.floor(Math.random() * eligibleCards.length)];
                const possibleEffects = [];
                const existingUpgrades = deckUpgrades[targetCard.instanceId] || {};

                if (targetCard.damage > 0) possibleEffects.push('damageBoost');
                if (targetCard.healing > 0) possibleEffects.push('healBoost');
                if (targetCard.shield > 0) possibleEffects.push('shieldBonus');
                if (!existingUpgrades.manaReduction) possibleEffects.push('manaReduction');
                if (!existingUpgrades.cardDrawBonus) possibleEffects.push('cardDrawBonus');
                if (targetCard.healing > 0 && !existingUpgrades.bonusHealEffect) possibleEffects.push('bonusHealEffect');
                if (targetCard.targetType === 'random' && !existingUpgrades.extraHitBonus) possibleEffects.push('extraHitBonus');

                if (possibleEffects.length === 0) {
                    possibleEffects.push('damageBoost');
                }

                const effect = possibleEffects[Math.floor(Math.random() * possibleEffects.length)];
                const value = effect === 'manaReduction' ? 1 : (effect === 'extraHitBonus' ? 1 : 2);
                const effectDesc = this.getUpgradeEffectDescription(effect).replace('X', value);

                choices.push({
                    type: 'upgrade_card',
                    subType: effect,
                    value: value,
                    description: (targetCard.name || 'Card') + ': ' + effectDesc,
                    card: targetCard,
                    instanceId: targetCard.instanceId,
                    icon: targetCard.art || '✨'
                });
                usedTypes.add('upgrade_card');
            }
        }

        // Option 3: Bonus healing upgrade
        if (!usedTypes.has('bonus_heal')) {
            choices.push({
                type: 'bonus_heal',
                description: '+3 minimum between-round healing',
                value: 3,
                icon: '💚'
            });
            usedTypes.add('bonus_heal');
        }

        // Shuffle and return up to 3
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }
        return choices.slice(0, 3);
    }

    static applyUpgradeChoice(arenaState, choice) {
        switch (choice.type) {
            case 'add_card': {
                const newCard = {
                    ...choice.card,
                    instanceId: choice.card.id + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
                };
                arenaState.arenaCards.push(newCard);
                break;
            }
            case 'upgrade_card': {
                if (!arenaState.deckUpgrades[choice.instanceId]) {
                    arenaState.deckUpgrades[choice.instanceId] = {};
                }
                const upgradeMap = {
                    damageBoost: 'damageBonus',
                    healBoost: 'healBonus',
                    shieldBonus: 'shieldBonus',
                    manaReduction: 'manaReduction',
                    cardDrawBonus: 'cardDrawBonus',
                    bonusHealEffect: 'bonusHealEffect',
                    extraHitBonus: 'extraHitBonus'
                };
                const key = upgradeMap[choice.subType] || choice.subType;
                arenaState.deckUpgrades[choice.instanceId][key] = (arenaState.deckUpgrades[choice.instanceId][key] || 0) + choice.value;
                break;
            }
            case 'bonus_heal': {
                arenaState.minHealBonus = (arenaState.minHealBonus || 0) + choice.value;
                break;
            }
        }
        return arenaState;
    }

    static calculateHealAmount(arenaState) {
        const round = arenaState.currentRound;
        const minHeal = 5 + (round * 2) + (arenaState.minHealBonus || 0);
        const maxHeal = arenaState.maxHealth - arenaState.playerHealth;
        if (maxHeal <= 0) return 0;
        if (minHeal >= maxHeal) return maxHeal;
        return minHeal + Math.floor(Math.random() * (maxHeal - minHeal + 1));
    }
}

window.ArenaStateManager = ArenaStateManager;
