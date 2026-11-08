(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector("#theme");
  const menuButton = document.querySelector("#menu");
  const nav = document.querySelector("#nav");
  const year = document.querySelector("#year");

  if (year) year.textContent = String(new Date().getFullYear());

  if (themeButton) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    const getTheme = () =>
      root.dataset.theme || (prefersDark.matches ? "dark" : "light");
    const updateThemeButton = () => {
      const isDark = getTheme() === "dark";
      themeButton.setAttribute(
        "aria-label",
        `Switch to ${isDark ? "light" : "dark"} theme`,
      );
      const icon = themeButton.querySelector("span");
      if (icon) icon.textContent = isDark ? "☀" : "☾";
    };

    updateThemeButton();
    themeButton.addEventListener("click", () => {
      root.dataset.theme = getTheme() === "dark" ? "light" : "dark";
      updateThemeButton();
    });
  }

  if (menuButton && nav) {
    const setMenuOpen = (open) => {
      nav.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute(
        "aria-label",
        open ? "Close navigation" : "Open navigation",
      );
      const icon = menuButton.querySelector("span");
      if (icon) icon.textContent = open ? "×" : "☰";
    };

    menuButton.addEventListener("click", () => {
      setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) setMenuOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        menuButton.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 640) setMenuOpen(false);
    });
  }

  const voltage = document.querySelector("#volt");
  const resistance = document.querySelector("#res");
  const voltageOutput = document.querySelector("#v-out");
  const resistanceOutput = document.querySelector("#r-out");
  const currentOutput = document.querySelector("#i-out");
  const powerOutput = document.querySelector("#p-out");
  const bulb = document.querySelector("#bulb");

  const updateOhmsLaw = () => {
    if (
      !(voltage instanceof HTMLInputElement) ||
      !(resistance instanceof HTMLInputElement)
    ) {
      return;
    }

    const volts = Number(voltage.value);
    const ohms = Number(resistance.value);
    const amps = volts / ohms;
    const watts = volts * amps;

    if (voltageOutput) voltageOutput.textContent = `${volts} V`;
    if (resistanceOutput) resistanceOutput.textContent = `${ohms} Ω`;
    if (currentOutput) currentOutput.textContent = `${amps.toFixed(2)} A`;
    if (powerOutput) powerOutput.textContent = `${watts.toFixed(0)} W`;

    if (bulb) {
      const intensity = Math.min(watts / 240, 1);
      bulb.style.setProperty("--glow", `${Math.round(intensity * 24)}px`);
      bulb.style.setProperty("--lit", String(0.2 + intensity * 0.8));
    }
  };

  voltage?.addEventListener("input", updateOhmsLaw);
  resistance?.addEventListener("input", updateOhmsLaw);
  updateOhmsLaw();

  document.querySelectorAll("button.copy[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.getAttribute("data-copy");
      if (!text) return;

      const label = button.textContent;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const field = document.createElement("textarea");
          field.value = text;
          field.setAttribute("readonly", "");
          field.style.position = "fixed";
          field.style.opacity = "0";
          document.body.append(field);
          let copied = false;
          try {
            field.select();
            copied = document.execCommand("copy");
          } finally {
            field.remove();
          }
          if (!copied) throw new Error("Clipboard copy was rejected");
        }
        button.textContent = "Copied";
      } catch {
        button.textContent = "Copy failed";
        button.setAttribute(
          "aria-label",
          "Copy failed. Select and copy the contact detail manually.",
        );
      }

      window.setTimeout(() => {
        button.textContent = label;
        button.removeAttribute("aria-label");
      }, 2400);
    });
  });

  const canvas = document.querySelector("#wave");
  const frequency = document.querySelector("#hz");
  const frequencyOutput = document.querySelector("#hz-out");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!(canvas instanceof HTMLCanvasElement)) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let elapsed = 0;
  let lastFrame = 0;
  let animationId = 0;
  let hz = frequency instanceof HTMLInputElement ? Number(frequency.value) : 50;
  const phases = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
  const colors = ["#ff4658", "#ffc933", "#6e92ff"];

  const resizeCanvas = () => {
    const bounds = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    drawWave();
  };

  const drawWave = () => {
    context.clearRect(0, 0, width, height);
    const amplitude = height * 0.34;
    const center = height / 2;
    const cycles = Math.PI * 4;

    phases.forEach((phase, index) => {
      context.beginPath();
      context.strokeStyle = colors[index];
      context.lineWidth = 3;
      context.lineJoin = "round";

      for (let x = 0; x <= width; x += 2) {
        const progress = (x / width) * cycles - elapsed + phase;
        const y = center - Math.sin(progress) * amplitude;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      context.stroke();
    });
  };

  const stopAnimation = () => {
    window.cancelAnimationFrame(animationId);
    animationId = 0;
  };

  const animate = (timestamp) => {
    if (document.hidden || reduceMotion.matches) {
      stopAnimation();
      return;
    }

    if (lastFrame) elapsed += ((timestamp - lastFrame) / 1000) * (hz / 50) * 2.4;
    lastFrame = timestamp;
    drawWave();
    animationId = window.requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    stopAnimation();
    lastFrame = 0;
    if (document.hidden) return;
    if (reduceMotion.matches) {
      drawWave();
      return;
    }
    animationId = window.requestAnimationFrame(animate);
  };

  frequency?.addEventListener("input", () => {
    if (!(frequency instanceof HTMLInputElement)) return;
    hz = Number(frequency.value);
    if (frequencyOutput) frequencyOutput.textContent = `${hz} Hz`;
  });
  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("visibilitychange", startAnimation);
  reduceMotion.addEventListener("change", startAnimation);
  resizeCanvas();
  startAnimation();
})();
