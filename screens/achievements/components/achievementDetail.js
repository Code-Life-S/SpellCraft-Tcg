class AchievementDetail {
    constructor(options) {
        this.options = options || {};
        this.element = null;
        this.currentAchievement = null;
    }

    render() {
        this.element = document.createElement('div');
        this.element.className = 'achievement-detail';

        var placeholder = document.createElement('div');
        placeholder.className = 'achievement-detail-placeholder';
        placeholder.textContent = 'Cliquez sur un succes pour voir les details';

        this.element.appendChild(placeholder);
        return this.element;
    }

    update(achievement) {
        if (!this.element) return;
        this.currentAchievement = achievement;

        this.element.innerHTML = '';

        if (!achievement) {
            var placeholder = document.createElement('div');
            placeholder.className = 'achievement-detail-placeholder';
            placeholder.textContent = 'Cliquez sur un succes pour voir les details';
            this.element.appendChild(placeholder);
            return;
        }

        var a = achievement;
        var def = a.def;

        // Header
        var header = document.createElement('div');
        header.className = 'achievement-detail-header';

        var icon = document.createElement('div');
        icon.className = 'achievement-detail-icon' + (a.unlocked ? ' unlocked' : ' locked');
        icon.textContent = a.unlocked ? def.icon : '\uD83D\uDD12';

        var titleArea = document.createElement('div');
        titleArea.className = 'achievement-detail-title-area';

        var name = document.createElement('div');
        name.className = 'achievement-detail-name';
        name.textContent = def.name;

        var status = document.createElement('div');
        status.className = 'achievement-detail-status' + (a.unlocked ? ' unlocked' : ' locked');
        status.textContent = a.unlocked ? '\u2713 Debloque' : '\uD83D\uDD12 Verrouille';

        titleArea.appendChild(name);
        titleArea.appendChild(status);
        header.appendChild(icon);
        header.appendChild(titleArea);

        // Description
        var desc = document.createElement('div');
        desc.className = 'achievement-detail-description';
        desc.textContent = def.longDescription || def.description;

        this.element.appendChild(header);
        this.element.appendChild(desc);

        // Reward
        if (def.reward && def.reward.type !== 'none') {
            var reward = document.createElement('div');
            reward.className = 'achievement-detail-reward';

            var rewardLabel = document.createElement('span');
            rewardLabel.className = 'reward-label';
            rewardLabel.textContent = 'Recompense : ';

            var rewardValue = document.createElement('span');
            rewardValue.className = 'reward-value';
            rewardValue.textContent = this._getRewardText(def.reward);

            reward.appendChild(rewardLabel);
            reward.appendChild(rewardValue);
            this.element.appendChild(reward);
        }

        // Progress (for counter type)
        if (def.type === 'counter' && !a.unlocked) {
            var progress = AchievementManager.progress(a.id);
            var progressSection = document.createElement('div');
            progressSection.className = 'achievement-detail-progress';

            var progressText = document.createElement('div');
            progressText.className = 'progress-text';
            progressText.textContent = 'Progresse : ' + progress.current + '/' + progress.max;

            var progressBar = document.createElement('div');
            progressBar.className = 'achievement-detail-progress-bar';

            var progressFill = document.createElement('div');
            progressFill.className = 'achievement-detail-progress-fill';
            var pct = Math.min(100, (progress.current / progress.max) * 100);
            progressFill.style.width = pct + '%';

            progressBar.appendChild(progressFill);
            progressSection.appendChild(progressText);
            progressSection.appendChild(progressBar);
            this.element.appendChild(progressSection);
        }

        // Date unlocked
        if (a.unlocked && a.date) {
            var dateEl = document.createElement('div');
            dateEl.className = 'achievement-detail-date';
            var date = new Date(a.date);
            dateEl.textContent = 'Debloque le ' + date.toLocaleDateString('fr-FR');
            this.element.appendChild(dateEl);
        }
    }

    _getRewardText(reward) {
        switch (reward.type) {
            case 'title': return 'Titre "' + reward.value + '"';
            case 'icon': return 'Icone ' + reward.value;
            case 'class': return 'Classe ' + reward.value;
            case 'cardSkin': return 'Skin de carte';
            case 'heroSkin': return 'Skin de heros';
            default: return reward.value || 'Special';
        }
    }

    destroy() {
        this.element = null;
    }
}

window.AchievementDetail = AchievementDetail;
