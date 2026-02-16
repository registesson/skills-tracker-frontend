# Skills Tracker Frontend 📚

Application Angular pour suivre vos compétences et votre progression. Frontend pour l'API Spring Boot Skills Tracker.

## 🚀 Fonctionnalités

- ✅ Authentification (inscription/connexion)
- ✅ Gestion des compétences (CRUD)
- ✅ Catégorisation des compétences
- ✅ Suivi des niveaux (actuel et cible)
- ✅ Statistiques de progression
- ✅ Interface responsive et moderne

## 📋 Prérequis

- Node.js 18 ou supérieur
- npm ou yarn
- API Spring Boot Skills Tracker en cours d'exécution sur http://localhost:8080

## 🛠️ Installation

```bash
# Installer les dépendances
npm install
```

## 💻 Développement

Pour démarrer le serveur de développement :

```bash
npm start
```

L'application sera accessible sur `http://localhost:4200/`

**Note** : Le proxy Angular est configuré pour rediriger `/api/*` vers `http://localhost:8080`. Cela évite les problèmes CORS en développement.

## 🏗️ Structure du projet

```
src/app/
├── core/                      # Services, modèles, guards, interceptors
│   ├── guards/
│   │   └── auth.guard.ts     # Protection des routes authentifiées
│   ├── interceptors/
│   │   └── auth.interceptor.ts  # Ajout automatique du token JWT
│   ├── models/
│   │   ├── auth.model.ts     # Modèles d'authentification
│   │   ├── skill.model.ts    # Modèles de compétences
│   │   └── learning-session.model.ts
│   └── services/
│       ├── auth.service.ts   # Service d'authentification
│       ├── skill.service.ts  # Service de gestion des compétences
│       └── learning-session.service.ts
├── features/                  # Composants par fonctionnalité
│   ├── auth/
│   │   ├── login/           # Page de connexion
│   │   └── register/        # Page d'inscription
│   └── skills/
│       └── dashboard/       # Tableau de bord des compétences
└── shared/                   # Composants partagés
    └── components/
        └── header/          # En-tête de navigation
```

## 🔑 Configuration de l'API

### Développement

Le proxy Angular (`proxy.conf.json`) redirige automatiquement `/api/*` vers `http://localhost:8080`.
Les services utilisent des URLs relatives (`/api/auth`, `/api/skills`).

### Configuration CORS Backend (optionnel)

Si vous préférez ne pas utiliser le proxy, ajoutez cette configuration dans votre backend Spring Boot :

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:4200")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

Puis modifiez les URLs dans les services pour pointer vers `http://localhost:8080/api/...`

## 📱 Pages disponibles

- `/login` - Connexion
- `/register` - Inscription
- `/dashboard` - Tableau de bord (protégé)

## 🎨 Technologies

- **Angular 19** - Framework frontend
- **TypeScript** - Langage
- **RxJS** - Programmation réactive
- **Signal API** - Gestion d'état moderne
- **Standalone Components** - Architecture modulaire

## 🔐 Authentification

L'application utilise JWT pour l'authentification :

- Le token est stocké dans le localStorage
- L'intercepteur HTTP ajoute automatiquement le token aux requêtes
- Le guard protège les routes nécessitant une authentification

## 📦 Build de production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

## 🧪 Tests

```bash
# Tests unitaires
npm test
```

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
