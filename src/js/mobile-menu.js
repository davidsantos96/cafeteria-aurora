// Abre/fecha o overlay de menu mobile pelo botão hamburguer e fecha ao navegar.
export function initMobileMenu() {
  var toggle = document.querySelector(".nav-toggle");
  var mobile = document.querySelector(".mobile-menu");
  if (!toggle || !mobile) return;

  toggle.addEventListener("click", function () {
    mobile.classList.toggle("open");
  });
  mobile.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      mobile.classList.remove("open");
    });
  });
}
