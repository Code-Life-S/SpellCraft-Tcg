class SpellCardComponent {
    static formatCardText(card) {
        const damage = card.damage || 0;
        const healing = card.healing || 0;
        const shield = card.shield || 0;
        const cardDraw = card.cardDraw || 0;
        const manaBoost = card.manaBoost || 0;
        const hits = card.hits || 0;

        let finalDamage = damage;
        if (card.element === 'fire' && window.ClassManager) {
            finalDamage += window.ClassManager.getFireDamageBonus();
        }

        const parts = [];
        if (card.lifesteal) {
            parts.push('<i>Lifesteal</i>');
        }
        if (card.element === 'frost') {
            parts.push('<i>Freeze</i>');
        }
        if (finalDamage > 0) {
            if (card.targetType === 'all') {
                parts.push('<b>' + finalDamage + '</b> damage to <i>All</i>');
            } else if (card.targetType === 'random' && hits > 0) {
                parts.push('<b>' + finalDamage + '</b> damage <b>' + hits + '</b> times');
            } else {
                parts.push('<b>' + finalDamage + '</b> damage to <i>Target</i>');
            }
        }
        if (healing > 0) {
            parts.push('Heal <b>' + healing + '</b>');
        }
        if (shield > 0) {
            parts.push('Shield <b>' + shield + '</b>');
        }
        if (cardDraw > 0) {
            parts.push('Draw <b>' + cardDraw + '</b>');
        }
        if (manaBoost > 0) {
            parts.push('+<b>' + manaBoost + '</b> mana');
        }
        if (parts.length > 0) return parts.join('<br>');
        return card.text || '';
    }

    /**
     * Creates a card DOM element matching the game screen's card design.
     * @param {Object} card - { mana, art, name, text, rarity }
     * @param {Object} [options]
     * @param {string} [options.baseClass='card'] - Base CSS class ('card' or 'mulligan-card')
     * @param {string[]} [options.extraClasses=[]] - Additional CSS classes
     * @param {boolean} [options.disabled=false] - If true, adds .disabled class
     * @returns {HTMLElement} div with card structure
     */
    static createCardElement(card, options = {}) {
        const { baseClass = 'card', extraClasses = [], disabled = false } = options;

        const classes = [baseClass, card.rarity || 'common', ...extraClasses];
        if (disabled) classes.push('disabled');
        // Class-specific visual class
        if (card.class) {
            classes.push('card-class-' + card.class);
        } else {
            classes.push('card-neutral');
        }

        const div = document.createElement('div');
        div.className = classes.join(' ');

        const manaDiv = document.createElement('div');
        manaDiv.className = 'card-mana';
        manaDiv.textContent = card.mana;

        const artDiv = document.createElement('div');
        artDiv.className = 'card-art';
        artDiv.textContent = card.art;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'card-name';
        nameDiv.textContent = card.name;

        const textDiv = document.createElement('div');
        textDiv.className = 'card-text';
        textDiv.innerHTML = SpellCardComponent.formatCardText(card);

        div.appendChild(manaDiv);
        div.appendChild(artDiv);
        div.appendChild(nameDiv);
        div.appendChild(textDiv);

        return div;
    }
}

window.SpellCardComponent = SpellCardComponent;
