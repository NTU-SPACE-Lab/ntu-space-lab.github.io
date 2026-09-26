// Animate the original artwork without replacing its geometry, materials or lighting.
export function mountHeroWorld(figure) {
  const host = figure.querySelector('[data-hero-scene]');
  const artwork = figure.querySelector('.hero-artwork');
  const control = figure.querySelector('[data-hero-motion]');
  if (!host || !artwork || !control) return;

  const ns = 'http://www.w3.org/2000/svg';
  const make = (tag, attributes, parent) => {
    const element = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    parent.append(element);
    return element;
  };
  const svg = make('svg', { viewBox: '0 0 1448 1086', 'aria-hidden': 'true', focusable: 'false' }, host);
  const defs = make('defs', {}, svg);
  const glow = make('radialGradient', { id: 'hero-signal-glow' }, defs);
  make('stop', { offset: '0', 'stop-color': '#4095ff', 'stop-opacity': '.48' }, glow);
  make('stop', { offset: '1', 'stop-color': '#4095ff', 'stop-opacity': '0' }, glow);
  const scanGradient = make('linearGradient', { id: 'hero-scan-light', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
  for (const [offset, opacity] of [['0', '0'], ['.68', '.04'], ['.92', '.17'], ['1', '0']]) {
    make('stop', { offset, 'stop-color': '#3288f0', 'stop-opacity': opacity }, scanGradient);
  }
  const personMask = make('clipPath', { id: 'hero-person-mask' }, defs);
  make('path', { d: 'M1099 529 Q1117 529 1118 548 L1111 576 1127 590 1149 639 1139 650 1114 611 1125 658 1116 699 1141 760 1153 779 1136 787 1120 777 1092 722 1081 764 1063 779 1045 772 1057 749 1068 696 1073 648 1058 637 1061 608 1075 587 1088 575 1088 554 Z' }, personMask);
  const personField = make('g', { 'clip-path': 'url(#hero-person-mask)' }, svg);
  const scan = make('rect', { x: '1038', y: '0', width: '125', height: '82', fill: 'url(#hero-scan-light)' }, personField);
  const scanEdge = make('path', { d: 'M1038 0H1163', stroke: '#347fe0', 'stroke-width': '1.5', opacity: '.48' }, personField);

  // Elliptical signals follow the source illustration's globe and trajectory planes.
  // Only short, travelling highlights are added; its original fine lines stay visible.
  const trajectories = [
    { x: 863, y: 515, rx: 477, ry: 437, angle: 0, speed: 1, phase: .08, color: '#398ef2' },
    { x: 853, y: 530, rx: 557, ry: 163, angle: -28, speed: -2, phase: .19, color: '#3c92f3' },
    { x: 850, y: 483, rx: 500, ry: 114, angle: -17, speed: 1, phase: .52, color: '#ec5478' },
    { x: 863, y: 647, rx: 488, ry: 256, angle: 13, speed: -1, phase: .72, color: '#4b9cff' },
  ].map((route) => {
    const group = make('g', {}, svg);
    const halo = make('circle', { r: '17', fill: 'url(#hero-signal-glow)' }, group);
    const tail = Array.from({ length: 11 }, (_, i) => make('circle', {
      r: (1.2 + i * .17).toFixed(2), fill: route.color, opacity: (.04 + i * .039).toFixed(2),
    }, group));
    const head = make('circle', { r: '4', fill: route.color }, group);
    const core = make('circle', { r: '1.4', fill: '#ffffff', opacity: '.9' }, group);
    const rotation = route.angle * Math.PI / 180;
    return { ...route, halo, tail, head, core, cos: Math.cos(rotation), sin: Math.sin(rotation) };
  });
  const pointOnRoute = (route, phase) => {
    const angle = phase * Math.PI * 2;
    const x = Math.cos(angle) * route.rx;
    const y = Math.sin(angle) * route.ry;
    return [route.x + x * route.cos - y * route.sin, route.y + x * route.sin + y * route.cos];
  };
  const position = (element, x, y) => element.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);

  const tableSignals = make('g', { fill: 'none', stroke: '#408eeb', 'stroke-width': '1.3' }, svg);
  const tableRings = Array.from({ length: 3 }, () => make('ellipse', { cx: '884', cy: '632', rx: '25', ry: '6' }, tableSignals));
  const sensorSignals = make('g', { fill: 'none', stroke: '#408eeb', 'stroke-width': '1.2' }, svg);
  const sensorRings = Array.from({ length: 2 }, () => make('ellipse', { cx: '748', cy: '792', rx: '20', ry: '6' }, sensorSignals));

  function draw(seconds) {
    const cycle = seconds / 24;
    // Same restrained breathing motion as the reference, shared by artwork and signals.
    const breath = (1 - Math.cos(seconds / 18 * Math.PI * 2)) / 2;
    artwork.style.transform = `translateY(${-9 * breath}px) scale(${1 + .006 * breath})`;
    for (const route of trajectories) {
      const phase = cycle * route.speed + route.phase;
      const [x, y] = pointOnRoute(route, phase);
      for (const element of [route.halo, route.head, route.core]) position(element, x, y);
      route.tail.forEach((dot, i) => {
        const point = pointOnRoute(route, phase - Math.sign(route.speed) * (11 - i) * .0019);
        position(dot, point[0], point[1]);
      });
    }
    const scanY = 430 + ((seconds % 6) / 6) * 400;
    position(scan, 0, scanY);
    position(scanEdge, 0, scanY + 75);
    tableRings.forEach((ring, i) => {
      const phase = (seconds / 4 + i / 3) % 1;
      ring.setAttribute('rx', (16 + phase * 90).toFixed(2));
      ring.setAttribute('ry', (3 + phase * 17).toFixed(2));
      ring.setAttribute('opacity', (.38 * Math.sin(phase * Math.PI)).toFixed(3));
    });
    sensorRings.forEach((ring, i) => {
      const phase = (seconds / 6 + i / 2) % 1;
      ring.setAttribute('rx', (35 + phase * 99).toFixed(2));
      ring.setAttribute('ry', (10 + phase * 28).toFixed(2));
      ring.setAttribute('opacity', (.25 * Math.sin(phase * Math.PI)).toFixed(3));
    });
  }

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches;
  let visible = false;
  let suspended = false;
  let disposed = false;
  let frame = 0;
  let lastTime = null;
  let elapsed = 0;

  function tick(time) {
    if (lastTime !== null) elapsed += Math.min((time - lastTime) / 1000, .064);
    lastTime = time;
    draw(elapsed);
    frame = requestAnimationFrame(tick);
  }
  function updatePlayback() {
    cancelAnimationFrame(frame);
    lastTime = null;
    const running = !disposed && !paused && visible && !suspended && !document.hidden;
    figure.classList.toggle('is-motion-paused', paused);
    figure.dataset.motion = running ? 'playing' : 'paused';
    control.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    control.setAttribute('aria-pressed', String(paused));
    if (running) frame = requestAnimationFrame(tick);
  }
  const toggle = () => { paused = !paused; updatePlayback(); };
  const changePreference = () => { paused = preference.matches; updatePlayback(); };
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updatePlayback();
  }, { threshold: 0 });
  const pageHide = (event) => {
    suspended = true;
    if (event.persisted) updatePlayback();
    else dispose();
  };
  const pageShow = () => { suspended = false; updatePlayback(); };
  function dispose() {
    disposed = true;
    cancelAnimationFrame(frame);
    intersection.disconnect();
    preference.removeEventListener('change', changePreference);
    document.removeEventListener('visibilitychange', updatePlayback);
    window.removeEventListener('pagehide', pageHide);
    window.removeEventListener('pageshow', pageShow);
    control.removeEventListener('click', toggle);
    svg.remove();
    artwork.style.removeProperty('transform');
    figure.classList.remove('is-live', 'is-motion-paused');
    delete figure.dataset.motion;
    control.hidden = true;
  }

  draw(0);
  figure.classList.add('is-live');
  control.hidden = false;
  control.addEventListener('click', toggle);
  preference.addEventListener('change', changePreference);
  document.addEventListener('visibilitychange', updatePlayback);
  window.addEventListener('pagehide', pageHide);
  window.addEventListener('pageshow', pageShow);
  intersection.observe(figure);
  updatePlayback();
  return dispose;
}
