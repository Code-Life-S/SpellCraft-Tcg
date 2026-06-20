# Idees Gameplay - Spell Caster TCG

Date: 20 Juin 2026

---

## 1. Classes / Heros

Chaque classe a :
- **1 Passif** (effet permanent pendant la run)
- **3 Cartes de classe** (ajoutees au deck au debut de la run)
- Le joueur choisit sa classe avant chaque run

### Pyromancien (Feu offensif)

- **Passif** : Vos sorts de Feu infligent +1 degat
- **Carte 1 - Boule de Feu** : 4 degats a un ennemi (mana 2)
- **Carte 2 - Bouclier de Flammes** : Quand vous lancez un sort Feu, gagnez 1 bouclier (mana 2)
- **Carte 3 - Conflagration** : Les ennemis Brules prennent +2 degats par sort qui les cible (mana 3)

Style de jeu : Aggressif, bruler les ennemis et frapper fort.

### Cryomancien (Givre controle)

- **Passif** : Vos sorts de Givre appliquent Gele pendant 1 tour supplementaire
- **Carte 1 - Barriere de Glace** : Gagnez 4 bouclier (mana 2)
- **Carte 2 - Blizzard** : 1 degat a tous les ennemis + les gele (mana 4)
- **Carte 3 - Armure de Givre** : Quand un ennemi vous attaque, gagnez 1 bouclier (mana 2)

Style de jeu : Controle, defense, geler les ennemis pour empecher les degats.

### Tempetier (Foudre chaines)

- **Passif** : Vos sorts de Foudre infligent 1 degat aux ennemis adjacents a la cible
- **Carte 1 - Eclair en Chaine** : 2 degats a la cible, 1 degat a chaque adjacent (mana 3)
- **Carte 2 - Paratonnerre** : Les ennemis Electrises subissent +1 degat par degat de sort (mana 2)
- **Carte 3 - Tempete** : 2 degats a tous les ennemis + les electrise (mana 5)

Style de jeu : Degats en chaine, interactions entre ennemis, fort contre les groupes.

### Archimage (Arcane utilite)

- **Passif** : Tous les 3 sorts lances, piochez 1 carte
- **Carte 1 - Orbe de Mana** : Gagnez 2 mana, piochez 1 carte (mana 2)
- **Carte 2 - Explosion Arcanique** : 2 degats + remettez une copie du sort dans votre main (mana 3)
- **Carte 3 - Deja Vu** : Le dernier sort que vous avez lance revient dans votre main (mana 1)

Style de jeu : Combos, cycle de cartes, utilisation maximale du mana.

### Necromancien (Sustain / mort)

- **Passif** : Quand un ennemi meurt, gagnez 1 PV
- **Carte 1 - Drain d'Ame** : 2 degats a un ennemi, vous soigne de 2 (mana 2)
- **Carte 2 - Bouclier d'Ossements** : Gagnez un bouclier egal au nombre d'ennemis en vie (mana 2)
- **Carte 3 - Moisson d'Ame** : Degats a un ennemi = total des degats que vous avez infliges ce combat aux ennemis (mana 4, max 10)

Style de jeu : Survivre, user les ennemis, valeur croissante au fil du combat.

### Ombrelumiere (Risque/Recompense)

- **Passif** : Vous pouvez depenser 2 PV pour gagner 1 mana (1 fois par tour)
- **Carte 1 - Pacte Obscur** : Perdez 3 PV, gagnez 3 mana (mana 0)
- **Carte 2 - Drain de Vie** : 2 degats, vous soigne de la moitie des degats infliges ce tour (mana 3)
- **Carte 3 - Explosion de l'Ombre** : Degats a un ennemi = vos PV manquants (mana 2, max 8)

Style de jeu : Jouer avec sa vie comme ressource, pivotements, haute dose d'adrenaline.

### Elementaliste (Synergies reactions)

- **Passif** : Les reactions elementaires infligent +1 degat ou +1 bonus
- **Carte 1 - Fureur Elementaire** : La prochaine reaction elementaire que vous declenchez ce tour est amplifiee (x1.5) (mana 2)
- **Carte 2 - Totem de Feu** : Invoque un totem avec 3 PV. Au debut de votre tour, inflige 1 degat a un ennemi aleatoire (mana 3)
- **Carte 3 - Cataclysme** : Applique Brulure et Electrise a un ennemi. S'il a deja les deux, inflige 4 degats bonus (mana 4)

Style de jeu : Maitrise des reactions, planification a plusieurs tours, gros burst.

---

## 2. Capacites ennemies

Chaque ennemi peut avoir **1 capacite** (pas plus, pour rester lisible). La capacite est visible via une icone sur la carte ennemie.

### Capacites de base (pour le MVP)

| Capacite | Effet | Icone |
|---|---|---|
| **Provocation** | Doit etre tue avant de pouvoir cibler les autres ennemis | Bouclier |
| **Bouclier Divin** | Bloque completement le prochain sort subi (1 fois) | Bouclier dore |
| **Soigneur** | Soigne un allie de 2 PV en fin de tour | Croix |
| **Clonage** | En fin de tour, si plein PV, cree une copie 1/1 (sans capacite) | Ombre |
| **Enrager** | Gagne +2 attaque quand ses PV passent sous 50% | Eclairs |
| **Invocation** | Au debut de son tour, invoque un sbire 1/1 | Portail |

