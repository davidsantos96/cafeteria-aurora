// Anima a contagem dos números na faixa de estatísticas quando ela entra em vista.
export function initStatCounters() {
  var band = document.querySelector(".band");
  if (!band) return;

  var counted = false;
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !counted) {
        counted = true;
        document.querySelectorAll(".stat .big[data-count]").forEach(function (n) {
          var target = parseFloat(n.getAttribute("data-count"));
          var suffix = n.getAttribute("data-suffix") || "";
          var dur = 1400, t0 = performance.now();
          function tick(t) {
            var p = Math.min((t - t0) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            var val = target * eased;
            n.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
        cio.disconnect();
      }
    });
  }, { threshold: 0.4 });

  cio.observe(band);
}
