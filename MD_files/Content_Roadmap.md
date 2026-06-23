# Content Roadmap - Spell Caster TCG

Date: 21 Juin 2026

---

## Bloc A -- Nouvelles cartes (10-15 sorts)

### A1. Morsure de Givre (Frost Bite)
| Champ | Valeur |
|---|---|
| Mana | 2 |
| Rarete | common |
| Effet | 4 degats si ennemi gele, sinon 2 degats |
| Element | frost |
| Cible | single |
| Mecanique | Condition -- synergise avec Cryomancien |
| Complexite | Faible -- logique conditionnelle dans l'effet |

### A2. Eclairs en Chaine (Chain Lightning)
| Champ | Valeur |
|---|---|
| Mana | 3 |
| Rarete | rare |
| Effet | 2 degats a la cible, 1 degat a chaque ennemi adjacent |
| Element | lightning |
| Cible | single (avec ricochet) |
| Mecanique | Positionnement -- touche les voisins |
| Complexite | Faible -- besoin de la notion d'adjacent |

### A3. Surge de Pouvoir (Power Surge)
| Champ | Valeur |
|---|---|
| Mana | 2 |
| Rarete | common |
| Effet | Ce tour, vos sorts coutent 1 de moins |
| Element | arcane |
| Cible | self |
| Mecanique | Reduction de mana temporaire |
| Complexite | Moyenne -- modifie le cout des sorts pour le tour |

### A4. Piege de Flammes (Flame Trap)
| Champ | Valeur |
|---|---|
| Mana | 2 |
| Rarete | rare |
| Effet | Pose un piege invisible. 3 degats au premier ennemi qui attaque |
| Element | fire |
| Cible | self |
| Mecanique | Piege -- se declenche automatiquement |
| Complexite | Moyenne -- etat persistant sur le terrain |

### A5. Drain Vampirique (Vampiric Drain)
| Champ | Valeur |
|---|---|
| Mana | 2 |
| Rarete | common |
| Effet | 4 degats a un ennemi, vous soigne de la moitie |
| Element | arcane |
| Cible | single |
| Mecanique | Lifesteal partiel (moitie des degats) |
| Complexite | Faible -- lifesteal existe deja, moitie a implementer |

### A6. Tempete de Grele (Hail Storm)
| Champ | Valeur |
|---|---|
| Mana | 3 |
| Rarete | rare |
| Effet | 1 degat a tous les ennemis + les gele |
| Element | frost |
| Cible | all |
| Mecanique | Multi-effet -- degats + freeze combines |
| Complexite | Faible -- combine existants |

### A7. Rituel Arcanique (Arcane Ritual)
| Champ | Valeur |
|---|---|
| Mana | 3 |
| Rarete | rare |
| Effet | Pioche 2 cartes, gagne 5 bouclier |
| Element | arcane |
| Cible | self |
| Mecanique | Multi-effet -- draw + shield |
| Complexite | Faible -- combine existants |

### A8. Affaiblissement (Weaken)
| Champ | Valeur |
|---|---|
| Mana | 1 |
| Rarete | common |
| Effet | L'ennemi cible perd 2 d'attaque pour ce tour |
| Element | arcane |
| Cible | single |
| Mecanique | Debuff temporaire d'attaque |
| Complexite | Faible -- debuff sur ennemi, reset en fin de tour |

### A9. Bouclier d'Energie (Energy Barrier)
| Champ | Valeur |
|---|---|
| Mana | 2 |
| Rarete | rare |
| Effet | Invoque un bouclier avec 3 PV. Le bouclier encaisse les degats a votre place |
| Element | arcane |
| Cible | self |
| Mecanique | Invocation defensive -- absorbe les degats jusqu'a destruction |
| Complexite | Moyenne -- entite avec PV, intercepte les degats |

### A10. Echo Arcanique (Arcane Echo)
| Champ | Valeur |
|---|---|
| Mana | 1 |
| Rarete | epic |
| Effet | Relance le dernier sort que vous avez joue (cout 0) |
| Element | arcane |
| Cible | special |
| Mecanique | Copie du dernier sort -- combo puissant |
| Complexite | Moyenne -- besoin de track le dernier sort |

