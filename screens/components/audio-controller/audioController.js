class AudioController {
    constructor(soundManager) {
        this.soundManager = soundManager;
    }

    init() {
        var soundEnabled = localStorage.getItem('soundEnabled');
        var musicEnabled = localStorage.getItem('musicEnabled');
        if (soundEnabled !== null && this.soundManager) {
            var enabled = soundEnabled === 'true';
            if (this.soundManager.enabled !== enabled) {
                this.soundManager.toggle();
            }
        }
    }

    toggleSound() {
        if (this.soundManager) {
            this.soundManager.toggle();
            localStorage.setItem('soundEnabled', this.soundManager.enabled);
            this.soundManager.play('button_click');
        }
    }

    toggleMusic() {
        var musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
        if (musicEnabled) {
            this.soundManager?.stopBackgroundMusic();
            localStorage.setItem('musicEnabled', false);
        } else {
            this.soundManager?.playBackgroundMusic();
            localStorage.setItem('musicEnabled', true);
        }
        this.soundManager?.play('button_click');
    }

    updateButtons(headerComp) {
        if (this.soundManager && headerComp) {
            var soundEnabled = this.soundManager.enabled;
            var musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
            var isPlaying = this.soundManager.backgroundMusicPlaying;
            headerComp.updateAudio(soundEnabled, musicEnabled, isPlaying);
        }
    }
}

window.AudioController = AudioController;
