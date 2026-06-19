class SpellCardComponent {
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
        textDiv.textContent = card.text;

        div.appendChild(manaDiv);
        div.appendChild(artDiv);
        div.appendChild(nameDiv);
        div.appendChild(textDiv);

        return div;
    }
}

window.SpellCardComponent = SpellCardComponent;
