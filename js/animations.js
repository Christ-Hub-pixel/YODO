try {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger")
  ]);
  gsap.registerPlugin(ScrollTrigger);

  const motion = gsap.matchMedia();
  motion.add("(prefers-reduced-motion: no-preference)", () => {
    const heroStage = document.querySelector("#hero-stage");
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

    intro
      .from(".brand", { autoAlpha: 0, y: -8, duration: 0.45 })
      .from(".main-nav a, .menu-toggle, .cart-trigger", {
        autoAlpha: 0,
        y: -6,
        duration: 0.35,
        stagger: 0.06
      }, "-=0.2")
      .from(".hero-copy > *", {
        autoAlpha: 0,
        y: 16,
        duration: 0.48,
        stagger: 0.08
      }, "-=0.12")
      .from(".hero-stage", {
        autoAlpha: 0,
        scale: 0.985,
        duration: 0.65
      }, "-=0.2");

    gsap.utils.toArray(".section-heading, .manifesto-copy, .newsletter > div").forEach((element) => {
      gsap.from(element, {
        autoAlpha: 0,
        y: 18,
        duration: 0.55,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 95%",
          once: true
        }
      });
    });

    gsap.from(".audience-card", {
      autoAlpha: 0,
      y: 16,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".audience-collections",
        start: "top 95%",
        once: true
      }
    });

    if (document.querySelector(".lookbook-feature")) {
      gsap.from(".lookbook-feature", {
        autoAlpha: 0,
        y: 22,
        duration: 0.6,
        stagger: 0.14,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".lookbook-grid",
          start: "top 92%",
          once: true
        }
      });
    }

    if (document.querySelector(".flagship-showcase .product-card")) {
      gsap.from(".flagship-showcase .product-card", {
        autoAlpha: 0,
        y: 18,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".flagship-showcase",
          start: "top 92%",
          once: true
        }
      });
    }

    gsap.from(".newsletter-form", {
      autoAlpha: 0,
      y: 12,
      duration: 0.45,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".newsletter",
        start: "top 95%",
        once: true
      }
    });

    if (heroStage) {
      ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
        onUpdate: ({ progress }) => {
          heroStage.dispatchEvent(new CustomEvent("yodo:scroll-progress", {
            detail: { progress }
          }));
        }
      });
    }

    return () => intro.kill();
  });
} catch (error) {
  console.error("Les animations GSAP n’ont pas pu être chargées.", error);
}
