# YODO - Architecture du projet

## Architecture actuelle

La boutique est un site multipage statique utilisable avec Live Server. Le code applicatif reste en HTML, CSS et JavaScript natif ; Three.js assure la scène 3D d'accueil et GSAP/ScrollTrigger ses animations.

YODO est traité comme une boutique multimarque : aucune marque de vêtement n'est inventée ou présentée comme une marque propre. Tant que les références réelles ne sont pas fournies, les articles, prix et variantes restent des données de démonstration explicitement identifiées. Aucun stock réel n'est annoncé.

## Arborescence

```text
YODO/
├── index.html
├── pages/
│   ├── boutique.html
│   ├── homme.html
│   ├── femme.html
│   ├── streetwear.html
│   ├── produit.html
│   └── panier.html
├── style.css
├── logo.jpeg
├── js/
│   ├── page-transitions.js
│   ├── home-page.js
│   ├── site-header.js
│   ├── catalog-page.js
│   ├── cart-page.js
│   ├── product-page.js
│   ├── cart-store.js
│   ├── favorites.js
│   ├── products.js
│   ├── three-scene.js
│   ├── three-bootstrap.js
│   ├── animations.js
├── assets/
│   └── images/
│       ├── hoodie.svg
│       ├── tshirt.svg
│       ├── overshirt.svg
│       ├── cargo-pants.svg
│       ├── urban-jacket.svg
│       ├── cap.svg
│       └── products.svg
└── README.md
```

Les modèles GLB ne sont pas encore présents dans les fichiers fournis. Le site devra donc afficher un remplacement si leur chargement échoue ou si WebGL n'est pas disponible ; les vrais fichiers 3D pourront être ajoutés ensuite dans `assets/models3d/`.

## Responsabilités et interfaces

| Fichier | Responsabilité |
|---|---|
| `index.html` | Accueil, hero 3D et liens vers les pages de collection |
| `pages/boutique.html`, `pages/homme.html`, `pages/femme.html`, `pages/streetwear.html` | Pages de catalogue séparées qui filtrent les mêmes produits |
| `pages/produit.html` | Fiche produit sélectionnée par identifiant dans l'URL |
| `pages/panier.html` | Panier persistant, quantités, suppression, total CFA et commande WhatsApp |
| `style.css` | Palette, typographie, composants, mises en page et règles responsive |
| `js/home-page.js` | Interactions du hero illustré et formulaire de newsletter |
| `js/site-header.js` | Menu mobile et compteur partagé du panier |
| `js/page-transitions.js` | Transition de navigation entre pages avec logo Y animé |
| `js/products.js` | Catalogue unique de produits de démonstration |
| `js/catalog-page.js` | Génération des cartes, recherche, catégories, univers et favoris |
| `js/cart-store.js` | Format versionné du panier partagé entre les pages |
| `js/cart-page.js` | Récapitulatif, édition des quantités et lien de commande WhatsApp |
| `js/product-page.js` | Chargement d'une fiche produit par identifiant, choix des variantes et ajout au panier partagé |
| `js/favorites.js` | Favoris versionnés partagés entre le catalogue et les fiches produit |
| `js/three-scene.js` | Scène Three.js, GLTFLoader, contrôles tactiles/souris, éclairage, gestion du redimensionnement et solution de repli |
| `js/animations.js` | Enregistrement GSAP/ScrollTrigger et animations de la page d'accueil |
| `assets/images/*.svg` | Illustrations originales des vêtements de démonstration |
| `assets/models3d/` | Modèles homme/femme au format GLB |

### Contrats de données

- Un produit a un identifiant stable, une catégorie, une marque (ou « marque à renseigner »), un prix de démonstration en CFA, et des variantes de tailles/couleurs identifiées comme démonstration.
- Le stock n'est pas affiché avant de disposer de données vérifiées.
- Le panier mémorisé utilise une clé versionnée, par exemple `yodo.cart.v1`; les favoris utilisent `yodo.favorites.v1`.
- Le bouton de commande prépare dans WhatsApp les lignes du panier et le total en CFA. Il ne débite pas le client et ne confirme pas automatiquement le stock.
- Aucune passerelle Wave, Orange Money ou MTN Money n'est intégrée à cette étape ; le flux de commande reste séparé afin de pouvoir les connecter plus tard.

## Lancement dans Live Server

- Ouvrir `index.html` dans Live Server ; les liens mènent aux pages HTML distinctes dans `pages/`.
- Le panier et les favoris utilisent le stockage local du navigateur pour rester partagés d'une page à l'autre.
- Le lien du panier dans l'en-tête utilise une icône de sac accessible avec compteur d'articles.
- Chaque page affiche une courte transition plein écran avec le Y de YODO lors de la navigation interne.
- Les liens externes, les liens d'ancre de la page courante et les ouvertures dans un nouvel onglet ne sont pas ralentis par la transition.
- La durée de transition est réduite si le navigateur préfère moins de mouvement.
- Les fichiers JavaScript de l'application sont des modules ES chargés par chaque page selon ses besoins, à l'exception de `page-transitions.js`, chargé comme script classique en fin de page afin que son affichage ne dépende pas du chargement des modules 3D ou d'animation.
- Three.js 0.170.0 et GSAP/ScrollTrigger 3.12.5 sont chargés via l'import map ; aucun bundler ni framework n'est nécessaire.
- Three.js est importé à l'approche du hero ; les modèles GLB ne sont demandés qu'à l'entrée de la scène dans la zone visible. Le ratio de pixels de rendu est plafonné sur mobile.
- En cas d'absence de GLB, d'erreur réseau ou de contexte WebGL, le hero reste utilisable avec une illustration locale.
- Les animations non essentielles respectent `prefers-reduced-motion` et sont suspendues lorsque leur section ou l'onglet n'est pas visible.

