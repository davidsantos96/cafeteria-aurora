// Abre/fecha o overlay de menu mobile pelo botão hamburguer e fecha ao navegar.
export function initMobileMenu() {
  var toggle = document.querySelector(".nav-toggle");
  var mobile = document.querySelector(".mobile-menu");
  if (!toggle || !mobile) return;

  function setOpen(open) {
    mobile.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }

  toggle.addEventListener("click", function () {
    setOpen(!mobile.classList.contains("open"));
  });
  mobile.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      setOpen(false);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobile.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}
