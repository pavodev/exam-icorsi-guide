import gsap from "gsap";
import "./style.css";

const I18N = {
  en: {
    "step.computerLogin": " Computer Login",
    "step.usiAccount": "USI account (same you use for Wi-Fi and email access)",
    "step.navigateTo": " Navigate to",
    "step.switchAccount": "Use your Switch Edu-ID account",
    "step.launchSeb": " Enter the exam course",
    "step.getReady": "Get ready for the beginning of the exam",
    "step.enterExamAndLaunch": " Enter the exam and Launch Safe Exam Browser",
    "step.immediately": "Do this immediately, this won't start the exam yet!",
    "step.provided": " Use provided login credentials",
    "step.providedDescription": "Log in using the credentials provided on the paper in front of you.",
    "step.providedDescription2": "Then, fill in and sign the paper.",
    "step.openBook": " Open book exam",
    "step.openBookDescription": "This is an open-book exam. The professor will explain which materials you are allowed to use during the exam.",
    "password.exam": "Exam",
    "password.password": "Exam start password:",
    "password.close": "Close",
    "password.show": "Show",
  },
  it: {
    "step.computerLogin": " Login con account personale",
    "step.usiAccount": "Account USI (lo stesso usato per Wi-Fi e casella e-mail)",
    "step.navigateTo": " Vai su",
    "step.switchAccount": "Usa il tuo account Switch Edu-ID",
    "step.launchSeb": " Entra nel corso esame",
    "step.getReady": "Preparati per l'inizio dell'esame",
    "step.enterExamAndLaunch": " Clicca sul quiz e avvia Safe Exam Browser",
    "step.immediately": "Puoi farlo già, questo non farà ancora iniziare l'esame!",
    "step.provided": " Login con account d'esame",
    "step.providedDescription": "Fai login sul computer utilizzando l'account che trovi sul foglio davanti a te.",
    "step.providedDescription2": "Compila e firma il foglio.",
    "step.openBook": " Esame open book",
    "step.openBookDescription": "Questo è un esame open book. Il professore spiegherà quali materiali sono consentiti durante l'esame.",
    "password.exam": "Esame",
    "password.password": "Password esame:",
    "password.close": "Chiudi",
    "password.show": "Mostra",
  },
};

