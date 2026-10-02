// The mobile burger menu is a CSS-only checkbox toggle. This adds the
// keyboard affordances a checkbox can't provide on its own.
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const toggle = document.querySelector(
      '.menu__burger input[type="checkbox"]',
    );
    if (toggle && toggle.checked) {
      toggle.checked = false;
    }
  }
});
