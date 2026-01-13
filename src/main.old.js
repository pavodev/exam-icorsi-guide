
// import gsap from 'gsap';

// import './style.css'

// window.addEventListener('DOMContentLoaded', () => {
//   const arrow = document.querySelector("#Arrow");
//   const circle = document.querySelector("#Circle");
//   const configOverlay = document.querySelector("#config-overlay");
//   const configForm = document.querySelector("#config-form");
//   const configReset = document.querySelector("#config-reset");

//   // Load svgs
//   document.querySelectorAll('.svg-container').forEach(async container => {
//     const svg = await loadInlineSVG(container)
//   })

//   if (arrow) {
//     // Start arrow off-screen top-right (adjust distances as needed)
//     gsap.fromTo(
//       arrow,
//       { x: 500, y: -300, opacity: 0 },   // initial offscreen position & invisible
//       { x: 0, y: 0, opacity: 1, duration: 1, ease: "power2.out" } // animate to original position
//     );

//     gsap.fromTo(
//       circle,
//       { opacity: 0 },   // initial offscreen position & invisible
//       { opacity: 1, duration: 1, delay: 1, ease: "power2.out" } // animate to original position
//     );
//   }

//   /* Config selection */
//   const hideOverlay = () => {
//     if (configOverlay) {
//       configOverlay.style.display = "none";
//     }
//   };

//   const showOverlay = () => {
//     if (configOverlay) {
//       configOverlay.style.display = "flex";
//     }
//   };

//   const getConfigsFromUrl = () => {
//     const params = new URLSearchParams(window.location.search);
//     const cfg = params.get("cfg");
//     return cfg ? cfg.split(",").filter(Boolean) : [];
//   };

//   const setConfigsInUrl = (configs) => {
//     const params = new URLSearchParams(window.location.search);
//     if (configs.length) {
//       params.set("cfg", configs.join(","));
//     } else {
//       params.delete("cfg");
//     }
//     const newUrl = `${window.location.pathname}?${params.toString()}`;
//     window.history.replaceState({}, "", newUrl);
//   };

//   if (configForm) {
//     configForm.addEventListener("submit", (e) => {
//       e.preventDefault();
//       const selected = Array.from(configForm.querySelectorAll("input[name='configs']:checked")).map(input => input.value);
//       setConfigsInUrl(selected);
//       hideOverlay();
//       applyFilters(selected);
//     });
//   }

//   if (configReset && configForm) {
//     configReset.addEventListener("click", (e) => {
//       e.preventDefault();
//       configForm.reset();
//       setConfigsInUrl([]);
//       showOverlay();
//     });
//   }

//   // Pre-check boxes from URL
//   const existingConfigs = getConfigsFromUrl();
//   if (existingConfigs.length && configForm) {
//     existingConfigs.forEach(val => {
//       const input = configForm.querySelector(`input[name="configs"][value="${val}"]`);
//       if (input) input.checked = true;
//     });
//   }

//   // Always show overlay on load; pre-check boxes from URL keeps state visible
//   showOverlay();

//   /* Filter articles based on configs */
//   const renumberSteps = () => {
//     const visibleSteps = Array.from(document.querySelectorAll("article.step")).filter(el => el.style.display !== "none");
//     visibleSteps.forEach((article, idx) => {
//       const numberEl = article.querySelector(".step__number");
//       if (numberEl) {
//         numberEl.textContent = idx + 1;
//       }
//     });
//   };

//   async function loadInlineSVG(container) {
//     const url = container.dataset.svg
//     const res = await fetch(url)
//     const svgText = await res.text()

//     container.innerHTML = svgText

//     return container.querySelector('svg')
//   }

//   const applyFilters = (selectedConfigs) => {
//     const articles = Array.from(document.querySelectorAll("article.step"));
//     if (!articles.length) return;

//     const selected = selectedConfigs || [];
//     const hasSelection = selected.length > 0;