### A11. Prophecie (Prophecy)
| Champ | Valeur |
|---|---|
| Mana | 1 |
| Rarete | rare |
| Effet | Regarde les 3 prochaines cartes de votre deck, pioche-en 1 |
| Element | arcane |
| Cible | self |
| Mecanique | Selection -- peek + pick |
| Complexite | Moyenne -- popup de selection, interaction utilisateur |

### A12. Surcharge Pyromantique (Pyromantic Overload)
| Champ | Valeur |
|---|---|
| Mana | 1 |
| Rarete | rare |
| Effet | Le prochain sort de feu que vous lancez ce tour fait le double de degats. Vous prenez 2 degats |
| Element | fire |
| Cible | self |
| Mecanique | Risque/Recompense -- double degats mais self-damage |
| Complexite | Faible -- buff temporaire + self-damage |

### A13. Nova de Givre (Frost Nova v2 -- cartes de classe Cryomancer)
| Champ | Valeur |
|---|---|
| Mana | 2 |
| Rarete | rare |
| Effet | Freeze + 1 degat a tous les ennemis |
| Element | frost |
| Cible | all |
| Classe | cryomancer |
| Mecanique | Remplacerait l'actuelle Frost Nova neutre -- deja implementee |
| Complexite | N/A -- deja codee comme cryo_frost_nova dans spells.json |

Note: cryo_frost_nova existe deja mais n'est pas dans le deck de classe Cryomancer actuel. A verifier si elle est bien attribuee.

### A14. Barriere de Glace amelioree (carte de classe Cryomancer)
Deja implementee : cryo_ice_barrier (bouclier 8, mana 2)

### A15. Marteau de Lumiere (Light Hammer)
| Champ | Valeur |
|---|---|
| Mana | 4 |
| Rarete | epic |
| Effet | 3 degats a un ennemi. S'il meurt, inflige 2 degats a tous les autres ennemis |
| Element | holy |
| Cible | single |
| Mecanique | Explosion -- degats de zone conditionnels a la mort |
| Complexite | Moyenne -- verifie si la cible meurt, puis AOE |

---

## Bloc B -- Nouvelles capacites ennemies

### B1. Vol de Vie (Lifestrike)
| Detail | Valeur |
|---|---|
| Effet | L'ennemi se soigne de la moitie des degats qu'il inflige au hero |
| Declencheur | Quand il attaque |
| Ennemi exemple | Vampire Lord |
| Icone proposee | Coeur |
| Complexite | Faible -- lifesteal existe deja du cote joueur |

### B2. Aura de Soin (Healing Aura)
| Detail | Valeur |
|---|---|
| Effet | Soigne tous les allies de 1 PV en fin de tour |
| Declencheur | Fin du tour ennemi |
| Ennemi exemple | Dark Priest / Acolyte |
| Icone proposee | Croix + cercles |
| Complexite | Faible -- similaire a Soigneur mais en AOE |

### B3. Rancune (Vengeful)
| Detail | Valeur |
|---|---|
| Effet | Gagne +1 attaque permanente a chaque fois qu'il subit un sort |
| Declencheur | Quand il subit des degats de sort |
| Ennemi exemple | Vengeful Spirit / Wrath Phantom |
| Icone proposee | Poing |
| Complexite | Faible -- compteur + buff attack permanent |

### B4. Brulure de Mana (Mana Burn)
| Detail | Valeur |
|---|---|
| Effet | Quand il attaque le hero, vous perdez 1 mana (minimum 0) |
| Declencheur | Quand il inflige des degats au hero |
| Ennemi exemple | Mana Fiend / Mana Wraith |
| Icone proposee | Goutte + fleche bas |
| Complexite | Faible -- reduit le mana du joueur |

