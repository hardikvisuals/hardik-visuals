import * as THREE from "three";
import gsap from "gsap";

// All art-direction and motion controls for the spiral live here.
export const SPIRAL_CONFIG = {
  fov: 55,
  cameraDistance: 9.8,
  mobileCameraDistance: 11.4,
  pixelRatio: 1.65,
  segments: 32,
  tileWidth: 3.9,
  tileAspect: 16 / 9,
  tileSizeRange: [0.82, 1.1],
  mobileScale: 0.78,
  focalScale: 1.15,
  focalRange: 1.05,
  spiralRadius: 3.0,
  mobileRadius: 1.45,
  spiralDepth: 2.35,
  pitch: 1.42,
  angularPitch: 0.87,
  jitter: { x: 0.24, y: 0.16, z: 0.24 },
  tilt: { x: 0.13, y: 1.0, z: 0.16 },
  bendStrength: 0.2,
  distanceBend: 0.15,
  velocityBend: 0.025,
  maxVelocityBend: 0.2,
  hoverBend: 0.025,
  cornerRadius: 0.055,
  blurPixels: 5.5,
  backBlurPixels: 3.0,
  backBrightness: 0.8,
  peripheralBlurRange: 3.0,
  saturation: 1.1,
  nearBrightness: 1.0,
  farBrightness: 0.73,
  inertia: 4.2,
  idleSpeed: 0.16,
  wheelGain: 0.005,
  dragGain: 0.009,
  hoverLift: 0.38,
  hoverScale: 0.04,
  hoverResponse: 10,
  videoBudget: 3,
  mobileVideoBudget: 1,
  mediaInterval: 220,
};
const C = SPIRAL_CONFIG;
const seeded = (i, salt) => {
  const value = Math.sin((i + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const vertex = `
varying vec2 vUv;
uniform float uHover;
uniform float uTime;
uniform float uBend;
void main() {
  vUv = uv;
  vec3 p = position;
  // Cylindrical paper bend: arc length is preserved instead of stretching UVs.
  float k = max(uBend, .001);
  float angle = p.x * k;
  p.x = sin(angle) / k;
  p.z += (cos(angle) - 1.0) / k;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const fragment = `
varying vec2 vUv;
uniform sampler2D uMap;
uniform float uAspect;
uniform float uMediaAspect;
uniform float uHover;
uniform float uOpacity;
uniform float uLight;
uniform float uIsVideo;
uniform float uRadius;
uniform float uBlur;
uniform float uBackBlur;
uniform float uBackBrightness;
uniform float uSaturation;
uniform vec2 uTexel;
vec4 sampleLinear(vec2 uv) {
  vec4 c = texture2D(uMap, clamp(uv, vec2(.001), vec2(.999)));
  return uIsVideo > .5 ? sRGBTransferEOTF(c) : c;
}
void main() {
  vec2 q = abs(vUv - 0.5) * vec2(uAspect, 1.0) - vec2(uAspect * 0.5 - uRadius, .5 - uRadius);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float aa = max(fwidth(d), .001);
  float alpha = 1.0 - smoothstep(-aa, aa, d);
  if (alpha < .01) discard;
  vec2 crop = vec2(min(1.0, uAspect / uMediaAspect), min(1.0, uMediaAspect / uAspect));
  vec2 uv = (vUv - .5) * crop / (1.0 + uHover * .045) + .5;
  vec3 color = sampleLinear(uv).rgb;
  // Back faces naturally show mirrored artwork. Soften them as paper turns
  // through the far side of the helix; keep the front focal sheet crisp.
  float blur = uBlur + (gl_FrontFacing ? 0. : uBackBlur);
  if (blur > .05) {
    vec2 offset = uTexel * blur;
    color = color * .2
      + sampleLinear(uv + vec2(offset.x, 0.)).rgb * .12
      + sampleLinear(uv - vec2(offset.x, 0.)).rgb * .12
      + sampleLinear(uv + vec2(0., offset.y)).rgb * .12
      + sampleLinear(uv - vec2(0., offset.y)).rgb * .12
      + sampleLinear(uv + offset).rgb * .08
      + sampleLinear(uv - offset).rgb * .08
      + sampleLinear(uv + vec2(offset.x, -offset.y)).rgb * .08
      + sampleLinear(uv + vec2(-offset.x, offset.y)).rgb * .08;
  }
  float luminance = dot(color, vec3(.2126, .7152, .0722));
  color = max(vec3(0.), mix(vec3(luminance), color, uSaturation));
  color *= min(1.0, uLight + uHover * .04);
  color *= gl_FrontFacing ? 1.0 : uBackBrightness;
  float edge = 1.0 - smoothstep(.0, .011, -d);
  color += edge * (.012 + uHover * .055);
  color += pow(max(0.0, 1.0 - abs(vUv.x + vUv.y * .3 - .1)), 14.0) * uHover * .055;
  gl_FragColor = vec4(color, alpha * uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// One render loop owns the gallery. No React updates or layout reads per frame.
// The helix wraps outside the camera frustum and video decoders are budgeted.
export function createSpiral(
  host,
  projects,
  { onHover, onSelect, onReady, onUnavailable, reduced },
) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    onUnavailable();
    return {
      dispose() {},
      enter() {},
      setPaused() {},
      setPlaying() {},
      impulse() {},
      nudge() {},
      focus() {},
      setRecessed() {},
      unfurl() {},
    };
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, C.pixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  scene.add(group);
  const camera = new THREE.PerspectiveCamera(C.fov, 1, 0.1, 50);
  camera.position.z = C.cameraDistance;
  const frustum = new THREE.Frustum(),
    projection = new THREE.Matrix4();
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2(10, 10);
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  const geometry = new THREE.PlaneGeometry(
    C.tileWidth,
    C.tileWidth / C.tileAspect,
    C.segments,
    C.segments,
  );
  geometry.computeBoundingSphere();
  const placeholder = new THREE.DataTexture(
    new Uint8Array([23, 27, 21, 255]),
    1,
    1,
  );
  placeholder.needsUpdate = true;
  const travel = { reveal: 0, burst: 0, recessed: 0, twist: 0 };
  let target = 0,
    hovered = -1,
    entered = false,
    paused = true,
    playing = !reduced;
  let disposed = false,
    mobile = false,
    dragStart = null,
    dragDistance = 0;
  let phase = 0,
    time = 0,
    last = performance.now(),
    frame,
    mediaTick = 0;
  let pointerDirty = false,
    activeCount = 0,
    videoBudget = C.videoBudget;
  let timings = [],
    lastTiming = performance.now();
  let ready = false;
  const list = projects.map((project, i) => {
    const uniforms = {
      uMap: { value: placeholder },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uBend: { value: C.bendStrength },
      uAspect: { value: C.tileAspect },
      uMediaAspect: { value: 16 / 9 },
      uOpacity: { value: 0 },
      uLight: { value: 1 },
      uIsVideo: { value: 0 },
      uRadius: { value: C.cornerRadius },
      uBlur: { value: 0 },
      uBackBlur: { value: C.backBlurPixels },
      uBackBrightness: { value: C.backBrightness },
      uSaturation: { value: C.saturation },
      uTexel: { value: new THREE.Vector2(1 / 640, 1 / 360) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.index = i;
    // Raycast the same cylinder as the vertex shader, including rounded corners.
    // This keeps clicks on bent edges accurate without CPU mesh deformation.
    const inverse = new THREE.Matrix4(),
      localRay = new THREE.Ray();
    const localPoint = new THREE.Vector3(),
      worldPoint = new THREE.Vector3();
    mesh.raycast = function (caster, hits) {
      if (!this.visible || uniforms.uOpacity.value < 0.05) return;
      inverse.copy(this.matrixWorld).invert();
      localRay.copy(caster.ray).applyMatrix4(inverse);
      const k = Math.max(uniforms.uBend.value, 0.001),
        radius = 1 / k;
      const o = localRay.origin,
        d = localRay.direction;
      const a = d.x * d.x + d.z * d.z;
      const b = 2 * (o.x * d.x + (o.z + radius) * d.z);
      const c = o.x * o.x + (o.z + radius) ** 2 - radius * radius;
      const discriminant = b * b - 4 * a * c;
      if (a < 1e-8 || discriminant < 0) return;
      for (const sign of [-1, 1]) {
        const t = (-b + sign * Math.sqrt(discriminant)) / (2 * a);
        if (t < 0) continue;
        localRay.at(t, localPoint);
        const sourceX = Math.atan2(localPoint.x, localPoint.z + radius) / k;
        const u = sourceX / C.tileWidth + 0.5;
        const v = localPoint.y / (C.tileWidth / C.tileAspect) + 0.5;
        const qx =
          Math.abs(u - 0.5) * C.tileAspect -
          (C.tileAspect / 2 - C.cornerRadius);
        const qy = Math.abs(v - 0.5) - (0.5 - C.cornerRadius);
        if (
          Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
            Math.min(Math.max(qx, qy), 0) >
          C.cornerRadius
        )
          continue;
        worldPoint.copy(localPoint).applyMatrix4(this.matrixWorld);
        const distance = worldPoint.distanceTo(caster.ray.origin);
        if (distance < caster.near || distance > caster.far) continue;
        hits.push({
          distance,
          point: worldPoint.clone(),
          uv: new THREE.Vector2(u, v),
          object: this,
        });
      }
    };
    group.add(mesh);
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "none";
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    return {
      mesh,
      material,
      uniforms,
      project,
      poster: null,
      posterStarted: false,
      texture,
      video,
      requested: false,
      autoplayBlocked: false,
      variation: {
        size: THREE.MathUtils.lerp(...C.tileSizeRange, seeded(i, 1)),
        x: (seeded(i, 2) - 0.5) * 2 * C.jitter.x,
        y: (seeded(i, 3) - 0.5) * 2 * C.jitter.y,
        z: (seeded(i, 4) - 0.5) * 2 * C.jitter.z,
        tilt: (seeded(i, 5) - 0.5) * 2 * C.tilt.z,
      },
      i,
    };
  });
  function loadPoster(item) {
    if (item.posterStarted) return;
    item.posterStarted = true;
    item.poster = loader.load(
      item.project.poster,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        if (!item.uniforms.uIsVideo.value) {
          item.uniforms.uMap.value = texture;
          item.uniforms.uMediaAspect.value =
            texture.image.width / texture.image.height;
          item.uniforms.uTexel.value.set(
            1 / texture.image.width,
            1 / texture.image.height,
          );
        }
        if (!ready) {
          ready = true;
          onReady();
        }
      },
      undefined,
      () => {
        if (!ready) {
          ready = true;
          onReady();
        }
      },
    );
    item.poster.colorSpace = THREE.SRGBColorSpace;
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    mobile = width < 700;
    videoBudget = mobile ? C.mobileVideoBudget : C.videoBudget;
    camera.aspect = width / height;
    camera.position.z = mobile
      ? Math.max(C.mobileCameraDistance, 4.5 / camera.aspect)
      : C.cameraDistance;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    frustum.setFromProjectionMatrix(
      projection.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse,
      ),
    );
    renderer.setSize(width, height);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  function setHover(i) {
    if (hovered === i) return;
    hovered = i;
    host.dataset.hovering = i >= 0 ? "true" : "false";
    onHover(i);
    pointerDirty = true;
  }
  function locate(e) {
    const box = host.getBoundingClientRect();
    pointer.set(
      ((e.clientX - box.left) / box.width) * 2 - 1,
      (-(e.clientY - box.top) / box.height) * 2 + 1,
    );
    pointerDirty = true;
  }
  function move(e) {
    locate(e);
    if (dragStart && !paused) {
      const dy = e.clientY - dragStart.y;
      dragDistance += Math.abs(dy);
      target -= dy * C.dragGain;
      dragStart = { x: e.clientX, y: e.clientY };
      setHover(-1);
    }
  }
  function down(e) {
    if (paused) return;
    locate(e);
    dragStart = { x: e.clientX, y: e.clientY };
    dragDistance = 0;
    host.setPointerCapture(e.pointerId);
  }
  function up(e) {
    if (!dragStart) return;
    const click = dragDistance < 7;
    dragStart = null;
    if (host.hasPointerCapture(e.pointerId))
      host.releasePointerCapture(e.pointerId);
    if (click && !paused) {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(group.children)[0];
      if (hit) onSelect(hit.object.userData.index);
    }
  }
  function leave() {
    if (!dragStart) {
      pointer.set(10, 10);
      setHover(-1);
    }
  }
  function cancel() {
    dragStart = null;
    leave();
  }
  function wheel(e) {
    if (paused) return;
    e.preventDefault();
    target +=
      Math.max(-220, Math.min(220, e.deltaY * (e.deltaMode === 1 ? 16 : 1))) *
      C.wheelGain;
  }
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerdown", down);
  host.addEventListener("pointerup", up);
  host.addEventListener("pointerleave", leave);
  host.addEventListener("pointercancel", cancel);
  host.addEventListener("wheel", wheel, { passive: false });
  function pauseVideos() {
    list.forEach((item) => {
      item.video.pause();
      // pause() alone can keep downloading; release previews while a film is open.
      if (item.video.getAttribute("src")) {
        item.video.removeAttribute("src");
        item.video.load();
      }
      item.requested = false;
      item.uniforms.uMap.value = item.poster?.image ? item.poster : placeholder;
      item.uniforms.uIsVideo.value = 0;
    });
  }
  function visibility() {
    last = performance.now();
    if (document.hidden) pauseVideos();
  }
  document.addEventListener("visibilitychange", visibility);
  function draw(now) {
    if (disposed) return;
    frame = requestAnimationFrame(draw);
    const elapsed = now - last;
    const dt = Math.min(elapsed / 1000, 0.045);
    last = now;
    if (document.hidden) return;
    if (import.meta.env.DEV && entered && !paused && playing) {
      timings.push(elapsed);
      if (now - lastTiming > 2500 && timings.length > 20) {
        const sorted = timings.slice().sort((a, b) => a - b);
        host.dataset.frameMedian =
          sorted[Math.floor(sorted.length * 0.5)].toFixed(2);
        host.dataset.frameP95 =
          sorted[Math.floor(sorted.length * 0.95)].toFixed(2);
        host.dataset.slowFrames = String(sorted.filter((t) => t > 25).length);
        host.dataset.sampleCount = String(sorted.length);
        timings = [];
        lastTiming = now;
      }
    }
    time += dt;
    if (entered && !paused && playing && hovered < 0 && !dragStart)
      target += dt * C.idleSpeed;
    const previousPhase = phase;
    phase = THREE.MathUtils.damp(phase, target, reduced ? 24 : C.inertia, dt);
    const speed = Math.abs(phase - previousPhase) / Math.max(dt, 0.001);
    const height = projects.length * C.pitch;
    const delta = target - phase;
    group.rotation.z = 0;
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      pointer.x < 5 && !mobile && !reduced ? pointer.x * 0.035 : 0,
      3,
      dt,
    );
    group.scale.setScalar(
      (0.78 + travel.reveal * 0.22) * (1 - travel.recessed * 0.15),
    );
    group.position.x = -travel.recessed * (mobile ? 0.35 : 1.6);
    group.updateMatrixWorld(true);
    const candidates = [];
    list.forEach((item, i) => {
      const y =
        THREE.MathUtils.euclideanModulo(
          i * C.pitch + phase + height / 2,
          height,
        ) -
        height / 2;
      const angle = y * C.angularPitch + travel.twist;
      const focal = Math.exp(-Math.pow(y / C.focalRange, 2));
      const away = 1 - focal;
      const radius = mobile ? C.mobileRadius : C.spiralRadius;
      const x = Math.sin(angle) * radius + item.variation.x * away;
      const z = Math.cos(angle) * C.spiralDepth + item.variation.z * away;
      const depth = THREE.MathUtils.clamp(
        (C.spiralDepth - z) / (C.spiralDepth * 2),
        0,
        1,
      );
      item.mesh.position.set(
        x * (1 + travel.burst * 0.4),
        y + item.variation.y * away + (1 - travel.reveal) * 2.3,
        z + travel.burst * 1.1 + item.uniforms.uHover.value * C.hoverLift,
      );
      const isHover = hovered === i;
      const hover = THREE.MathUtils.damp(
        item.uniforms.uHover.value,
        isHover ? 1 : 0,
        C.hoverResponse,
        dt,
      );
      item.uniforms.uHover.value = hover;
      item.mesh.scale.setScalar(
        (mobile ? C.mobileScale : 1) *
          THREE.MathUtils.lerp(item.variation.size, C.focalScale, focal) *
          (1 + hover * C.hoverScale),
      );
      item.mesh.rotation.set(
        Math.sin(angle) * C.tilt.x * away,
        -angle * C.tilt.y + Math.max(-0.08, Math.min(0.08, delta * 0.012)),
        item.variation.tilt * away,
      );
      item.uniforms.uBend.value =
        C.bendStrength +
        away * C.distanceBend +
        (reduced ? 0 : Math.min(C.maxVelocityBend, speed * C.velocityBend)) +
        hover * C.hoverBend;
      item.uniforms.uTime.value = reduced ? 0 : time;
      item.uniforms.uOpacity.value =
        travel.reveal * Math.min(1, (height / 2 - Math.abs(y)) / 0.6);
      item.uniforms.uLight.value = THREE.MathUtils.lerp(
        C.nearBrightness,
        C.farBrightness,
        depth,
      );
      const peripheral = THREE.MathUtils.smoothstep(
        Math.abs(y),
        C.focalRange,
        C.peripheralBlurRange,
      );
      item.uniforms.uBlur.value =
        Math.max(depth, peripheral) * C.blurPixels * (1 - hover * 0.65);
      item.mesh.updateMatrixWorld();
      item.mesh.visible = frustum.intersectsObject(item.mesh);
      if (item.mesh.visible) loadPoster(item);
      if (item.mesh.visible && item.uniforms.uOpacity.value > 0.05)
        candidates.push({
          item,
          score: (isHover ? 20 : 0) + z * 2 - Math.abs(y) * 0.5,
        });
      if (item.requested && item.video.readyState >= 2) {
        item.uniforms.uMap.value = item.texture;
        item.uniforms.uIsVideo.value = 1;
        item.uniforms.uMediaAspect.value =
          item.video.videoWidth / item.video.videoHeight;
        item.uniforms.uTexel.value.set(
          1 / item.video.videoWidth,
          1 / item.video.videoHeight,
        );
      }
    });
    if (now - mediaTick > C.mediaInterval) {
      mediaTick = now;
      const chosen = new Set(
        entered && !paused && playing
          ? candidates
              .sort((a, b) => b.score - a.score)
              .slice(0, videoBudget)
              .map((c) => c.item.i)
          : [],
      );
      activeCount = chosen.size;
      list.forEach((item) => {
        if (chosen.has(item.i) && !item.requested && !item.autoplayBlocked) {
          item.requested = true;
          if (!item.video.getAttribute("src"))
            item.video.src = item.project.preview;
          item.video.play().catch((error) => {
            item.requested = false;
            if (error.name === "NotAllowedError") item.autoplayBlocked = true;
          });
        } else if (!chosen.has(item.i) && item.requested) {
          item.video.pause();
          item.requested = false;
        }
      });
      // Exposed as DOM data for diagnostics, without exposing application internals.
      host.dataset.activeVideos = String(activeCount);
      host.dataset.phase = phase.toFixed(2);
    }
    if (!paused && !dragStart && pointer.x < 5 && (pointerDirty || playing)) {
      scene.updateMatrixWorld();
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(group.children)[0];
      setHover(hit ? hit.object.userData.index : -1);
      pointerDirty = false;
    }
    renderer.render(scene, camera);
  }
  frame = requestAnimationFrame(draw);
  function contextLost(e) {
    e.preventDefault();
    onUnavailable();
  }
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  return {
    enter() {
      entered = true;
      paused = false;
      gsap.to(travel, {
        reveal: 1,
        duration: reduced ? 0.15 : 1.25,
        ease: "power3.out",
        delay: reduced ? 0 : 0.15,
      });
    },
    setPaused(value) {
      paused = value;
      if (value) {
        setHover(-1);
        pauseVideos();
      }
    },
    setPlaying(value) {
      playing = value;
      if (!value) pauseVideos();
    },
    impulse() {
      target += 2;
      gsap.to(travel, {
        burst: 0.7,
        duration: 0.22,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
      });
    },
    setRecessed(value) {
      gsap.to(travel, {
        recessed: value ? 1 : 0,
        duration: reduced ? 0.15 : 0.85,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    },
    unfurl() {
      if (reduced) return;
      target += 0.85;
      gsap.fromTo(
        travel,
        { twist: -0.65 },
        { twist: 0, duration: 1.25, ease: "power3.out", overwrite: "auto" },
      );
    },
    nudge(direction) {
      target += direction * C.pitch;
    },
    focus(index) {
      target = -index * C.pitch;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      gsap.killTweensOf(travel);
      pauseVideos();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointercancel", cancel);
      host.removeEventListener("wheel", wheel);
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      list.forEach((item) => {
        item.video.removeAttribute("src");
        item.video.load();
        item.poster?.dispose();
        item.texture.dispose();
        item.material.dispose();
      });
      geometry.dispose();
      placeholder.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
