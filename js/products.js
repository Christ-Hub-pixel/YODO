export const CATEGORY_META = {
  tshirt: {
    id: "tshirt",
    label: "T-shirts",
    kicker: "Coton épais 280g · Coupes oversize & boxy"
  },
  longsleeve: {
    id: "longsleeve",
    label: "Manches Longues",
    kicker: "Jersey lourd · Éditions Studio"
  }
};

export const CATEGORY_ORDER = ["tshirt", "longsleeve"];

function buildViews(folder, count) {
  return Array.from({ length: count }, (_, i) => `products/${folder}/view-${i + 1}.jpg`);
}

export const PRODUCTS = {
  // ===== T-SHIRTS (17) =====
  "tee-asap-flag-bw": {
    id: "tee-asap-flag-bw",
    name: "T-shirt A$AP Rocky Flag B&W",
    detail: "Coton épais 280g · Sérigraphie recto/verso A$AP Rocky",
    price: 10000,
    oldPrice: 15000,
    badge: "NOUVEAU",
    symbol: "tee-art",
    image: "products/tee-asap-flag-bw/view-1.jpg",
    images: buildViews("tee-asap-flag-bw", 6),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Blanc / Noir", value: "#f4f4f6", bg: "#ffffff" },
      { name: "Noir Profond", value: "#111113", bg: "#111113" }
    ]
  },
  "tee-asap-portrait": {
    id: "tee-asap-portrait",
    name: "T-shirt A$AP Rocky Portrait",
    detail: "Coton épais 280g · Portrait monochrome haute définition",
    price: 10000,
    oldPrice: 15000,
    badge: "STUDIO",
    symbol: "tee-art",
    image: "products/tee-asap-portrait/view-1.jpg",
    images: buildViews("tee-asap-portrait", 7),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Blanc / Noir", value: "#f4f4f6", bg: "#ffffff" },
      { name: "Noir Profond", value: "#141416", bg: "#141416" }
    ]
  },
  "tee-asap-color-portrait": {
    id: "tee-asap-color-portrait",
    name: "T-shirt A$AP Color Portrait",
    detail: "Coton épais 280g · Portrait couleur studio",
    price: 10000,
    badge: "NOUVEAU",
    symbol: "tee-art",
    image: "products/tee-asap-color-portrait/view-1.jpg",
    images: buildViews("tee-asap-color-portrait", 1),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc Pur", value: "#ffffff", bg: "#ffffff" }
    ]
  },
  "tee-asap-collage": {
    id: "tee-asap-collage",
    name: "T-shirt A$AP Collage",
    detail: "Coupe oversize · Lettrage collage graphique",
    price: 10000,
    oldPrice: 14000,
    badge: "PROMO",
    symbol: "tee-art",
    image: "products/tee-asap-collage/view-1.jpg",
    images: buildViews("tee-asap-collage", 3),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc Pur", value: "#ffffff", bg: "#ffffff" },
      { name: "Noir Profond", value: "#111113", bg: "#111113" }
    ]
  },
  "tee-asap-flag-color": {
    id: "tee-asap-flag-color",
    name: "T-shirt A$AP Rocky Flag Color",
    detail: "Coton épais 280g · Visuel drapeau couleur",
    price: 10000,
    badge: "ÉDITION",
    symbol: "tee-art",
    image: "products/tee-asap-flag-color/view-1.jpg",
    images: buildViews("tee-asap-flag-color", 7),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc / Tricolore", value: "#ffffff", bg: "#ffffff" }
    ]
  },
  "tee-asap-red": {
    id: "tee-asap-red",
    name: "T-shirt ASAP Red Edition",
    detail: "Coupe boxy · Typographie ASAP rouge néon",
    price: 10000,
    badge: "ARCHIVE",
    symbol: "tee-art",
    image: "products/tee-asap-red/view-1.jpg",
    images: buildViews("tee-asap-red", 7),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc / Rouge", value: "#E51F35", bg: "#ffffff" },
      { name: "Noir / Rouge", value: "#141416", bg: "#141416" }
    ]
  },
  "tee-tupac-noir": {
    id: "tee-tupac-noir",
    name: "T-shirt 2Pac Praying Noir",
    detail: "Coton lourd 280g · Portrait iconique 2Pac noir & blanc",
    price: 10000,
    oldPrice: 15000,
    badge: "ICÔNE",
    symbol: "tee-art",
    image: "products/tee-tupac-noir/view-1.jpg",
    images: buildViews("tee-tupac-noir", 5),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Noir Profond", value: "#141416", bg: "#ffffff" },
      { name: "Blanc Pur", value: "#ffffff", bg: "#f4f4f6" }
    ]
  },
  "tee-tupac-blanc": {
    id: "tee-tupac-blanc",
    name: "T-shirt 2Pac Praying Blanc",
    detail: "Coton lourd 280g · Portrait iconique 2Pac noir & blanc",
    price: 10000,
    badge: "ICÔNE",
    symbol: "tee-art",
    image: "products/tee-tupac-blanc/view-1.jpg",
    images: buildViews("tee-tupac-blanc", 3),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc Pur", value: "#ffffff", bg: "#ffffff" }
    ]
  },
  "tee-tupac-eyes-blanc": {
    id: "tee-tupac-eyes-blanc",
    name: "T-shirt 2Pac All Eyez Blanc",
    detail: "Coton épais 280g · Montage graphique All Eyez On Me",
    price: 10000,
    badge: "ICÔNE",
    symbol: "tee-art",
    image: "products/tee-tupac-eyes-blanc/view-1.jpg",
    images: buildViews("tee-tupac-eyes-blanc", 3),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc Pur", value: "#ffffff", bg: "#ffffff" }
    ]
  },
  "tee-crown-noir": {
    id: "tee-crown-noir",
    name: "T-shirt Crown of Thorns Noir",
    detail: "Coton délavé · Visuel monochrome contrasté",
    price: 10000,
    badge: "STUDIO",
    symbol: "tee-art",
    image: "products/tee-crown-noir/view-1.jpg",
    images: buildViews("tee-crown-noir", 3),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Noir Profond", value: "#141416", bg: "#ffffff" }
    ]
  },
  "tee-diffusion-noir": {
    id: "tee-diffusion-noir",
    name: "T-shirt Diffusion Edition 001",
    detail: "Coton lourd · Visuel avant smoke & dos typographique",
    price: 10000,
    badge: "ÉDITION 001",
    symbol: "tee-art",
    image: "products/tee-diffusion-noir/view-1.jpg",
    images: buildViews("tee-diffusion-noir", 8),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Noir Profond", value: "#141416", bg: "#ffffff" }
    ]
  },
  "tee-eyes-noir": {
    id: "tee-eyes-noir",
    name: "T-shirt Eyes Collage Noir",
    detail: "Coupe oversize · Patchwork photographique poitrine",
    price: 10000,
    oldPrice: 14000,
    badge: "PROMO",
    symbol: "tee-art",
    image: "products/tee-eyes-noir/view-1.jpg",
    images: buildViews("tee-eyes-noir", 8),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Noir Profond", value: "#141416", bg: "#ffffff" }
    ]
  },
  "tee-kendrick-cap": {
    id: "tee-kendrick-cap",
    name: "T-shirt Kendrick Blue Cap",
    detail: "Coton épais 280g · Portrait & signature bleu royal",
    price: 10000,
    badge: "NOUVEAU",
    symbol: "tee-art",
    image: "products/tee-kendrick-cap/view-1.jpg",
    images: buildViews("tee-kendrick-cap", 5),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc / Bleu Royal", value: "#1652f0", bg: "#ffffff" }
    ]
  },
  "tee-mandela-blanc": {
    id: "tee-mandela-blanc",
    name: "T-shirt Mandela Héritage Blanc",
    detail: "Slogan rouge avant · Portrait Nelson Mandela au dos",
    price: 10000,
    badge: "HÉRITAGE",
    symbol: "tee-art",
    image: "products/tee-mandela-blanc/view-1.jpg",
    images: buildViews("tee-mandela-blanc", 4),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc / Rouge", value: "#ffffff", bg: "#ffffff" }
    ]
  },
  "tee-mini-collage": {
    id: "tee-mini-collage",
    name: "T-shirt Mini Collage",
    detail: "Coton épais 280g · Imprimé collage minimaliste",
    price: 10000,
    badge: "STUDIO",
    symbol: "tee-art",
    image: "products/tee-mini-collage/view-1.jpg",
    images: buildViews("tee-mini-collage", 1),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc Pur", value: "#ffffff", bg: "#ffffff" }
    ]
  },
  "tee-money-print": {
    id: "tee-money-print",
    name: "T-shirt Money Print",
    detail: "Coupe oversize · Sérigraphie graphique haute densité",
    price: 10000,
    oldPrice: 14000,
    badge: "PROMO",
    symbol: "tee-art",
    image: "products/tee-money-print/view-1.jpg",
    images: buildViews("tee-money-print", 4),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc / Graphique", value: "#f4f4f6", bg: "#ffffff" }
    ]
  },
  "tee-script-cursive": {
    id: "tee-script-cursive",
    name: "T-shirt Script Cursive",
    detail: "Coton épais 280g · Lettrage cursif signature",
    price: 10000,
    badge: "NOUVEAU",
    symbol: "tee-art",
    image: "products/tee-script-cursive/view-1.jpg",
    images: buildViews("tee-script-cursive", 4),
    color: "#ffffff",
    category: "tshirt",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc Pur", value: "#ffffff", bg: "#ffffff" }
    ]
  },

  // ===== MANCHES LONGUES (4) =====
  "ls-asap-flag-noir": {
    id: "ls-asap-flag-noir",
    name: "Manches Longues A$AP Flag Noir",
    detail: "Jersey lourd manches longues · Portrait & drapeau vintage",
    price: 15000,
    oldPrice: 20000,
    badge: "MANCHES LONGUES",
    symbol: "tee-art",
    image: "products/ls-asap-flag-noir/view-1.jpg",
    images: buildViews("ls-asap-flag-noir", 4),
    color: "#ffffff",
    category: "longsleeve",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Noir Profond", value: "#141416", bg: "#ffffff" }
    ]
  },
  "ls-asap-flag-white": {
    id: "ls-asap-flag-white",
    name: "Manches Longues A$AP Flag Blanc",
    detail: "Jersey lourd manches longues · Visuel drapeau couleur",
    price: 15000,
    oldPrice: 20000,
    badge: "MANCHES LONGUES",
    symbol: "tee-art",
    image: "products/ls-asap-flag-white/view-1.jpg",
    images: buildViews("ls-asap-flag-white", 2),
    color: "#ffffff",
    category: "longsleeve",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Blanc Pur", value: "#ffffff", bg: "#ffffff" }
    ]
  },
  "ls-kendrick-cap": {
    id: "ls-kendrick-cap",
    name: "Manches Longues Kendrick Blue Cap",
    detail: "Jersey lourd manches longues · Portrait & signature bleu royal",
    price: 15000,
    oldPrice: 20000,
    badge: "MANCHES LONGUES",
    symbol: "tee-art",
    image: "products/ls-kendrick-cap/view-1.jpg",
    images: buildViews("ls-kendrick-cap", 1),
    color: "#ffffff",
    category: "longsleeve",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc / Bleu Royal", value: "#1652f0", bg: "#ffffff" }
    ]
  },
  "ls-marathon-continues": {
    id: "ls-marathon-continues",
    name: "Manches Longues Marathon Continues",
    detail: "Jersey lourd manches longues · Édition hommage graphic",
    price: 15000,
    badge: "MANCHES LONGUES",
    symbol: "tee-art",
    image: "products/ls-marathon-continues/view-1.jpg",
    images: buildViews("ls-marathon-continues", 1),
    color: "#ffffff",
    category: "longsleeve",
    streetwear: true,
    audiences: ["homme", "femme"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Noir / Graphique", value: "#141416", bg: "#ffffff" }
    ]
  }
};
