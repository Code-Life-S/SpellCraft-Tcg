# Real Audio Files - TODO

Status: NOT STARTED

## Goal
Replace synthesized audio (Web Audio API) with real MP3/WAV audio files for better sound quality.

## Current State
- All sounds are synthesized via Web Audio API (`audio/soundManager.js`)
- No audio files exist in the `audio/` directory
- TODO comments in soundManager.js show planned MP3 file paths

## Planned Audio Files

### Spell Casting Sounds
| File | Description |
|------|-------------|
| `fire_cast.mp3` | Fire spell casting sound |
| `lightning_cast.mp3` | Lightning spell casting sound |
| `frost_cast.mp3` | Frost spell casting sound |
| `arcane_cast.mp3` | Arcane spell casting sound |
| `healing_cast.mp3` | Healing spell casting sound |

### Impact Sounds
| File | Description |
|------|-------------|
| `fire_impact.mp3` | Fire spell impact |
| `lightning_impact.mp3` | Lightning spell impact |
| `frost_impact.mp3` | Frost spell impact |
| `arcane_impact.mp3` | Arcane spell impact |

### UI Sounds
| File | Description |
|------|-------------|
| `card_select.mp3` | Card selection sound |
| `card_play.mp3` | Card played sound |
| `button_click.mp3` | Button click sound |
| `enemy_death.mp3` | Enemy death sound |
| `player_hurt.mp3` | Player taking damage |
| `victory.mp3` | Victory fanfare |
| `defeat.mp3` | Defeat sound |

### Ambient Sounds
| File | Description |
|------|-------------|
| `screen_shake.mp3` | Screen shake rumble |
| `mana_restore.mp3` | Mana restoration chime |

### Background Music
| File | Description |
|------|-------------|
| `background_music.mp3` | Main background music loop |

## Implementation Plan

### Phase 1: Source Audio Files
- Find free/royalty-free audio sources (freesound.org, mixkit.co, etc.)
- Or create/customize sounds using audio tools
- Ensure consistent quality and volume levels

### Phase 2: Integrate into SoundManager
- Uncomment MP3 file definitions in `soundManager.js`
- Add fallback to synthesized sounds if file not found
- Test each sound effect in game context

### Phase 3: Balance Volume
- Adjust volume levels for each sound type
- Ensure music doesn't overpower SFX
- Test on different browsers/devices

## Notes
- Keep synthesized sounds as fallback for missing files
- Consider loading audio files on demand to reduce initial load time
- Audio files should be small (< 100KB each for SFX, < 2MB for music)