### Capacites avancees (contenu futur)

| Capacite | Effet |
|---|---|
| **Camouflage** | Ne peut pas etre cible par les sorts 1 tour sur 2 |
| **Vol de Vie** | Se soigne de la moitie des degats infliges au hero |
| **Aura de Soin** | Soigne tous les allies de 1 PV en fin de tour |
| **Brulure de Mana** | Quand il attaque, vous brule 1 mana |
| **Reflet** | Quand vous le ciblez avec un sort, vous prend 1 degat |
| **Sacrifice** | Quand il meurt, donne +2 attaque a un allie aleatoire |
| **Rancune** | Gagne +1 attaque permanente a chaque fois qu'il subit un sort |
| **Stun** | Au debut de son tour, il empeche l'ennemi le plus a gauche d'attaquer ce tour |
| **Absorption** | Quand il tue un ennemi allie (clones, sbires), il gagne ses stats |

---

## 3. Evenements temporaires (cycles ~1-2 semaines)

Inspires des "Tavern Brawls" Hearthstone. Changent les regles du jeu pour une duree limitee. Donnent une raison de revenir regulierement.

### Evenement 1 : Double Classe
- Vous choisissez 2 classes et obtenez les passifs et les cartes des deux
- Decks plus longs, combos plus fous
- Objectif : finir la campagne avec ce deck hybride

### Evenement 2 : Boss de la Semaine
- Un boss special (plus dur que la normale) avec des regles uniques
- Pas de vagues avant, juste le boss
- Score base sur le nombre de tours pour le vaincre
- Classement hebdomadaire

### Evenement 3 : Deck Preconstruit
- On vous donne un deck fixe (sans choix)
- Vous devez gagner avec
- Decks themes : "Tout Feu Tout Flamme" (que des sorts feu), "Givre Total" (que du givre), etc.
- Recompense : parchemin ancien ou cosmetique exclusif

### Evenement 4 : Mana Infini
- Chaque tour, vous avez 10 mana au lieu du mana croissant
- Les ennemis sont plus nombreux et plus forts
- Objectif : survivre le plus de vagues possible

### Evenement 5 : Ennemis Capacites
- Tous les ennemis ont 2 capacites au lieu d'une
- Mode difficile pour joueurs experimentes
- Badge special pour les vainqueurs

### Evenement 6 : Essai Gratuit
- Toutes les classes sont jouables (meme celles non debloquees)
- Permet aux joueurs de tester avant d'acheter/debloquer

### Evenement 7 : Defi du Vide
- Les ennemis ont des effets aleatoires qui changent chaque tour
- "Les ennemis gagnent bouclier divin ce tour", "Tous les ennemis clonent ce tour", etc.
- Chaos total, survie jusqu'a la fin

### Systeme de recompenses

| Evenement | Recompense participation | Recompense victoire |
|---|---|---|
| Participation | 1 Parchemin Ancien | - |
| 1ere victoire | 3 Parchemins Anciens | - |
| 5 victoires | 5 Parchemins Anciens | Badge evenement |
| Tops scores | - | Badge exclusif + cosmetique |

---

## 4. Interactions Classe + Ennemi (gameplay emergent)

Quelques exemples de synergies et situations uniques :

- **Cryomancien vs Enrager** : Gelez l'ennemi avant qu'il passe sous 50% HP. Il ne peut pas attaquer ni s'enrager.
- **Tempetier vs Clonage** : Les eclairs en chaine touchent le clone, nettoyant les sbires.
- **Ombrelumiere vs Brulure de Mana** : On vous vole du mana, mais vous pouvez en recreer avec votre passif (PV -> mana).
- **Necromancien vs Invocation** : Les sbires meurent -- vous regagnez de la vie a chaque fois.
- **Pyromancien vs Bouclier Divin** : Le bouclier bloque un hit, mais Brulure traverse (degats de tour).
- **Archimage + Double Classe avec Tempetier** : Beaucoup de sorts lanc, l'Archimage pioche sans cesse.

### Matrice capacites ennemies vs classes

| Ennemi \ Classe | Pyro | Cryo | Tempe | Archi | Necro | Ombre | Ele |
|---|---|---|---|---|---|---|---|
| Provocation | Brulure traverse | Gele ignore | Chaine rebondit | Utilite contourne | Drain traverse | Explosion brute | Reactions traversent |
| Bouclier Divin | Brise + Brulure | Gele ne brise pas | Chaine brise | Copie contourne | Drain brise | Pacte prepare | Totem use |
| Soigneur | Brulure > soin | Gele empeche soin | Prioriser tueur | Copie le soin | Outvalue le soin | Burst > soin | Reactions > soin |
| Clonage | AOE nettoie | Gele le clone | Chaine tue clone | Copie le clone | Tue le clone = vie | Ignore le clone | Totem tue clone |
| Enrager | Burst avant enrage | Gele empeche | Degats > seuil | Cycle vite | Use lentement | Risque d'enrage | Reactions amplifiees |
| Invocation | AOE facile | Gele invoc | Chaine tue invoc | Copie l'invoc | Invoc mort = vie | Ignore invoc | Totem contre invoc |
