class AchievementsScreen {
    constructor(options) {
        this.options = options || {};
        this.element = null;
        this.onBack = options.onBack || function() {};
        this.categories = [];
        this.detailPanel = null;
        this.selectedCard = null;
    }

    async show() {
        await this.setupContent();

        this.element = document.createElement('div');
        this.element.className = 'achievements-screen';
        this.element.id = 'achievements-screen';

        var header = this._renderHeader();
        this.element.appendChild(header);

        var content = document.createElement('div');
        content.className = 'achievements-content';

        var leftPanel = document.createElement('div');
        leftPanel.className = 'achievements-left-panel';

        var rightPanel = document.createElement('div');
        rightPanel.className = 'achievements-right-panel';

        this.detailPanel = new AchievementDetail();
        var detailEl = this.detailPanel.render();
        rightPanel.appendChild(detailEl);

        var self = this;

        ACHIEVEMENT_CATEGORIES.forEach(function(cat) {
            var category = new AchievementCategory({
                category: cat,
                onCardClick: function(achievement) {
                    self.detailPanel.update(achievement);
                }
            });

            var catEl = category.render();
            if (catEl) {
                leftPanel.appendChild(catEl);
                self.categories.push(category);
            }
        });

        var scrollContainer = document.createElement('div');
        scrollContainer.className = 'achievements-scroll-container';
        scrollContainer.appendChild(leftPanel);

        content.appendChild(scrollContainer);
        content.appendChild(rightPanel);

        this.element.appendChild(content);

        document.body.appendChild(this.element);

        await this._animateIn();
        return this.element;
    }

    _renderHeader() {
        var header = document.createElement('div');
        header.className = 'achievements-header';

        var title = document.createElement('h1');
        title.className = 'achievements-title';
        title.textContent = 'Succes';

        var stats = document.createElement('div');
        stats.className = 'achievements-header-stats';
        var allAchievements = AchievementManager.getAll();
        var unlockedCount = 0;
        allAchievements.forEach(function(a) { if (a.unlocked) unlockedCount++; });
        stats.textContent = unlockedCount + '/' + allAchievements.length + ' debloques';

        var backBtn = document.createElement('button');
        backBtn.className = 'back-button';
        backBtn.textContent = 'Retour';
        backBtn.addEventListener('click', this._onBack.bind(this));

        header.appendChild(backBtn);
        header.appendChild(title);
        header.appendChild(stats);

        return header;
    }

    _onBack() {
        var self = this;
        this._animateOut().then(function() {
            if (self.element && self.element.parentNode) {
                self.element.parentNode.removeChild(self.element);
            }
            self.destroy();
            self.onBack();
        });
    }

    async _animateIn() {
        if (!this.element) return;
        this.element.classList.add('entering');
        await new Promise(function(r) { requestAnimationFrame(r); });
        this.element.classList.add('visible');
        this.element.classList.remove('entering');
    }

    async _animateOut() {
        if (!this.element) return;
        this.element.classList.remove('visible');
        this.element.classList.add('exiting');
        await new Promise(function(resolve) { setTimeout(resolve, 300); });
        this.element.classList.remove('exiting');
    }

    destroy() {
        this.categories.forEach(function(c) { c.destroy(); });
        this.categories = [];
        if (this.detailPanel) this.detailPanel.destroy();
        this.element = null;
    }

    async setupContent() {
        var cssFiles = [
            'screens/achievements/components/achievementCard.css',
            'screens/achievements/components/achievementDetail.css',
            'screens/achievements/components/achievementCategory.css',
            'screens/achievements/achievementsScreen.css',
            'screens/components/achievement-toast/achievementToast.css'
        ];
        for (var i = 0; i < cssFiles.length; i++) {
            try {
                if (window.templateLoader && typeof window.templateLoader.loadCSS === 'function') {
                    await window.templateLoader.loadCSS(cssFiles[i], cssFiles[i].replace(/[\/\.]/g, '-'));
                }
            } catch (error) {
                console.warn('Failed to load achievement CSS:', error);
            }
        }
    }
}

window.AchievementsScreen = AchievementsScreen;