## Avancement

### Étape 2 - Header et hero

- `index.html` : en-tête et hero reformulés pour une boutique multimarque homme/femme.
- `style.css` : en-tête blanc et hero cinématique sombre, palette noir `#080808`, blanc `#FFFFFF`, gris `#777777` et rouge `#E52335`.
- Le hoodie SVG rotatif sert de remplacement visuel si Three.js ou WebGL est indisponible.
- Les liens vers les collections, le menu mobile et les commandes de rotation restent fonctionnels.
- Vérification navigateur effectuée sur 320, 375, 700, 768, 1024 et 1440 px, sans débordement horizontal ni erreur JavaScript.

### Étape 3 - Scène Three.js et mannequins

- `js/three-bootstrap.js` charge la scène et annonce clairement l'indisponibilité du moteur 3D.
- `js/three-scene.js` charge les modèles GLB locaux, avec mannequins procéduraux de démonstration si les fichiers manquent.
- La scène prend en charge rotation souris/tactile, boutons de rotation et zoom, redimensionnement, mouvement réduit et suspension hors écran.
- Les fichiers définitifs attendus sont `assets/models3d/mannequin-homme.glb` et `assets/models3d/mannequin-femme.glb`.
- Les modèles GLB ne sont pas fournis ; l'affichage actuel utilise donc des mannequins 3D de démonstration.

### Étape 4 - Animations GSAP

- `js/animations.js` orchestre l'entrée du hero, les révélations de collections et les animations de défilement avec GSAP/ScrollTrigger.
- Le défilement du hero transmet une inclinaison discrète à la scène Three.js.
- Les animations s'activent uniquement si le visiteur n'a pas demandé la réduction des mouvements ; le contenu reste visible si GSAP ne se charge pas.
- GSAP 3.12.5 est chargé via l'import map, sans bundler ni framework.

### Étape 5 - Collections Homme et Femme

- Deux panneaux de collection orientent vers les sélections Homme et Femme du catalogue.
- Les données de démonstration indiquent les univers auxquels chaque article peut appartenir ; les filtres par univers et par type se combinent.
- Les liens des panneaux règlent le filtre correspondant avant d'amener le visiteur à la grille.
- Les articles restent clairement identifiés comme démonstrations ; aucun nom de marque, stock ou prix réel n'est ajouté.

### Étape 6 - Catalogue et fiches produit

- `js/products.js` centralise les six références de démonstration et leurs variantes indicatives.
- La recherche par nom, matière, catégorie et univers se combine aux filtres du catalogue.
- Chaque article ouvre `pages/produit.html?id=...`, avec choix de taille/couleur et ajout au panier.
- `js/cart-store.js` synchronise les variantes du panier entre les pages via `localStorage`; le retour ouvre le récapitulatif.
- Les six illustrations SVG dédiées aux vêtements sont reliées au catalogue, aux fiches produit et aux vignettes du panier ; les visuels de l'accueil restent intégrés à la page.

### Étape 7 - Panier et favoris

- Le panier sauvegarde produits, quantités, tailles et couleurs dans `yodo.cart.v1`; son total CFA et le message WhatsApp tiennent compte des variantes.
- Les favoris se sauvegardent dans `yodo.favorites.v1`, depuis la grille comme depuis une fiche produit.
- Le filtre « Favoris » se combine aux univers, catégories et à la recherche.

### Étape 8 - Responsive et accessibilité

- Accueil et fiche produit restent sans débordement horizontal aux largeurs testées, de 320 à 1440 px.
- Les contrôles de formulaire, filtres et favoris disposent de libellés, d'états annoncés et d'un focus visible.
- Les préférences de réduction des mouvements désactivent les animations non essentielles.

### Étape 9 - Optimisation et vérifications

- L'import de Three.js est différé à l'approche du hero, et les GLB ne démarrent leur chargement qu'une fois la scène visible.
- Le rendu s'arrête hors écran ou lorsque l'onglet est masqué ; la résolution est plafonnée sur mobile.
- Contrôles fonctionnels réalisés sur recherche, filtres, fiches, variantes, favoris, panier et message WhatsApp.
- Accueil et fiche produit vérifiés à 320, 375, 700, 768, 1024 et 1440 px, sans débordement horizontal.
- L'environnement de test ne fournit pas de contexte WebGL ; le secours illustré a été vérifié, mais le rendu GPU réel reste à valider sur un appareil compatible.

### Étape 10 - Navigation multipage

- L'accueil est une vitrine et mène vers des pages distinctes Boutique, Homme, Femme, Streetwear, Produit et Panier.
- Les pages de collection partagent les mêmes données, la recherche, les filtres par catégorie et les favoris.
- Le panier et son compteur sont communs entre les pages ; les variantes, quantités et totaux sont conservés dans le stockage local.
- Le panier autonome prépare la commande complète dans WhatsApp sans confirmation automatique de stock.
- Les changements de page affichent un écran de chargement YODO avec un Y animé.