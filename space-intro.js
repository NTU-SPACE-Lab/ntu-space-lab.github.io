// One geographic camera, from NASA's Earth to NTU EEE's S2 building.
// Real imagery and source details are documented in design/earth-intro.md.
const EEE = { longitude: 103.68074742, latitude: 1.34240034 };
const IMAGERY_URL = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer";
const ENGINE_URL = new URL("./assets/vendor/cesium/", import.meta.url).href;
const FLIGHT_MS = 12400;
const AERIAL_HOLD_MS = 1500;
const SCHOOL_MS = 4400;
const TOTAL_MS = FLIGHT_MS + AERIAL_HOLD_MS + SCHOOL_MS;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value) => { const t = clamp(value); return t * t * t * (t * (t * 6 - 15) + 10); };
const mix = (a, b, t) => a + (b - a) * t;
const asset = (name) => new URL(`./assets/images/intro/${name}`, import.meta.url).href;

function loadEngine() {
  if (window.Cesium) return Promise.resolve(window.Cesium);
  window.CESIUM_BASE_URL = ENGINE_URL;
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = `${ENGINE_URL}Widgets/widgets.css`;
  document.head.append(css);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${ENGINE_URL}Cesium.js`;
    script.async = true;
    script.onload = () => resolve(window.Cesium);
    script.onerror = () => reject(new Error("Globe renderer unavailable"));
    document.head.append(script);
  });
}

// Warm only the camera corridor in the browser's ordinary HTTP cache. No tile
// data is persisted by the app. Three workers leave bandwidth for visible tiles.
async function warmApproach(C, provider, signal, mobile) {
  const point = C.Cartographic.fromDegrees(EEE.longitude, EEE.latitude);
  const urls = [];
  for (const level of [7, 9, 11, 13, 15, 17, 18, 19]) {
    const center = provider.tilingScheme.positionToTileXY(point, level);
    const radius = !mobile && level >= 18 ? 2 : 1;
    for (let y = center.y - radius; y <= center.y + radius; y++) {
      for (let x = center.x - radius; x <= center.x + radius; x++) {
        urls.push(`${IMAGERY_URL}/tile/${level}/${y}/${x}`);
      }
    }
  }
  let cursor = 0;
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (!signal.aborted && cursor < urls.length) {
      const url = urls[cursor++];
      try {
        const response = await fetch(url, { signal, cache: "force-cache", credentials: "omit" });
        if (response.ok) await response.arrayBuffer();
      } catch {
        // This is optional preloading; Cesium owns normal retries and errors.
      }
    }
  }));
}

export async function playSpaceIntro(intro) {
  const root = document.documentElement;
  const body = document.body;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motion.matches || !root.classList.contains("space-intro-pending")) {
    intro.remove();
    root.classList.remove("space-intro-pending");
    return;
  }

  window.clearTimeout(window.spaceIntroWatchdog);
  body.classList.add("space-intro-playing");
  const mobile = window.innerWidth < 600;
  const skip = intro.querySelector("[data-intro-skip]");
  const pause = intro.querySelector("[data-intro-pause]");
  const status = intro.querySelector("[data-intro-status]");
  const progress = intro.querySelector("[data-intro-progress]");
  const marker = intro.querySelector("[data-intro-marker]");
  const credits = intro.querySelector("[data-intro-credits]");
  const school = intro.querySelector("[data-intro-school]");
  const schoolImage = intro.querySelector("[data-intro-school-image]");
  const schoolCaption = intro.querySelector("[data-intro-caption]");
  const prefetch = new AbortController();
  const previousFocus = document.activeElement;
  const background = [...body.children].filter((el) => el !== intro && !["SCRIPT", "STYLE"].includes(el.tagName));
  const inertStates = background.map((el) => el.inert);
  background.forEach((el) => { el.inert = true; });
  skip.focus({ preventScroll: true });

  let widget;
  let loadTimer;
  let exitTimer;
  let fallbackTimer;
  let errorTimer;
  let leaving = false;
  let finished = false;
  let fallback = false;
  let paused = false;
  let photoReady = false;
  let elapsed = 0;
  let previousTime;
  let stage = "";
  let resizeScene;
  let setRenderBudget;
  let removeTick;
  let removePostRender;
  let removeRenderError;
  let removeTileListener;
  let removeImageryError;

  // Load the appropriate real school photograph during the orbital flight.
  schoolImage.src = asset(mobile ? "ntu-eee-exterior.jpg" : "ntu-eee-s2.png");
  schoolImage.decode().then(() => {
    photoReady = true;
    if (fallback && !leaving && !finished) {
      school.style.opacity = "1";
      intro.classList.add("is-school-photo");
    }
  }).catch(() => {});

  function destroyGlobe() {
    removeTick?.();
    removePostRender?.();
    removeRenderError?.();
    removeTileListener?.();
    removeImageryError?.();
    removeTick = removePostRender = removeRenderError = removeTileListener = removeImageryError = undefined;
    if (resizeScene) window.removeEventListener("resize", resizeScene);
    prefetch.abort();
    if (widget && !widget.isDestroyed()) {
      widget.useDefaultRenderLoop = false;
      widget.destroy();
    }
    widget = undefined;
  }

  function complete() {
    if (finished) return;
    finished = true;
    clearTimeout(loadTimer);
    clearTimeout(exitTimer);
    clearTimeout(fallbackTimer);
    clearTimeout(errorTimer);
    const hadFocus = intro.contains(document.activeElement);
    destroyGlobe();
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("visibilitychange", onVisibility);
    motion.removeEventListener("change", onMotion);
    window.removeEventListener("pagehide", complete);
    background.forEach((el, i) => { el.inert = inertStates[i]; });
    root.classList.remove("space-intro-pending");
    body.classList.remove("space-intro-playing");
    intro.remove();
    if (hadFocus) {
      const target = previousFocus !== body && previousFocus?.isConnected
        ? previousFocus : document.querySelector(".space-brand");
      target?.focus({ preventScroll: true });
    }
  }

  function leave() {
    if (leaving || finished) return;
    leaving = true;
    clearTimeout(loadTimer);
    clearTimeout(fallbackTimer);
    clearTimeout(errorTimer);
    removeTick?.();
    removeTick = undefined;
    prefetch.abort();
    intro.classList.add("is-leaving");
    // Never destroy Cesium inside its own update/render event stack.
    exitTimer = window.setTimeout(complete, motion.matches ? 0 : 820);
  }

  function showFallback() {
    if (leaving || finished || fallback) return;
    fallback = true;
    clearTimeout(loadTimer);
    if (intro.contains(document.activeElement)) skip.focus({ preventScroll: true });
    destroyGlobe();
    intro.classList.remove("is-arriving");
    intro.classList.add("is-school");
    schoolCaption.setAttribute("aria-hidden", "false");
    intro.dataset.phase = "fallback";
    status.textContent = "NTU School of Electrical and Electronic Engineering";
    if (photoReady) {
      school.style.opacity = "1";
      intro.classList.add("is-school-photo");
    }
    pause.disabled = true;
    fallbackTimer = window.setTimeout(leave, 2200);
  }

  function deferFallback() {
    if (!errorTimer && !leaving && !finished && !fallback) {
      errorTimer = window.setTimeout(showFallback, 0);
    }
  }

  function togglePause() {
    if (pause.disabled || leaving) return;
    paused = !paused;
    intro.dataset.paused = String(paused);
    pause.setAttribute("aria-label", paused ? "Resume intro" : "Pause intro");
    pause.innerHTML = paused
      ? '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="m5 3 8 5-8 5Z" /></svg>'
      : '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M5 3v10M11 3v10" /></svg>';
    previousTime = undefined;
    setRenderBudget?.(paused || elapsed < 800 || elapsed >= FLIGHT_MS ? 5000000 : 2500000);
  }

  function onKey(event) {
    if (event.key === "Escape") { event.preventDefault(); leave(); }
    if (event.key === "Tab") {
      const controls = [...intro.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')].filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden");
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }
  function onVisibility() {
    previousTime = undefined;
    if (!leaving && !finished && !fallback && widget && !widget.isDestroyed()) widget.useDefaultRenderLoop = !document.hidden;
  }
  function onMotion(event) { if (event.matches) complete(); }
  skip.addEventListener("click", leave);
  pause.addEventListener("click", togglePause);
  document.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", onVisibility);
  motion.addEventListener("change", onMotion);
  window.addEventListener("pagehide", complete);
  loadTimer = window.setTimeout(showFallback, 12000);

  try {
    // Start the larger Earth image fetch alongside the renderer, not after it.
    const earthName = mobile || navigator.connection?.saveData ? "earth-blue-marble-4k.jpg" : "earth-blue-marble-8k.jpg";
    const earthPreload = new Image();
    earthPreload.src = asset(earthName);
    const C = await loadEngine();
    if (leaving || finished || fallback) return;
    const [provider, earthProvider] = await Promise.all([
      C.ArcGisMapServerImageryProvider.fromUrl(IMAGERY_URL, { enablePickFeatures: false, maximumLevel: 19 }),
      C.SingleTileImageryProvider.fromUrl(asset(earthName), {
        credit: new C.Credit('<a href="https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/" target="_blank" rel="noreferrer">NASA Blue Marble</a>', true),
      }),
    ]);
    if (leaving || finished || fallback) return;

    widget = new C.CesiumWidget(intro.querySelector("[data-intro-scene]"), {
      baseLayer: new C.ImageryLayer(provider),
      terrainProvider: new C.EllipsoidTerrainProvider(),
      scene3DOnly: true,
      skyBox: false,
      sceneMode: C.SceneMode.SCENE3D,
      creditContainer: credits,
      creditViewport: intro,
      showRenderLoopErrors: false,
      useBrowserRecommendedResolution: true,
      // Use native RAF cadence; a 45 FPS cap stutters on 60 Hz displays.
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      // Retina resolution already smooths edges; four-sample MSAA multiplies
      // fill cost during the entire full-screen flight.
      msaaSamples: 1,
      contextOptions: { webgl: { alpha: false, antialias: true } },
    });
    const scene = widget.scene;
    const camera = widget.camera;
    let pixelBudget = 5000000;
    resizeScene = () => {
      const { clientWidth: width, clientHeight: height } = intro;
      widget.resolutionScale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(pixelBudget / Math.max(1, width * height)));
      widget.resize();
      scene.requestRender();
    };
    setRenderBudget = (budget) => {
      if (pixelBudget === budget) return;
      pixelBudget = budget;
      scene.globe.maximumScreenSpaceError = budget < 5000000 ? 1.75 : 1.25;
      resizeScene();
    };
    resizeScene();
    window.addEventListener("resize", resizeScene);
    onVisibility();
    scene.backgroundColor = C.Color.fromCssColorString("#03070c");
    scene.screenSpaceCameraController.enableInputs = false;
    scene.globe.baseColor = C.Color.fromCssColorString("#10273b");
    scene.globe.enableLighting = true;
    scene.globe.showGroundAtmosphere = true;
    scene.globe.maximumScreenSpaceError = 1.25;
    scene.globe.tileCacheSize = 320;
    scene.globe.preloadAncestors = true;
    scene.globe.preloadSiblings = true;
    const earthLayer = scene.imageryLayers.addImageryProvider(earthProvider);
    scene.fog.enabled = true;
    widget.clock.currentTime = C.JulianDate.fromIso8601("2025-06-21T08:00:00Z");
    widget.clock.shouldAnimate = false;
    camera.frustum.fov = C.Math.toRadians(52);
    const position = C.Cartesian3.fromDegrees(EEE.longitude, EEE.latitude, 5);
    const projected = new C.Cartesian2();
    const radius = C.Ellipsoid.WGS84.maximumRadius;
    const minimumFov = Math.min(camera.frustum.fovy, 2 * Math.atan(Math.tan(camera.frustum.fovy / 2) * camera.frustum.aspectRatio));
    const orbitalHeight = radius / Math.sin(Math.atan(Math.tan(minimumFov / 2) * .84)) - radius;
    const finalHeight = mobile ? 1200 : 950;

    function setPhase(next) {
      if (stage === next) return;
      stage = next;
      intro.dataset.phase = next;
      // Location announcements remain available to screen readers, with no
      // changing slogans or coordinates covering the photograph.
      status.textContent = {
        earth: "Earth", region: "Southeast Asia", singapore: "Singapore",
        campus: "NTU School of Electrical and Electronic Engineering, S2",
        school: "NTU Electrical and Electronic Engineering",
      }[next];
    }

    function pose(time) {
      const t = clamp((time - 800) / (FLIGHT_MS - 800));
      const zoom = smooth(t);
      const alignment = smooth(t / .62);
      const height = Math.exp(mix(Math.log(orbitalHeight), Math.log(finalHeight), zoom));
      earthLayer.alpha = smooth((Math.log(height) - Math.log(450000)) / (Math.log(4000000) - Math.log(450000)));
      camera.setView({
        destination: C.Cartesian3.fromDegrees(mix(94, EEE.longitude, alignment), mix(16, EEE.latitude, alignment), height),
        orientation: { heading: C.Math.toRadians(mix(-10, 0, alignment)), pitch: -C.Math.PI_OVER_TWO, roll: 0 },
      });
      setPhase(height > 2400000 ? "earth" : height > 200000 ? "region" : height > 6500 ? "singapore" : "campus");
      intro.classList.toggle("is-arriving", height < 6500);
      scene.requestRender();
    }
    pose(0);
    removePostRender = scene.postRender.addEventListener(() => {
      if (scene.cartesianToCanvasCoordinates(position, projected)) marker.style.transform = `translate(${projected.x}px, ${projected.y}px)`;
    });
    removeRenderError = scene.renderError.addEventListener(deferFallback);

    // Camera updates and rendering use the same clock/RAF loop. After landing,
    // the globe stops requesting frames while the photo moves in the compositor.
    function tick() {
      if (leaving || finished || fallback) return;
      try {
        const now = performance.now();
        if (previousTime !== undefined && !paused && !document.hidden) elapsed += Math.min(now - previousTime, 80);
        previousTime = now;
        if (paused || document.hidden) return;
        setRenderBudget(elapsed < 800 || elapsed >= FLIGHT_MS ? 5000000 : 2500000);
        if (elapsed <= FLIGHT_MS) pose(elapsed);
        else if (stage !== "school" && elapsed < FLIGHT_MS + 100) pose(FLIGHT_MS);
        const schoolTime = elapsed - FLIGHT_MS - AERIAL_HOLD_MS;
        if (schoolTime >= 0) {
          setPhase("school");
          intro.classList.add("is-school");
          schoolCaption.setAttribute("aria-hidden", "false");
          if (photoReady) {
            const blend = smooth(schoolTime / 1100);
            school.style.opacity = String(blend);
            schoolImage.style.transform = `scale(${1 + smooth(schoolTime / SCHOOL_MS) * .035})`;
            // Keep map source credits visible until the photograph covers it.
            intro.classList.toggle("is-school-photo", blend >= 1);
            if (blend >= 1 && scene.globe.show) {
              prefetch.abort();
              scene.globe.show = false;
              scene.requestRender();
            }
          }
        }
        progress.style.transform = `scaleX(${clamp(elapsed / TOTAL_MS)})`;
        if (elapsed >= TOTAL_MS) leave();
      } catch { deferFallback(); }
    }
    let started = false;
    let observedTileRequest = false;
    let imageryErrors = 0;
    removeImageryError = provider.errorEvent.addEventListener(() => {
      if (!started && ++imageryErrors >= 3) deferFallback();
    });
    removeTileListener = scene.globe.tileLoadProgressEvent.addEventListener((pending) => {
      if (pending > 0) observedTileRequest = true;
      if (!observedTileRequest || pending !== 0 || started || leaving || finished || fallback || !scene.globe.tilesLoaded) return;
      started = true;
      clearTimeout(loadTimer);
      intro.classList.add("is-ready");
      pause.disabled = false;
      removeTick = scene.preUpdate.addEventListener(tick);
      if (!navigator.connection?.saveData) warmApproach(C, provider, prefetch.signal, mobile).catch(() => {});
    });
  } catch { showFallback(); }
}
