# Spec de reorganização — Cafeteria Aurora

## 1. Objetivo

O projeto atual é o resultado de uma geração via ferramenta de design: `Cafeteria Aurora v2.html` concentra toda a marcação em um único arquivo, `aurora-v2.css` concentra todo o estilo (500 linhas) e a lógica de interação está dividida em apenas dois scripts genéricos (`aurora-v2.js`, `smoke.js`). Funciona, mas não demonstra separação de responsabilidades — tudo fica acoplado a um só lugar por camada.

Esta spec define a reorganização do projeto em arquivos pequenos e coesos, cada um com **uma única responsabilidade clara**, usando um build leve (Vite) para permitir HTML componentizado de verdade. O resultado deve deixar evidente domínio de HTML semântico, CSS organizado em camadas e JavaScript modular — sem depender de nenhum framework de UI.

## 2. Diagnóstico do estado atual

| Arquivo | Problema |
|---|---|
| `Cafeteria Aurora.html` | Stub de loading gerado pela ferramenta de design (bundler), não é a página real — deve ser descartado. |
| `Cafeteria Aurora v2.html` | 317 linhas: head, nav, 8 seções e footer todos no mesmo arquivo. Nenhuma seção é reutilizável ou testável isoladamente. |
| `aurora-v2.css` | 500 linhas num único arquivo. Tokens, reset, componentes reutilizáveis (botões, nav, reveal) e estilos de seções específicas (hero, cardápio, footer) misturados sem fronteira. |
| `aurora-v2.js` | Uma IIFE com 6 responsabilidades diferentes (scroll do nav, menu mobile, scroll-reveal, parallax, status "aberto agora", contadores) — nenhuma isolada, nenhuma reaproveitável fora da página. |
| `smoke.js` | Já é razoavelmente isolado (shader WebGL da fumaça), mas exposto via `window.AuroraSmoke` em vez de módulo ES. |
| `aurora.css` / `aurora.js` | Versão 1, substituída pela v2 — código morto no repositório. |
| `uploads/`, `_check/` | Imagens-fonte do ChatGPT e screenshots de debug — não são assets de produção, não deveriam estar lado a lado com o site publicável. |

## 3. Princípios

1. **Um arquivo, uma responsabilidade.** Se um arquivo precisa de "e" no meio da frase para descrever o que faz, ele deve ser dividido.
2. **HTML declara estrutura, não estilo nem comportamento.** Sem `style=""` inline, sem `<script>` inline de lógica (o `AuroraSmoke.init(...)` inline também sai do HTML).
3. **CSS em camadas, na ordem em que cascateiam:** tokens → base → layout → componentes reutilizáveis → seções específicas.
4. **JS em módulos ES, cada um exportando uma função `init()`.** `main.js` é o único orquestrador; nenhum módulo depende de outro módulo de feature.
5. **Nomenclatura consistente:** kebab-case para arquivos, classes CSS mantêm o padrão já usado no projeto (nomes de componente/seção, ex. `.hero-media`, `.feature-copy`).
6. **Assets de produção ficam separados de material de trabalho** (fontes de imagem, screenshots de QA).

## 4. Stack

- **Vite** como dev server e bundler (`npm create vite@latest` não é necessário — configuração manual abaixo).
- **`vite-plugin-posthtml-include`** para permitir `<include src="./partials/hero.html"></include>` dentro do HTML — partials reais, resolvidos em build time, sem runtime JS extra para montar a página.
- Sem framework de componentes (React/Vue etc.) — o objetivo é mostrar HTML/CSS/JS puro bem organizado, não conhecimento de framework.

```json
// package.json (dependências relevantes)
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.x",
    "vite-plugin-posthtml-include": "^1.x"
  }
}
```

```js
// vite.config.js
import { defineConfig } from "vite";
import posthtmlInclude from "vite-plugin-posthtml-include";

export default defineConfig({
  plugins: [posthtmlInclude()],
});
```

## 5. Estrutura de pastas alvo

