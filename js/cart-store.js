export const CART_STORAGE_KEY = "yodo.cart.v1";

function getLineKey(productId, size, color) {
  return JSON.stringify([productId, size, color]);
}

export function addCartLine(cart, product, size, color) {
  if (!product.sizes.includes(size) || !product.colors.some((option) => option.name === color)) {
    throw new Error(`Variante invalide pour ${product.name}.`);
  }

  const key = getLineKey(product.id, size, color);
  const line = cart.get(key);
  cart.set(key, {
    productId: product.id,
    size,
    color,
    quantity: (line?.quantity || 0) + 1
  });
}

export function readCart(products) {
  let serialized;
  try {
    serialized = localStorage.getItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Le panier enregistré n’a pas pu être lu.", error);
    return new Map();
  }
  if (serialized === null) return new Map();

  let savedLines;
  try {
    savedLines = JSON.parse(serialized);
  } catch (error) {
    console.error("Le panier enregistré contient des données JSON invalides.", error);
    return new Map();
  }
  if (!Array.isArray(savedLines)) {
    console.error("Le panier enregistré n’a pas le format attendu.");
    return new Map();
  }

  const cart = new Map();
  savedLines.forEach((line) => {
    const product = products[line?.productId];
    if (
      !product ||
      !product.sizes.includes(line.size) ||
      !product.colors.some((option) => option.name === line.color) ||
      !Number.isSafeInteger(line.quantity) ||
      line.quantity < 1
    ) {
      console.warn("Une ligne invalide du panier enregistré a été ignorée.", line);
      return;
    }

    const key = getLineKey(line.productId, line.size, line.color);
    const previous = cart.get(key);
    cart.set(key, {
      productId: line.productId,
      size: line.size,
      color: line.color,
      quantity: line.quantity + (previous?.quantity || 0)
    });
  });
  return cart;
}

export function writeCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([...cart.values()]));
    return true;
  } catch (error) {
    console.error("Le panier n’a pas pu être enregistré.", error);
    return false;
  }
}
