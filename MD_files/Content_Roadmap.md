# Content Roadmap - Spell Caster TCG

Date: 25 Juin 2026

---

## Etat actuel des contenus

### Fait
- [x] 16 cartes neutres de base
- [x] 15 cartes de classe (3 par classe x 5 classes)
- [x] 6 classes jouables
- [x] 8 capacites ennemies
- [x] 3 boss avec mecaniques uniques
- [x] Systeme de reactions elementaires (Melt, Overload, Shatter)
- [x] Systeme XP / niveaux / deblocage
- [x] Mode Arena (12 rounds, draft, upgrades)
- [x] Deck Builder (30 cartes, filtres)
- [x] Sauvegarde/reprise d'aventure

### A faire
- [ ] 15 nouvelles cartes (voir `todo/New_Cards.md`)
- [ ] Systeme de succes (voir `todo/Success_System.md`)
- [ ] Defi quotidien (voir `todo/Daily_Challenge.md`)
- [ ] Vrais fichiers audio (voir `todo/Real_Audio_Files.md`)

---

## Bloc A -- Nouvelles cartes (15 sorts) -- A FAIRE

Voir `todo/New_Cards.md` pour les details completes.

### Court terme (1-2 sessions)
- A1. Frost Bite (2 mana, 4 degats si gele, sinon 2)
- A5. Vampiric Drain (2 mana, 4 degats + soin moitie)
- A6. Hail Storm (3 mana, 1 degat tous + gele)
- A7. Arcane Ritual (3 mana, pioche 2 + bouclier 5)
- A8. Weaken (1 mana, -2 ATK temporaire)
- A12. Pyromantic Overload (1 mana, double degats feu + 2 degats self)

### Moyen terme (3-5 sessions)
- A2. Chain Lightning (3 mana, 2 degats cible + 1 degat adjacents)
- A3. Power Surge (2 mana, sorts -1 mana ce tour)
- A4. Flame Trap (2 mana, piege 3 degats)
- A9. Energy Barrier (2 mana, bouclier invoque 3 PV)
- A10. Arcane Echo (1 mana, relance dernier sort)
- A11. Prophecy (1 mana, peek 3 cartes + pick 1)
- A15. Light Hammer (4 mana, 3 degats + explosion si kill)

### Deja fait
- A13. Frost Nova v2 (cryo_frost_nova existe deja)
- A14. Ice Barrier (cryo_ice_barrier existe deja)

---

## Bloc B -- Capacites ennemies -- PARTIELLEMENT FAIT

### Fait (8 capacites)
| Capacite | ID | Declencheur |
|----------|-----|-------------|
| Provocation | provoke | Targeting |
| Enrage | enrage | Damage |
| Soigneur | healer | End of turn |
| Invocateur | summoner | End of turn |
| Bouclier Divin | divineShield | Damage |
| Vol de Vie | lifestrike | Attack |
| Sacrifice | sacrifice | Death |
| Camouflage | shroud | Turn start |

### Non fait (non prioritaire pour l'instant)
| Capacite | Effet | Priorite |
|----------|-------|----------|
| Aura de Soin | Soigne tous les allies de 1 PV en fin de tour | Basse |
| Rancune | +1 ATK a chaque sort subi | Basse |
| Brulure de Mana | -1 mana au hero quand il attaque | Basse |
| Absorption | Gagne stats d'un allie mort a cote | Basse |

### Futures (a definir)
- Stun
- Reflet
- Clonage ameliore

---

## Bloc C -- Systeme de succes (24) -- A FAIRE

Voir `todo/Success_System.md` pour les details complets.

### Categories prevues
- Progression (5 succes)
- Combat (8 succes)
- Arena (5 succes)
- Challenge (3 succes)
- Farm (3 succes)

---

## Bloc D -- Defi quotidien -- A FAIRE

Voir `todo/Daily_Challenge.md` pour les details complets.

### Principe
- 1 run par jour avec des regles speciales (modificateurs)
- Rotation de 7 modificateurs (1 par jour)
- Recompenses : XP bonus, parchemins anciens, badges

---

## Bloc E -- Classes -- FAIT

### Etat actuel : 6 classes

| Classe | Element | Passif | Statut |
|--------|---------|--------|--------|
| Pyromancien | Fire | +1 degat feu | FAIT |
| Cryomancien | Frost | Freeze +1 tour | FAIT |
| Necromancien | - | +1 PV max a mort ennemie | FAIT |
| Electromancien | Lightning | 1 degat adjacents | FAIT |
| Archimage | Arcane | Pioche/3 sorts | FAIT |
| OmbreLumiere | - | 2 PV -> 1 mana | FAIT |

### Futures classes (DLC)
- Geomancien (Earth)
- Aeromancien (Wind)
- Chaman (Nature)
- Aquamancien (Water)
- Chronomancien (Time)
- Paladin (Holy)

Voir `DLC_Plan.md` pour les details.

---

## Bloc F -- Bonus passifs (Mode Aventure) -- IDEE FUTURE

Inspires de Balatro. Le joueur choisit un bonus tous les 5 rounds pour personnaliser sa run.

### Principe
- Un choix de 2-3 bonus proposes tous les 5 rounds (rounds 5, 10, 15...)
- Les bonus sont cumulables
- Persistants pour toute la duree de la run
- Visibles dans l'interface (icones a cote du portrait hero)

### Liste des bonus proposes

| Bonus | Effet | Rareté |
|-------|-------|--------|
| Main +1 | +1 carte piochée par tour | Commun |
| Mana +1 | Commence chaque vague avec +1 mana max | Commun |
| Bouclier de depart | Gagne 2 bouclier au debut de chaque vague | Commun |
| Soin de vague | Soin 1 PV au debut de chaque vague | Commun |
| PV Max +2 | +2 PV max permanents | Commun |
| Dessin +1 | Pioche 2 cartes par tour au lieu d'1 | Rare |
| Degats +1 | Tous les sorts font +1 degat | Rare |
| Lifesteal 1 | Soin 1 a chaque sort lance | Rare |
| Mana reduit | Tous les sorts coutent 1 de moins (min 1) | Rare |
| Bouclier permanent | +1 bouclier permanent (ne se retire pas) | Rare |
| Echo | Le premier sort de chaque vague est lance 2 fois | Epique |

### Notes techniques
- Stockage : tableau `runBonuses[]` dans l'etat de la run (localStorage)
- Application : verifier les bonus a chaque debut de tour/vague
- UI : afficher les icones des bonus actifs dans le header

---

## Notes techniques

- Nouvelles cartes : ajouter dans cards/spells.json, puis dans le tableau de deblocage (CARD_UNLOCK_TABLE) si necessaire
- Nouvelles capacites : ajouter dans game/enemyAbilitiesConfig.js, puis assigner aux ennemis
- Succes : nouveau fichier game/achievementManager.js, stockage localStorage separe
- Defi quotidien : nouveau fichier game/dailyChallengeManager.js, seed basee sur la date
- Nouvelles classes : nouveau fichier de config, maj classManager.js, maj classConfig.js, ajout des cartes associees
