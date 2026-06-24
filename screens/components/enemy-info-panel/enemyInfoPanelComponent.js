class EnemyInfoPanelComponent {
    constructor(rootElement, panelSelector) {
        this.panel = rootElement.querySelector(panelSelector || '#enemy-info-panel');
        this.content = this.panel ? this.panel.querySelector('.info-panel-content') : null;
        this._hide();
    }

    update(enemy) {
        if (!this.panel || !this.content) return;
        if (!enemy || enemy.isDying || enemy.health <= 0) {
            this._hide();
            return;
        }
        this._show();
        var html = '';
        html += '<div class="info-enemy-name">' + enemy.art + ' ' + enemy.name + '</div>';
        html += '<div class="info-enemy-stats">';
        html += '<span class="info-enemy-attack">\u2694\uFE0F ' + enemy.attack + '</span>';
        html += '<span class="info-enemy-health">\u2764\uFE0F ' + enemy.health + '/' + enemy.maxHealth + '</span>';
        html += '</div>';
        if (enemy.ability && window.ENEMY_ABILITIES && window.ENEMY_ABILITIES[enemy.ability]) {
            var ab = window.ENEMY_ABILITIES[enemy.ability];
            html += '<div class="info-ability-row">';
            html += '<div class="info-ability-name">' + ab.icon + ' ' + ab.name + '</div>';
            html += '<div class="info-ability-desc">' + ab.desc + '</div>';
            html += '</div>';
        }
        if (enemy.statusEffects && window.STATUS_EFFECTS && window.ElementalReactionsManager) {
            var anyStatus = false;
            for (var type in enemy.statusEffects) {
                var effectDef = window.STATUS_EFFECTS[type];
                if (effectDef && ElementalReactionsManager.hasStatus(enemy, type)) {
                    if (!anyStatus) {
                        html += '<hr class="info-divider">';
                        anyStatus = true;
                    }
                    var statusClass = 'info-status-frozen';
                    if (type === 'burning') statusClass = 'info-status-burning';
                    if (type === 'shocked') statusClass = 'info-status-shocked';
                    html += '<div class="info-status-row ' + statusClass + '">' + effectDef.icon + ' ' + effectDef.name + '</div>';
                }
            }
        }
        this.content.innerHTML = html;
    }

    hide() {
        this._hide();
    }

    _show() {
        if (this.panel) {
            this.panel.classList.add('visible');
        }
    }

    _hide() {
        if (this.panel) {
            this.panel.classList.remove('visible');
        }
    }
}

window.EnemyInfoPanelComponent = EnemyInfoPanelComponent;
