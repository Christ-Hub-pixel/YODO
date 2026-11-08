const status = document.querySelector("#scene-status");
const stage = document.querySelector("#hero-stage");

async function loadScene() {
  try {
    const { initThreeScene } = await import("./three-scene.js");
    await initThreeScene();
  } catch (error) {
    console.error("La scène Three.js n’a pas pu être chargée.", error);
    status.textContent = "Aperçu illustré affiché : le moteur 3D n’est pas disponible.";
  }
}

function observeStage() {
  if (!stage || !status) return;
  const bounds = stage.getBoundingClientRect();
  const nearViewport = bounds.top < window.innerHeight + 240 && bounds.bottom > -240;
  if (nearViewport || !("IntersectionObserver" in window)) {
    void loadScene();
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void loadScene();
    }, { rootMargin: "240px 0px" });
    observer.observe(stage);
  }
}

window.setTimeout(observeStage, 100);
