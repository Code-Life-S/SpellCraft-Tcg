class AchievementCard {
    constructor(options) {
        this.options = options || {};
        this.achievement = options.achievement || null;
        this.onClick = options.onClick || null;
        this.element = null;
    }

    render() {
        if (!this.achievement) return null;

        var a = this.achievement;
        var def = a.def;

        this.element = document.createElement('div');
        this.element.className = 'achievement-card' + (a.unlocked ? ' unlocked' : ' locked');
        this.element.setAttribute('data-achievement-id', a.id);
        this.element.setAttribute('role', 'button');
        this.element.setAttribute('tabindex', '0');

        var iconEl = document.createElement('div');
        iconEl.className = 'achievement-icon';
        iconEl.textContent = a.unlocked ? def.icon : '\uD83D\uDD12';
        if (!a.unlocked) iconEl.classList.add('achievement-icon-locked');

        var nameEl = document.createElement('div');
        nameEl.className = 'achievement-name';
        nameEl.textContent = def.name;

        this.element.appendChild(iconEl);
        this.element.appendChild(nameEl);

        if (def.type === 'counter' && !a.unlocked) {
            var progress = AchievementManager.progress(a.id);
            var progressBar = document.createElement('div');
            progressBar.className = 'achievement-progress-mini';

            var progressFill = document.createElement('div');
            progressFill.className = 'achievement-progress-mini-fill';
            var pct = Math.min(100, (progress.current / progress.max) * 100);
            progressFill.style.width = pct + '%';

            progressBar.appendChild(progressFill);
            this.element.appendChild(progressBar);
        }

        if (a.unlocked) {
            var badge = document.createElement('div');
            badge.className = 'achievement-badge';
            badge.textContent = '\u2713';
            this.element.appendChild(badge);
        }

        this._bindEvents();
        return this.element;
    }

    _bindEvents() {
        if (!this.element) return;
        var self = this;
        this.element.addEventListener('click', function() {
            if (self.onClick) self.onClick(self.achievement);
        });
        this.element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (self.onClick) self.onClick(self.achievement);
            }
        });
    }

    setSelected(selected) {
        if (!this.element) return;
        this.element.classList.toggle('selected', selected);
    }

    destroy() {
        this.element = null;
    }
}

window.AchievementCard = AchievementCard;
