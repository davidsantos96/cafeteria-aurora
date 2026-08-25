import "./styles/main.css";

import { initNavScroll } from "./js/nav-scroll.js";
import { initMobileMenu } from "./js/mobile-menu.js";
import { initScrollReveal } from "./js/scroll-reveal.js";
import { initParallax } from "./js/parallax.js";
import { initOpenStatus } from "./js/open-status.js";
import { initStatCounters } from "./js/stat-counters.js";
import { initSmokeBackground } from "./js/smoke-background.js";

initNavScroll();
initMobileMenu();
initScrollReveal();
initParallax();
initOpenStatus();
initStatCounters();
initSmokeBackground(".smoke-gl", { color: "#E8B98C" });