//     articles.forEach(article => {
//       const cfgRaw = article.getAttribute("data-config");
//       const cfgList = cfgRaw ? cfgRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

//       // Default hidden
//       let show = false;

//       // If explicit empty data-config, always show
//       if (!cfgRaw || cfgRaw.trim() === "") {
//         show = true;
//       } else if (hasSelection) {
//         // Show if intersection exists
//         show = cfgList.some(cfg => selected.includes(cfg));
//       }

//       article.style.display = show ? "" : "none";
//     });

//     renumberSteps();
//   };

//   // Apply filters on load based on URL cfg
//   applyFilters(existingConfigs);

//   /* Animate SVGs */

//   const containers = document.querySelectorAll(".step__image--container");

//   containers.forEach(container => {
//     // Find the caption paragraph associated with this container
//     let captionEl =
//       container.closest(".step")?.querySelector(".step__caption") ||
//       container.closest("article")?.querySelector(".step__caption") ||
//       container.parentElement?.querySelector(".step__caption") ||
//       container.querySelector(".step__caption");

//     // If no caption element exists, create one just after the container
//     if (!captionEl) {
//       captionEl = document.createElement("p");
//       captionEl.className = "step__caption mt-2 text-center text-gray-600 text-md leading-relaxed";
//       container.insertAdjacentElement("afterend", captionEl);
//     }

//     const animateCaption = () => {
//       if (!captionEl) return;
//       gsap.fromTo(
//         captionEl,
//         { autoAlpha: 0, y: 8 },
//         { autoAlpha: 1, y: 0, duration: 0.35, ease: "power1.out" }
//       );
//     };

//     // Normalize container sizing so every slide shares the same aspect ratio
//     container.style.aspectRatio = "1319 / 792";
//     container.style.height = "auto";
//     container.style.minHeight = "unset";
//     container.classList.remove("px-4");
//     container.classList.add("p-4");

//     let existingSlides = [];
//     try {
//       existingSlides = Array.from(
//         container && typeof container.querySelectorAll === "function"
//           ? container.querySelectorAll(".step__slide")
//           : []
//       );
//     } catch (e) {
//       existingSlides = [];
//     }

//     const normalizeSvg = (svg) => {
//       svg.classList.remove("absolute", "top-0", "px-4", "h-auto");
//       svg.classList.add("w-auto", "h-auto", "max-w-full", "max-h-full");
//       svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
//       svg.setAttribute("width", "100%");
//       svg.setAttribute("height", "100%");
//       svg.style.width = "auto";
//       svg.style.height = "auto";
//       svg.style.maxWidth = "100%";
//       // svg.style.maxHeight = "400px";
//     };

//     let slides = [];
//     let slideCaptions = [];

//     if (existingSlides.length) {
//       slides = existingSlides;
//       slides.forEach(slide => {
//         const svg = slide.querySelector("svg");
//         if (svg) normalizeSvg(svg);
//         slideCaptions.push(
//           (svg?.dataset.caption) ||
//           svg?.getAttribute("aria-label") ||
//           svg?.getAttribute("title") ||
//           ""
//         );
//       });
//     } else {
//       let rawSvgs = [];
//       try {
//         rawSvgs = Array.from(
//           container && typeof container.querySelectorAll === "function"
//             ? container.querySelectorAll("svg")
//             : []
//         );
//       } catch (e) {
//         rawSvgs = [];
//       }
//       if (!rawSvgs.length) return;

//       slides = rawSvgs.map(svg => {
//         const wrapper = document.createElement("div");
//         wrapper.className = "step__slide absolute inset-0 flex items-center justify-center p-4";

//         normalizeSvg(svg);

//         wrapper.appendChild(svg);
//         container.appendChild(wrapper);
//         slideCaptions.push(
//           svg.dataset.caption ||
//           svg.getAttribute("aria-label") ||
//           svg.getAttribute("title") ||
//           ""
//         );
//         return wrapper;
//       });
//     }

//     if (!slides.length) {
//       return;
//     }

