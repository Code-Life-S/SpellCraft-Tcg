## Arena
Great. Now that you get the context, lets work on improving our game ! Lets brainstorm together. I want us to work on the Arena game mode.
Read Arena_mode_task.md to know what have been done already.
In the mode Arena, the player will face enemies little and weak at the beginning. Round after round, there will be more enemies and/or stronger ones.
Between rounds the player will be able to heal himself and he will be able to choose between spells to upgrade (yet in his deck, or can choose to add a new card to his deck).
There will be three choices between upgrades. CHoices can be - for example - a new card to add to the deck. Or to upgrade a spell.

C'est mieux mais en mode arène il y a deux fois le tour 1.
Je vois parfois des attaques d'ennemis qui n'existent pas s'afficher, des effets de particules se jouaient alors que les cartes correspondances n'ont pas été jouées.Peux-tu vérifier s'il n'y a pas un problème ?
Je préfère que l'on supprime certains des messages qui s'affichent : Quand un ennemi attaque pour faire X dégâts, ce n'est pas intéressant d'afficher cela. Idem pour les messages des sorts qui font des dégats, soignent, ect.. pas besoin d'afficher ces messages.

J'ai remarqué que l'affichage des cartes dans la création de deck n'est pas affiché de la même façon que sur les autres écrans. J'aimerais que les cartes affichées dans le deck builder aient le même affichage qu'ailleurs.

- Dans le mode arène, pour les phases d'upgrade et d'ajout de cartes au deck, on va inverser ces deux phases. D'abord le joueur ajoute les cartes à son deck et ensuite il upgrade.
Comme ça, même les cartes ajoutées vont bénéficier des bonus d'upgrade. Si jamais le bonus d'upgrade porte sur une des cartes ajoutées.
- On va revoir les descriptions des cartes comme suit (pour raccourcir et uniformiser) :
    - X damage to All (au lieu des "Deal X damage to all enemies.")
    - X damage to Target (au lieu des "Target enemy take 2 damage.")
    - Draw X (au lieu de "Draw X cards.")
    - +X mana (au lieu de "Gain +X mana.")
- Les descriptions des cartes en mode arene sont mises à jour comme ceci, pour afficher TOUS les effets des upgrades successives :
    - Exemple avec "Magic missile" qui est "X damage to Target" si on ajoute 1 Draw, devient "X damage to Target. Draw 1".
    Si on upgrade à nouveau avec "+2 mana" les cartes "Magic missile" la description évolue à nouveau "X damage to Target. Draw 1. +X mana" (idéalement chaque nouvelle action sur une nouvelle ligne mais vérifier que cela rentre en hauteur sur la carte. Peut etre agrandir la partie description de la carte si besoin)