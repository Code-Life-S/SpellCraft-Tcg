# Spell Caster - Coding Standards

Date: 25 Juin 2026

---

## File Organisation

### Screen Modules (screens/)
Each screen has its own folder with three files:
```
screens/<screen-name>/
  screenName.js       # Logic and behavior
  screenName.html     # HTML structure
  screenName.css      # Screen-specific styling (non-shared rules only)
```

### Components (screens/components/)
Reusable UI components go in their own folder:
```
screens/components/<component-name>/
  componentName.js    # Component class
  componentName.css   # Component styling
```
Component JS files are loaded via `<script>` in `index.html`.
Component CSS is loaded dynamically via `templateLoader.loadCSS()` in the consuming screen's `setupContent()`.

### Shared Resources (screens/shared/)
CSS shared between multiple screens lives in `screens/shared/`.
Each screen loads shared CSS via `templateLoader.loadCSS()` before its own component CSS.

---

## DRY Principles

### Eliminate Duplication
- Extract repeated code blocks into reusable components under `screens/components/`
- Merge identical CSS into `screens/shared/` shared stylesheets
- Use the `deckAccessor` pattern when a component needs screen-specific data operations

### When to Create a Component
Create a component when the same UI/logic appears in 2+ screens. A component should:
- Accept configuration via constructor options or method parameters
- Not import or reference specific screen modules
- Communicate results via callbacks
- Manage its own DOM within a container element provided by the screen

---

## Event Binding

### Use addEventListenerSafe
All screens extend `BaseScreen` which provides `addEventListenerSafe(element, event, handler)`.
This ensures listeners are cleaned up when the screen is destroyed. Never use:
- Raw `addEventListener` (can leak)
- `onclick` attributes in HTML
- `element.onclick = ...` in JS

### Event Delegation
For collections of similar elements (cards in hand, enemies), use event delegation on a common parent rather than binding per-element listeners:
```javascript
this.addEventListenerSafe(this.playerHandEl, 'click', function(e) {
    var cardEl = e.target.closest('.card');
    if (!cardEl) return;
    // handle card click
});
```

### Exceptions
Components may use raw `addEventListener` when they manage their own lifecycle (and clean up in a `destroy()` method).

---

## CSS Rules

### Shared First
Always put shared styles in `screens/shared/gameCommon.css`. Keep only unique styles in screen-specific CSS files.

### Class-Based State
Use CSS classes (not inline styles) for state changes:
- Add/remove `.visible`, `.hidden`, `.selected`, `.disabled` classes
- Use `!important` only when overriding external/component styles
- Avoid inline style manipulation in JS

### Specificity
Use minimal specificity. Prefer class selectors over ID selectors. Avoid chaining selectors when not needed.

---

## JavaScript Conventions

### Variable Declarations
Use `var` consistently (matching existing codebase convention).

### Namespace
All screen and component classes are exported to `window`:
```javascript
window.GameScreen = GameScreen;
```

### Component API Pattern
Components expose a clean public API:
- Constructor: `new Component(rootElement, options)`
- Methods: `start()`, `update()`, `hide()`, `destroy()`
- Callbacks: passed as options or config object

### DeckAccessor Pattern
When a component needs to interact with screen-specific data (deck operations, etc.), pass an accessor object:
```javascript
component.start(data, {
    returnCards: function(cards) { /* screen-specific */ },
    drawCards: function(count) { /* screen-specific */ }
}, {
    onComplete: function(result) { /* callback */ }
});
```

---

## Template Architecture

### Screen Lifecycle
1. Constructor: Set default state
2. `setupContent()`: Load HTML template, CSS, create component instances
3. `onBeforeShow()`: Refresh data, update UI before becoming visible
4. `onShow()`: Post-visibility hooks (animations, etc.)
5. `onBeforeHide()`: Pause/reset before leaving
6. `destroy()`: Clean up listeners and components

### No Inline HTML in JS
HTML structure belongs in `.html` template files, not in JS strings. The `templateLoader` fetches templates at runtime.

---

## Documentation Maintenance

### Après chaque tâche
Après avoir terminé une tâche de développement, mettre à jour la documentation :

1. **Déplacer le fichier de tâche** de `todo/` vers `done/`
   - Renommer si nécessaire pour cohérence (snake_case -> PascalCase)
   - Mettre à jour le statut dans le fichier (ajouter "Status: COMPLETED")
2. **Créer/supprimer des fichiers MD** quand nécessaire
   - Nouvelle tâche = créer un fichier dans `todo/`
   - Tâche terminée = déplacer vers `done/`
   - Info obsolète = supprimer ou archiver dans `archive/`
3. **Mettre à jour les fichiers racine** si nécessaire :
   - `README.md` : features, planned features
   - `Vision_MVP_Store.md` : état actuel, roadmap
   - `Content_Roadmap.md` : priorités, statuts
4. **Regrouper/splitter** des infos dans des fichiers MD si plus clair/lisible
   - Ex: extraire les specs d'un système dans son propre fichier
   - Ex: fusionner des petits fichiers liés en un seul

### Convention de nommage
- Fichiers `done/` : PascalCase (ex: `Class_System.md`)
- Fichiers `todo/` : PascalCase (ex: `Success_System.md`)
- Fichiers `archive/` : tel quel (ex: `Etat_24_06_2026.md`)

### Vérification finale
Avant de valider une tâche, vérifier que :
- [ ] Le fichier de tâche est déplacé de `todo/` vers `done/`
- [ ] Le statut est mis à jour dans le fichier de tâche
- [ ] Les fichiers racine sont mis à jour si nécessaire
- [ ] La structure de dossiers est cohérente

---

## Refactoring Priority

When reducing duplication in existing code:
1. Extract logic into components (`screens/components/`)
2. Merge CSS into shared stylesheets (`screens/shared/`)
3. Standardise event binding patterns
4. Remove dead code (overridden methods, unused state)
