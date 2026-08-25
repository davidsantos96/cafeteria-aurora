// Alterna o estado sólido/translúcido da nav conforme o scroll da página.
export function initNavScroll() {
  var nav = document.querySelector(".nav");
  if (!nav) return;

  function onScroll() {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
