// Calcula e exibe se a cafeteria está aberta agora, revalidando a cada 30s.
export function initOpenStatus() {
  var el = document.querySelector(".status");
  if (!el) return;

  function checkOpen() {
    var now = new Date();
    var day = now.getDay();
    var h = now.getHours() + now.getMinutes() / 60;
    var open, close;
    if (day >= 1 && day <= 5) { open = 7; close = 19; } else { open = 8; close = 18; }
    var isOpen = h >= open && h < close;
    var word = el.querySelector(".word");
    var detail = el.querySelector(".detail");
    if (isOpen) {
      el.classList.add("open");
      word.textContent = "Aberto agora";
      detail.textContent = "fecha às " + close + "h";
    } else {
      el.classList.remove("open");
      word.textContent = "Fechado agora";
      detail.textContent = "abre às " + open + "h";
    }
  }

  checkOpen();
  setInterval(checkOpen, 30000);
}
