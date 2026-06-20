# Vision MVP Store - Spell Caster TCG

Date: 20 Juin 2026

---

## Modele economique

**2 phases selon la plateforme :**

### Phase 1 - Steam (MVP ~3-6 mois)

**Jeu de base payant (~8-10$)** avec demo gratuite (3 premieres vagues).

Contenu du jeu de base :
- 3 classes : Pyromancien, Cryomancien, Necromancien
- Campagne 10 vagues + boss final
- Mode sans fin (post-campagne)
- Toutes les cartes de base deblocables en jouant (XP/paliers)

**DLC (vente additionnelle) :**
- DLC "Maitres de l'Arcane" (~4-5$) : 4 classes (Tempetier, Archimage, Ombrelumiere, Elementaliste) + 1 boss + 5-10 cartes
- DLC "Heros Legendaires" (~6-7$) : 2 classes avancees + boss bonus + cartes
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

### Plateauformes (ordre de priorite)

1. **Steam** (PC) -- MVP dans 3-6 mois
2. **Mobile** (Play Store / App Store) -- portage 6-12 mois plus tard
3. **Pas de multijoueur** pour le moment (trop complexe, pas necessaire pour un jeu solo)

---

## Progression du joueur

**3 couches, inspirees de Balatro + Hearthstone :**

### Couche 1 : XP et paliers (toutes les parties)
- XP gagne a chaque partie (meme perdue), proportionnel a la performance
- Palier tous les X XP : debloque une nouvelle carte
- ~20-30 cartes total, 10 de base, les autres a debloquer
- Debloque aussi : ennemis, boss, fonds d'ecran, titres

### Couche 2 : Succes / Hauts-faits
Objectifs varies qui recompensent l'exploration et la maitrise :
- "Gagner une partie sans utiliser de soin"
- "Infliger 50 degats en un tour"
- "Geler 3 ennemis en meme temps"
- "Remporter une partie avec chaque deck"
- "Finir la campagne en moins de X tours"
- Etc.
- Chaque succes debloque une recompense (carte, cosmetique, titre)

### Couche 3 : Defi quotidien
- 1 run par jour avec des regles speciales (modificateurs)
- Recompense unique (parchemin ancien, essence, etc.)
- Fidelise les joueurs, donne une raison de revenir chaque jour

---

## Campagne : Mode principal

