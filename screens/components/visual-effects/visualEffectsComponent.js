class VisualEffectsComponent {
    constructor(rootElement) {
        this.root = rootElement;
        this.spellColors = {
            fire: { bg: 'radial-gradient(circle, #ff4500 0%, #ff8c00 50%, #ffa500 100%)', shadow: '#ff4500' },
            lightning: { bg: 'radial-gradient(circle, #ffff00 0%, #87ceeb 50%, #4169e1 100%)', shadow: '#ffff00' },
            frost: { bg: 'radial-gradient(circle, #add8e6 0%, #b0e0e6 50%, #87ceeb 100%)', shadow: '#add8e6' },
            arcane: { bg: 'radial-gradient(circle, #8a2be2 0%, #9370db 50%, #dda0dd 100%)', shadow: '#8a2be2' }
        };
    }

    destroy() {
        this.root = null;
    }

    static getSpellEffectType(spellId) {
        const types = {
            fire_bolt: 'fire', flame_burst: 'fire', meteor: 'fire',
            thunder_storm: 'lightning', divine_wrath: 'lightning',
            frost_nova: 'frost',
            arcane_missiles: 'arcane', magic_missile: 'arcane',
            healing_light: 'healing', minor_heal: 'healing',
            greater_heal: 'healing'
        };
        return types[spellId] || 'arcane';
    }

    showFloatingNumber(text, type, targetElement) {
        if (!targetElement) return;
        const rect = targetElement.getBoundingClientRect();
        const div = document.createElement('div');
        const className = type === 'damage' ? 'damage-number' :
            type === 'shield' ? 'shield-number' : 'healing-number';
        div.className = className;
        div.textContent = text;
        div.style.left = (rect.left + rect.width / 2) + 'px';
        div.style.top = rect.top + 'px';
        document.body.appendChild(div);
        setTimeout(() => {
            if (document.body.contains(div)) document.body.removeChild(div);
        }, 1200);
    }

    showDamageNumber(enemyElement, damage) {
        this.showFloatingNumber('-' + damage, 'damage', enemyElement);
    }

    showHealingNumber(targetElement, amount) {
        this.showFloatingNumber('+' + amount, 'healing', targetElement);
    }

    showShieldNumber(targetElement, amount) {
        this.showFloatingNumber('+' + amount + ' 🛡️', 'shield', targetElement);
    }

    createSpellImpact(targetElement, spellType) {
        if (!targetElement) return;
        const rect = targetElement.getBoundingClientRect();
        const impact = document.createElement('div');
        impact.className = 'spell-impact ' + (spellType || 'arcane');
        impact.style.left = (rect.left + rect.width / 2 - 30) + 'px';
        impact.style.top = (rect.top + rect.height / 2 - 30) + 'px';
        document.body.appendChild(impact);
        setTimeout(() => {
            if (document.body.contains(impact)) document.body.removeChild(impact);
        }, 1000);
    }

    createHealingEffect(targetElement) {
        if (!targetElement) return;
        targetElement.classList.add('healing');
        setTimeout(() => targetElement.classList.remove('healing'), 1000);
    }

    createShieldEffect(targetElement) {
        if (!targetElement) return;
        targetElement.classList.add('shield-effect');
        setTimeout(() => targetElement.classList.remove('shield-effect'), 1000);
    }

    createScreenShake(element) {
        if (!element) return;
        element.classList.add('screen-shake');
        setTimeout(() => element.classList.remove('screen-shake'), 300);
    }

    createCardDrawEffect(element) {
        if (!element) return;
        element.classList.add('card-draw-effect');
        setTimeout(() => element.classList.remove('card-draw-effect'), 1000);
    }

    showManaBoostEffect(element) {
        if (!element) return;
        element.classList.add('mana-boost-effect');
        setTimeout(() => element.classList.remove('mana-boost-effect'), 1000);
    }

    createParticleTrail(fromElement, toElement, spellType) {
        if (!fromElement || !toElement) return;

        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();

        const startX = fromRect.left + fromRect.width / 2;
        const startY = fromRect.top + fromRect.height / 2;
        const endX = toRect.left + toRect.width / 2;
        const endY = toRect.top + toRect.height / 2;

        const projectile = document.createElement('div');
        projectile.className = 'spell-projectile ' + (spellType || 'arcane');
        projectile.style.left = startX + 'px';
        projectile.style.top = startY + 'px';

        const colors = this.spellColors[spellType];
        if (colors) {
            projectile.style.background = colors.bg;
            projectile.style.boxShadow = '0 0 20px ' + colors.shadow + ', 0 0 40px ' + colors.shadow;
        }

        document.body.appendChild(projectile);

        this.createTrailParticles(startX, startY, endX, endY, spellType);

        setTimeout(() => {
            projectile.style.left = endX + 'px';
            projectile.style.top = endY + 'px';
            projectile.style.transform = 'scale(1.5)';
        }, 50);

        setTimeout(() => {
            if (document.body.contains(projectile)) document.body.removeChild(projectile);
        }, 900);
    }

    createTrailParticles(startX, startY, endX, endY, spellType) {
        const count = 15;
        const dx = (endX - startX) / count;
        const dy = (endY - startY) / count;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'trail-particle';
                particle.style.left = (startX + dx * i + (Math.random() - 0.5) * 20) + 'px';
                particle.style.top = (startY + dy * i + (Math.random() - 0.5) * 20) + 'px';
                particle.style.width = (4 + Math.random() * 6) + 'px';
                particle.style.height = (4 + Math.random() * 6) + 'px';

                if (spellType === 'fire') {
                    particle.style.background = 'hsl(' + (Math.random() * 60) + ', 100%, ' + (50 + Math.random() * 30) + '%)';
                } else if (spellType === 'lightning') {
                    particle.style.background = 'hsl(' + (180 + Math.random() * 60) + ', 100%, ' + (70 + Math.random() * 30) + '%)';
                } else if (spellType === 'frost') {
                    particle.style.background = 'hsl(' + (180 + Math.random() * 40) + ', 60%, ' + (70 + Math.random() * 30) + '%)';
                } else {
                    particle.style.background = 'hsl(' + (270 + Math.random() * 60) + ', 70%, ' + (50 + Math.random() * 30) + '%)';
                }

                document.body.appendChild(particle);
                setTimeout(() => {
                    if (document.body.contains(particle)) document.body.removeChild(particle);
                }, 1000);
            }, i * 40);
        }
    }

    createAOEParticles(containerElement, spellType) {
        if (!containerElement) return;
        const rect = containerElement.getBoundingClientRect();
        const count = 30;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'aoe-particle';
                particle.style.left = (rect.left + Math.random() * rect.width) + 'px';
                particle.style.top = (rect.top + Math.random() * rect.height) + 'px';
                particle.style.width = (6 + Math.random() * 10) + 'px';
                particle.style.height = (6 + Math.random() * 10) + 'px';

                if (spellType === 'lightning') {
                    particle.style.background = 'radial-gradient(circle, #ffff00 0%, #87ceeb 100%)';
                    particle.style.boxShadow = '0 0 10px #ffff00';
                } else if (spellType === 'frost') {
                    particle.style.background = 'radial-gradient(circle, #add8e6 0%, #ffffff 100%)';
                    particle.style.boxShadow = '0 0 8px #add8e6';
                } else if (spellType === 'fire') {
                    particle.style.background = 'radial-gradient(circle, #ff4500 0%, #ffa500 100%)';
                    particle.style.boxShadow = '0 0 12px #ff4500';
                } else {
                    particle.style.background = 'radial-gradient(circle, #8a2be2 0%, #9370db 100%)';
                    particle.style.boxShadow = '0 0 10px #8a2be2';
                }

                document.body.appendChild(particle);
                setTimeout(() => {
                    if (document.body.contains(particle)) document.body.removeChild(particle);
                }, 2000);
            }, i * 50);
        }
    }
}

window.VisualEffectsComponent = VisualEffectsComponent;
