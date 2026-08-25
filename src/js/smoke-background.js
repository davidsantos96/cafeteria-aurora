// Fumaça do café — fundo WebGL2 (shader fbm), tingido com a luz quente da Aurora.

var VERT = "#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){gl_Position=position;}";

// Fragmento: fbm "fumaça", tingido por u_color.
// Saída com ALPHA pela luminância -> partes escuras ficam transparentes,
// a fumaça quente aparece sobre o fundo escuro da página.
var FRAG = "#version 300 es\n" +
"precision highp float;\n" +
"out vec4 O;\n" +
"uniform float time;\n" +
"uniform vec2 resolution;\n" +
"uniform vec3 u_color;\n" +
"#define FC gl_FragCoord.xy\n" +
"#define R resolution\n" +
"#define T (time+660.)\n" +
"float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}\n" +
"float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1,0)),u.x),mix(rnd(i+vec2(0,1)),rnd(i+1.),u.x),u.y);}\n" +
"float fbm(vec2 p){float t=.0,a=1.;for(int i=0;i<5;i++){t+=a*noise(p);p*=mat2(1,-1.2,.2,1.2)*2.;a*=.5;}return t;}\n" +
"void main(){\n" +
"  vec2 uv=(FC-.5*R)/R.y;\n" +
"  vec3 col=vec3(1);\n" +
"  uv.x+=.05;\n" +
"  uv*=vec2(1.4,1.0);\n" +
"  float n=fbm(uv*.32-vec2(0.0,T*.02));\n" +   // movimento vertical = fumaça subindo
"  n=noise(uv*3.+n*2.);\n" +
"  col.r-=fbm(uv+vec2(0,T*.02)+n);\n" +
"  col.g-=fbm(uv*1.003+vec2(0,T*.02)+n+.003);\n" +
"  col.b-=fbm(uv*1.006+vec2(0,T*.02)+n+.006);\n" +
"  col=mix(col, u_color, dot(col,vec3(.21,.71,.07)));\n" +
"  col=mix(vec3(.08),col,min(time*.1,1.));\n" +
"  col=clamp(col,.0,1.);\n" +
"  float lum=dot(col, vec3(.299,.587,.114));\n" +
"  float a=smoothstep(0.10, 0.92, lum);\n" +
"  O=vec4(col, a);\n" +
"}";

function Renderer(canvas) {
  this.canvas = canvas;
  this.gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
  this.color = [0.94, 0.82, 0.62];
  if (!this.gl) return;
  this.setup();
  this.init();
}
Renderer.prototype.setup = function () {
  var gl = this.gl;
  this.vs = gl.createShader(gl.VERTEX_SHADER);
  this.fs = gl.createShader(gl.FRAGMENT_SHADER);
  var p = gl.createProgram();
  this.program = p;
  gl.shaderSource(this.vs, VERT); gl.compileShader(this.vs);
  gl.shaderSource(this.fs, FRAG); gl.compileShader(this.fs);
  if (!gl.getShaderParameter(this.fs, gl.COMPILE_STATUS)) {
    console.error("Smoke shader:", gl.getShaderInfoLog(this.fs));
  }
  gl.attachShader(p, this.vs); gl.attachShader(p, this.fs);
  gl.linkProgram(p);
};
Renderer.prototype.init = function () {
  var gl = this.gl, p = this.program;
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(p, "position");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  this.uRes = gl.getUniformLocation(p, "resolution");
  this.uTime = gl.getUniformLocation(p, "time");
  this.uColor = gl.getUniformLocation(p, "u_color");
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};
Renderer.prototype.updateColor = function (rgb) { this.color = rgb; };
Renderer.prototype.updateScale = function () {
  var dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  var w = this.canvas.clientWidth, h = this.canvas.clientHeight;
  this.canvas.width = Math.max(1, Math.floor(w * dpr));
  this.canvas.height = Math.max(1, Math.floor(h * dpr));
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};
Renderer.prototype.render = function (now) {
  var gl = this.gl, p = this.program;
  if (!p) return;
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(p);
  gl.uniform2f(this.uRes, this.canvas.width, this.canvas.height);
  gl.uniform1f(this.uTime, now * 1e-3);
  gl.uniform3fv(this.uColor, this.color);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

function hexToRgb(hex) {
  var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255] : null;
}

export function initSmokeBackground(selector, opts) {
  opts = opts || {};
  var canvas = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!canvas) return;
  var renderer = new Renderer(canvas);
  if (!renderer.gl) { canvas.style.display = "none"; return; }
  var rgb = hexToRgb(opts.color || "#F0D2A0");
  if (rgb) renderer.updateColor(rgb);

  var resize = function () { renderer.updateScale(); };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { renderer.render(2000); return; }

  var raf;
  var loop = function (now) { renderer.render(now); raf = requestAnimationFrame(loop); };
  loop(0);
}
