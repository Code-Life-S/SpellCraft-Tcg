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
        attackDiv.textContent = showIcons ? '\u2694\uFE0F' + enemy.attack : enemy.attack;

        const healthDiv = document.createElement('div');
        healthDiv.className = 'enemy-health';
        healthDiv.textContent = showIcons ? '\u2764\uFE0F' + enemy.health : enemy.health;

        statsDiv.appendChild(attackDiv);
        statsDiv.appendChild(healthDiv);

        enemyDiv.appendChild(artDiv);
        enemyDiv.appendChild(nameDiv);
        enemyDiv.appendChild(statsDiv);

        return enemyDiv;
    }

    renderEnemies(enemies) {
        this.container.innerHTML = '';
        enemies.forEach(enemy => {
            if (enemy.isDying) return;
            const el = this.createEnemyElement(enemy);
            this.container.appendChild(el);
        });
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

    getEnemyCount() {
        return this.container.querySelectorAll('.enemy').length;
    }
}

window.EnemyBoardComponent = EnemyBoardComponent;