//     if (slides.length <= 1) {
//       if (captionEl) captionEl.innerHTML = slideCaptions[0] || "";
//       animateCaption();
//       return;  // no animation if only one svg
//     }

//     // Set initial caption
//     if (captionEl) captionEl.innerHTML = slideCaptions[0] || "";
//     animateCaption();

//     let currentIndex = 0;
//     const duration = 0.8;
//     const interval = 10;

//     // Slide distance = container width (the width svgs slide in/out)
//     const slideDistance = container.clientWidth;

//     // CSS setup: absolute position all slides inside container
//     slides.forEach((slide, i) => {
//       gsap.set(slide, { position: "absolute", top: 0, left: 0 });
//       // Show first svg at position 0, others off-right
//       gsap.set(slide, { x: i === 0 ? 0 : slideDistance, autoAlpha: i === 0 ? 1 : 0 });
//     });

//     function slideCycle() {
//       const current = slides[currentIndex];
//       const nextIndex = (currentIndex + 1) % slides.length;
//       const next = slides[nextIndex];

//       // Update caption just before starting the slide transition
//       if (captionEl) captionEl.innerHTML = slideCaptions[nextIndex] || "";
//       animateCaption();

//       const tl = gsap.timeline();

//       // Current SVG slides left and fades out
//       tl.to(current, { x: -slideDistance, autoAlpha: 0, duration, ease: "power2.inOut" });

//       // Next SVG slides in from right and fades in
//       tl.to(next, { x: 0, autoAlpha: 1, duration, ease: "power2.inOut" }, `-=${duration}`);

//       tl.call(() => {
//         // After animation, reset old svg position off to right for next cycle
//         gsap.set(current, { x: slideDistance });
//         currentIndex = nextIndex;
//       });


//       tl.call(() => {
//         setTimeout(slideCycle, interval * 1000);
//       });
//     }

//     // Start first cycle after initial interval
//     setTimeout(slideCycle, interval * 1000);
//   });

//   /* Animate cross */

//   const wrongLine1 = document.querySelector("#WrongLine1");
//   const wrongLine2 = document.querySelector("#WrongLine2");

//   const isRendered = (el) => {
//     if (!el) return false;
//     const style = window.getComputedStyle(el);
//     return style.display !== "none" && style.visibility !== "hidden" && el.getClientRects().length > 0;
//   };

//   if (isRendered(wrongLine1) && isRendered(wrongLine2)) {
//     let length1;
//     let length2;
//     try {
//       length1 = wrongLine1.getTotalLength();
//       length2 = wrongLine2.getTotalLength();
//     } catch (e) {
//       length1 = length2 = null;
//     }

//     if (length1 && length2) {

//       // Prepare WrongLine1 (normal)
//       wrongLine1.style.strokeDasharray = length1;
//       wrongLine1.style.strokeDashoffset = length1;

//       // Prepare WrongLine2 (for rotation)
//       wrongLine2.style.strokeDasharray = length2;
//       wrongLine2.style.strokeDashoffset = length2;

//       // Set transform origin and rotate the WrongLine2 path 180deg in place
//       gsap.set(wrongLine2, {
//         transformOrigin: "50% 50%",
//         rotation: 180,
//       });

//       const tl = gsap.timeline({ repeat: -1, defaults: { duration: 1.5, ease: "power1.inOut" } });

//       // Animate WrongLine1 dashoffset from full length to 0 (draw left to right)
//       tl.to(wrongLine1, { strokeDashoffset: 0 }, 0);

//       // Animate WrongLine2 dashoffset from full length to 0 (draw on rotated line, so visually right to left)
//       tl.to(wrongLine2, { strokeDashoffset: 0 }, 0);

//       // Reverse animations for ping-pong effect
//       // tl.to(wrongLine1, { strokeDashoffset: length1 }, "+=0.5");
//       // tl.to(wrongLine2, { strokeDashoffset: length2 }, "<");
//     }
//   }
// });
