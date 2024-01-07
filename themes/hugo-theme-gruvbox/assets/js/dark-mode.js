function getTheme() {
  if (window.matchMedia) {
    // OS preference
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  // Undefined
}

function setPrismTheme(theme) {
  const prismDark = document.getElementById("prism-dark");
  const prismLight = document.getElementById("prism-light");
  prismDark.toggleAttribute("disabled", theme === "light");
  prismLight.toggleAttribute("disabled", theme === "dark");
}

function setCommentsTheme(theme) {
  if (document.querySelector(".utterances-frame")) {
    const iframe = document.querySelector(".utterances-frame");
    var message = {
      type: "set-theme",
      theme: theme == "dark" ? "gruvbox-dark" : "github-light",
    };
    iframe.contentWindow.postMessage(message, "https://utteranc.es");
  }
}

// Initial load
const theme = getTheme();
if (theme) {
  setPrismTheme(theme);
}

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (event) => {
    const theme = event.matches ? "dark" : "light";
    setPrismTheme(theme);
    setCommentsTheme(theme);
  });
