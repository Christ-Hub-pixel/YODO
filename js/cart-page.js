import { PRODUCTS } from "./products.js";
import { readCart, writeCart } from "./cart-store.js";

const itemsContainer = document.querySelector("#cart-page-items");
const emptyState = document.querySelector("#cart-page-empty");
const summary = document.querySelector("#cart-page-summary");
const status = document.querySelector("#cart-page-status");
const orderLink = document.querySelector("#whatsapp-order");
const currency = new Intl.NumberFormat("fr-CI", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0
});
const cart = readCart(PRODUCTS);
const whatsappNumber = "2250151135690";

function lineKey(line) {
  return JSON.stringify([line.productId, line.size, line.color]);
}

function createCartLine(line) {
  const product = PRODUCTS[line.productId];
  const article = document.createElement("article");
  article.className = "cart-page-line";
  article.dataset.lineKey = lineKey(line);

  const visual = document.createElement("div");
  visual.className = "cart-page-thumb";
  visual.style.backgroundColor = product.color;
  const art = document.createElement("img");
  art.src = `../assets/images/${product.image}`;
  art.alt = "";
  visual.append(art);

  const details = document.createElement("div");
  details.className = "cart-page-line-details";
  const name = document.createElement("h2");
  name.textContent = product.name;
  const variant = document.createElement("p");
  variant.textContent = `Taille : ${line.size} · Couleur : ${line.color}`;
  const unitPrice = document.createElement("p");
  unitPrice.textContent = currency.format(product.price);
  const controls = document.createElement("div");
  controls.className = "quantity-control";

  const decrement = document.createElement("button");
  decrement.type = "button";
  decrement.dataset.action = "decrement";
  decrement.setAttribute("aria-label", `Diminuer la quantité de ${product.name}`);
  decrement.textContent = "−";
  const quantity = document.createElement("span");
  quantity.textContent = String(line.quantity);
  quantity.setAttribute("aria-label", `Quantité : ${line.quantity}`);
  const increment = document.createElement("button");
  increment.type = "button";
  increment.dataset.action = "increment";
  increment.setAttribute("aria-label", `Augmenter la quantité de ${product.name}`);
  increment.textContent = "+";
  controls.append(decrement, quantity, increment);
  details.append(name, variant, unitPrice, controls);

  const side = document.createElement("div");
  side.className = "cart-page-line-side";
  const subtotal = document.createElement("strong");
  subtotal.textContent = currency.format(product.price * line.quantity);
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-item";
  remove.dataset.action = "remove";
  remove.textContent = "Supprimer";
  side.append(subtotal, remove);
  article.append(visual, details, side);
  return article;
}

function buildWhatsAppUrl() {
  const lines = [...cart.values()].map((line) => {
    const product = PRODUCTS[line.productId];
    return `• ${product.name} (${line.size}, ${line.color}) × ${line.quantity} - ${currency.format(product.price * line.quantity)}`;
  });
  const total = [...cart.values()].reduce(
    (sum, line) => sum + PRODUCTS[line.productId].price * line.quantity,
    0
  );
  const message = [
    "Bonjour, je souhaite commander :",
    "",
    ...lines,
    "",
    `Total des articles : ${currency.format(total)}`,
    "",
    "Pouvez-vous me confirmer la disponibilité et les modalités de livraison ?"
  ].join("\n");
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function render() {
  const lines = [...cart.values()];
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + PRODUCTS[line.productId].price * line.quantity, 0);
  document.querySelector("#cart-page-count").textContent = `(${count})`;
  document.querySelector("#cart-page-total").textContent = currency.format(total);
  itemsContainer.replaceChildren(...lines.map(createCartLine));
  emptyState.hidden = lines.length > 0;
  summary.hidden = lines.length === 0;
  orderLink.hidden = lines.length === 0;
  if (lines.length > 0) orderLink.href = buildWhatsAppUrl();
  window.dispatchEvent(new Event("yodo:cart-updated"));
}

itemsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const article = button.closest("[data-line-key]");
  const line = cart.get(article.dataset.lineKey);
  if (!line) return;

  const previous = new Map([...cart].map(([key, value]) => [key, { ...value }]));
  if (button.dataset.action === "remove") {
    cart.delete(article.dataset.lineKey);
  } else if (button.dataset.action === "increment") {
    line.quantity += 1;
  } else if (button.dataset.action === "decrement" && line.quantity > 1) {
    line.quantity -= 1;
  }

  if (!writeCart(cart)) {
    cart.clear();
    previous.forEach((value, key) => cart.set(key, value));
    status.textContent = "Le panier n’a pas pu être sauvegardé. Vos modifications n’ont pas été appliquées.";
    return;
  }
  status.textContent = "";
  render();
});

render();
