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

    static getCardDisplayText(card) {
        const damage = card.damage || 0;
        const healing = card.healing || 0;
        const shield = card.shield || 0;
        const cardDraw = card.cardDraw || 0;
        const manaBoost = card.manaBoost || 0;
        const hits = card.hits || 0;

        if (card.targetType === 'single' && damage > 0) {
            return 'Target enemy takes ' + damage + ' damage.';
        }
        if (card.targetType === 'all' && damage > 0) {
            return 'Deal ' + damage + ' damage to all enemies.';
        }
        if (card.targetType === 'random' && damage > 0 && hits > 0) {
            return 'Deal ' + damage + ' damage ' + hits + ' times randomly.';
        }
        if (healing > 0 && cardDraw > 0 && manaBoost > 0) {
            return 'Restore ' + healing + ' health. Draw ' + cardDraw + ' cards. Gain +' + manaBoost + ' mana.';
        }
        if (healing > 0) {
            return 'Restore ' + healing + ' health.';
        }
        if (shield > 0) {
            return 'Protect from ' + shield + ' damage.';
        }
        if (cardDraw > 0 && manaBoost > 0) {
            return 'Draw ' + cardDraw + ' cards. Gain +' + manaBoost + ' mana.';
        }
        if (cardDraw > 0) {
            return 'Draw ' + cardDraw + ' cards.';
        }
        if (manaBoost > 0) {
            return 'Gain +' + manaBoost + ' mana.';
        }
        return card.text || '';
    }

    static getUpgradedCard(card, deckUpgrades) {
        if (!card || !deckUpgrades) return card;
        const upgrades = deckUpgrades[card.id];
        if (!upgrades) {
            // Still update text for the base card
            const cardWithText = { ...card };
            cardWithText.text = this.getCardDisplayText(card);
            return cardWithText;
        }
        const upgraded = { ...card };
        if (upgrades.damageBonus) upgraded.damage = (upgraded.damage || 0) + upgrades.damageBonus;
        if (upgrades.healBonus) upgraded.healing = (upgraded.healing || 0) + upgrades.healBonus;
        if (upgrades.shieldBonus) upgraded.shield = (upgraded.shield || 0) + upgrades.shieldBonus;
        if (upgrades.manaReduction) upgraded.mana = Math.max(1, (upgraded.mana || 1) - upgrades.manaReduction);
        if (upgrades.cardDrawBonus) upgraded.cardDraw = (upgraded.cardDraw || 0) + upgrades.cardDrawBonus;
        if (upgrades.bonusHealEffect) upgraded.healing = (upgraded.healing || 0) + 2;
        if (upgrades.extraHitBonus) upgraded.hits = (upgraded.hits || 1) + upgrades.extraHitBonus;
        upgraded.text = this.getCardDisplayText(upgraded);
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

    static getPossibleUpgrades(card, existingUpgrades) {
        const possible = [];
        if (card.damage > 0) possible.push('damageBoost');
        if (card.healing > 0) possible.push('healBoost');
        if (card.shield > 0) possible.push('shieldBonus');
        if (!existingUpgrades.manaReduction) possible.push('manaReduction');
        if (!existingUpgrades.cardDrawBonus) possible.push('cardDrawBonus');
        if (card.healing > 0 && !existingUpgrades.bonusHealEffect) possible.push('bonusHealEffect');
        if (card.targetType === 'random' && !existingUpgrades.extraHitBonus) possible.push('extraHitBonus');
        if (possible.length === 0) possible.push('damageBoost');
        return possible;
    }

    static buildPreviewCard(card, upgradeType, upgradeValue) {
        const preview = { ...card };
        switch (upgradeType) {
            case 'damageBoost': preview.damage = (preview.damage || 0) + upgradeValue; break;
            case 'healBoost': preview.healing = (preview.healing || 0) + upgradeValue; break;
            case 'shieldBonus': preview.shield = (preview.shield || 0) + upgradeValue; break;
            case 'manaReduction': preview.mana = Math.max(1, (preview.mana || 1) - upgradeValue); break;
            case 'cardDrawBonus': preview.cardDraw = (preview.cardDraw || 0) + upgradeValue; break;
            case 'bonusHealEffect': preview.healing = (preview.healing || 0) + upgradeValue; break;
            case 'extraHitBonus': preview.hits = (preview.hits || 1) + upgradeValue; break;
        }
        preview.text = this.getCardDisplayText(preview);
        return preview;
    }

    static generatePhase1UpgradeChoices(arenaCards, deckUpgrades) {
        const choices = [];
        const usedCardIds = new Set();

        // Shuffle arena cards for variety
        const shuffled = [...arenaCards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        for (const card of shuffled) {
            if (choices.length >= 3) break;
            if (usedCardIds.has(card.id)) continue;

            const existingUpgrades = deckUpgrades[card.id] || {};
            const possibleEffects = this.getPossibleUpgrades(card, existingUpgrades);
            const effect = possibleEffects[Math.floor(Math.random() * possibleEffects.length)];
            const value = effect === 'manaReduction' ? 1 : (effect === 'extraHitBonus' ? 1 : 2);
            const effectDesc = this.getUpgradeEffectDescription(effect).replace('X', value);
            const previewCard = this.buildPreviewCard(card, effect, value);

            choices.push({
                type: 'upgrade_card',
                subType: effect,
                value: value,
                description: effectDesc,
                card: card,
                previewCard: previewCard,
                cardId: card.id,
                icon: card.art || 'sparkle'
            });
            usedCardIds.add(card.id);
        }

        // If fewer than 3 choices, rotate back through used cards with different upgrades
        if (choices.length < 3) {
            for (const card of shuffled) {
                if (choices.length >= 3) break;
                if (!usedCardIds.has(card.id)) continue;

                const existingUpgrades = deckUpgrades[card.id] || {};
                const possibleEffects = this.getPossibleUpgrades(card, existingUpgrades);
                const usedEffects = new Set();
                choices.forEach(c => {
                    if (c.cardId === card.id) usedEffects.add(c.subType);
                });
                const availableEffects = possibleEffects.filter(e => !usedEffects.has(e));
                if (availableEffects.length === 0) continue;

                const effect = availableEffects[Math.floor(Math.random() * availableEffects.length)];
                const value = effect === 'manaReduction' ? 1 : (effect === 'extraHitBonus' ? 1 : 2);
                const effectDesc = this.getUpgradeEffectDescription(effect).replace('X', value);
                const previewCard = this.buildPreviewCard(card, effect, value);

                choices.push({
                    type: 'upgrade_card',
                    subType: effect,
                    value: value,
                    description: effectDesc,
                    card: card,
                    previewCard: previewCard,
                    cardId: card.id,
                    icon: card.art || 'sparkle'
                });
            }
        }

        // Fallback: if still no choices, create generic choices
        while (choices.length < 3 && arenaCards.length > 0) {
            const card = arenaCards[Math.floor(Math.random() * arenaCards.length)];
            choices.push({
                type: 'upgrade_card',
                subType: 'damageBoost',
                value: 2,
                description: '+2 damage',
                card: card,
                previewCard: this.buildPreviewCard(card, 'damageBoost', 2),
                cardId: card.id,
                icon: card.art || 'sparkle'
            });
        }

        return choices.slice(0, 3);
    }

    static generatePhase2AddCardChoices(arenaCards, allSpells) {
        const choices = [];
        const usedCardIds = new Set(arenaCards.map(c => c.id));

        // Shuffle all available spells for variety
        const shuffled = [...allSpells];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Prefer cards not already in deck
        const notInDeck = shuffled.filter(s => !usedCardIds.has(s.id));
        const pool = notInDeck.length > 0 ? notInDeck : shuffled;

        // Pick unique cards (by id) up to 3 choices
        const addedIds = new Set();
        for (const spell of pool) {
            if (choices.length >= 3) break;
            if (addedIds.has(spell.id)) continue;
            addedIds.add(spell.id);
            choices.push({
                type: 'add_card',
                description: 'Add ' + spell.name + ' to your deck',
                card: spell,
                icon: spell.art || 'sparkle'
            });
        }

        return choices;
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
                if (!arenaState.deckUpgrades[choice.cardId]) {
                    arenaState.deckUpgrades[choice.cardId] = {};
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
                arenaState.deckUpgrades[choice.cardId][key] = (arenaState.deckUpgrades[choice.cardId][key] || 0) + choice.value;
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