### B5. Camouflage (Shroud)
| Detail | Valeur |
|---|---|
| Effet | Ne peut pas etre cible par les sorts 1 tour sur 2 |
| Declencheur | Permanent, toggle chaque tour |
| Ennemi exemple | Shadow Assassin / Phantom |
| Icone proposee | Oeil barre |
| Complexite | Moyenne -- toggle d'etat chaque tour |

### B6. Sacrifice (Sacrifice)
| Detail | Valeur |
|---|---|
| Effet | Quand il meurt, donne +2 attaque permanente a un allie aleatoire |
| Declencheur | A sa mort |
| Ennemi exemple | Fanatique / Cultist |
| Icone proposee | Fleche vers le haut |
| Complexite | Faible -- buff sur la mort |

### B7. Absorption (Absorb)
| Detail | Valeur |
|---|---|
| Effet | Quand un allie meurt a cote de lui, il gagne ses statistiques (ATK/HP) |
| Declencheur | Mort d'un allie adjacent |
| Ennemi exemple | Devourer / Void Beast |
| Icone proposee | Tourbillon |
| Complexite | Moyenne -- detecter mort d'adjacent, transfert de stats |

---

## Bloc C -- Systeme de succes (15-20 achievements)

### Categorie : Progression

| Succes | Condition | Recompense proposee |
|---|---|---|
| Premiere victoire | Gagner votre premiere partie | Titre "Novice" |
| Veteran | Gagner 50 parties | Titre "Veteran" |
| Collectionneur | Debloquer toutes les cartes neutres | Titre "Collectionneur" |
| Maitre des classes | Gagner un run arena avec chaque classe | Titre "Maitre des Classes" |
| Unlocked | Debloquer Necromancien | -- (deja une recompense) |

### Categorie : Combat

| Succes | Condition | Recompense proposee |
|---|---|---|
| Pyromane | Infliger 50+ degats de feu en un combat | Icone de feu |
| Givre eternel | Geler 4 ennemis differents en un combat | Icone de glace |
| Braseur de mana | Lancer 10+ sorts en un tour | Titre "Brasseur" |
| Sans egratignure | Gagner un combat sans perdre de PV | Titre "Parfait" |
| Survivant | Gagner un combat alors qu'il vous reste 1 PV | Titre "Survivant" |
| Bouclier de fer | Accumuler 30+ bouclier en un combat | Titre "Forteresse" |
| Speedrun | Gagner un combat en 2 tours ou moins | Titre "Eclair" |
| Plein aux as | Avoir 10+ cartes en main | -- |

### Categorie : Arena

| Succes | Condition | Recompense proposee |
|---|---|---|
| Champion d'arene | Gagner un run arena (n'importe quelle classe) | Titre "Champion" |
| Vainqueur legendaire | Gagner un run arena sans perdre de PV (boss inclus) | Titre "Legendaire" |
| Chasseur de boss | Battre chaque type de boss (Roi Squelette, Mage Noir, Dragon) | Icone de boss |
| Invincible | Gagner 3 runs arena consecutifs | Titre "Invincible" |
| Full deck | Completer un draft arena sans prendre de carte de classe (neutres uniquement) | -- |

### Categorie : Defi

| Succes | Condition | Recompense proposee |
|---|---|---|
| Le Collectionneur | Avoir 3 copies d'une meme carte en main | -- |
| Reaction en chaine | Declencher une reaction elementaire 3 fois en un combat | Titre "Alchimiste" |
| Boss Rush | Battre le boss en 5 tours ou moins | Titre "Boss Slayer" |

### Categorie : Farm

| Succes | Condition | Recompense proposee |
|---|---|---|
| Niveau 10 | Atteindre le niveau 10 | Skin de carte |
| Niveau 20 | Atteindre le niveau 20 | Skin de hero |
| XP Farmer | Gagner 10000 XP total | -- |

---

## Bloc D -- Defi quotidien

### Principe
1 run par jour avec des regles speciales (modificateurs). Recompense unique pour fideliser.

### Modificateurs possibles

