class EnemyBoardComponent {
    constructor(rootElement, containerSelector) {
        this.root = rootElement;
        this.container = rootElement.querySelector(containerSelector);
        this.deathAnimations = ['dying-spin', 'dying-dissolve', 'dying-explode', 'dying-fade'];
    }

    destroy() {
        this.root = null;
        this.container = null;
    }

    getEnemySelector(enemyId) {
        return `[data-enemy-id="${enemyId}"]`;
    }

    createEnemyElement(enemy, showIcons = false) {
        const enemyDiv = document.createElement('div');
        enemyDiv.className = 'enemy';
        if (enemy.isBoss) enemyDiv.classList.add('enemy-boss');
        enemyDiv.dataset.enemyId = enemy.id;

        const artDiv = document.createElement('div');
        artDiv.className = 'enemy-art';
        artDiv.textContent = enemy.art;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'enemy-name';
        nameDiv.textContent = enemy.name;

        var abilityDiv = null;
        if (enemy.ability && window.ENEMY_ABILITIES && window.ENEMY_ABILITIES[enemy.ability]) {
            abilityDiv = document.createElement('div');
            abilityDiv.className = 'enemy-ability';
            abilityDiv.textContent = window.ENEMY_ABILITIES[enemy.ability].icon;
        }

        const statsDiv = document.createElement('div');
        statsDiv.className = 'enemy-stats';

        const attackDiv = document.createElement('div');
        attackDiv.className = 'enemy-attack';
        attackDiv.textContent = showIcons ? '\u2694\uFE0F' + enemy.attack : enemy.attack;

        const healthDiv = document.createElement('div');
        healthDiv.className = 'enemy-health';
        healthDiv.textContent = showIcons ? '\u2764\uFE0F' + enemy.health : enemy.health;

        statsDiv.appendChild(attackDiv);
        statsDiv.appendChild(healthDiv);

        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-overlays';

        enemyDiv.appendChild(artDiv);
        enemyDiv.appendChild(nameDiv);
        if (abilityDiv) enemyDiv.appendChild(abilityDiv);
        enemyDiv.appendChild(statsDiv);
        enemyDiv.appendChild(statusDiv);

        if (enemy.isBoss) {
            var bossLabel = document.createElement('div');
            bossLabel.className = 'boss-label';
            bossLabel.textContent = 'BOSS';
            enemyDiv.appendChild(bossLabel);

            var shieldBar = document.createElement('div');
            shieldBar.className = 'boss-shield-bar';
            shieldBar.id = 'boss-shield-' + enemy.id;
            var shieldFill = document.createElement('div');
            shieldFill.className = 'boss-shield-bar-fill';
            shieldFill.id = 'boss-shield-fill-' + enemy.id;
            shieldBar.appendChild(shieldFill);
            enemyDiv.appendChild(shieldBar);
        }

        return enemyDiv;
    }

    renderEnemies(enemies) {
        this.container.innerHTML = '';
        enemies.forEach(enemy => {
            if (enemy.isDying) return;
            const el = this.createEnemyElement(enemy);
            this.container.appendChild(el);
        });
        this.updateAllStatusOverlays(enemies);
    }

    updateEnemyHealth(enemyId, health, maxHealth) {
        const el = this.container.querySelector(this.getEnemySelector(enemyId));
        if (!el) return;
        const healthDiv = el.querySelector('.enemy-health');
        if (healthDiv) {
            healthDiv.textContent = health;
        }
    }

