class AchievementCategory {
    constructor(options) {
        this.options = options || {};
        this.category = options.category || null;
        this.onCardClick = options.onCardClick || null;
        this.element = null;
        this.cards = [];
    }

    render() {
        if (!this.category) return null;

        var cat = this.category;
        var achievements = AchievementManager.getUnlockedByCategory(cat.id);
        var totalCount = cat.achievements.length;
        var unlockedCount = achievements.length;

        this.element = document.createElement('div');
        this.element.className = 'achievement-category';
        this.element.setAttribute('data-category-id', cat.id);

        // Category header
        var header = document.createElement('div');
        header.className = 'achievement-category-header';

        var title = document.createElement('div');
        title.className = 'achievement-category-title';
        title.textContent = cat.icon + ' ' + cat.name;

        var counter = document.createElement('div');
        counter.className = 'achievement-category-counter';
        counter.textContent = unlockedCount + '/' + totalCount;

        header.appendChild(title);
        header.appendChild(counter);

        // Progress bar
        var progressBar = document.createElement('div');
        progressBar.className = 'achievement-category-progress';

        var progressFill = document.createElement('div');
        progressFill.className = 'achievement-category-progress-fill';
        var pct = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
        progressFill.style.width = pct + '%';

        progressBar.appendChild(progressFill);

        // Cards grid
        var grid = document.createElement('div');
        grid.className = 'achievement-category-grid';

        var self = this;
        cat.achievements.forEach(function(achievementId) {
            var a = AchievementManager.getAchievement(achievementId);
            if (!a) return;

            var card = new AchievementCard({
                achievement: a,
                onClick: function(ach) {
                    // Deselect all other cards
                    self.cards.forEach(function(c) { c.setSelected(false); });
                    card.setSelected(true);
                    if (self.onCardClick) self.onCardClick(ach);
                }
            });

            var cardEl = card.render();
            if (cardEl) {
                grid.appendChild(cardEl);
                self.cards.push(card);
            }
        });

        this.element.appendChild(header);
        this.element.appendChild(progressBar);
        this.element.appendChild(grid);

        return this.element;
    }

    destroy() {
        this.cards.forEach(function(c) { c.destroy(); });
        this.cards = [];
        this.element = null;
    }
}

window.AchievementCategory = AchievementCategory;
