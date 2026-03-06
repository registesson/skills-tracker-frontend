# Fonctionnalité de Notifications de Pratique

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de recevoir des notifications de rappel s'ils n'ont pas pratiqué une compétence depuis un certain nombre de jours.

## Critères d'acceptation ✅

- ✅ Notification si aucune session depuis 3 jours (configurable)
- ✅ Configuration par compétence
- ✅ Désactivable

## Architecture

### Modèles de données

#### `notification.model.ts`

- `NotificationSettings` : Configuration des notifications (activé/seuil de jours)
- `SkillNotification` : Notification générée pour une compétence inactive
- `DEFAULT_NOTIFICATION_SETTINGS` : Configuration par défaut (3 jours)

#### `skill.model.ts` (modifié)

Ajout de deux nouveaux champs optionnels :

- `notificationPreferences?: NotificationPreferences` : Préférences de notification par compétence
- `lastSessionDate?: string` : Date de la dernière session de pratique

### Services

#### `notification.service.ts`

Service principal gérant les notifications :

**Fonctionnalités :**

- Vérification périodique des compétences inactives (toutes les heures)
- Génération automatique de notifications
- Gestion des préférences de notification par compétence
- Support des notifications du navigateur
- Signal `activeNotifications` pour l'affichage en temps réel

**Méthodes principales :**

- `checkInactiveSkills()` : Vérifie toutes les compétences et génère des notifications
- `updateNotificationPreferences(skillId, preferences)` : Met à jour les préférences
- `dismissNotification(skillId)` : Ferme une notification
- `requestBrowserNotificationPermission()` : Demande l'autorisation des notifications navigateur
- `sendBrowserNotification(notification)` : Envoie une notification navigateur

### Composants

#### `notification-banner.component.ts`

Bannière affichée en haut du dashboard :

- Affiche toutes les notifications actives
- Design moderne avec dégradé violet
- Actions : "Pratiquer" (lien vers la compétence) et "Ignorer"
- Proposition d'activer les notifications du navigateur
- Animation de la cloche 🔔

#### `notification-preferences.component.ts`

Composant réutilisable pour gérer les préférences :

- Activation/désactivation des notifications
- Configuration du seuil de jours (1-30 jours)
- Détection des changements
- Boutons Enregistrer/Annuler

### Intégration dans le Dashboard

Le dashboard a été modifié pour :

1. Afficher la bannière de notifications en haut
2. Ajouter une section de préférences de notification dans le formulaire d'édition
3. Sauvegarder les préférences lors de la modification d'une compétence

## Utilisation

### Pour l'utilisateur

1. **Voir les notifications :**
   - Les notifications apparaissent automatiquement en haut du dashboard
   - Le nombre de notifications est affiché dans le titre

2. **Configurer les notifications pour une compétence :**
   - Cliquer sur "Modifier" sur une carte de compétence
   - Scroller jusqu'à la section "🔔 Notifications de pratique"
   - Cocher/décocher "Recevoir des rappels"
   - Ajuster le nombre de jours avant notification (1-30 jours)
   - Cliquer sur "Sauvegarder"

3. **Activer les notifications du navigateur :**
   - Cliquer sur "Activer les notifications" dans la bannière
   - Accepter la demande d'autorisation du navigateur

4. **Ignorer une notification :**
   - Cliquer sur le ✕ sur la notification individuelle
   - Ou cliquer sur le ✕ en haut à droite pour tout ignorer

### Logique de notification

Une notification est générée si :

- Les notifications sont activées pour la compétence
- **ET** aucune session n'a été enregistrée depuis N jours (N = seuil configuré)
- **OU** la compétence a été créée il y a N jours et aucune session n'a jamais été créée

## Améliorations futures possibles

1. **Backend :**
   - Endpoint API pour mettre à jour les préférences de notification : `PUT /api/skills/:id/notification-preferences`
   - Ajouter `lastSessionDate` et `notificationPreferences` dans le modèle Skill côté backend
   - Calculer et retourner `lastSessionDate` lors de la récupération des compétences

2. **Notifications avancées :**
   - Notifications par email
   - Notifications push sur mobile (PWA)
   - Personnalisation des messages de notification
   - Statistiques sur le respect de la routine

3. **Fonctionnalités supplémentaires :**
   - Snooze (rappeler dans X heures)
   - Planning de notifications (heures préférées)
   - Suggestions de sessions basées sur l'historique
   - Streak tracking (jours consécutifs de pratique)

## Configuration par défaut

- Notifications activées : `true`
- Seuil de jours : `3 jours`
- Vérification automatique : `toutes les heures`

## Dépendances

- Angular 18+ (signals, standalone components)
- RxJS pour la réactivité
- API Notifications Web (pour les notifications navigateur)

## Notes techniques

- Le service de notification s'initialise automatiquement au démarrage de l'application
- Les notifications sont stockées en mémoire (signal Angular)
- Les préférences sont persistées via l'API backend
- Compatible avec tous les navigateurs modernes supportant l'API Notifications
