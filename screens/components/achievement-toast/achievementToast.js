class AchievementToast {
    constructor(options) {
        this.options = options || {};
        this.element = null;
        this.visible = false;
        this.queue = [];
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'achievement-toast-container';
        this.element.id = 'achievement-toast-container';
        document.body.appendChild(this.element);
    }

    show(achievement) {
        if (!this.element) this.init();

        var self = this;
        var def = achievement.def;

        var toast = document.createElement('div');
        toast.className = 'achievement-toast entering';

        var icon = document.createElement('div');
        icon.className = 'achievement-toast-icon';
        icon.textContent = def.icon;

        var textArea = document.createElement('div');
        textArea.className = 'achievement-toast-text';

        var title = document.createElement('div');
        title.className = 'achievement-toast-title';
        title.textContent = 'Succes debloque !';

        var name = document.createElement('div');
        name.className = 'achievement-toast-name';
        name.textContent = def.name;

        textArea.appendChild(title);
        textArea.appendChild(name);
        toast.appendChild(icon);
        toast.appendChild(textArea);

        this.element.appendChild(toast);

        requestAnimationFrame(function() {
            toast.classList.remove('entering');
            toast.classList.add('visible');
        });

        setTimeout(function() {
            toast.classList.remove('visible');
            toast.classList.add('exiting');
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

window.AchievementToast = AchievementToast;
