# Vision MVP Store - Spell Caster TCG

Date: 25 Juin 2026

---

## Etat actuel du projet

### Mecaniques implementees
- 31 sorts (16 neutres + 15 de classe)
- 6 classes jouables (Pyromancien, Cryomancien, Necromancien, Electromancien, Archimage, OmbreLumiere)
- 8 capacites ennemies (Provocation, Enrage, Soigneur, Invocateur, Bouclier Divin, Vol de Vie, Sacrifice, Camouflage)
- 7 Boss (Roi Squelette, Mage Noir, Dragon, Phenix de Cendre, Golem de Cristal, Spectre de l'Esprit, Cracheur de Venin)
- Systeme de reactions elementaires (Melt, Overload, Shatter)
- Mode vague infini avec scaling de difficulte
- Mode Arena (12 rounds, draft, upgrades)
- Deck Builder (30 cartes, filtres par classe)
- Systeme XP / niveaux / deblocage de cartes et classes
- Sauvegarde/reprise d'aventure
- Audio synthetise (Web Audio API, pas de vrais fichiers audio)

### Ce qui reste a faire
- [x] Systeme de succes (28/28, voir `done/Success_System.md`)
- [ ] 15 nouvelles cartes (voir `todo/New_Cards.md`)
- [ ] Defi quotidien (voir `todo/Daily_Challenge.md`)
- [ ] Vrais fichiers audio (voir `todo/Real_Audio_Files.md`)
- [ ] Bonus passifs inter-vagues (voir `todo/Passive_Bonuses.md`)
- [ ] Systeme d'upgrades deblocables + artefacts (voir `todo/Upgrades_Artifacts.md`)

---

## Modele economique

**2 phases selon la plateforme :**

### Phase 1 - Steam (MVP ~3-6 mois)

**Jeu de base payant (~8-10$)** avec demo gratuite (3 premieres vagues).

Contenu du jeu de base :
- 6 classes : Pyromancien, Cryomancien, Necromancien, Electromancien, Archimage, OmbreLumiere
- Mode vague infini avec boss tous les 10 niveaux
- Mode Arena (12 rounds, draft, upgrades)
- Toutes les cartes de base deblocables en jouant (XP/paliers)

**DLC (vente additionnelle) :**
- DLC "Forces de la Nature" (~4-5$) : 3 classes (Geomancien, Aeromancien, Chaman) + 1 boss + 10 cartes
- DLC "Dimensions Cachees" (~4-5$) : 3 classes (Aquamancien, Chronomancien, Paladin) + 1 boss + 10-15 cartes
- Pack "Collection Complete" (~10-12$)

Alternative : classes vendues a l'unite (~2$ chacune) + pack bundle.

**IAP cosmetiques :**
- Dos de cartes (Cuir, Or, Cristal, Obsidienne, Themes saisonniers)
- Plateaux de jeu (Bibliotheque, Caverne, Temple, Arenes)
- Effets de particules (Feux d'artifice, Etoiles, Ombres)
- Skins de heros
- Packs de musiques alternatives

**Gacha leger cosmetique** ("Parchemins anciens") :
- Gagnes en jouant ou achetes
- Donne des cosmetiques aleatoires (dos, plateau, effet)
- Zero pay-to-win

**Pas de publicites** (jeu payant + IAP, la pub tuerait l'experience)

### Phase 2 - Mobile (post-MVP ~6-12 mois)

**Free-to-play** avec rotation de classes (inspire League of Legends).

- 3 classes gratuites permanentes (Pyromancien, Cryomancien, Necromancien)
- 1 classe en rotation gratuite chaque semaine
- Acheter une classe permanente : ~2$ (ou deblocage par temps de jeu)
- Pack "Toutes les classes" : ~10-12$
- Memes cosmetiques IAP que la version Steam (transferables si compte unifie)
- Meme gacha leger cosmetique

Note : Avoir le jeu payant sur Steam mais gratuit sur mobile n'est pas derangeant.
- Les joueurs PC sont habitues a payer sur Steam
- Les joueurs mobiles sont habitues au F2P
- Les deux audiences ne se chevauchent que partiellement
- Exemples reussis : Dead Cells, Minecraft

### Plateformes (ordre de priorite)

1. **Steam** (PC) -- MVP dans 3-6 mois
2. **Mobile** (Play Store / App Store) -- portage 6-12 mois plus tard
3. **Pas de multijoueur** pour le moment (trop complexe, pas necessaire pour un jeu solo)

---

## Progression du joueur

**4 couches, inspirees de Balatro + Hearthstone + Hades 2 :**

### Couche 1 : XP et paliers (toutes les parties) -- FAIT
- XP gagnee a chaque partie (meme perdue), proportionnel a la performance
- Palier tous les X XP : debloque une nouvelle carte
- ~20-30 cartes total, 10 de base, les autres a debloquer
- Debloque aussi : ennemis, boss, fonds d'ecran, titres

### Couche 2 : Succes / Hauts-faits -- FAIT (28/28)
Objectifs varies qui recompensent l'exploration et la maitrise :
- "Gagner sa premiere partie"
- "Infliger 50 degats de feu en un combat"
- "Geler 4 ennemis differents en un combat"
- "Gagner l'arene avec chaque classe"
- "Finir un combat en 2 tours ou moins"
- Etc.
- Chaque succes debloque une recompense (titre, icone, skin)

Voir `done/Success_System.md` pour les details.

### Couche 3 : Defi quotidien -- A FAIRE
- 1 run par jour avec des regles speciales (modificateurs)
- Recompense unique (parchemin ancien, essence, etc.)
- Fidelise les joueurs, donne une raison de revenir chaque jour

Voir `todo/Daily_Challenge.md` pour les details.

### Couche 4 : Upgrades deblocables et artefacts (Arena) -- A FAIRE
- Debloquer des upgrades permanentes via succes et victoires de classe
- Equiper des artefacts avant chaque run pour orienter le pool d'upgrades
- Inspire de Hades 2 (dieux favoris / weight system)

Voir `todo/Upgrades_Artifacts.md` pour les details.

---

## Mode de jeu principal : Vague Infini

**Infini** (pas de fin, difficulte croissante).

Raisons :
- Le joueur lance et joue immediatement
- La strategie est dans le choix des sorts pendant le combat
- La rejouabilite vient de la difficulte croissante et des boss

### Structure d'une run

```
Ecran titre -> Choix deck -> Vague 1 -> Vague 2 -> ... -> Boss (vague 10) -> Vague 11 -> ...
                                |              |              |
                        Recompenses      Scaling HP/ATK    Boss unique
                        (XP, or)         +1 ennemi/10v     (mecaniques)
```

- Vagues 1-9 : 2-3 ennemis, scaling progressif
- Vague 10 : BOSS unique (Roi Squelette, Mage Noir, ou Dragon)
- Apres le boss : retour aux vagues normales, difficulte continue d'augmenter
- Scaling : +1 ennemi toutes les 10 vagues (max 7), +1 HP/10 vagues, +1 ATK/20 vagues
- Capacites ennemies : vagues 1-3 = aucune, vagues 4-7 = basiques, vagues 8+ = toutes

### Mode Arena (post-campagne)
- 12 rounds, difficulte croissante
- Draft de 10 cartes au depart
- Upgrades entre rounds (ajout carte, upgrade carte, bonus permanent)
- Boss au round 12
- Defaite = fin de run

---

## Cartes

### Etat actuel : 31 sorts

**Neutres (16) :**
fire_bolt, magic_missile, meteor, thunder_storm, frost_nova, flame_burst, divine_wrath, arcane_missiles, healing_light, minor_heal, greater_heal, arcane_study, mystical_insight, quickdraw, mana_surge, arcane_shield

**De classe (15) :**
- Pyromancien : Conflagration
- Cryomancien : Blizzard, Ice Barrier, Frost Nova
- Necromancien : Soul Drain, Soul Harvest, Bone Shield
- Electromancien : Chain Lightning, Lightning Rod, Thunder Shield
- Archimage : Arcane Explosion, Mana Surge, Echo
- OmbreLumiere : Shadow Bolt, Life Tap, Dark Pact

### Nouvelles cartes a ajouter (~15)

Voir `todo/New_Cards.md` pour les details.

---

## Ennemis

### Etat actuel : 8 capacites

| Capacite | Comportement | Declencheur |
|----------|--------------|-------------|
| Provocation | Doit etre tue avant de pouvoir cibler les autres | Targeting |
| Enrage | +2 attaque quand ses PV passent sous 50% | Damage |
| Soigneur | Soigne un allie de 2 chaque tour | End of turn |
| Invocateur | Invoque un sbire 1/1 au debut de son tour | End of turn |
| Bouclier Divin | Bloque le prochain sort subi (1 fois) | Damage |
| Vol de Vie | Se soigne de la moitie des degats infliges | Attack |
| Sacrifice | A sa mort, donne +2 ATK a un allie | Death |
| Camouflage | Ne peut pas etre cible 1 tour sur 2 | Turn start |

### Capacites futures (non prioritaire pour l'instant)

| Capacite | Comportement |
|----------|--------------|
| Aura de Soin | Soigne tous les allies de 1 PV en fin de tour |
| Rancune | +1 ATK permanent a chaque fois qu'il subit un sort |
| Brulure de Mana | Quand il attaque le hero, vous perdez 1 mana |
| Absorption | Quand un allie meurt a cote de lui, il gagne ses stats |

---

## Boss

### Etat actuel : 7 boss

| Boss | HP | ATK | Mecanique |
|------|-----|-----|-----------|
| Roi Squelette | 20 | 4 | Invoque 2 squelettes apres chaque attaque |
| Mage Noir | 15 | 3 | Se soigne de 3 PV par tour |
| Dragon | 30 | 3 | +1 ATK par tour, enrage sous 50% HP |
| Phenix de Cendre | 20 | 3 | Ressuscite 1x avec 20 HP +2 ATK, aura brulure |
| Golem de Cristal | 22 | 2 | Gagne 2 bouclier/tour, reflete degats |
| Spectre de l'Esprit | 16 | 3 | Defausse 1 carte aleatoire si >=3 en main |
| Cracheur de Venin | 20 | 4 | Poison cumulatif chaque tour |

### Boss futurs (idées pour plus tard)
- Double Boss (tank + dps, si l'un meurt l'autre s'enrage)
- Horloge (compte a rebours 5 tours, apres = degats massifs)
- Ombre (invisible 1 tour sur 2, ne peut pas etre ciblee)

---

## Leviers d'addiction pour le MVP

| Levier | Effort | Impact | Statut |
|--------|--------|--------|--------|
| Recompenses de run (or/essence) | Faible | Haut | FAIT (XP) |
| XP/Paliers de progression | Faible | Tres haut | FAIT |
| Records personnels (score, degats) | Faible | Moyen | FAIT (bestWave) |
| Succes / Hauts-faits | Faible | Haut | FAIT (28/28) |
| Bonus passifs inter-vagues | Moyen | Tres haut | A FAIRE |
| Upgrades deblocables + artefacts | Moyen | Tres haut | A FAIRE |
| Defi quotidien | Moyen | Tres haut | A FAIRE |
| Classement local (high score) | Faible | Moyen | A FAIRE |
| Seed partageable | Faible | Moyen | A FAIRE |

---

## Roadmap

### Phase 1 (1-2 mois) : Coeur du jeu -- TERMINE

- [x] Mode vague infini avec boss tous les 10 niveaux
- [x] Ennemis avec capacites (8 types)
- [x] 3 boss avec mecaniques uniques
- [x] Systeme de classes : 6 classes
- [x] Progression XP + deblocage de cartes et classes
- [x] Mode Arena (12 rounds, draft, upgrades)
- [x] Deck Builder
- [x] Sauvegarde/reprise d'aventure
- [x] Reactions elementaires
- [x] Audio synthetise

### Phase 2 (1-2 mois) : Contenu -- EN COURS

- [x] 4 nouveaux boss (Phenix de Cendre, Golem de Cristal, Spectre de l'Esprit, Cracheur de Venin)
- [x] Systeme de succes (28/28, voir `done/Success_System.md`)
- [ ] 15 nouvelles cartes (voir `todo/New_Cards.md`)
- [ ] Bonus passifs inter-vagues (voir `todo/Passive_Bonuses.md`)
- [ ] Systeme d'upgrades deblocables + artefacts (voir `todo/Upgrades_Artifacts.md`)
- [ ] Defi quotidien (voir `todo/Daily_Challenge.md`)
- [ ] Vrais fichiers audio (voir `todo/Real_Audio_Files.md`)

### Phase 3 (1-2 mois) : Polish & Store

- [ ] Page Steam (capsule, trailer, screenshots)
- [ ] Demo gratuite (3 premieres vagues)
- [ ] Build final + bugfix
- [ ] DLC prets pour le lancement (classes restantes en packs)

### Post-MVP (apres sortie Steam)

- [ ] Portage mobile (F2P avec rotation de classes)
- [ ] Gacha cosmetique "Parchemins anciens"
- [ ] Nouvelles campagnes / boss
- [ ] Evenements temporaires (Double Classe, Boss de la Semaine, etc.)

---

## Principes de conception

- **Chill, fun, addictif, sans prise de tete** -- le joueur lance une partie et joue immediatement
- **Pas de pay-to-win** -- tout le contenu de jeu se debloque en jouant
- **Classes comme pilier de rejouabilite** -- chaque classe offre un style de jeu different, encourage a toutes les essayer
- **Le cosmetique est la seule monnaie reelle** (hors prix du jeu sur Steam)
- **Rejouabilite** par la variete (classes, cartes, ennemis, boss, seed) et la progression (succes, XP, defi quotidien)
- **Mobile-friendly** en tete pour le code (responsive, touch), mais adaptation mobile apres la sortie Steam
