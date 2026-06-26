# Upgrades deblocables + Artefacts (Arena)

## Concept general

2 systemes complementaires pour la progression long-terme du mode Arena:

1. **Upgrades deblocables** : certaines upgrades sont verrouillees au debut. Le pool initial est restreint. 
   Chaque deblocage ajoute une upgrade au pool permanent.
2. **Artefacts** : equiper 1-2 artefacts avant chaque run. Chaque artefact modifie les poids des upgrades
   dans le pool (certaines upgrades deviennent X fois plus probables).

Inspire de Hades 2 (dieux favoris / weight system) + systeme de deblocage permanent.

---

## Partie 1 : Upgrades deblocables

### Etat actuel

Actuellement, toutes les upgrades sont disponibles dans `ArenaStateManager.getPossibleUpgrades()`:
- `damageBoost` (+2 degats)
- `healBoost` (+2 soin)
- `shieldBonus` (+2 bouclier)
- `manaReduction` (-1 mana, 1 fois max)
- `cardDrawBonus` (+1 pioche, 1 fois max)
- `bonusHealEffect` (+2 soin supplementaire, 1 fois max)
- `extraHitBonus` (+1 hit, 1 fois max, cible aleatoire uniquement)

### Design propose

**Pool de base (debloque par defaut)** :
| Upgrade | Valeur | Condition technique |
|---------|--------|-------------------|
| damageBoost | +2 degats | card.damage > 0 |
| healBoost | +2 soin | card.healing > 0 |
| shieldBonus | +2 bouclier | card.shield > 0 |
| manaReduction | -1 mana (1x) | toujours dispo |

**Pool avance (a debloquer)** :
| Upgrade | Valeur | Condition technique | Deblocage |
|---------|--------|-------------------|-----------|
| cardDrawBonus | +1 pioche (1x) | toujours dispo | Gagner 3 runs Arena |
| bonusHealEffect | +2 soin supp (1x) | card.healing > 0 | Soigner 500 PV total |
| extraHitBonus | +1 hit (1x) | card.targetType === 'random' | Infliger 1000 degats en Arena |
| damageBoost Lv2 | +3 degats (au lieu de +2) | quand damageBoost deja pris | Gagner avec 3 classes differentes |
| manaReduction Lv2 | -2 mana (au lieu de -1) | quand manaReduction deja pris | Terminer l'Arena sans perdre de PV |
| elemtalFocus | +1 degat elementaire bonus | card.type (feu/givre/foudre) | Declencher 50 reactions elementaires |
| piercing | ignore 2 bouclier ennemi | card.damage > 0 | Tuer 100 ennemis en Arena |

### Integration technique

**Nouveau fichier** : `game/unlockableUpgradesConfig.js`
```js
const UNLOCKABLE_UPGRADES = {
    cardDrawBonus: {
        label: "Pioche +1",
        unlockCondition: () => AchievementManager.getStat('arenaWins') >= 3,
        defaultUnlocked: false
    },
    bonusHealEffect: {
        label: "Soin renforce",
        unlockCondition: () => AchievementManager.getStat('totalHealingArena') >= 500,
        defaultUnlocked: false
    },
    // ...
};
```

**Modification** : `ArenaStateManager.getPossibleUpgrades()`
- Filtrer les upgrades possibles via `UNLOCKABLE_UPGRADES`
- Si une upgrade n'est pas debloquee, l'exclure du tableau `possible`

**Stockage** :
- Les stats de progression sont deja persistees via `AchievementManager.setCombatStat()`
- Pas de nouveau stockage necessaire

---

## Partie 2 : Artefacts (Hades 2 style)

### Concept

Avant chaque run Arena, le joueur equipe 1-2 artefacts.
Chaque artefact modifie les **poids** des upgrades dans le pool :

Au lieu de `Math.random()` uniforme sur les upgrades possibles, on utilise un **weighted random** :
```js
const weights = {};
for (const effect of possibleEffects) {
    weights[effect] = 1; // poids de base
    if (activeArtifact?.weightModifiers?.[effect]) {
        weights[effect] *= activeArtifact.weightModifiers[effect];
    }
}
// Selection ponderee
```