```
cafeteria-aurora/
├── index.html
├── package.json
├── vite.config.js
├── REFACTOR-SPEC.md
├── public/
│   └── img/                     # imagens de produção (as 13 já usadas no site)
├── src/
│   ├── main.js                  # ponto de entrada: importa CSS + inicializa módulos JS
│   ├── partials/
│   │   ├── head-meta.html       # <meta>, <link> de fontes (incluído dentro do <head>)
│   │   ├── nav.html
│   │   ├── mobile-menu.html
│   │   ├── hero.html
│   │   ├── manifesto.html
│   │   ├── cafes.html
│   │   ├── stats-band.html
│   │   ├── padaria.html
│   │   ├── ambiente.html
│   │   ├── cardapio.html
│   │   ├── visite.html
│   │   └── footer.html
│   ├── styles/
│   │   ├── main.css             # só @imports, na ordem de cascata (ponto de entrada)
│   │   ├── tokens.css           # :root — cores oklch, espaçamento, fontes, easing
│   │   ├── base.css             # reset, html/body, tipografia base, grão de fundo
│   │   ├── layout.css           # .wrap, .section-pad, primitivas de grid
│   │   ├── motion.css           # .reveal/.reveal-fade + prefers-reduced-motion (global, cross-seção)
│   │   ├── components/
│   │   │   ├── buttons.css      # .btn, .btn-primary, .btn-ghost
│   │   │   ├── nav.css          # .nav, .nav-links, .nav-cta, .nav-toggle, .brand
│   │   │   ├── mobile-menu.css  # .mobile-menu
│   │   │   └── img-frame.css    # .img-frame (usado em várias seções)
│   │   └── sections/
│   │       ├── hero.css         # .hero, aurora-glow, hero-sun, smoke mask, scroll-cue
│   │       ├── manifesto.css    # .manifesto, .rituals, .ritual
│   │       ├── feature.css      # .feature (compartilhado por cafés/padaria) + .methods
│   │       ├── stats-band.css   # .band, .band-grid, .stat
│   │       ├── gallery.css      # .gallery, .g-a..g-d (seção Ambiente)
│   │       ├── menu.css         # .menu-head, .menu-cols, .menu-item
│   │       ├── visit.css        # .visit-grid, .info-row, .status
│   │       └── footer.css       # .footer, .footer-cta, .footer-bottom
│   └── js/
│       ├── nav-scroll.js        # export function initNavScroll()
│       ├── mobile-menu.js       # export function initMobileMenu()
│       ├── scroll-reveal.js     # export function initScrollReveal()  (IntersectionObserver + data-stagger)
│       ├── parallax.js          # export function initParallax()     (data-parallax + aurora glow)
│       ├── open-status.js       # export function initOpenStatus()   (horário "aberto agora")
│       ├── stat-counters.js     # export function initStatCounters() (contagem animada da band)
│       └── smoke-background.js  # export function initSmokeBackground(selector, opts) (shader WebGL, ex-smoke.js)
└── design/                      # fora do build; não referenciado pelo site
    ├── source-images/           # conteúdo atual de uploads/
    └── qa-screenshots/          # conteúdo atual de _check/
```

Cada seção de `partials/` corresponde 1:1 a uma `<section>` do HTML atual — a divisão segue os `data-screen-label` já existentes no markup (`Hero`, `Manifesto`, `Cafés`, `Padaria`, `Ambiente`, `Cardápio`, `Visite`, `Footer`), então o mapeamento do conteúdo atual para os arquivos novos é direto, sem redesenhar nada.

## 6. `index.html` (shell)

O `index.html` fica só com a casca do documento e a ordem de composição — nenhum conteúdo de seção mora nele:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Cafeteria Aurora — desperte seus melhores momentos</title>
  <include src="./src/partials/head-meta.html"></include>
</head>
<body>
  <include src="./src/partials/nav.html"></include>
  <include src="./src/partials/mobile-menu.html"></include>
  <include src="./src/partials/hero.html"></include>
  <include src="./src/partials/manifesto.html"></include>
  <include src="./src/partials/cafes.html"></include>
  <include src="./src/partials/stats-band.html"></include>
  <include src="./src/partials/padaria.html"></include>
  <include src="./src/partials/ambiente.html"></include>
  <include src="./src/partials/cardapio.html"></include>
  <include src="./src/partials/visite.html"></include>
  <include src="./src/partials/footer.html"></include>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

## 7. `src/main.js` (orquestrador)

```js
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
```

Regra: nenhum módulo de `src/js/` importa outro módulo de `src/js/`. Se dois módulos parecerem precisar se comunicar (ex. reveal e parallax), a orquestração acontece em `main.js`, não entre eles — mantém cada um testável isoladamente.

## 8. `src/styles/main.css` (ordem de cascata)

```css
@import "./tokens.css";
@import "./base.css";
@import "./layout.css";
@import "./motion.css";

@import "./components/buttons.css";
@import "./components/nav.css";
@import "./components/mobile-menu.css";
@import "./components/img-frame.css";

@import "./sections/hero.css";
@import "./sections/manifesto.css";
@import "./sections/feature.css";
@import "./sections/stats-band.css";
@import "./sections/gallery.css";
@import "./sections/menu.css";
@import "./sections/visit.css";
@import "./sections/footer.css";
```

