class ClassSelectScreen extends BaseScreen {
    constructor(screenManager) {
        super(screenManager);
        this.selectedClassId = null;
        this.returnData = null;
        this.mode = 'deck_builder';
        this.classOptions = null;
        this.soundManager = null;
    }

    getRandomClasses(count, allClasses) {
        var shuffled = allClasses.slice().sort(function() { return Math.random() - 0.5; });
        return shuffled.slice(0, count);
    }

    async setupContent() {
        this.element.innerHTML = this.getHTML();
        this.addStyles();

        if (window.SoundManager) {
            if (window.globalSoundManager) {
                this.soundManager = window.globalSoundManager;
            } else {
                this.soundManager = new SoundManager();
                this.soundManager.setAsGlobalInstance();
            }
        }
    }

    getHTML() {
        return '<div class="class-select">' +
            '<div class="class-select-header">' +
                '<h1>Choisissez votre Classe</h1>' +
                '<p class="class-select-subtitle">Chaque classe offre un style de jeu unique</p>' +
            '</div>' +
            '<div class="class-cards-container" id="class-cards-container">' +
            '</div>' +
            '<div class="class-select-footer">' +
                '<button class="class-select-back" id="class-select-back">Retour</button>' +
                '<button class="class-select-confirm" id="class-select-confirm" disabled>Confirmer</button>' +
            '</div>' +
        '</div>';
    }

    addStyles() {
        if (document.getElementById('class-select-styles')) return;
        var style = document.createElement('style');
        style.id = 'class-select-styles';
        style.textContent = '.class-select {' +
            'width: 100%; height: 100%; display: flex; flex-direction: column;' +
            ' align-items: center; justify-content: center;' +
            ' background: linear-gradient(135deg, #1a1a2e, #16213e);' +
            ' padding: 40px 20px;' +
        '}' +
        '.class-select-header { text-align: center; margin-bottom: 30px; }' +
        '.class-select-header h1 { color: #FFD700; font-size: 32px; margin: 0 0 10px 0;' +
            ' text-shadow: 0 0 15px rgba(255,215,0,0.5); }' +
        '.class-select-subtitle { color: #87CEEB; font-size: 16px; margin: 0; }' +
        '.class-cards-container {' +
            ' display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;' +
            ' max-width: 900px; margin-bottom: 30px;' +
        '}' +
        '.class-card {' +
            ' width: 260px; background: linear-gradient(145deg, #2a2a4a, #3a3a5a);' +
            ' border: 3px solid #555; border-radius: 15px; padding: 20px;' +
            ' cursor: pointer; transition: all 0.3s ease;' +
            ' display: flex; flex-direction: column; align-items: center;' +
            ' position: relative; overflow: hidden;' +
        '}' +
        '.class-card:hover { transform: translateY(-5px); border-color: #FFD700;' +
            ' box-shadow: 0 10px 30px rgba(255,215,0,0.3); }' +
        '.class-card.selected { border-color: #FFD700;' +
            ' box-shadow: 0 0 30px rgba(255,215,0,0.5);' +
            ' background: linear-gradient(145deg, #3a2a1a, #4a3a2a); }' +
        '.class-card-art { font-size: 64px; margin-bottom: 10px; }' +
        '.class-card-name { color: #FFD700; font-size: 22px; font-weight: bold; margin-bottom: 8px; }' +
        '.class-card-desc { color: #ccc; font-size: 13px; text-align: center;' +
            ' line-height: 1.4; margin-bottom: 15px; min-height: 36px; }' +
        '.class-card-passive {' +
            ' background: rgba(255,215,0,0.15); border: 1px solid rgba(255,215,0,0.4);' +
            ' border-radius: 8px; padding: 6px 12px; margin-bottom: 12px;' +
            ' font-size: 13px; color: #FFD700; text-align: center;' +
        '}' +
        '.class-card-cards {' +
            ' display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;' +
            ' width: 100%;' +
        '}' +
        '.class-card-preview {' +
            ' background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15);' +
            ' border-radius: 6px; padding: 4px 8px; font-size: 20px;' +
            ' transition: all 0.2s ease;' +
        '}' +
        '.class-card-preview:hover { background: rgba(255,215,0,0.2); }' +
        '.class-select-footer { display: flex; gap: 15px; }' +
        '.class-select-back, .class-select-confirm {' +
            ' padding: 12px 30px; border: 2px solid; border-radius: 10px;' +
            ' font-size: 16px; font-weight: bold; cursor: pointer;' +
            ' transition: all 0.3s ease; font-family: inherit;' +
        '}' +
        '.class-select-back { background: transparent; border-color: #888; color: #888; }' +
        '.class-select-back:hover { background: rgba(255,255,255,0.1); border-color: #ccc; color: #ccc; }' +
        '.class-select-confirm {' +
            ' background: linear-gradient(145deg, rgba(255,215,0,0.2), rgba(255,165,0,0.2));' +
            ' border-color: #FFD700; color: #FFD700;' +
        '}' +
        '.class-select-confirm:hover:not(:disabled) {' +
            ' background: linear-gradient(145deg, rgba(255,215,0,0.4), rgba(255,165,0,0.4));' +
            ' box-shadow: 0 5px 20px rgba(255,215,0,0.3);' +
        '}' +
        '.class-select-confirm:disabled { opacity: 0.4; cursor: not-allowed; }';
        document.head.appendChild(style);
    }