### Liste d'artefacts

| Artefact | Effet poids | Deblocage |
|----------|------------|-----------|
| Braise Runique | upgrades feu (type feu) x2 | Gagner 1 run avec Pyromancien |
| Eclat de Glace | upgrades givre (type givre) x2 | Gagner 1 run avec Cryomancien |
| Cristal de Mana | `manaReduction` x2.5 | Gagner 1 run avec Archimage |
| Pierre de Sang | `healBoost` / `bonusHealEffect` x2 | Gagner 1 run avec Necromancien |
| Eclat de Foudre | upgrades foudre x2 | Gagner 1 run avec Electromancien |
| Fragment Runique | upgrades de la classe du heros x2 | Gagner 1 run avec chaque classe |
| Oeil du Gardien | `shieldBonus` x2.5 | Terminer l'Arena avec plus de 50 bouclier |
| Gantelet du Forgeron | `damageBoost` x2.5 | Infliger 500 degats en 1 run |
| Voile Spectral | `extraHitBonus` / `cardDrawBonus` x2 | Terminer l'Arena en 8 rounds ou moins |
| Coeur Ancien | toutes les upgrades de soin x2 | Soigner 1000 PV total |

### Objets legendaires (influences fortes)

| Artefact | Effet | Deblocage |
|----------|-------|-----------|
| Tablette Primordiale | toutes les upgrades de base x1.5, mais les upgrades avancees x0.5 | Debloquer tous les artefacts precedents |
| Masque du Chaos | 3 choix au lieu de 3, mais chaque upgrade a un effet secondaire aleatoire | Succes cache |

### Integration technique

**Nouveau fichier** : `game/artifactConfig.js`
```js
const ARTIFACT_CONFIG = {
    braiseRunique: {
        name: "Braise Runique",
        description: "Les upgrades feu apparaissent 2x plus souvent",
        weightModifiers: { damageBoost: 2 },
        typeFilter: 'fire',
        unlockCondition: () => /* ... */
    },
    // ...
};
```

**Modification** : `ArenaStateManager.generateUpgradeChoices()`
- Ajouter `activeArtifactIds` en parametre
- Charger les artefacts depuis `ArtifactManager.getEquipped()`
- Appliquer les modificateurs de poids avant la selection
- Filtrer les upgrades possibles par `typeFilter` si applicable

**Nouveau fichier** : `game/artifactManager.js` (singleton)
- `getEquipped()` → tableau des artefacts actifs
- `equip(artifactId)`, `unequip(artifactId)`
- Stockage dans localStorage sous `artifactEquipSlots[]`
- Limite a 1-2 slots

### UI

**Nouvel ecran** : `screens/arena/artifactSelectionScreen.js`
- Affiche avant le draft Arena (apres selection de classe)
- Grille d'artefacts debloques
- Click pour equiper/dequiper
- Indication visuelle des artefacts debloquables mais pas encore debloques (cadenas)

---

## Plan d'implementation

### Session 1 : Base technique upgrades deblocables
1. Creer `game/unlockableUpgradesConfig.js`
2. Modifier `ArenaStateManager.getPossibleUpgrades()` avec filtrage
3. Creer `game/artifactConfig.js`
4. Creer `game/artifactManager.js` (singleton, stockage)
5. Modifier `ArenaStateManager.generateUpgradeChoices()` avec poids

### Session 2 : UI artefacts
1. Creer `screens/arena/artifactSelectionScreen.js` + HTML + CSS
2. Integrer l'ecran dans le flow Arena (apres choix de classe)
3. Test : verifier que les poids modifient bien les chances

### Session 3 : Conditions de deblocage + polish
1. Implementer les conditions de deblocage (lier aux stats existantes ou creer les stats manquantes)
2. UI de progression (indicateur "X/6 upgrades debloquees" dans le menu principal)
3. Cadenas / tooltip sur les artefacts non debloques
4. Tests de regression (le pool de base doit fonctionner sans aucun deblocage)
