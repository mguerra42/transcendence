Bonjoir !

Voici un petit récap de la stack

## Back

NestJS

### Database

Prisma (ORM) + PostgreSQL (Database)

Prisma est un ORM, ça permet de faire des requêtes SQL sans avoir à écrire de SQL. C'est plus simple, plus safe et plus rapide à écrire.


### Socket

Socket.io

C'est une librairie qui permet de faire du temps réel. On l'utilisera pour les parties de pong et pour le chat.

### Authentification

Pour l'authentification, on utilisera le système de JWT (JSON Web Token). C'est un système d'authentification qui permet de stocker des informations dans un token, et de le vérifier à chaque requête. C'est plus simple que les sessions, et ça permet de faire des choses plus complexes.

## Front

### Tailwind CSS [https://tailwindcss.com/](https://tailwindcss.com/)
C'est un framework CSS, ça permet de faire des trucs sympas sans trop se prendre la tête. Et ça nous permettra de bosser en équipe plus facilement sans péter les classes et styles des autres. En gros, il y a des classes prédéfinies pour ajuster chaque propriété CSS, et on peut les combiner pour faire des trucs plus complexes.

### UnoCSS [https://unocss.dev/](https://unocss.dev/)
En vérité, on utilisera pas Tailwind CSS, mais UnoCSS. J'ai ajouté tailwind pour que vous compreniez le concept. Il fait la même chose que Tailwind, à savoir fournir des classes prédéfinies pour faire du CSS, mais il ne génére que celles qui sont utilisées dans le code, donc ça permet de ne pas avoir un fichier CSS de 10Mo. Ca permet aussi de créer des thèmes facilement, et de faire des trucs plus complexes que Tailwind.


### Vue 3 [https://vuejs.org/](https://vuejs.org/)
### Nuxt 3 [https://nuxt.com/](https://nuxt.com/)

Pour rendre les choses un peu plus simple, on utilisera Nuxt, c'est un framework Vue.js, ça simplifie la vie pour le routing frontend et pas mal d'autres trucs de Vue. 

### Vite [https://vitejs.dev/](https://vitejs.dev/)

C'est un bundler, ça permet de compiler le code pour le rendre compatible avec les navigateurs. C'est un peu comme webpack, mais en plus simple et plus rapide (genre 10x plus rapide). Il est intégré à Nuxt 3, donc on a pas besoin de s'en occuper.

### Icons

UnoCSS permet d'intégrer des icônes facilement, en utilisant juste une classe CSS. Pour la liste des icones dispo : [https://icones.js.org/](https://icones.js.org/).

Pour utiliser une icone, copiez-le nom de l'icone, et ajoutez la classe `i-` devant. Par exemple, pour utiliser l'icone `mdi:account` : `<div class="i-mdi:account"></div>`.

## Pinia

Pinia est un store pour Vue.js, c'est un peu comme Vuex, mais en plus simple et plus rapide. Ca permet de stocker des données et de les partager entre les composants/pages.
