# Yaahw — Frontend

Application Angular + Tailwind CSS pour **Yaahw**, point de vente (POS) configurable multi-contextes : boutique, restaurant, pharmacie, cave.

## Stack

- **Angular 21** (standalone components)
- **Tailwind CSS 3** (darkMode par classe, responsive mobile-first)
- **SCSS** pour les styles composants
- Police **Inter** (Google Fonts)

## Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de dev
npm start
# ou
ng serve
```

L'app est disponible sur `http://localhost:4200/`.

## Scripts

| Commande | Action |
|---|---|
| `npm start` | Serveur de dev (`ng serve`) |
| `npm run build` | Build de production (`dist/yaahw-frontend/`) |
| `npm run watch` | Build dev en watch mode |
| `npm test` | Tests Karma/Jasmine |

## Arborescence

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.ts            # Composant racine (standalone)
│   │   ├── app.html          # Template racine
│   │   ├── app.routes.ts     # Routes
│   │   └── app.config.ts     # Providers
│   ├── index.html
│   ├── main.ts
│   └── styles.scss           # Tailwind + globals
├── tailwind.config.js
├── postcss.config.js
└── angular.json
```

## Conventions

- **Responsive mobile-first** : breakpoints Tailwind (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- **Dark mode** via classe `.dark` sur `<html>`
- **Couleur de marque** : `brand-{50..800}` (indigo)
- Composants standalone avec `imports: [...]`

## Backend API

Par défaut : `http://localhost:5000/api`
(À configurer dans `src/environments/` — à créer plus tard)
