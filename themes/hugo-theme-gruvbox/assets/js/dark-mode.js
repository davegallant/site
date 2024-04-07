function getTheme() {
  if (localStorage && localStorage.getItem("theme")) {
    return localStorage.getItem("theme");
  }
  return "auto";
}

function saveTheme(theme) {
  localStorage.setItem("theme", theme);
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

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  setPrismTheme(theme);
  setCommentsTheme(theme);
}


setTheme("dark");

// This script is inlined in the <head> of the document, so we have to wait
// for the DOM content before can add event listeners to the toggle buttons
document.addEventListener("DOMContentLoaded", function () {
  const toggleButtons = document.querySelectorAll(".theme__toggle");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", toggleTheme);
  });
});
