// 첫 화면의 물 표면. 라이브러리 없는 WebGL2 한 패스 — 커스틱 빛무늬·깊이·빛줄기·포인터 파문.
// 첫 화면 밖으로 나가거나 탭이 숨으면 멈추고, reduced-motion 이면 한 프레임만 그린다.

const VERT = `#version 300 es
precision highp float;
void main() {
  // 화면을 덮는 삼각형 하나
  vec2 p = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 u_res;
uniform float u_time;
uniform vec4 u_rip[8];
uniform int u_ripN;
uniform float u_narrow;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

// 흔들리는 보로노이 셀의 경계 거리. 경계가 빛나면 물 밑 커스틱 그물이 된다.
float edge(vec2 x, float t) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  float f1 = 8.0;
  float f2 = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 h = hash2(n + g);
      vec2 p = g + 0.5 + 0.36 * sin(t + 6.2831 * h) - f;
      float d = dot(p, p);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
    }
  }
  return sqrt(f2) - sqrt(f1);
}

void main() {
  vec2 st = vec2(gl_FragCoord.x / u_res.x, 1.0 - gl_FragCoord.y / u_res.y);
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(st.x * aspect, st.y);
  float t = u_time;

  // 파문: 포인터가 닿은 자리에서 고리가 퍼지며 빛무늬를 밀어낸다
  float push = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= u_ripN) break;
    vec4 r = u_rip[i];
    float age = t - r.z;
    if (age < 0.0 || age > 2.6) continue;
    float d = length(p - vec2(r.x * aspect, r.y));
    float front = age * 0.5;
    push += exp(-pow((d - front) * 16.0, 2.0)) * exp(-age * 1.4) * r.w;
  }
  // 물결에 굽은 좌표: 곧은 셀 경계가 아니라 흔들리는 실선이 되게
  vec2 q = p + push * 0.05;
  q += 0.10 * vec2(sin(q.y * 3.3 + t * 0.35), cos(q.x * 2.9 - t * 0.28));
  q += 0.05 * vec2(sin(q.y * 7.1 - t * 0.5), cos(q.x * 6.3 + t * 0.4));

  // 커스틱 두 겹: 큰 그물과 잔 그물. 가는 실선 + 그 둘레의 옅은 번짐.
  float e1 = edge(q * 2.2 + vec2(0.0, t * 0.03), t * 0.32);
  float e2 = edge(q * 4.6 - vec2(t * 0.02, 0.0), t * 0.5);
  float c1 = pow(1.0 - smoothstep(0.0, 0.08, e1), 1.5);
  float h1 = pow(1.0 - smoothstep(0.0, 0.36, e1), 3.0);
  float c2 = pow(1.0 - smoothstep(0.0, 0.07, e2), 1.7);
  // 빛이 모이는 자리와 비는 자리
  float gather = 0.6 + 0.4 * sin(p.x * 1.3 + t * 0.18) * sin(p.y * 1.7 - t * 0.14 + 1.3);
  float caustic = (c1 * 0.5 + h1 * 0.28 + c2 * 0.26 + c1 * c2 * 0.45) * gather;
  caustic *= 0.45 + 0.55 * st.y; // 깊을수록 빛무늬가 또렷하다

  // 빛줄기: 위에서 비스듬히 내려오는 옅은 띠
  float shaft = 0.5 + 0.5 * sin((st.x * 1.7 - st.y * 0.45) * 8.0 + t * 0.22);
  shaft = pow(shaft, 7.0) * (1.0 - st.y) * 0.16;

  // 깊이: 위는 맑고 아래로 갈수록 짙은 물빛
  vec3 top = vec3(0.957, 0.984, 0.992);
  vec3 deep = vec3(0.627, 0.835, 0.906);
  vec3 col = mix(top, deep, smoothstep(0.0, 1.0, st.y * 0.95 + 0.08 * st.x));
  vec3 cyan = vec3(0.62, 0.9, 0.97);
  col += caustic * mix(cyan, vec3(1.0), 0.6) * 0.24;
  col += shaft;
  col += push * 0.14;

  // 글이 놓이는 왼쪽(좁은 화면에선 위쪽)은 차분하게
  float calm = 1.0 - smoothstep(0.12, 0.56, st.x);
  calm = max(calm, u_narrow * (1.0 - smoothstep(0.06, 0.52, st.y)));
  col = mix(col, top, calm * 0.78);

  o = vec4(col, 1.0);
}`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('[water] shader', gl.getShaderInfoLog(s))
    return null
  }
  return s
}

// canvas 에 물을 그리는 렌더러. 실패하면 null — 호출한 쪽이 CSS 배경으로 둔다.
export function createWater(canvas, { scale = 0.6, maxDpr = 1.5 } = {}) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' })
  if (!gl) return null
  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[water] link', gl.getProgramInfoLog(prog))
    return null
  }
  gl.useProgram(prog)
  gl.bindVertexArray(gl.createVertexArray())
  const U = {
    res: gl.getUniformLocation(prog, 'u_res'),
    time: gl.getUniformLocation(prog, 'u_time'),
    rip: gl.getUniformLocation(prog, 'u_rip[0]'),
    ripN: gl.getUniformLocation(prog, 'u_ripN'),
    narrow: gl.getUniformLocation(prog, 'u_narrow'),
  }

  const rips = new Float32Array(32)
  let ripHead = 0
  let w = 1
  let h = 1
  let narrow = 0
  let running = false
  let frozen = false
  let raf = 0
  const t0 = performance.now()
  const now = () => (performance.now() - t0) / 1000

  function draw() {
    gl.uniform2f(U.res, w, h)
    gl.uniform1f(U.time, now())
    gl.uniform4fv(U.rip, rips)
    gl.uniform1i(U.ripN, Math.min(8, ripHead))
    gl.uniform1f(U.narrow, narrow)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  function loop() {
    if (!running) return
    draw()
    raf = requestAnimationFrame(loop)
  }

  const water = {
    resize(cssW, cssH) {
      const dpr = Math.min(maxDpr, window.devicePixelRatio || 1)
      w = Math.max(1, Math.round(cssW * scale * dpr))
      h = Math.max(1, Math.round(cssH * scale * dpr))
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      narrow = cssW < 760 ? 1 : 0
      draw()
    },
    start() {
      if (running || frozen) return
      running = true
      raf = requestAnimationFrame(loop)
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
    },
    // 개발·reduced-motion 용: 지금 상태로 한 장만 그리고 멈춘다
    freeze() {
      frozen = true
      water.stop()
      draw()
    },
    get running() {
      return running
    },
    // x, y 는 첫 화면 안의 비율(0~1)
    ripple(x, y, strength = 1) {
      rips.set([x, y, now(), strength], (ripHead % 8) * 4)
      ripHead++
    },
    // 컨텍스트는 버리지 않는다 — React StrictMode 가 마운트를 두 번 하면 같은 canvas 에 다시 붙기 때문.
    destroy() {
      water.stop()
    },
  }
  return water
}

let api = null
export function registerWater(a) {
  api = a
}
export function ripple(x, y, strength = 1) {
  api?.ripple(x, y, strength)
}
