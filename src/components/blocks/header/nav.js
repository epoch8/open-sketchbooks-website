const header = document.getElementById("site-header");
const toggle = document.getElementById("menu-toggle");
const overlay = document.getElementById("nav-overlay");

if (!header || !toggle || !overlay) {
  console.warn("Nav elements not found");
}

let isOpen = false;

function openMenu() {
  isOpen = true;
  header.setAttribute("data-open", "true");
  toggle.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  isOpen = false;
  header.setAttribute("data-open", "false");
  toggle.setAttribute("aria-expanded", "false");
}

function toggleMenu() {
  isOpen ? closeMenu() : openMenu();
}

/* ================================
   EVENTS
================================ */

toggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
    console.log("CLICK");

});

overlay?.addEventListener("click", () => {
  closeMenu();
});



/* закрытие по ESC */

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenu();
  }
});