    renderClassCards() {
        var container = this.element.querySelector('#class-cards-container');
        container.innerHTML = '';
        var _this = this;
        var classes = this.classOptions || CLASSES;

        classes.forEach(function(cls) {
            var card = document.createElement('div');
            card.className = 'class-card';
            card.dataset.classId = cls.id;
            if (cls.id === _this.selectedClassId) {
                card.classList.add('selected');
            }

            var art = document.createElement('div');
            art.className = 'class-card-art';
            art.textContent = cls.art;

            var name = document.createElement('div');
            name.className = 'class-card-name';
            name.textContent = cls.name;

            var desc = document.createElement('div');
            desc.className = 'class-card-desc';
            desc.textContent = cls.description;

            var passive = document.createElement('div');
            passive.className = 'class-card-passive';
            passive.textContent = cls.passiveDesc;

            var previews = document.createElement('div');
            previews.className = 'class-card-cards';
            cls.cards.forEach(function(cardDef) {
                var preview = document.createElement('div');
                preview.className = 'class-card-preview';
                preview.title = cardDef.id;
                var cardData = _this.getCardData(cardDef.id);
                preview.textContent = cardData ? cardData.art : '?';
                previews.appendChild(preview);
            });

            card.appendChild(art);
            card.appendChild(name);
            card.appendChild(desc);
            card.appendChild(passive);
            card.appendChild(previews);

            card.addEventListener('click', function() {
                _this.selectClass(cls.id);
            });

            container.appendChild(card);
        });
    }

    getCardData(cardId) {
        if (window.CardManager && window.cardManagerInstance) {
            return window.cardManagerInstance.getCardById(cardId);
        }
        return null;
    }

    selectClass(classId) {
        this.selectedClassId = classId;
        this.element.querySelector('#class-select-confirm').disabled = false;
        var _this = this;
        this.element.querySelectorAll('.class-card').forEach(function(c) {
            c.classList.toggle('selected', c.dataset.classId === classId);
        });
        if (this.soundManager) { this.soundManager.play('card_select'); }
    }

    bindEvents() {
        var _this = this;

        this.addEventListenerSafe(
            this.element.querySelector('#class-select-back'),
            'click',
            function() { _this.goBack(); }
        );

        this.addEventListenerSafe(
            this.element.querySelector('#class-select-confirm'),
            'click',
            function() { _this.confirmClass(); }
        );
    }

    async onBeforeShow(data) {
        this.returnData = data || {};
        this.mode = data.mode || 'deck_builder';

        if (!window.cardManagerInstance && window.CardManager) {
            window.cardManagerInstance = new CardManager();
            await window.cardManagerInstance.loadCards();
        }

        if (this.mode === 'arena') {
            this.classOptions = this.getRandomClasses(3, CLASSES);
            this.selectedClassId = this.classOptions[0] ? this.classOptions[0].id : 'pyromancer';
        } else {
            this.classOptions = CLASSES;
            this.selectedClassId = ClassManager.getLastClassId() || 'pyromancer';
        }

        this.renderClassCards();
        this.element.querySelector('#class-select-confirm').disabled = false;
        var _this = this;
        this.element.querySelectorAll('.class-card').forEach(function(c) {
            c.classList.toggle('selected', c.dataset.classId === _this.selectedClassId);
        });
    }

    confirmClass() {
        if (!this.selectedClassId) return;
        if (this.soundManager) { this.soundManager.play('button_click'); }
        ClassManager.setActiveClass(this.selectedClassId);

        if (this.mode === 'arena') {
            this.navigateTo('arena-builder', { classId: this.selectedClassId });
        } else if (this.mode === 'deck_builder') {
            this.navigateTo('deck-builder', { classId: this.selectedClassId });
        } else {
            this.navigateTo('mainmenu');
        }
    }

    goBack() {
        if (this.soundManager) { this.soundManager.play('button_click'); }
        this.navigateTo('mainmenu');
    }

    getScreenClass() {
        return 'class-select';
    }

    getScreenId() {
        return 'class-select';
    }
}

window.ClassSelectScreen = ClassSelectScreen;