**Lineaire** (pas d'arbre de choix comme Slay the Spire).

Raisons :
- "Chill, sans prise de tete" -- le joueur lance et joue
- La strategie est dans le choix des sorts pendant le combat, pas dans la route
- La rejouabilite vient de la composition de deck aleatoire + boss/enemis variables

### Structure d'une run

```
Ecran titre -> Choix deck -> Vagues 1-9 (croissantes) -> BOSS -> Victoire/Defaite
                                |
                        Recompenses entre vagues
                        (soin, ajout carte, upgrade)
```

- ~10 vagues + boss final
- Vagues 1-4 : 2 ennemis (apprentissage)
- Vagues 5-7 : 3 ennemis + capacites
- Vagues 8-9 : 4 ennemis + mecaniques de vagues
- Vague 10 : BOSS

### Mode sans fin (post-campagne)
- Vagues infinies, difficulte croissante
- Score base sur vagues survécues + degats infliges + tresors collectes
- High score local (et global plus tard)

---

## Cartes

### Etat actuel : 16 sorts

fire_bolt, magic_missile, meteor, thunder_storm, frost_nova, flame_burst, divine_wrath, arcane_missiles, healing_light, minor_heal, greater_heal, arcane_study, mystical_insight, quickdraw, mana_surge, arcane_shield

### Nouvelles cartes a ajouter (~15-20)

| Type | Exemple | Mecanique |
|---|---|---|
| Degats conditionnels | "4 degats si l'ennemi est gele" | Synergie elementaire |
| Degats en chaine | "2 degats, puis 1 degat a l'ennemi a cote" | Positionnement |
| Boost temporaire | "Ce tour, vos sorts coutent 1 de moins" | Mana manipulation |
| Armes | "Invoque une arme qui frappe chaque tour (2 degats)" | Degats passifs |
| Pieges | "Piege : 3 degats au premier ennemi qui attaque" | Controle |
| Vol de vie | "3 degats, vous soigne de la moitie" | Sustain |
| Multi-element | "1 degat a tous, gele les ennemis" | Double effet |
| Rituel | "Coute 3 mana, pioche 2 cartes, gagne 5 bouclier" | Multi-effet |
| Malefice | "L'ennemi cible perd 2 d'attaque pour ce tour" | Debuff |
| Invocation | "Invoque un bouclier qui absorbe 3 degats" | Defense passive |
| Echo | "Relance le dernier sort joue (cout 0)" | Combo |
| Prophecie | "Regarde les 3 prochaines cartes, pioche-en 1" | Selection |
| Explosion | "Detruit un ennemi, inflige autant de degats aux autres" | Risque/Recompense |
| Surcharge | "Inflige le double de degats mais vous prend 2 degats" | Risque/Recompense |

---

## Ennemis

### Etat actuel : 12 types generiques (attaque seule)

Goblin, Orc, Skeleton, Wolf, Bandit, Spider, Dark Mage, Minotaur, Wraith, Gargoyle, Demon, Vampire

### Capacites a ajouter (4-5 types pour le MVP)

| Capacite | Comportement | Ennemi exemple |
|---|---|---|
| **Soigneur** | Soigne un allie de 2 chaque tour | Dark Priest |
| **Tank** | A 50% plus de HP, gagne 2 bouclier au debut | Shieldbearer |
| **Berserker** | +1 attaque a chaque fois qu'il perd 2 HP | Frenzied Orc |
| **Invocateur** | Invoque un sbire 1/1 au debut de son tour | Summoner |
| **Voleur de mana** | Vous vole 1 mana au debut de son tour | Mana Thief |
| **Explosif** | Inflige 3 degats a tous les ennemis (alliés compris) a sa mort | Bomb Lobber |

---

## Boss (priorite #1)

Ajouter 2-3 boss pour le MVP. Mecaniques uniques, phases, defi memorable.

### Boss 1 : Roi Squelette (invocateur)
- Invoque 2 Skeletiques 1/1 au debut de chaque tour
- Ses sbires peuvent etre geles/brules/electrises normalement
- Mechanique : "Tant que des sbires sont vivants, le Roi a bouclier"

### Boss 2 : Mage Noir (bouclier + sorts)
- Gagne 3 bouclier au debut de son tour
- Lance "Drain de vie" : vous vole 2 HP et se soigne
- Quand son bouclier est brise, il stun 1 tour

### Boss 3 : Dragon (phases)
- Phase 1 (100%-50%) : attaque normale + souffle (degats a tous les ennemis du joueur -- les cartes dans la main ? Non, degats au hero)
- Phase 2 (50%-0%) : "Enrage" -- +2 attaque, attaque 2 fois par tour
- Visuellement impressionnant (grand, effets de particules)

### Idees pour plus tard
- Double Boss (tank + dps, si l'un meurt l'autre s'enrage)
- Horloge (compte a rebours 5 tours, apres = degats massifs ou game over)
- Ombre (invisible 1 tour sur 2, ne peut pas etre ciblee)

---

## Leviers d'addiction pour le MVP (sans multi)

| Levier | Effort | Impact |
|---|---|---|
| Recompenses de run (or/essence) | Faible | Haut |
| Succes / Hauts-faits | Faible | Haut |
| Records personnels (score, degats, etc.) | Faible | Moyen |
| XP/Paliers de progression | Faible | Tres haut |
| Defi quotidien | Moyen | Tres haut |
| Classement local (high score sur la machine) | Faible | Moyen |
| Seed partageable (defi du jour "meme partie que tout le monde") | Faible | Moyen |

---

## Roadmap proposee

### Phase 1 (1-2 mois) : Coeur du jeu
- Campagne lineaire (10 vagues + boss final)
- Ennemis avec capacites (4-5 types)
- 2 boss avec mecaniques uniques
- **Systeme de classes** : 3 classes de base (Pyromancien, Cryomancien, Necromancien)
  - Chaque classe : passif + 3 cartes de classe
  - Selection de classe avant chaque run
- Progression XP + deblocage de cartes
- Succes / Hauts-faits

### Phase 2 (1 mois) : Contenu
- 10+ nouvelles cartes
- Mode sans fin (post-campagne)
- 1 boss supplementaire
- Defi quotidien
- 2 classes supplementaires (Tempetier, Archimage)

### Phase 3 (1-2 mois) : Polish & Store
- Sons IA / libres de droits
- Page Steam (capsule, trailer, screenshots)
- Demo gratuite (3 premieres vagues)
- Build final + bugfix
- DLC prets pour le lancement (classes restantes en packs)

### Post-MVP (apres sortie Steam)
- Portage mobile (F2P avec rotation de classes)
- Gacha cosmetique "Parchemins anciens"
- Nouvelles campagnes / boss
- Evenements temporaires (Double Classe, Boss de la Semaine, etc.)
- Mode Aventure (choix de chemin, optionnel)

---

## Principes de conception

- **Chill, fun, addictif, sans prise de tete** -- le joueur lance une partie et joue immediatement
- **Pas de pay-to-win** -- tout le contenu de jeu se debloque en jouant
- **Classes comme pilier de rejouabilite** -- chaque classe offre un style de jeu different, encourage a toutes les essayer
- **Le cosmetique est la seule monnaie reelle** (hors prix du jeu sur Steam)
- **Rejouabilite** par la variete (classes, cartes, ennemis, boss, seed) et la progression (succes, XP, defi quotidien)
- **Mobile-friendly** en tete pour le code (responsive, touch), mais adaptation mobile apres la sortie Steam
