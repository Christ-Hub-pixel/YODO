Remplacer les mannequins 3D rudimentaires actuels dans le hero de la page d'accueil de la marque de mode streetwear YODO par un visuel 3D de haute qualité (vêtements streetwear stylisés, hoodie/veste, textures travaillées, éclairage studio).

Working directory: /home/christ77/Documents/YODO
Integrity mode: development

## Requirements

### R1. Remplacement des mannequins de démonstration par un visuel 3D streetwear haut de gamme
Retirer définitivement les mannequins 3D basiques en primitives (sphères, cylindres, capsules) et le texte de démonstration de la scène hero dans `index.html`. Les remplacer par une scène 3D valorisant l'univers streetwear de YODO (mannequin stylisé ou vêtement streetwear emblématique tel qu'un hoodie ou une veste), en s'appuyant sur des assets 3D libres de droits adaptés ou une modélisation/shader Three.js soignée.

### R2. Éclairage studio et intégration Three.js
Intégrer le nouveau visuel dans le pipeline Three.js existant (`js/three-scene.js`, `js/three-bootstrap.js`) avec un éclairage studio soigné (ombres, reflets, mise en valeur des matières), un cadrage caméra adapté et des animations ou interactions fluides en accord avec l'expérience utilisateur du site.

### R3. Performance et réactivité responsive
Assurer un rendu fluide et stable sans dégrader les performances de la page d'accueil. Adapter le rendu et le canvas Three.js de manière responsive à toutes les tailles d'écran (desktop, tablette, mobile) sans déformation ni débordement.

## Acceptance Criteria

### Rendu visuel et esthétique
- [ ] Les mannequins en primitives basiques et la mention temporaire de démonstration sont totalement retirés du hero.
- [ ] La scène hero affiche un visuel 3D de qualité professionnelle représentant des vêtements ou mannequins streetwear avec des textures et matières travaillées.
- [ ] L'éclairage studio met en valeur les volumes et textures du modèle de manière esthétique.

### Intégration technique et performance
- [ ] La scène 3D se charge et s'anime sans erreur ni warning critique dans la console du navigateur.
- [ ] Aucun asset 3D ou texture manquant (aucune erreur 404).
- [ ] Le redimensionnement de la fenêtre ajuste le viewport, la caméra et le canvas Three.js de façon responsive sans déformation visuelle.