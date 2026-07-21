function getTheme() {
  if (localStorage && localStorage.getItem("theme")) {
    return localStorage.getItem("theme");
  }
  return "auto";
}

function saveTheme(theme) {
  localStorage.setItem("theme", theme);
}

function getEffectiveTheme(theme) {
  if (theme === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

function setCommentsTheme(effectiveTheme) {
  const iframe = document.querySelector(".utterances-frame");
  if (iframe) {
    const message = {
      type: "set-theme",
      theme: effectiveTheme === "dark" ? "github-dark" : "github-light",
    };
    iframe.contentWindow.postMessage(message, "https://utteranc.es");
  }
}

function applyTheme(theme) {
  const effectiveTheme = getEffectiveTheme(theme);

  if (theme === "auto") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }

  setCommentsTheme(effectiveTheme);
  updateToggleIcons(theme);
}

function updateToggleIcons(theme) {
  const icons = document.querySelectorAll(".theme__toggle-icon");
  icons.forEach((icon) => {
    const iconAuto = icon.querySelector(".icon-auto");
    const iconLight = icon.querySelector(".icon-light");
    const iconDark = icon.querySelector(".icon-dark");
    if (iconAuto && iconLight && iconDark) {
      iconAuto.style.display = theme === "auto" ? "block" : "none";
      iconLight.style.display = theme === "light" ? "block" : "none";
      iconDark.style.display = theme === "dark" ? "block" : "none";
    }
  });
}

function toggleTheme() {
  const cycle = { auto: "light", light: "dark", dark: "auto" };
  const currentTheme = getTheme();
  const nextTheme = cycle[currentTheme];
  saveTheme(nextTheme);
  applyTheme(nextTheme);
}

// Apply theme immediately to prevent FOUC
const savedTheme = getTheme();

if (savedTheme !== "auto") {
  document.documentElement.setAttribute("data-theme", savedTheme);
} else {
  document.documentElement.removeAttribute("data-theme");
}

// Listen for OS theme changes when in auto mode
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    const currentTheme = getTheme();
    if (currentTheme === "auto") {
      applyTheme("auto");
    }
  });

// Wait for DOM to set up toggle buttons and apply icon state
document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".theme__toggle");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", toggleTheme);
  });

  applyTheme(getTheme());
});
