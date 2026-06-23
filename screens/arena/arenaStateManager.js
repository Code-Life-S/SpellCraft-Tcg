class ArenaStateManager {
    static STORAGE_KEY = 'arenaBuilderState';

    static getState() {
        return StateManager.getState(this.STORAGE_KEY);
    }

    static saveState(state) {
        return StateManager.saveState(this.STORAGE_KEY, state);
    }

    static clearState() {
        return StateManager.clearState(this.STORAGE_KEY);
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
        return SpellCardComponent.formatCardText(card);
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
        if (upgrades.manaReduction) upgraded.mana = Math.max(0, (upgraded.mana || 1) - upgrades.manaReduction);
        if (upgrades.cardDrawBonus) upgraded.cardDraw = (upgraded.cardDraw || 0) + upgrades.cardDrawBonus;
        if (upgrades.bonusHealEffect) upgraded.healing = (upgraded.healing || 0) + upgrades.bonusHealEffect;
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
            cardDrawBonus: '+X draw',
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
            case 'manaReduction': preview.mana = Math.max(0, (preview.mana || 1) - upgradeValue); break;
            case 'cardDrawBonus': preview.cardDraw = (preview.cardDraw || 0) + upgradeValue; break;
            case 'bonusHealEffect': preview.healing = (preview.healing || 0) + upgradeValue; break;
            case 'extraHitBonus': preview.hits = (preview.hits || 1) + upgradeValue; break;
        }
        preview.text = this.getCardDisplayText(preview);
        return preview;
    }

    static generateUpgradeChoices(arenaCards, deckUpgrades) {
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
            const value = effect === 'manaReduction' ? 1 : (effect === 'extraHitBonus' || effect === 'cardDrawBonus' ? 1 : 2);
            const effectDesc = this.getUpgradeEffectDescription(effect).replace('X', value);
            const upgradedCard = this.getUpgradedCard(card, deckUpgrades);
            const previewCard = this.buildPreviewCard(upgradedCard, effect, value);

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
                const value = effect === 'manaReduction' ? 1 : (effect === 'extraHitBonus' || effect === 'cardDrawBonus' ? 1 : 2);
                const effectDesc = this.getUpgradeEffectDescription(effect).replace('X', value);
                const upgradedCard = this.getUpgradedCard(card, deckUpgrades);
                const previewCard = this.buildPreviewCard(upgradedCard, effect, value);

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
            const upgradedCard = this.getUpgradedCard(card, deckUpgrades);
            choices.push({
                type: 'upgrade_card',
                subType: 'damageBoost',
                value: 2,
                description: '+2 damage',
                card: card,
                previewCard: this.buildPreviewCard(upgradedCard, 'damageBoost', 2),
                cardId: card.id,
                icon: card.art || 'sparkle'
            });
        }

        return choices.slice(0, 3);
    }

    static generateAddCardChoices(arenaCards, allSpells, deckUpgrades, classId) {
        const choices = [];

        // Filter to neutral cards (no 'class' field) or current class cards
        var progression = window.PlayerProgressionManager ?
            PlayerProgressionManager.getProgression() : null;
        const classFilter = classId || 'pyromancer';
        const filtered = allSpells.filter(function(card) {
            if (card.class) return card.class === classFilter;
            if (progression) return PlayerProgressionManager.isCardUnlocked(card, progression);
            return true;
        });

        // Pick 3 random spells from filtered pool (allow duplicates)
        for (let i = 0; i < 3 && filtered.length > 0; i++) {
            const spell = filtered[Math.floor(Math.random() * filtered.length)];
            const previewCard = this.getUpgradedCard(spell, deckUpgrades);
            choices.push({
                type: 'add_card',
                description: spell.name,
                card: spell,
                previewCard: previewCard,
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
        return CombatEngineComponent.calculateHealAmount(
            arenaState.currentRound,
            arenaState.playerHealth,
            arenaState.maxHealth,
            arenaState.minHealBonus || 0
        );
    }
}

window.ArenaStateManager = ArenaStateManager;
