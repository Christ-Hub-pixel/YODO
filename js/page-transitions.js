const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const overlay = document.createElement("div");
overlay.className = "page-transition";
overlay.setAttribute("role", "status");
overlay.setAttribute("aria-label", "Chargement de la page");
overlay.innerHTML = `
  <div class="page-transition-mark" aria-hidden="true">
    <span>Y</span>
  </div>
  <p>YODO</p>
`;
document.body.append(overlay);

let navigationStarted = false;
let hideTimer;

function showTransition() {
  window.clearTimeout(hideTimer);
  overlay.classList.add("is-visible");
}

function hideTransition() {
  overlay.classList.remove("is-visible");
}

showTransition();
hideTimer = window.setTimeout(hideTransition, reducedMotion.matches ? 120 : 380);

document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) return;

  const link = event.target.closest("a[href]");
  if (
    !link ||
    link.hasAttribute("download") ||
    (link.target && link.target !== "_self") ||
    link.relList.contains("external")
  ) return;

  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin) return;
  if (
    destination.pathname === window.location.pathname &&
    destination.search === window.location.search
  ) return;

  event.preventDefault();
  if (navigationStarted) return;

  navigationStarted = true;
  showTransition();
  window.setTimeout(() => {
    window.location.assign(destination.href);
  }, reducedMotion.matches ? 100 : 360);
}, true);

window.addEventListener("pageshow", (event) => {
  navigationStarted = false;
  if (event.persisted) hideTransition();
});