| Modificateur | Effet |
|---|---|
| **Mana Infini** | Chaque tour, mana max = 10 (pas de croissance) |
| **Ennemis Capacites+** | Tous les ennemis ont 2 capacites au lieu d'une |
| **Deck Preconstruit** | Vous jouez avec un deck fixe choisit aleatoirement |
| **Classe Gratuite** | Toutes les classes sont disponibles (ignore les verrouillages) |
| **Vagues Multipliees** | 2x plus d'ennemis par vague |
| **Soin Zero** | Aucun soin entre les rounds (Arena uniquement) |
| **Mana Reduit** | Cout des sorts reduit de 1 (minimum 0) |
| **Ennemis Geants** | Tous les ennemis ont +50% HP |
| **Miroir** | Vous commencez avec une copie de chaque carte dans votre deck |
| **Pauvre** | Vous commencez avec 0 carte en main (mulligan saute) |
| **Elements Aleatoires** | Chaque sort que vous lancez a un element aleatoire |

### Rotation proposee
- Lundi : Mana Infini
- Mardi : Ennemis Geants
- Mercredi : Deck Preconstruit
- Jeudi : Soin Zero
- Vendredi : Ennemis Capacites+
- Samedi : Elements Aleatoires
- Dimanche : Joueur choisit son modificateur

### Recompenses
- Participation : 50 XP bonus
- Victoire : Parchemin ancien (cosmetique) ou titre exclusif
- 7 defis completes dans la semaine : Badge hebdomadaire

---

## Bloc E -- Nouvelles classes (2-4)

Voir Gameplay_Idees.md pour les descriptions detaillees. Priorite suggeree :

1. **Tempetier (Foudre)** -- le plus different, ajoute la mecanique de chaine
2. **Archimage (Arcane)** -- utilise les nouvelles cartes de cycle/pioche
3. **Ombrelumiere (Risque)** -- ajoute la tension PV/ressource
4. **Elementaliste (Reactions)** -- dependant des mecaniques elementaires

Chaque nouvelle classe ajoute :
- 1 passif unique
- 3 cartes de classe
- 1 nouvelle mecanique au jeu

---

## Priorites suggerees

### Court terme (1-2 sessions)
- Bloc A : 5-6 cartes faciles (Morsure de Givre, Drain Vampirique, Tempete de Grele, Rituel Arcanique, Surcharge Pyromantique, Affaiblissement)
- Bloc B : 2-3 capacites (Vol de Vie, Aura de Soin, Rancune)

### Moyen terme (3-5 sessions)
- Bloc A : cartes complexes restantes (Piege, Bouclier, Echo, Prophecie, Eclairs en Chaine, Marteau de Lumiere)
- Bloc B : capacites restantes (Brulure de Mana, Camouflage, Sacrifice, Absorption)
- Bloc C : systeme de succes (15-20 achievements)

### Long terme (5-10 sessions)
- Bloc D : Defi quotidien complet (modificateurs, rotation, recompenses)
- Bloc E : 2 nouvelles classes (Tempetier + Archimage)

---

## Bloc F -- Bonus passifs (Mode Aventure)

Inspires de Balatro. Le joueur choisit un bonus tous les 5 rounds pour personnaliser sa run.

### Principe
- Un choix de 2-3 bonus propose tous les 5 rounds (rounds 5, 10, 15...)
- Les bonus sont cumulables (ex: Main +1 trois fois = +3 cartes)
- Persistants pour toute la duree de la run
- Visibles dans l'interface (icones a cote du portrait hero)

### Liste des bonus proposes

| Bonus | Effet | Rareté |
|---|---|---|
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

## Notes techniques

- Nouvelles cartes : ajouter dans cards/spells.json, puis dans le tableau de deblocage (CARD_UNLOCK_TABLE) si necessaire
- Nouvelles capacites : ajouter dans game/enemyAbilitiesConfig.js, puis assigner aux ennemis dans les screens de combat
- Succes : nouveau fichier game/achievementManager.js, stockage localStorage separe
- Defi quotidien : nouveau fichier game/dailyChallengeManager.js, seed basee sur la date
- Nouvelles classes : nouveau fichier de config, maj classManager.js, maj classConfig.js, ajout des cartes associees
