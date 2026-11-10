const menuToggle = document.querySelector(".menu__toggle");
const mobileMenu = document.getElementById("mobile-menu");

function setMenuOpen(open) {
  mobileMenu.hidden = !open;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute(
    "aria-label",
    open ? "Close main menu" : "Open main menu",
  );
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(mobileMenu.hidden);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !mobileMenu.hidden) {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

// Open search with Cmd/Ctrl+K, or focus it when already on the search page.
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    const searchInput = document.getElementById("search-input");
    e.preventDefault();
    if (searchInput) {
      searchInput.focus();
    } else {
      window.location.href = document.querySelector(".search-link").href;
    }
  }
});
