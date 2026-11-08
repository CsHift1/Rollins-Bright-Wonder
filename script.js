(() => {
  const root = document.documentElement;
  const year = document.getElementById("year");
  const themeButton = document.getElementById("theme");
  const menuButton = document.getElementById("menu");
  const nav = document.getElementById("nav");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (year) year.textContent = String(new Date().getFullYear());

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const isDark = root.dataset.theme !== "dark";
      root.dataset.theme = isDark ? "dark" : "light";
      themeButton.setAttribute("aria-pressed", String(isDark));
      themeButton.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) themeMeta.content = isDark ? "#172622" : "#e9eee4";
    });
  }

  if (menuButton && nav) {
    const closeMenu = () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation menu");
      const label = menuButton.querySelector(".menu-label");
      if (label) label.textContent = "Menu";
    };

    menuButton.setAttribute("aria-label", "Open navigation menu");
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      nav.classList.toggle("open", !isOpen);
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
      const label = menuButton.querySelector(".menu-label");
      if (label) label.textContent = isOpen ? "Menu" : "Close";
    });
    nav.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuButton.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) closeMenu();
    });
  }

  const routeLinks = Array.from(document.querySelectorAll(".route-stops a"));
  const routeSections = routeLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter((section) => section instanceof HTMLElement);

  if ("IntersectionObserver" in window && routeSections.length) {
    const routeObserver = new IntersectionObserver((entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      routeLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${current.target.id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.5] });
    routeSections.forEach((section) => routeObserver.observe(section));
  }

  const frequency = document.getElementById("hz");
  const frequencyOutput = document.getElementById("hz-out");
  const canvas = document.getElementById("wave");
  const context = canvas instanceof HTMLCanvasElement ? canvas.getContext("2d") : null;

  if (canvas && context && frequency && frequencyOutput) {
    const phaseColors = ["#dce59e", "#99c0bb", "#c5a9ed"];
    let width = 0;
    let height = 0;
    let frame = 0;
    let phase = 0;
    let previousTime = 0;

    const draw = (timestamp) => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) {
        frame = 0;
        return;
      }

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      if (bounds.width !== width || bounds.height !== height || canvas.width !== Math.round(bounds.width * pixelRatio)) {
        width = bounds.width;
        height = bounds.height;
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }

      if (!motionPreference.matches && previousTime) {
        phase += Math.min(timestamp - previousTime, 50) * Number(frequency.value) * 0.000035;
      }
      previousTime = timestamp;

      const center = height / 2;
      const amplitude = height * 0.34;
      const cycles = 1.6;
      context.clearRect(0, 0, width, height);

      phaseColors.forEach((color, index) => {
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 2.3;
        context.lineJoin = "round";
        for (let x = 0; x <= width; x += 2) {
          const angle = (x / width) * Math.PI * 2 * cycles - phase - (index * Math.PI * 2) / 3;
          const y = center - Math.sin(angle) * amplitude;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      });

      if (!motionPreference.matches) frame = window.requestAnimationFrame(draw);
      else frame = 0;
    };

    const updateFrequency = () => {
      frequencyOutput.textContent = `${frequency.value} Hz`;
    };

    const restart = () => {
      if (frame) window.cancelAnimationFrame(frame);
      previousTime = 0;
      draw(performance.now());
      if (!motionPreference.matches && !frame) frame = window.requestAnimationFrame(draw);
    };

    frequency.addEventListener("input", updateFrequency);
    window.addEventListener("resize", restart);
    motionPreference.addEventListener("change", restart);
    updateFrequency();
    restart();
  }

  const voltage = document.getElementById("volt");
  const resistance = document.getElementById("res");
  const voltageOutput = document.getElementById("v-out");
  const resistanceOutput = document.getElementById("r-out");
  const currentOutput = document.getElementById("i-out");
  const powerOutput = document.getElementById("p-out");
  const bulb = document.getElementById("bulb");

  if (voltage && resistance && voltageOutput && resistanceOutput && currentOutput && powerOutput && bulb) {
    const updateCircuit = () => {
      const volts = Number(voltage.value);
      const ohms = Number(resistance.value);
      const amps = volts / ohms;
      const watts = volts * amps;
      const powerRatio = Math.min(watts / 2880, 1);

      voltageOutput.textContent = `${volts} V`;
      resistanceOutput.textContent = `${ohms} Ω`;
      currentOutput.innerHTML = `${amps.toFixed(2)} <small>A</small>`;
      powerOutput.innerHTML = `${Number.isInteger(watts) ? watts : watts.toFixed(1)} <small>W</small>`;
      bulb.style.setProperty("--glow", `${Math.round(powerRatio * 34)}px`);
      bulb.style.opacity = String(0.55 + powerRatio * 0.45);
    };

    voltage.addEventListener("input", updateCircuit);
    resistance.addEventListener("input", updateCircuit);
    updateCircuit();
  }

  const copyStatus = document.getElementById("copy-status");
  const copyButtons = document.querySelectorAll("[data-copy]");

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy");
      if (!value || !(button instanceof HTMLButtonElement)) return;
      let copied = false;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
          copied = true;
        } else {
          const field = document.createElement("textarea");
          field.value = value;
          field.setAttribute("readonly", "");
          field.style.position = "fixed";
          field.style.opacity = "0";
          document.body.append(field);
          field.select();
          copied = document.execCommand("copy");
          field.remove();
        }
      } catch {
        copied = false;
      }

      if (copyStatus) {
        copyStatus.textContent = copied
          ? "Copied to clipboard."
          : "Copy was blocked. Select and copy the contact detail above.";
      }
      const originalLabel = button.textContent;
      button.textContent = copied ? "Copied" : "Retry";
      window.setTimeout(() => {
        button.textContent = originalLabel || "Copy";
      }, 1800);
    });
  });
})();