window.addEventListener("DOMContentLoaded", () => {
  const DEFAULT_LANG = "en";
  const DEFAULT_DOMAIN = "exam.icorsi.ch";
  const DEFAULT_H2 = 1.35;
  const DEFAULT_H3 = 1.10;

  const configOverlay = document.querySelector("#config-overlay");
  const configForm = document.querySelector("#config-form");
  const configReset = document.querySelector("#config-reset");
  let scrollYBeforeOverlay = 0;

  /****** FUNCTIONS ******/

  async function loadInlineSVG(container) {
    const raw = container.dataset.svg; // e.g. "svg/personal-account.svg"
    const url = new URL(import.meta.env.BASE_URL + raw, window.location.href).toString();

    const res = await fetch(url);
    if (!res.ok) throw new Error(`SVG fetch failed (${res.status}): ${url}`);

    container.innerHTML = await res.text();
    return container.querySelector("svg");
  }

  const getConfigsFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.getAll("cfg").map((s) => s.trim()).filter(Boolean);
  };

  const setConfigsInUrl = (configs) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("cfg");
    configs.forEach((c) => url.searchParams.append("cfg", c));
    window.history.replaceState({}, "", url.toString());
  };

  const getDomainFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("domain") || DEFAULT_DOMAIN;
  };

  const setDomainInUrl = (domain) => {
    const url = new URL(window.location.href);

    if (domain && domain !== DEFAULT_DOMAIN) {
      url.searchParams.set("domain", domain);
    } else {
      url.searchParams.delete("domain");
    }

    window.history.replaceState({}, "", url.toString());
  };

  const applyDomain = (domain) => {
    const label = document.querySelector("#exam-domain-label");
    if (label) label.textContent = domain;
  };

  const getLangFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("lang") || DEFAULT_LANG;
  };

  const setLangInUrl = (lang) => {
    const url = new URL(window.location.href);
    if (lang && lang !== DEFAULT_LANG) url.searchParams.set("lang", lang);
    else url.searchParams.delete("lang");
    window.history.replaceState({}, "", url.toString());
  };

  const applyLanguage = (lang) => {
    const dict = I18N[lang] || I18N[DEFAULT_LANG];

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const value = dict[key];
      if (typeof value === "string") el.textContent = value;
    });
  };

  const clampNum = (v, min, max) => Math.min(max, Math.max(min, v));

  const getNumParam = (key, fallback) => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(key);
    const num = raw !== null ? Number(raw) : NaN;
    return Number.isFinite(num) ? num : fallback;
  };

  const setTextSizesInUrl = (h2, h3) => {
    const url = new URL(window.location.href);

    if (h2 && h2 !== DEFAULT_H2) url.searchParams.set("h2", String(h2));
    else url.searchParams.delete("h2");

    if (h3 && h3 !== DEFAULT_H3) url.searchParams.set("h3", String(h3));
    else url.searchParams.delete("h3");

    window.history.replaceState({}, "", url.toString());
  };

  const applyTextSizes = (h2, h3) => {
    // Apply to all step titles/subtitles
    document.querySelectorAll(".step__title").forEach((el) => {
      el.style.fontSize = `${h2}rem`;
      el.style.lineHeight = "1.15";
    });

    // Your subtitles are plain h3 under .step
    document.querySelectorAll("article.step h3").forEach((el) => {
      el.style.fontSize = `${h3}rem`;
      el.style.lineHeight = "1.15";
    });
  };

  const renumberSteps = () => {
    const steps = Array.from(document.querySelectorAll("article.step"));

    const visibleSteps = steps.filter((el) => el.offsetParent !== null);

    visibleSteps.forEach((article, idx) => {
      const numberEl = article.querySelector(".step__number");
      if (numberEl) numberEl.textContent = idx + 1;
    });
  };

  const applyFilters = (selectedConfigs) => {
    const articles = Array.from(document.querySelectorAll("article.step"));
    if (!articles.length) return;

    const selected = selectedConfigs || [];
    const hasSelection = selected.length > 0;

    articles.forEach((article) => {
      const cfgRaw = article.getAttribute("data-config");
      const cfgList = cfgRaw ? cfgRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];

      // Default hidden
      let show = false;

      // If explicit empty data-config, always show
      if (!cfgRaw || cfgRaw.trim() === "") {
        show = true;
      } else if (hasSelection) {
        // Show if intersection exists
        show = cfgList.some((cfg) => selected.includes(cfg));
      }

      article.style.display = show ? "" : "none";
    });

    renumberSteps();
  };

  const showOverlay = () => {
    scrollYBeforeOverlay = window.scrollY || 0;

    if (configOverlay) configOverlay.style.display = "flex";

    // Lock background scroll without jumping
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYBeforeOverlay}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  };

  const hideOverlay = () => {
    if (configOverlay) configOverlay.style.display = "none";

    // Restore scroll
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    window.scrollTo(0, scrollYBeforeOverlay);
  };

  /****** SLIDER / CAPTIONS ******/

  const normalizeSvg = (svg) => {
    if (!svg) return;
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "auto";
    svg.style.height = "auto";
    svg.style.maxWidth = "100%";
    svg.style.maxHeight = "100%";
    svg.style.display = "block";
  };

  const initSlidingForContainer = (container) => {
    // Avoid double-initializing
    if (container.dataset.sliderInit === "1") return;
    container.dataset.sliderInit = "1";

    // Container must be relative for absolutely-positioned slides
    container.style.position = "relative";

    // Pause/Resume animation on mouse over
    // container.addEventListener("mouseenter", () => gsap.globalTimeline.pause());
    // container.addEventListener("mouseleave", () => gsap.globalTimeline.resume());

    // We must prevent
    // multiple svg-containers from being laid out.
    // We'll absolutely position slides so layout won't matter after wrapping.

    // Caption element: use existing .step__caption if present, otherwise create one after container
    let captionEl =
      container.closest(".step")?.querySelector(".step__caption") ||
      container.closest("article")?.querySelector(".step__caption");

    if (!captionEl) {
      captionEl = document.createElement("p");
      captionEl.className = "step__caption mt-2 text-center text-gray-600 text-md leading-relaxed";
      container.insertAdjacentElement("afterend", captionEl);
    }

    const animateCaption = () => {
      if (!captionEl) return;
      gsap.fromTo(
        captionEl,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power1.out" }
      );
    };

    // Build slides from the *direct children* .svg-container elements
    const svgContainers = Array.from(container.querySelectorAll(":scope > .svg-container"));
    if (!svgContainers.length) return;

    // If only one SVG container, normalize SVG and set caption (if any) then stop
    if (svgContainers.length === 1) {
      svgContainers[0].classList.add("w-full", "h-full", "flex", "items-center", "justify-center");
      const svg = svgContainers[0].querySelector("svg");
      normalizeSvg(svg);

      const cap =
        svg?.dataset.caption ||
        svg?.getAttribute("aria-label") ||
        svg?.getAttribute("title") ||
        "";
      if (captionEl) captionEl.innerHTML = cap;
      animateCaption();
      return;
    }

    // Wrap each .svg-container into a slide
    const slides = [];
    const slideCaptions = [];

    svgContainers.forEach((svgContainer) => {
      svgContainer.classList.add("w-full", "h-full", "flex", "items-center", "justify-center");

      // Capture caption from contained svg (if any)
      const svg = svgContainer.querySelector("svg");
      normalizeSvg(svg);

      slideCaptions.push(
        svg?.dataset.caption ||
        svg?.getAttribute("aria-label") ||
        svg?.getAttribute("title") ||
        ""
      );

      // Create slide wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "step__slide h-full absolute inset-0 flex items-center justify-center p-4";

      // Move the svgContainer inside the wrapper
      wrapper.appendChild(svgContainer);
      container.appendChild(wrapper);
      container.style.position = "relative";
      container.style.overflow = "hidden";

      slides.push(wrapper);
    });

    // Set initial caption
    if (captionEl) captionEl.innerHTML = slideCaptions[0] || "";
    animateCaption();

    // Force container to hide overflow (already in your HTML, but keep safe)
    container.style.overflow = "hidden";

    // Measure slide distance after DOM changes
    const getSlideDistance = () => container.clientWidth || 1;

    let currentIndex = 0;
    const duration = 0.8;
    const intervalSec = 10;

    // Initial state: first slide visible, others off-right
    const dist0 = getSlideDistance();
    slides.forEach((slide, i) => {
      gsap.set(slide, {
        position: "absolute",
        top: 0,
        left: 0,
        x: i === 0 ? 0 : dist0,
        autoAlpha: i === 0 ? 1 : 0,
      });
    });

    // Use GSAP delayedCall instead of setTimeout (cleaner + easier to kill if needed)
    const cycle = () => {
      const current = slides[currentIndex];
      const nextIndex = (currentIndex + 1) % slides.length;
      const next = slides[nextIndex];

      const dist = getSlideDistance();

      // Ensure the incoming slide starts off-right (important after resizes)
      gsap.set(next, { x: dist, autoAlpha: 0 });

      // Update caption before sliding
      if (captionEl) captionEl.innerHTML = slideCaptions[nextIndex] || "";
      animateCaption();

      const tl = gsap.timeline();

      tl.to(current, { x: -dist, autoAlpha: 0, duration, ease: "power2.inOut" });
      tl.to(next, { x: 0, autoAlpha: 1, duration, ease: "power2.inOut" }, `-=${duration}`);
      tl.call(() => {
        // Reset outgoing slide to off-right for next cycle
        gsap.set(current, { x: dist, autoAlpha: 0 });
        currentIndex = nextIndex;
      });

      gsap.delayedCall(intervalSec, cycle);
    };

    gsap.delayedCall(intervalSec, cycle);
  };

  const initAllSliding = () => {
    const containers = document.querySelectorAll(".step__image--container");
    containers.forEach((c) => initSlidingForContainer(c));
  };

  /****** SETUP ******/
  const existingConfigs = getConfigsFromUrl();
  const domainInput = document.querySelector("#exam-domain");
  const existingDomain = getDomainFromUrl();
  const langSelect = document.querySelector("#lang");
  const existingLang = getLangFromUrl();
  const h2Slider = document.querySelector("#h2-size");
  const h3Slider = document.querySelector("#h3-size");
  const h2ValueEl = document.querySelector("#h2-size-value");
  const h3ValueEl = document.querySelector("#h3-size-value");

  if (domainInput) {
    domainInput.value = existingDomain;
  }

  applyDomain(existingDomain);

  if (langSelect) langSelect.value = existingLang;

  applyLanguage(existingLang);

  let existingH2 = getNumParam("h2", DEFAULT_H2);
  let existingH3 = getNumParam("h3", DEFAULT_H3);

  // Clamp to slider bounds just in case someone edits URL manually
  existingH2 = clampNum(existingH2, 0.8, 2.2);
  existingH3 = clampNum(existingH3, 0.8, 2.2);

  if (h2Slider) h2Slider.value = String(existingH2);
  if (h3Slider) h3Slider.value = String(existingH3);

  if (h2ValueEl) h2ValueEl.textContent = existingH2.toFixed(2);
  if (h3ValueEl) h3ValueEl.textContent = existingH3.toFixed(2);

  // Apply immediately on load
  applyTextSizes(existingH2, existingH3);

  const syncSizesFromSliders = (writeUrl = false) => {
    const h2 = clampNum(Number(h2Slider?.value ?? DEFAULT_H2), 0.8, 2.2);
    const h3 = clampNum(Number(h3Slider?.value ?? DEFAULT_H3), 0.8, 2.2);

    if (h2ValueEl) h2ValueEl.textContent = h2.toFixed(2);
    if (h3ValueEl) h3ValueEl.textContent = h3.toFixed(2);

    applyTextSizes(h2, h3);
    if (writeUrl) setTextSizesInUrl(h2, h3);
  };

  if (h2Slider) h2Slider.addEventListener("input", () => syncSizesFromSliders(true));
  if (h3Slider) h3Slider.addEventListener("input", () => syncSizesFromSliders(true));

  if (configForm) {
    configForm.querySelectorAll(`input[name="cfg"]`).forEach((i) => (i.checked = false));

    existingConfigs.forEach((val) => {
      const input = configForm.querySelector(`input[name="cfg"][value="${CSS.escape(val)}"]`);
      if (input) input.checked = true;
    });
  }

  applyFilters(existingConfigs);
  showOverlay();

  if (configForm) {
    configForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const selected = Array.from(configForm.querySelectorAll("input[name='cfg']:checked")).map(
        (input) => input.value
      );
      const domain = domainInput?.value.trim() || DEFAULT_DOMAIN;
      const lang = langSelect?.value || DEFAULT_LANG;

      setDomainInUrl(domain);
      applyDomain(domain);

      setLangInUrl(lang);
      applyLanguage(lang);

      setConfigsInUrl(selected);
      applyFilters(selected);

      syncSizesFromSliders(true);

      // (Re)numbering is done in applyFilters; slider init is idempotent
      initAllSliding();

      hideOverlay();
    });
  }

  if (configReset && configForm) {
    configReset.addEventListener("click", (e) => {
      e.preventDefault();
      configForm.reset();

      if (langSelect) langSelect.value = DEFAULT_LANG;

      setLangInUrl(DEFAULT_LANG);
      applyLanguage(DEFAULT_LANG);

      if (h2Slider) h2Slider.value = String(DEFAULT_H2);
      if (h3Slider) h3Slider.value = String(DEFAULT_H3);

      syncSizesFromSliders(true);

      setConfigsInUrl([]);
      applyFilters([]); // keep your current reset behavior
      initAllSliding();
      showOverlay();
    });
  }

  /****** LOAD SVGS THEN INIT SLIDERS ******/

  (async () => {
    const svgContainers = Array.from(document.querySelectorAll(".svg-container"));

    // Wait until all SVGs are injected (critical for the slider)
    await Promise.all(svgContainers.map((c) => loadInlineSVG(c).catch(() => null)));

    // Now that SVGs exist in the DOM, initialize sliding
    initAllSliding();

    /****** ANIMATE SVGS ******/

    const wrongLine1 = document.querySelector("#WrongLine1");
    const wrongLine2 = document.querySelector("#WrongLine2");

    const isRendered = (el) => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden" && el.getClientRects().length > 0;
    };

    if (isRendered(wrongLine1) && isRendered(wrongLine2)) {
      let length1, length2;
      try {
        length1 = wrongLine1.getTotalLength();
        length2 = wrongLine2.getTotalLength();
      } catch {
        length1 = length2 = null;
      }

      if (length1 && length2) {
        wrongLine1.style.strokeDasharray = length1;
        wrongLine1.style.strokeDashoffset = length1;

        wrongLine2.style.strokeDasharray = length2;
        wrongLine2.style.strokeDashoffset = length2;

        gsap.set(wrongLine2, { transformOrigin: "50% 50%", rotation: 180 });

        gsap.timeline({ repeat: -1, defaults: { duration: 1.5, ease: "power1.inOut" } })
          .to(wrongLine1, { strokeDashoffset: 0 }, 0)
          .to(wrongLine2, { strokeDashoffset: 0 }, 0);
      }
    }

    const circles = document.querySelectorAll("#circle,#circle-1,#circle-2,#circle-3");
    const arrows = document.querySelectorAll("#arrow, #arrow-1,#arrow-2,#arrow-3");

    // Pulse circle (scale + slight fade), infinite
    circles.forEach((c) => {
      gsap.set(c, { transformOrigin: "50% 50%" });
      gsap.to(c, {
        scale: 1.08,
        autoAlpha: 0,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut",
      });
    });

    // Arrow “nudge” (small translate), infinite
    arrows.forEach((a) => {
      gsap.to(a, {
        x: 8,
        duration: 1.5,
        autoAlpha: 0,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut",
      });
    });
  })();

  // ===== Password button + modal (styled like config overlay) =====
  const pwdFab = document.querySelector("#pwd-fab");
  const pwdOverlay = document.querySelector("#pwd-overlay");
  const pwdForm = document.querySelector("#pwd-form");
  const pwdInput = document.querySelector("#pwd-input");
  const pwdClose = document.querySelector("#pwd-close");
  const pwdClear = document.querySelector("#pwd-clear");
  const pwdToggle = document.querySelector("#pwd-toggle");
  let passwordVisible = false;

  const openPwdOverlay = () => {
    if (!pwdOverlay) return;
    pwdOverlay.classList.remove("hidden");
    pwdOverlay.classList.add("flex");
    pwdOverlay.setAttribute("aria-hidden", "false");

    // Lock background scroll (same approach you use for config)
    // If you already have global helpers for this, call them instead.
    // (Keeping it minimal here.)
    document.body.classList.add("overflow-hidden");

    setTimeout(() => pwdInput?.focus(), 0);
  };

  const closePwdOverlay = () => {
    if (!pwdOverlay) return;

    pwdOverlay.classList.add("hidden");
    pwdOverlay.classList.remove("flex");
    pwdOverlay.setAttribute("aria-hidden", "true");

    // Reset visibility when closing
    if (pwdInput) pwdInput.type = "password";
    passwordVisible = false;

    const pwdToggle = document.querySelector("#pwd-toggle");
    if (pwdToggle) pwdToggle.textContent = "Show";

    document.body.classList.remove("overflow-hidden");
  };

  pwdFab?.addEventListener("click", openPwdOverlay);
  pwdClose?.addEventListener("click", closePwdOverlay);

  pwdClear?.addEventListener("click", () => {
    if (!pwdInput) return;

    pwdInput.value = "";
    pwdInput.type = "password";
    passwordVisible = false;

    const pwdToggle = document.querySelector("#pwd-toggle");
    if (pwdToggle) pwdToggle.textContent = "Show";

    pwdInput.focus();
  });

  // Prevent submit from reloading; keep overlay open so it can be read

  pwdForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!pwdInput) return;

    passwordVisible = !passwordVisible;

    if (passwordVisible) {
      pwdInput.type = "text";
      pwdInput.blur();
      if (pwdToggle) pwdToggle.textContent = "Hide";
    } else {
      pwdInput.type = "password";
      pwdInput.focus();
      if (pwdToggle) pwdToggle.textContent = "Show";
    }
  });

  // Click outside card closes (overlay background click)
  pwdOverlay?.addEventListener("click", (e) => {
    if (e.target === pwdOverlay) closePwdOverlay();
  });

  // ESC closes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && pwdOverlay && !pwdOverlay.classList.contains("hidden")) {
      closePwdOverlay();
    }
  });
});
