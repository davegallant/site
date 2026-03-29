function setPrismTheme(theme) {
  const prismDark = document.getElementById("prism-dark");
  const prismLight = document.getElementById("prism-light");
  prismDark.toggleAttribute("disabled", theme === "light");
  prismLight.toggleAttribute("disabled", theme === "dark");
}

function setCommentsTheme(theme) {
  if (document.querySelector(".utterances-frame")) {
    const iframe = document.querySelector(".utterances-frame");
    const message = {
      type: "set-theme",
      theme: theme == "dark" ? "gruvbox-dark" : "github-light",
    };
    iframe.contentWindow.postMessage(message, "https://utteranc.es");
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  setPrismTheme(theme);
  setCommentsTheme(theme);
}

setTheme("dark");
