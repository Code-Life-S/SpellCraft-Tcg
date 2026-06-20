# Vision MVP Store - Spell Caster TCG

Date: 20 Juin 2026

---

## Modele economique

**Hybride, inspire de Fortnite/Valorant/Balatro :**

- **Jeu payant sur Steam (~8-10$)** avec demo gratuite (3-5 premieres vagues)
- **IAP cosmetiques uniquement** :
  - Dos de cartes (Cuir, Or, Cristal, Obsidienne, Themes saisonniers)
  - Plateaux de jeu (Bibliotheque, Caverne, Temple, Arenes)
  - Effets de particules (Feux d'artifice, Etoiles, Ombres)
  - Skins de heros
  - Packs de musiques alternatives
- **Gacha leger cosmetique** ("Parchemins anciens") : gagnes en jouant ou achetes. Donne des cosmetiques aleatoires. Zero pay-to-win.
- **Pas de cartes de jeu dans le gacha** -- tout se debloque en jouant (XP/paliers/succes)
- **Publicites : non** (jeu payant + IAP, la pub tuerait l'experience)

### Plateformes (ordre de priorite)

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
- Ennemis avec capacites (4 types)
- 2 boss
- Progression XP + deblocage de cartes
- Succes / Hauts-faits

### Phase 2 (1 mois) : Contenu
- 10+ nouvelles cartes
- Mode sans fin (post-campagne)
- 1 boss supplementaire
- Defi quotidien

### Phase 3 (1-2 mois) : Polish & Store
- Sons IA / libres de droits
- Page Steam (capsule, trailer, screenshots)
- Demo gratuite
- Build final + bugfix

### Post-MVP (apres sortie Steam)
- Portage mobile
- Gacha cosmetique "Parchemins anciens"
- Nouvelles campagnes / boss
- Mode Aventure (choix de chemin, optionnel)

---

## Principes de conception

- **Chill, fun, addictif, sans prise de tete** -- le joueur lance une partie et joue immediatement
- **Pas de pay-to-win** -- tout le contenu de jeu se debloque en jouant
- **Le cosmetique est la seule monnaie reelle** (hors prix du jeu sur Steam)
- **Rejouabilite** par la variete (cartes, ennemis, boss, seed) et la progression (succes, XP, defi quotidien)
- **Mobile-friendly** en tete pour le code (responsive, touch), mais adaptation mobile apres la sortie Steam
