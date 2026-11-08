const turntable = document.querySelector("#garment-turntable");
const heroStage = document.querySelector("#hero-stage");
const model = document.querySelector(".garment-model");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (turntable && model) {
  let angle = 0;
  let zoom = 1;
  let pointerStart = null;

  const renderModel = () => {
    model.style.transform = `rotateY(${angle}deg) scale(${zoom})`;
  };
  const setAngle = (nextAngle) => {
    angle = ((nextAngle % 360) + 360) % 360;
    renderModel();
  };

  turntable.addEventListener("pointerdown", (event) => {
    pointerStart = { x: event.clientX, angle };
    turntable.setPointerCapture(event.pointerId);
  });
  turntable.addEventListener("pointermove", (event) => {
    if (pointerStart) setAngle(pointerStart.angle + (event.clientX - pointerStart.x) * 0.65);
  });
  turntable.addEventListener("pointerup", () => { pointerStart = null; });
  turntable.addEventListener("pointercancel", () => { pointerStart = null; });
  document.querySelector("#rotate-left")?.addEventListener("click", () => {
    setAngle(angle - 35);
    heroStage?.dispatchEvent(
      new CustomEvent("yodo:rotate", {
        detail: { direction: -1, degrees: -35 },
        bubbles: true,
      })
    );
  });
  document.querySelector("#rotate-right")?.addEventListener("click", () => {
    setAngle(angle + 35);
    heroStage?.dispatchEvent(
      new CustomEvent("yodo:rotate", {
        detail: { direction: 1, degrees: 35 },
        bubbles: true,
      })
    );
  });
  document.querySelectorAll("[data-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      const isZoomIn = button.dataset.zoom === "in";
      zoom = Math.min(1.3, Math.max(0.75, zoom + (isZoomIn ? 0.1 : -0.1)));
      renderModel();
      heroStage?.dispatchEvent(
        new CustomEvent("yodo:zoom", {
          detail: { delta: isZoomIn ? 0.35 : -0.35 },
          bubbles: true,
        })
      );
    });
  });

  const syncMotion = () => {
    const active = !reducedMotion.matches && document.visibilityState === "visible";
    if (heroStage) heroStage.dataset.motion = active ? "on" : "off";
  };
  document.addEventListener("visibilitychange", syncMotion);
  reducedMotion.addEventListener("change", syncMotion);
  syncMotion();
}

const newsletterForm = document.querySelector("#newsletter-form");
newsletterForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#newsletter-email");
  if (!email.checkValidity()) {
    email.reportValidity();
    return;
  }
  document.querySelector("#newsletter-message").textContent = "C’est noté - à bientôt dans votre boîte mail.";
  newsletterForm.reset();
});
