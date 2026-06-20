# Elemental Reactions System - IMPLEMENTED

## Status Effects implementes

| Effet | Element | Duree | Effet |
|-------|---------|-------|-------|
| Frozen (gele) | Frost | 1 tour | Saute la prochaine attaque |
| Burning (brulure) | Fire | 2 tours | 1 degat au debut de son tour |
| Shocked (electrise) | Lightning | 1 hit | +2 degats a la prochaine source |

## Reactions implementees

| Reaction | Declencheur | Effet |
|----------|-------------|-------|
| Melt (fonte) | Fire sur Frozen | Degats x2, enleve Frozen |
| Overload (surcharge) | Fire sur Shocked | +2 AOE a tous les ennemis, enleve Shocked |
| Shatter (bris) | Lightning sur Frozen | +3 degats bonus, enleve Frozen |

## Architecture

### Nouveaux fichiers
- game/elementalReactionsConfig.js - Constante on/off + definitions data-driven
- game/elementalReactionsManager.js - Classe utilitaire statique

### Fichiers modifies
- screens/components/enemy-board/enemyBoardComponent.js - Overlays de status
- screens/components/enemy-board/enemyBoardComponent.css - Animations CSS
- screens/gameScreen.js - Integration reactions + gestion Frozen/Burning
- screens/arena/arenaAdventureScreen.js - Meme integration pour l'arena
- index.html - Script tags

### Principe data-driven
- Les status et reactions sont definis comme donnees (objets/maps)
- Ajouter un nouveau status ou reaction = ajouter une entree dans la config
- Pas de code dur, modification minimale

### Activation/desactivation
- Constante ELEMENTAL_REACTIONS_ENABLED dans elementalReactionsConfig.js
- Mettre a false pour desactiver entierement le systeme
- Pour plus tard: integration dans un menu d'options

### Etat: COMPLETE
- Verifie dans GameScreen (vagues) et ArenaAdventureScreen
- Gestion des status ennemis (Frozen/Burning/Shocked)
- Reactions elementaires (Melt/Overload/Shatter)
- Overlays visuels avec animations CSS
- Degats de brulure en debut de tour ennemi
- Gel empeche l'attaque, retire le statut apres
