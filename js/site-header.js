import { PRODUCTS } from "./products.js";
import { readCart } from "./cart-store.js";

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    mainNav.classList.toggle("is-open", !isOpen);
  });
  mainNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuToggle.setAttribute("aria-expanded", "false");
      mainNav.classList.remove("is-open");
    }
  });
}

function updateCartCount() {
  const count = [...readCart(PRODUCTS).values()]
    .reduce((sum, line) => sum + line.quantity, 0);
  document.querySelectorAll("[data-cart-link]").forEach((link) => {
    const label = link.hasAttribute("aria-current") ? "Votre panier" : "Ouvrir le panier";
    link.setAttribute("aria-label", `${label}, ${count} article${count === 1 ? "" : "s"}`);
  });
  document.querySelectorAll("[data-cart-count]").forEach((counter) => {
    counter.textContent = String(count);
    counter.setAttribute("aria-label", `${count} article${count === 1 ? "" : "s"}`);
  });
}

updateCartCount();
window.addEventListener("storage", (event) => {
  if (event.key === "yodo.cart.v1") updateCartCount();
});
window.addEventListener("yodo:cart-updated", updateCartCount);
