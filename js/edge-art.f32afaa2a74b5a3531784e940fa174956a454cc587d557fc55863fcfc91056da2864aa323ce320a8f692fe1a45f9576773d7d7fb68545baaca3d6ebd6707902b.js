(() => {
  // <stdin>
  var reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  var colorScheme = matchMedia("(prefers-color-scheme: dark)");
  var palettes = {
    dark: ["#304354", "#3c556b", "#486a81", "#547c95", "#628da6"],
    light: ["#325571", "#3d6581", "#49758e", "#58869d", "#6b97ac"]
  };
  function noise(x, y) {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return value - Math.floor(value);
  }
  document.querySelectorAll(".edge-art canvas").forEach((canvas) => {
    const context = canvas.getContext("2d");
    if (!context) return;
    const offset = canvas.parentElement.classList.contains("edge-art--bottom") ? 17 : 0;
    let visible = false;
    let frame = 0;
    let lastDraw = -Infinity;
    function draw(now) {
      frame = 0;
      if (!visible || document.hidden) return;
      if (!reducedMotion.matches && now - lastDraw < 1e3 / 30) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const theme = document.documentElement.dataset.theme;
      const dark = theme === "dark" || theme !== "light" && colorScheme.matches;
      const palette = palettes[dark ? "dark" : "light"];
      const time = (reducedMotion.matches ? 0 : now / 1e3) + offset;
      const driftTime = time * (offset ? 1 : 1.6);
      const size = width < 768 ? 48 : 64;
      const rowHeight = size * 0.8;
      const columns = Math.ceil(width / size) + 3;
      const rows = Math.ceil(height / rowHeight) + (offset ? 2 : 3);
      const points = [];
      for (let row = 0; row < rows; row++) {
        points[row] = [];
        for (let col = 0; col < columns; col++) {
          const phase = noise(col + offset, row) * Math.PI * 2;
          points[row][col] = {
            restX: (col - 1 + row % 2 * 0.5) * size,
            restY: (row - 1) * rowHeight,
            x: (col - 1 + row % 2 * 0.5) * size + Math.sin(driftTime * 0.3 + phase) * size * 0.2,
            y: (row - 1) * rowHeight + Math.cos(driftTime * 0.24 + phase * 1.7) * rowHeight * 0.23
          };
        }
      }
      function triangle(a, b, c, seed) {
        const x = (a.x + b.x + c.x) / 3;
        const y = (a.y + b.y + c.y) / 3;
        const restX = (a.restX + b.restX + c.restX) / 3;
        const restY = (a.restY + b.restY + c.restY) / 3;
        const shore = height * 0.65 + Math.sin(restX / 145 + offset) * 15 + Math.sin(restX / 59 - offset) * 9;
        if (offset && restY > shore) return;
        const shimmer = Math.sin(x / 180 + y / 90 - time * 0.34);
        const variation = noise(seed, offset + 3);
        const baseShade = variation * 0.65 + (shimmer + 1) * 0.175;
        const headerShade = seed % 2 * 0.42 + baseShade * 0.36 + 0.11;
        const shade = (offset ? baseShade : headerShade) * (palette.length - 1);
        const low = Math.floor(shade);
        const high = Math.min(low + 1, palette.length - 1);
        const blend = shade - low;
        const rgb = [1, 3, 5].map((channel) => {
          const from = parseInt(palette[low].slice(channel, channel + 2), 16);
          const to = parseInt(palette[high].slice(channel, channel + 2), 16);
          return Math.round(from + (to - from) * blend);
        });
        context.fillStyle = `rgb(${rgb.join(",")})`;
        context.strokeStyle = context.fillStyle;
        context.lineWidth = 0.6;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.lineTo(c.x, c.y);
        context.closePath();
        context.fill();
        context.stroke();
      }
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < columns - 1; col++) {
          const a = points[row][col];
          const b = points[row][col + 1];
          const c = points[row + 1][col];
          const d = points[row + 1][col + 1];
          const seed = row * columns + col;
          if (row % 2) {
            triangle(a, b, d, seed * 2);
            triangle(a, d, c, seed * 2 + 1);
          } else {
            triangle(a, b, c, seed * 2);
            triangle(b, d, c, seed * 2 + 1);
          }
        }
      }
      if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
    }
    function start() {
      if (!frame) frame = requestAnimationFrame(draw);
    }
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }).observe(canvas);
    document.addEventListener("visibilitychange", start);
    window.addEventListener("resize", start);
    reducedMotion.addEventListener("change", start);
    colorScheme.addEventListener("change", start);
    new MutationObserver(start).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
  });
})();
