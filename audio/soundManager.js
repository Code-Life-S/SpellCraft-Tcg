class SoundManager {
    constructor() {
        this.sounds = {};
        this.audioContext = null;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.4;
        this.enabled = true;
        this.backgroundMusicPlaying = false;
        this.activeOscillators = [];
        this.musicRestartTimeout = null;
        
        this.initializeAudioContext();
        this.loadSounds();
    }

    initializeAudioContext() {
        try {
            // Create audio context for advanced audio features
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context on user interaction (required by browsers)
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    loadSounds() {
        // TODO: Add MP3 audio files to /audio/ directory for enhanced audio experience
        // For now, we use synthesized sounds as fallbacks to avoid 404 errors
        
        // Define sound files and their properties (commented out until MP3 files are added)
        const soundDefinitions = {
            // TODO: Uncomment when MP3 files are available
            // Spell casting sounds
            // 'fire_cast': { url: 'audio/fire_cast.mp3', volume: 0.6, type: 'sfx' },
            // 'lightning_cast': { url: 'audio/lightning_cast.mp3', volume: 0.7, type: 'sfx' },
            // 'frost_cast': { url: 'audio/frost_cast.mp3', volume: 0.5, type: 'sfx' },
            // 'arcane_cast': { url: 'audio/arcane_cast.mp3', volume: 0.6, type: 'sfx' },
            // 'healing_cast': { url: 'audio/healing_cast.mp3', volume: 0.5, type: 'sfx' },
            
            // TODO: Uncomment when MP3 files are available
            // Impact sounds
            // 'fire_impact': { url: 'audio/fire_impact.mp3', volume: 0.7, type: 'sfx' },
            // 'lightning_impact': { url: 'audio/lightning_impact.mp3', volume: 0.8, type: 'sfx' },
            // 'frost_impact': { url: 'audio/frost_impact.mp3', volume: 0.6, type: 'sfx' },
            // 'arcane_impact': { url: 'audio/arcane_impact.mp3', volume: 0.7, type: 'sfx' },
            
            // TODO: Uncomment when MP3 files are available
            // UI sounds
            // 'card_select': { url: 'audio/card_select.mp3', volume: 0.4, type: 'sfx' },
            // 'card_play': { url: 'audio/card_play.mp3', volume: 0.5, type: 'sfx' },
            // 'button_click': { url: 'audio/button_click.mp3', volume: 0.3, type: 'sfx' },
            // 'enemy_death': { url: 'audio/enemy_death.mp3', volume: 0.6, type: 'sfx' },
            // 'player_hurt': { url: 'audio/player_hurt.mp3', volume: 0.5, type: 'sfx' },
            // 'victory': { url: 'audio/victory.mp3', volume: 0.8, type: 'sfx' },
            // 'defeat': { url: 'audio/defeat.mp3', volume: 0.7, type: 'sfx' },
            
            // TODO: Uncomment when MP3 files are available
            // Ambient sounds
            // 'screen_shake': { url: 'audio/screen_shake.mp3', volume: 0.4, type: 'sfx' },
            // 'mana_restore': { url: 'audio/mana_restore.mp3', volume: 0.3, type: 'sfx' },
            
            // TODO: Uncomment when MP3 files are available
            // Background music
            // 'background_music': { url: 'audio/background_music.mp3', volume: 0.3, type: 'music', loop: true }
        };

        // Load each sound (currently empty, will use synthesized sounds as fallback)
        Object.entries(soundDefinitions).forEach(([name, config]) => {
            this.loadSound(name, config);
        });
        
        // Initialize synthesized sound placeholders for all expected sounds
        this.initializeSynthesizedSoundPlaceholders();
    }

    initializeSynthesizedSoundPlaceholders() {
        // Create placeholder entries for all sounds we expect to use
        // This prevents errors when trying to play sounds that don't exist
        const expectedSounds = [
            'fire_cast', 'lightning_cast', 'frost_cast', 'arcane_cast', 'healing_cast',
            'fire_impact', 'lightning_impact', 'frost_impact', 'arcane_impact',
            'card_select', 'card_play', 'button_click', 'enemy_death', 'player_hurt',
            'victory', 'defeat', 'screen_shake', 'mana_restore', 'shield_block',
            'background_music'
        ];
        
        expectedSounds.forEach(soundName => {
            if (!this.sounds[soundName]) {
                // Create a placeholder that will use synthesized sound
                this.sounds[soundName] = {
                    audio: { play: () => {}, pause: () => {}, currentTime: 0 },
                    config: { volume: 0.5, type: 'sfx' },
                    loaded: false
                };
            }
        });
    }

    loadSound(name, config) {
        // Create audio element
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = config.volume * this.masterVolume * (config.type === 'music' ? this.musicVolume : this.sfxVolume);
        
        if (config.loop) {
            audio.loop = true;
        }

        // Store sound with metadata
        this.sounds[name] = {
            audio: audio,
            config: config,
            loaded: false
        };

        // Load the audio file
        audio.addEventListener('canplaythrough', () => {
            this.sounds[name].loaded = true;
        });

        audio.addEventListener('error', (e) => {
            // Silently create fallback - no console warnings for missing files
            this.sounds[name] = {
                audio: { play: () => {}, pause: () => {}, currentTime: 0 },
                config: config,
                loaded: false
            };
        });

        // Set source last to trigger loading
        audio.src = config.url;
    }

    play(soundName, options = {}) {
        if (!this.enabled) return;

        const sound = this.sounds[soundName];
        
        // Always use synthesized sound since MP3 files are not loaded
        // TODO: When MP3 files are added, uncomment the MP3 playback logic below
        this.createSynthesizedSound(soundName, options);
        return;

        /* TODO: Uncomment when MP3 files are available
        if (!sound || !sound.loaded) {
            // Fallback: try to play anyway or create synthesized sound
            if (sound && sound.audio) {
                try {
                    sound.audio.play().catch(() => {});
                } catch (e) {
                    // Create synthesized sound as fallback
                    this.createSynthesizedSound(soundName, options);
                }
            }
            return;
        }

        try {
            const audio = sound.audio.cloneNode();
            
            // Apply options
            if (options.volume !== undefined) {
                audio.volume = options.volume * this.masterVolume * 
                    (sound.config.type === 'music' ? this.musicVolume : this.sfxVolume);
            }
            
            if (options.playbackRate) {
                audio.playbackRate = options.playbackRate;
            }

            // Play the sound
            audio.play().catch(error => {
                console.warn(`Failed to play sound: ${soundName}`, error);
            });

            return audio;
        } catch (error) {
            console.warn(`Error playing sound: ${soundName}`, error);
            // Fallback to synthesized sound
            this.createSynthesizedSound(soundName, options);
        }
        */
    }

    createSynthesizedSound(soundName, options = {}) {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Configure sound based on type
            const soundConfig = this.getSynthConfig(soundName);
            
            oscillator.frequency.setValueAtTime(soundConfig.frequency, this.audioContext.currentTime);
            oscillator.type = soundConfig.type;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(soundConfig.volume * this.masterVolume * this.sfxVolume, 
                this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, 
                this.audioContext.currentTime + soundConfig.duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + soundConfig.duration);
        } catch (error) {
            // Silently handle audio context errors (usually autoplay restrictions)
        }
    }

    getSynthConfig(soundName) {
        const configs = {
            'fire_cast': { frequency: 200, type: 'sawtooth', volume: 0.3, duration: 0.5 },
            'fire_impact': { frequency: 150, type: 'square', volume: 0.4, duration: 0.3 },
            'lightning_cast': { frequency: 800, type: 'square', volume: 0.4, duration: 0.2 },
            'lightning_impact': { frequency: 1000, type: 'square', volume: 0.5, duration: 0.1 },
            'frost_cast': { frequency: 300, type: 'sine', volume: 0.3, duration: 0.8 },
            'frost_impact': { frequency: 250, type: 'sine', volume: 0.3, duration: 0.4 },
            'arcane_cast': { frequency: 500, type: 'triangle', volume: 0.3, duration: 0.6 },
            'arcane_impact': { frequency: 400, type: 'triangle', volume: 0.4, duration: 0.3 },
            'healing_cast': { frequency: 600, type: 'sine', volume: 0.2, duration: 1.0 },
            'card_select': { frequency: 800, type: 'sine', volume: 0.2, duration: 0.1 },
            'card_play': { frequency: 400, type: 'triangle', volume: 0.3, duration: 0.2 },
            'button_click': { frequency: 1000, type: 'square', volume: 0.1, duration: 0.05 },
            'enemy_death': { frequency: 100, type: 'sawtooth', volume: 0.4, duration: 0.8 },
            'player_hurt': { frequency: 150, type: 'square', volume: 0.3, duration: 0.4 },
            'victory': { frequency: 523, type: 'sine', volume: 0.4, duration: 1.0 },
            'defeat': { frequency: 200, type: 'sawtooth', volume: 0.4, duration: 1.5 },
            'screen_shake': { frequency: 80, type: 'square', volume: 0.2, duration: 0.3 },
            'mana_restore': { frequency: 700, type: 'sine', volume: 0.2, duration: 0.5 },
            'shield_block': { frequency: 400, type: 'triangle', volume: 0.3, duration: 0.4 }
        };
        
        return configs[soundName] || { frequency: 440, type: 'sine', volume: 0.2, duration: 0.3 };
    }

    playSpellSound(spellId, phase = 'cast') {
        const spellType = this.getSpellSoundType(spellId);
        const soundName = `${spellType}_${phase}`;
        this.play(soundName);
    }

    getSpellSoundType(spellId) {
        const spellSounds = {
            'fire_bolt': 'fire',
            'flame_burst': 'fire',
            'meteor': 'fire',
            'lightning_storm': 'lightning',
            'divine_wrath': 'lightning',
            'frost_nova': 'frost',
            'arcane_missiles': 'arcane',
            'magic_missile': 'arcane',
            'healing_light': 'healing',
            'minor_heal': 'healing'
        };
        return spellSounds[spellId] || 'arcane';
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    updateAllVolumes() {
        Object.entries(this.sounds).forEach(([name, sound]) => {
            if (sound.audio && sound.config) {
                sound.audio.volume = sound.config.volume * this.masterVolume * 
                    (sound.config.type === 'music' ? this.musicVolume : this.sfxVolume);
            }
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopAll();
        }
        return this.enabled;
    }

    stopAll() {
        Object.values(this.sounds).forEach(sound => {
            if (sound.audio && typeof sound.audio.pause === 'function') {
                sound.audio.pause();
                sound.audio.currentTime = 0;
            }
        });
    }

    playBackgroundMusic() {
        if (this.enabled) {
            // Stop any existing music first to prevent overlapping
            this.stopBackgroundMusic();
            
            // Use synthesized background music since MP3 files are not loaded
            // TODO: When background_music.mp3 is added, uncomment the MP3 playback logic below
            this.createSynthesizedBackgroundMusic();
            
            /* TODO: Uncomment when MP3 files are available
            // Try to play audio file first, fallback to synthesized music
            const bgMusic = this.sounds['background_music'];
            if (bgMusic && bgMusic.loaded) {
                this.play('background_music');
            } else {
                // Create synthesized background music
                this.createSynthesizedBackgroundMusic();
            }
            */
        }
    }

    createSynthesizedBackgroundMusic() {
        if (!this.audioContext) return;
        
        // Stop any existing music first
        if (this.backgroundMusicPlaying) {
            this.stopBackgroundMusic();
        }

        try {
            this.backgroundMusicPlaying = true;
            
            // Zelda-inspired adventure theme
            const playZeldaTheme = () => {
                if (!this.backgroundMusicPlaying || !this.enabled) return;
                
                // Note frequencies (in Hz) - using C major scale with some variations
                const notes = {
                    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
                    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
                    'C3': 130.81, 'G3': 196.00, 'E3': 164.81, 'F3': 174.61
                };
                
                // Main melody inspired by Zelda overworld (simplified and original)
                const melody = [
                    // Phrase 1 - Heroic opening
                    {note: 'G4', duration: 0.5}, {note: 'A4', duration: 0.25}, {note: 'B4', duration: 0.25},
                    {note: 'C5', duration: 0.5}, {note: 'B4', duration: 0.25}, {note: 'A4', duration: 0.25},
                    {note: 'G4', duration: 1.0},
                    
                    // Phrase 2 - Adventure continues
                    {note: 'E4', duration: 0.5}, {note: 'F4', duration: 0.25}, {note: 'G4', duration: 0.25},
                    {note: 'A4', duration: 0.5}, {note: 'G4', duration: 0.25}, {note: 'F4', duration: 0.25},
                    {note: 'E4', duration: 1.0},
                    
                    // Phrase 3 - Mystical variation
                    {note: 'C5', duration: 0.5}, {note: 'B4', duration: 0.25}, {note: 'A4', duration: 0.25},
                    {note: 'G4', duration: 0.5}, {note: 'F4', duration: 0.25}, {note: 'E4', duration: 0.25},
                    {note: 'D4', duration: 1.0},
                    
                    // Phrase 4 - Resolution
                    {note: 'G4', duration: 0.5}, {note: 'C5', duration: 0.5},
                    {note: 'G4', duration: 0.5}, {note: 'E4', duration: 0.5},
                    {note: 'C4', duration: 1.5}
                ];
                
                // Bass line (simple root progression)
                const bassLine = [
                    {note: 'C3', duration: 2.0}, {note: 'G3', duration: 2.0},
                    {note: 'E3', duration: 2.0}, {note: 'F3', duration: 2.0},
                    {note: 'C3', duration: 2.0}, {note: 'G3', duration: 2.0},
                    {note: 'C3', duration: 4.0}
                ];
                
                // Harmony layer (arpeggiated chords)
                const harmony = [
                    {note: 'E4', duration: 0.25}, {note: 'G4', duration: 0.25}, {note: 'C5', duration: 0.25}, {note: 'E5', duration: 0.25},
                    {note: 'D4', duration: 0.25}, {note: 'G4', duration: 0.25}, {note: 'B4', duration: 0.25}, {note: 'D5', duration: 0.25},
                    {note: 'C4', duration: 0.25}, {note: 'E4', duration: 0.25}, {note: 'G4', duration: 0.25}, {note: 'C5', duration: 0.25},
                    {note: 'F3', duration: 0.25}, {note: 'A4', duration: 0.25}, {note: 'C5', duration: 0.25}, {note: 'F5', duration: 0.25}
                ];
                
                const playMelodyLine = (sequence, waveType, baseVolume, startTime) => {
                    let currentTime = startTime;
                    
                    sequence.forEach(({note, duration}) => {
                        const osc = this.audioContext.createOscillator();
                        const gain = this.audioContext.createGain();
                        
                        osc.frequency.setValueAtTime(notes[note], currentTime);
                        osc.type = waveType;
                        
                        // Envelope (attack, sustain, release)
                        gain.gain.setValueAtTime(0, currentTime);
                        gain.gain.linearRampToValueAtTime(baseVolume * this.masterVolume * this.musicVolume, currentTime + 0.05);
                        gain.gain.setValueAtTime(baseVolume * this.masterVolume * this.musicVolume * 0.8, currentTime + duration - 0.1);
                        gain.gain.linearRampToValueAtTime(0, currentTime + duration);
                        
                        osc.connect(gain);
                        gain.connect(this.audioContext.destination);
                        
                        osc.start(currentTime);
                        osc.stop(currentTime + duration);
                        
                        // Track oscillator for immediate stopping
                        this.activeOscillators.push(osc);
                        
                        currentTime += duration;
                    });
                };
                
                const startTime = this.audioContext.currentTime;
                
                // Play all layers
                playMelodyLine(melody, 'square', 0.15, startTime); // Main melody
                playMelodyLine(bassLine, 'triangle', 0.1, startTime); // Bass
                playMelodyLine(harmony, 'triangle', 0.05, startTime + 0.5); // Harmony (slightly delayed)
                
                // Calculate total duration and restart
                const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);
                
                this.musicRestartTimeout = setTimeout(() => {
                    if (this.backgroundMusicPlaying) {
                        this.musicRestartTimeout = setTimeout(() => {
                            playZeldaTheme();
                        }, 500); // Small pause between loops
                    }
                }, (totalDuration + 1) * 1000);
            };
            
            // Start the theme
            playZeldaTheme();
            
        } catch (error) {
            console.warn('Failed to create background music:', error);
            this.backgroundMusicPlaying = false;
        }
    }

    stopBackgroundMusic() {
        this.backgroundMusicPlaying = false;
        
        // Stop all active oscillators immediately
        this.activeOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Oscillator might already be stopped
            }
        });
        this.activeOscillators = [];
        
        const bgMusic = this.sounds['background_music'];
        if (bgMusic && bgMusic.audio) {
            bgMusic.audio.pause();
            bgMusic.audio.currentTime = 0;
        }
        
        // Clear any pending music restart timeouts
        if (this.musicRestartTimeout) {
            clearTimeout(this.musicRestartTimeout);
            this.musicRestartTimeout = null;
        }
    }

    // Global method to ensure only one background music instance
    static stopAllBackgroundMusic() {
        // Stop any existing background music from other instances
        if (window.globalSoundManager) {
            window.globalSoundManager.stopBackgroundMusic();
        }
    }

    // Set this instance as the global sound manager
    setAsGlobalInstance() {
        // Stop any existing background music
        SoundManager.stopAllBackgroundMusic();
        window.globalSoundManager = this;
    }

    // Property getter for enabled state (for compatibility)
    get soundEnabled() {
        return this.enabled;
    }
}

// Export for use in main game
window.SoundManager = SoundManager;