# Fix bugs en mode Aventure - 23 Juin 2026

## Bug 1 : Race condition attaque phase / animation de mort (Corrige)

**Symptome** : Tour 1, ennemis n'attaquent pas, second tour aussi a 1 mana.

**Cause racine** : Quand tous les ennemis meurent d'un sort (ou de degats de brulure pendant le traitement de statut), les callbacks d'animation de mort (1800ms) entrent en conflit avec le demarrage de la phase d'attaque.

**Scenario type** :
1. Joueur tue tous les ennemis au tour 1 avec un sort
2. `isDying=true` lance pour chaque ennemi, animation de mort 1800ms
3. `castSpell()` -> auto-end-turn declenche a t=1000ms
4. `endTurn()` verifie `this.enemies.length` -> les ennemis mourants sont encore dans le tableau -> FAUX -> phase d'attaque demarre (planifiee a t=2000ms)
5. Animation de mort se termine a t=1800ms -> ennemis retires du tableau -> `checkGameEnd()` declenche `nextWave()` pour t=2800ms
6. Phase d'attaque demarre a t=2000ms -> `filter(!isDying)` -> tableau vide (ennemis deja retires) -> **RETOUR PRECOCE sans `onPhaseEnd`** -> `startNewTurn` jamais appele
7. `nextWave()` a t=2800ms -> `currentTurn = 1`, mana = 1/1

**Resultat** : Le joueur saute un tour (pas d'increment de mana), la vague 2 commence avec turn=1.

### Corrections appliquees

**1a. `endTurn()` (gameScreen.js:1010)** :
- Verifie desormais `enemies.filter(!isDying && health > 0)` au lieu de `enemies.length === 0`
- Si aucun ennemi vivant : desactive le bouton, met a jour le statut "Wave Complete!", appelle `checkGameEnd()` et retourne
- Evite de lancer la phase d'attaque alors que tous les ennemis sont deja mourants/morts

**1b. `checkGameEnd()` (gameScreen.js:1115)** :
- Ajoute un flag `_pendingWaveTransition` pour empecher les transitions dupliquees
- Ajoute la verification des ennemis mourants (`enemies.filter(isDying).length > 0`)
- Attend que TOUTES les animations de mort soient terminees avant de transitionner
- Delai reduit de 1000ms a 500ms (on a deja attendu les animations)

**1c. `onBeforeShow()` (gameScreen.js:210)** :
- Ajoute `this._pendingWaveTransition = false` au reset d'etat pour nouvelle run

## Bug 2 : Bouton End Turn actif pendant transition (Corrige)

**Cause** : `nextWave()` desactivait le bouton seulement dans le callback `setTimeout`, pas au debut de la fonction. Le bouton restait cliquable pendant la fenetre de transition de 1.5s.

**Correction** (`nextWave()` gameScreen.js:401) :
- Desactive le bouton End Turn des le debut de `nextWave()`
- Toujours reactive dans le callback `setTimeout` quand la vague apparait

## Bug 3 : Multiples Provokers - seul le premier est ciblable (Corrige)

**Cause** : `handleEnemyClick()` utilisait `enemies.find()` qui retourne le PREMIER ennemi avec `provoke`. Si le joueur cliquait sur un autre provoker, le message "protected by Provocation" s'affichait.

**Correction** (`handleEnemyClick()` gameScreen.js:695) :
- Verifie desormais si l'ennemi clique a l'abilite `provoke`
- Permet de cibler n'importe quel ennemi avec Provocation
- Bloque seulement les clics sur les ennemis SANS Provocation

## Bug 4 : Ecran de defaite persistant au restart (Corrige)

**Symptome** : Quand on relance une partie apres avoir perdu un run, l'ecran de defaite est toujours affiche.

**Cause** : `showEndRunScreen()` enleve la classe `hidden` du `#gameover-overlay`, mais `onBeforeShow()` ne la remet jamais.

**Correction** (`onBeforeShow()` gameScreen.js:214) :
- Ajoute `overlay.classList.add('hidden')` pour cacher l'overlay au debut d'une nouvelle partie

## Bug 5 : Premier tour sans ennemis apres mulligan (Corrige)

**Symptome** : Quand on clique "End Turn" au premier tour, ca declenche directement `nextWave()` → vague 2 avec tour=1, mana=1, ennemis et main differents.

**Cause** : `spawnInitialEnemies()` etait appelee dans `initializeGame()` (via `setupContent()`), mais `onBeforeShow()` ecrasait `this.enemies = []` sans jamais re-invoquer `spawnInitialEnemies()`. Les ennemis de la vague 1 n'existaient donc jamais apres le mulligan.

**Correction** (gameScreen.js) :
- `onBeforeShow()` appelle desormais `spawnInitialEnemies()` + `updateUI()` + `updateHistoryDisplay()` apres avoir charge le deck
- `initializeGame()` ne fait plus que l'initialisation des preferences (ne touche plus aux ennemis)

## Bug 6 : Pas de sauvegarde / reprise de l'aventure (Corrige)

**Demande** : Pouvoir quitter l'aventure et la reprendre plus tard (comme le mode Arena).

**Implementation** :
- Cree `AdventureStateManager` (stockage localStorage cle `adventureState`), separe de l'etat Arena
- `backToMenu()` sauvegarde l'etat (mid-wave) avant de naviguer au menu principal
- `onBeforeShow()` distingue nouvelle run (`data.deckId`) vs reprise (`data.resume: true`)
- `gameOver()` efface l'etat sauvegarde
- `nextWave()` sauvegarde l'etat apres chaque spawn de vague
- Menu principal : `startAdventure()` detecte un etat sauvegarde et propose "Continuer" / "Nouvelle aventure"
- Dialogue de reprise avec progression ("Wave X") et boutons Continue / New Adventure / Cancel

## Fichiers modifies
- `screens/gameScreen.js` : `endTurn()`, `checkGameEnd()`, `nextWave()`, `handleEnemyClick()`, `onBeforeShow()`, `initializeGame()`, `backToMenu()`, `gameOver()`, `showEndRunScreen()`
- `screens/mainMenuScreen.js` : `startAdventure()`, nouvelle methode `showAdventureChoiceDialog()`, `addAdventureChoiceStyles()`
- `screens/game/adventureStateManager.js` : **NOUVEAU** - gestion etat sauvegarde aventure
- `index.html` : script tag pour `adventureStateManager.js`
