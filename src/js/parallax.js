// Move elementos [data-parallax] e os glows de aurora conforme o scroll,
// aplicando a leitura de scrollY dentro de um requestAnimationFrame.
export function initParallax() {
  var parallax = [].slice.call(document.querySelectorAll("[data-parallax]"));
  var glows = [].slice.call(document.querySelectorAll(".aurora-glow"));
  if (!parallax.length && !glows.length) return;

  var ticking = false;

  function applyParallax() {
    var y = window.scrollY;
    parallax.forEach(function (el) {
      var sp = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      el.style.transform = "translate3d(0," + (y * sp) + "px,0)";
    });
    glows.forEach(function (g, i) {
      var sp = i === 0 ? -0.06 : 0.04;
      g.style.marginTop = (y * sp) + "px";
    });
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(applyParallax); ticking = true; }
  }, { passive: true });

  applyParallax();
}