**Media queries ficam dentro do arquivo da seção a que pertencem** (ex. o breakpoint de `.hero-grid` mora em `sections/hero.css`, não num `responsive.css` separado). Cada arquivo de seção fica completo e autocontido — quem abre `sections/menu.css` vê o comportamento do cardápio em todas as larguras de tela, sem precisar caçar overrides em outro arquivo.

## 9. Tabela de responsabilidade — JS

| Módulo | Responsabilidade única | Fonte no código atual |
|---|---|---|
| `nav-scroll.js` | Alternar `.scrolled` na nav conforme `scrollY` | `aurora-v2.js` linhas 7–14 |
| `mobile-menu.js` | Abrir/fechar `.mobile-menu` no toggle e ao clicar em link | `aurora-v2.js` linhas 16–24 |
| `scroll-reveal.js` | Aplicar `data-stagger`, observar `.reveal`/`.reveal-fade` com IntersectionObserver, safety-net de 3s | `aurora-v2.js` linhas 26–57 |
| `parallax.js` | Mover elementos `[data-parallax]` e `.aurora-glow` conforme scroll (rAF-throttled) | `aurora-v2.js` linhas 59–78 |
| `open-status.js` | Calcular e exibir se a cafeteria está aberta agora | `aurora-v2.js` linhas 80–103 |
| `stat-counters.js` | Animar contagem dos números da faixa de estatísticas | `aurora-v2.js` linhas 105–131 |
| `smoke-background.js` | Renderer WebGL2 da fumaça (shader fbm) | `smoke.js` inteiro, convertido para módulo ES (`export function initSmokeBackground`) em vez de `window.AuroraSmoke` |

## 10. Assets

- `img/*.png` (as 13 imagens realmente referenciadas no HTML) → `public/img/`, caminhos continuam `/img/nome.png`.
- `uploads/` (imagens-fonte do ChatGPT, não usadas no HTML) → `design/source-images/`, fora de `public/` e `src/` para não ir no build.
- `_check/` (screenshots de debug/QA) → `design/qa-screenshots/`.

## 11. Arquivos removidos

- `Cafeteria Aurora.html` — stub de loading da ferramenta de design, sem conteúdo real.
- `aurora.css`, `aurora.js` — versão 1, substituída pela v2.
- `Cafeteria Aurora v2.html`, `aurora-v2.css`, `aurora-v2.js`, `smoke.js` na raiz — conteúdo migrado para `src/`, arquivos originais apagados após a migração (não hifenizados como `.old`).

## 12. Plano de migração (fases)

1. **Setup**: criar `package.json`, `vite.config.js`, instalar `vite` e `vite-plugin-posthtml-include`, criar a árvore de pastas de `src/`, `public/`, `design/`.
2. **CSS**: recortar `aurora-v2.css` nos arquivos de `styles/` seguindo os comentários de seção já existentes no arquivo original (eles já demarcam os blocos corretos — é praticamente 1:1).
3. **HTML**: recortar `Cafeteria Aurora v2.html` em `partials/`, um por `<section data-screen-label="...">`, e montar o `index.html` shell com `<include>`.
4. **JS**: separar a IIFE de `aurora-v2.js` nos 6 módulos, converter `smoke.js` para módulo ES.
5. **Assets**: mover imagens conforme seção 10, atualizar nenhum caminho (já compatível com convenção `public/`).
6. **Limpeza**: apagar os arquivos legados listados na seção 11.
7. **Verificação**: `npm run dev`, comparar visualmente com a página atual seção por seção (hero, manifesto, cafés, padaria, band de stats, ambiente/galeria, cardápio, visite, footer, menu mobile, smoke background, contador animado, status aberto/fechado); depois `npm run build && npm run preview` para validar o output de produção.

## 13. Checklist de aceite

- [ ] Nenhum arquivo de `src/js/` importa outro módulo de `src/js/`.
- [ ] Nenhum `<style>` ou `style="..."` inline sobrevive no HTML.
- [ ] Nenhum `<script>` inline de lógica sobrevive no HTML (apenas `<script type="module" src="...">`).
- [ ] Cada `partials/*.html` corresponde a exatamente uma seção/bloco da página.
- [ ] `npm run build` gera site funcionalmente idêntico ao `Cafeteria Aurora v2.html` original.
- [ ] Arquivos legados (seção 11) removidos do diretório raiz.