    removeEnemyElement(enemyId) {
        const el = this.container.querySelector(this.getEnemySelector(enemyId));
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    enableTargeting() {
        this.container.querySelectorAll('.enemy').forEach((enemy, index) => {
            setTimeout(() => {
                enemy.classList.add('targetable');
            }, index * 100);
        });
    }

    disableTargeting() {
        this.container.querySelectorAll('.enemy').forEach(enemy => {
            enemy.classList.remove('targetable');
        });
    }

    enableTargetingForEnemy(enemyId) {
        this.container.querySelectorAll('.enemy').forEach(enemy => {
            enemy.classList.remove('targetable');
        });
        const el = this.container.querySelector(this.getEnemySelector(enemyId));
        if (el) {
            el.classList.add('targetable');
        }
    }

    addDamageEffect(enemyId) {
        const el = this.container.querySelector(this.getEnemySelector(enemyId));
        if (el) {
            el.classList.add('taking-damage');
            setTimeout(() => el.classList.remove('taking-damage'), 600);
        }
    }

    addAttackEffect(enemyId) {
        const el = this.container.querySelector(this.getEnemySelector(enemyId));
        if (el) {
            el.classList.add('attacking');
            setTimeout(() => el.classList.remove('attacking'), 600);
        }
    }

    addTargetSelectionEffect(enemyId) {
        const el = this.container.querySelector(this.getEnemySelector(enemyId));
        if (el) {
            el.style.animation = 'targetSelected 0.5s ease-out';
        }
    }

    startDeathAnimation(enemyId, duration, onComplete) {
        const el = this.container.querySelector(this.getEnemySelector(enemyId));
        if (!el) {
            if (onComplete) onComplete();
            return;
        }

        const randomAnim = this.deathAnimations[Math.floor(Math.random() * this.deathAnimations.length)];
        this.deathAnimations.forEach(anim => el.classList.remove(anim));
        el.dataset.dyingAnimation = randomAnim;
        el.dataset.dyingStartTime = Date.now();
        el.classList.add(randomAnim);

        setTimeout(() => {
            if (onComplete) onComplete();
        }, duration || 1800);
    }

    startSimpleDeathEffect(enemyId, onComplete) {
        const el = this.container.querySelector(this.getEnemySelector(enemyId));
        if (!el) {
            if (onComplete) onComplete();
            return;
        }
        el.style.transition = 'all 0.5s ease';
        el.style.opacity = '0';
        el.style.transform = 'scale(0.5) rotate(180deg)';
        setTimeout(() => {
            if (onComplete) onComplete();
        }, 600);
    }

    updateStatusOverlay(enemyId, enemy) {
        const el = this.container.querySelector(this.getEnemySelector(enemyId));
        if (!el) return;

        const overlay = el.querySelector('.status-overlays');
        if (!overlay) return;

        overlay.innerHTML = '';

        if (!window.ElementalReactionsManager || !ElementalReactionsManager.isEnabled()) return;

        const classes = ElementalReactionsManager.getStatusVisualClasses(enemy);

        ['status-frozen', 'status-burning', 'status-shocked'].forEach(cls => {
            el.classList.remove(cls);
        });

        classes.forEach(cls => {
            el.classList.add(cls);
        });

        const statuses = ElementalReactionsManager.getActiveStatuses(enemy);
        statuses.forEach(statusType => {
            const effectDef = typeof STATUS_EFFECTS !== 'undefined' ? STATUS_EFFECTS[statusType] : null;
            if (effectDef) {
                const iconSpan = document.createElement('span');
                iconSpan.className = 'status-icon status-icon-' + statusType;
                iconSpan.textContent = effectDef.icon;
                overlay.appendChild(iconSpan);
            }
        });
    }

    updateAllStatusOverlays(enemies) {
        enemies.forEach(enemy => {
            this.updateStatusOverlay(enemy.id, enemy);
        });
    }

    updateBossShieldBar(enemyId, shieldValue, maxShield) {
        var fill = this.container.querySelector('#boss-shield-fill-' + enemyId);
        var bar = this.container.querySelector('#boss-shield-' + enemyId);
        if (!fill || !bar) return;
        if (shieldValue > 0) {
            bar.style.display = '';
            fill.style.width = Math.round((shieldValue / maxShield) * 100) + '%';
        } else {
            bar.style.display = 'none';
        }
    }

    getEnemyCount() {
        return this.container.querySelectorAll('.enemy').length;
    }
}

window.EnemyBoardComponent = EnemyBoardComponent;
