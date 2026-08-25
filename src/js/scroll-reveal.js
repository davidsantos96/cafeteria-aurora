// Revela elementos .reveal/.reveal-fade ao entrar na viewport, aplicando
// atraso escalonado (--d) para os grupos marcados com data-stagger.
export function initScrollReveal() {
  var reveals = document.querySelectorAll(".reveal, .reveal-fade");
  if (!reveals.length) return;

  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseInt(group.getAttribute("data-stagger"), 10) || 90;
    var kids = group.querySelectorAll(".reveal, .reveal-fade");
    kids.forEach(function (k, i) { k.style.setProperty("--d", (i * step) + "ms"); });
  });

  // 1. Aplica o estado oculto via classe no <html>
  document.documentElement.classList.add("reveal-ready");

  // 2. Força reflow para o navegador confirmar o estado invisível
  void document.body.offsetHeight;

  // 3. Só agora registra o observer — .in vai disparar uma transição real
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  reveals.forEach(function (el) { io.observe(el); });

  // rede de segurança: garante que nada fique invisível para sempre
  setTimeout(function () {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }, 3000);
}
