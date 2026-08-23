const root = document.documentElement;
const body = document.body;
const header = document.querySelector("[data-header]");
const progressBar = document.querySelector(".scroll-progress");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const hero = document.querySelector(".hero");
const heroVisual = document.querySelector("[data-hero-visual]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const spaceIntro = document.querySelector("[data-space-intro]");

if (spaceIntro) {
  const shouldPlayIntro = root.classList.contains("space-intro-pending");

  if (!shouldPlayIntro || reduceMotion.matches) {
    root.classList.remove("space-intro-pending");
    spaceIntro.remove();
  } else {
    body.classList.add("space-intro-playing");

    let introComplete = false;
    const handleIntroKeydown = (event) => {
      if (event.key === "Escape") skipIntro();
    };
    const completeIntro = () => {
      if (introComplete) return;
      introComplete = true;
      document.removeEventListener("keydown", handleIntroKeydown);
      root.classList.remove("space-intro-pending");
      body.classList.remove("space-intro-playing");
      spaceIntro.remove();
    };

    const skipIntro = () => {
      if (introComplete || spaceIntro.classList.contains("is-skipping")) return;
      spaceIntro.classList.add("is-skipping");
    };

    window.requestAnimationFrame(() => spaceIntro.classList.add("is-active"));
    spaceIntro.addEventListener("click", skipIntro);
    document.addEventListener("keydown", handleIntroKeydown);
    spaceIntro.addEventListener("animationend", (event) => {
      if (event.target === spaceIntro && event.animationName === "space-intro-exit") {
        completeIntro();
      }
    });
    window.setTimeout(completeIntro, 4100);
  }
}

root.classList.add("reveal-ready");

const updateScrollState = () => {
  const scrollTop = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(scrollTop / scrollRange, 1) : 0;

  header?.classList.toggle("is-scrolled", scrollTop > 24);
  progressBar?.style.setProperty("--scroll-progress", progress.toString());
};

let scrollTicking = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateScrollState();
      scrollTicking = false;
    });
  },
  { passive: true },
);
updateScrollState();

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -9% 0px", threshold: 0.08 },
);

document.querySelectorAll("[data-reveal]").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
  revealObserver.observe(element);
});

const setMenuOpen = (open) => {
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileMenu?.classList.toggle("is-open", open);
  body.classList.toggle("menu-open", open);
};

menuToggle?.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

const currentPage = body.dataset.page;
document.querySelectorAll("[data-page-link]").forEach((link) => {
  const isCurrent = link.dataset.pageLink === currentPage;
  link.classList.toggle("is-active", isCurrent);
  if (isCurrent) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
});

if (hero && heroVisual && !reduceMotion.matches && matchMedia("(pointer: fine)").matches) {
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroVisual.style.setProperty("--hero-x", `${x * 12}px`);
    heroVisual.style.setProperty("--hero-y", `${y * 8}px`);
  });

  hero.addEventListener("pointerleave", () => {
    heroVisual.style.setProperty("--hero-x", "0px");
    heroVisual.style.setProperty("--hero-y", "0px");
  });
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear().toString();
