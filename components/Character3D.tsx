"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OutlineEffect } from "three/addons/effects/OutlineEffect.js";
import type { CharacterModel } from "@/lib/character-model";
import { SEATED_TOP, T, clamp01, lerp, poseAt, ramp, type SceneLayout } from "@/lib/hero-timeline";
import { Z } from "./AnimeCharacter";

type ClipName = keyof CharacterModel["clips"];

/** Toon shading bands, darkest first. */
const TOON_STEPS = [96, 176, 255];
/** Camera field of view; narrow, so the stage keeps its flat layout with only a hint of perspective. */
const FOV = 22;

const smooth = (t: number) => t * t * (3 - 2 * t);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

async function loadFile(url: string) {
  if (/\.(glb|gltf)$/i.test(url)) {
    const gltf = await new GLTFLoader().loadAsync(url);
    return { root: gltf.scene as THREE.Object3D, clips: gltf.animations };
  }
  const fbx = await new FBXLoader().loadAsync(url);
  return { root: fbx as THREE.Object3D, clips: fbx.animations };
}

function toonify(root: THREE.Object3D, gradientMap: THREE.Texture) {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.frustumCulled = false;
    const convert = (m: THREE.Material) => {
      const src = m as THREE.MeshStandardMaterial;
      const toon = new THREE.MeshToonMaterial({
        color: src.color ?? new THREE.Color(0xffffff),
        map: src.map ?? null,
        gradientMap,
        transparent: src.transparent,
        alphaTest: src.alphaTest,
        side: src.side,
      });
      m.dispose();
      return toon;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(convert) : convert(mesh.material);
  });
}

/**
 * The character as a rigged 3D model, toon-shaded with outlines. It follows
 * the same timeline as the drawn character: walks in from the left, turns to
 * face the visitor, sits behind the desk and types. The walk cycle is tied to
 * the distance actually travelled, so his feet don't slide.
 */
export default function Character3D({
  model: files,
  layout,
  startAt,
  reduced,
  onReady,
}: {
  model: CharacterModel;
  layout: SceneLayout;
  startAt: number | null;
  reduced: boolean;
  /** Called once with whether the model loaded; on false the drawn character takes over. */
  onReady: (ok: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ layout, startAt, reduced, onReady, resize: null as (() => void) | null });

  useEffect(() => {
    Object.assign(live.current, { layout, startAt, reduced, onReady });
    live.current.resize?.();
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const state = live.current;
    let disposed = false;
    let raf = 0;
    let visible = true;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      state.onReady(false);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const outline = new OutlineEffect(renderer, { defaultThickness: 0.0035, defaultColor: [0.04, 0.04, 0.06] });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 100000);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x445566, 1.1);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-0.6, 1, 1);
    const rim = new THREE.DirectionalLight(0xffffff, 1.4);
    rim.position.set(1, 0.6, -0.8);
    scene.add(hemi, key, rim);

    // The rim light takes the theme's accent colour.
    const readAccent = () => {
      const rgb = getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim().split(/\s+/).map(Number);
      if (rgb.length === 3 && rgb.every((c) => !Number.isNaN(c))) rim.color.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, THREE.SRGBColorSpace);
    };
    readAccent();
    const themeObserver = new MutationObserver(readAccent);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const gradient = new THREE.DataTexture(new Uint8Array(TOON_STEPS), TOON_STEPS.length, 1, THREE.RedFormat);
    gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
    gradient.needsUpdate = true;

    const resize = () => {
      const L = state.layout;
      renderer.setSize(L.width, L.height, false);
      camera.aspect = L.width / L.height;
      // The z = 0 plane maps one world unit to one CSS pixel of the stage, with y pointing up.
      camera.position.set(L.width / 2, -L.height / 2, L.height / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
      camera.lookAt(L.width / 2, -L.height / 2, 0);
      camera.updateProjectionMatrix();
    };
    state.resize = resize;
    resize();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    (async () => {
      const url = (path: string) => `/models/${path}`;
      const cache = new Map<string, ReturnType<typeof loadFile>>();
      const load = (file: string) => {
        if (!cache.has(file)) cache.set(file, loadFile(url(file)));
        return cache.get(file)!;
      };
      const { root: model } = await load(files.character);
      const clips: Partial<Record<ClipName, THREE.AnimationClip>> = {};
      await Promise.all(
        (Object.entries(files.clips) as [ClipName, string | undefined][]).map(async ([name, ref]) => {
          if (!ref) return;
          const [file, clipName] = ref.split("#");
          const found = (await load(file)).clips;
          const clip = clipName ? found.find((c) => c.name === clipName) : found[0];
          if (clip) clips[name] = clip.clone();
        }),
      );
      if (!clips.idle || !clips.walk) throw new Error("idle and walk clips are required");
      if (disposed) return;

      toonify(model, gradient);
      const rig = new THREE.Group();
      rig.add(model);
      scene.add(rig);
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const height = box.max.y - box.min.y;
      model.position.y -= box.min.y;
      model.updateMatrixWorld(true);

      let hips: THREE.Object3D | undefined;
      let head: THREE.Object3D | undefined;
      model.traverse((n) => {
        if (!hips && /hips$/i.test(n.name)) hips = n;
        if (!head && /head$/i.test(n.name)) head = n;
      });
      const worldY = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3()).y;
      const headTopAbove = head ? height - worldY(head) : 0;

      const mixer = new THREE.AnimationMixer(model);
      const sample = (clip: THREE.AnimationClip, time: number, read: () => number) => {
        const action = mixer.clipAction(clip);
        action.reset().play();
        action.setEffectiveWeight(1);
        action.time = time;
        mixer.update(0);
        model.updateMatrixWorld(true);
        const value = read();
        action.stop();
        return value;
      };
      const hipsZ = () => hips!.getWorldPosition(new THREE.Vector3()).z;

      // How far one walk cycle carries him, in world units, then make every clip play in place.
      let stride = height * 0.78;
      if (hips) {
        const travel = sample(clips.walk, clips.walk.duration - 1e-3, hipsZ) - sample(clips.walk, 0, hipsZ);
        if (Math.abs(travel) > height * 0.2) stride = Math.abs(travel);
      }
      for (const name of ["walk", "idle", "typing"] as const) {
        for (const track of clips[name]?.tracks ?? []) {
          if (!/hips\.position$/i.test(track.name)) continue;
          const v = track.values;
          for (let i = 0; i < v.length; i += 3) {
            v[i] = v[0];
            v[i + 2] = v[2];
          }
        }
      }

      // How far to raise him on the seat so his head clears the desk where the drawn seated pose does.
      let seatLift = (SEATED_TOP - 1) * height;
      const seated = clips.typing ?? clips.sit;
      if (seated && head) {
        const headTop = sample(seated, seated === clips.sit ? seated.duration - 1e-3 : 0, () => worldY(head!)) + headTopAbove;
        seatLift = SEATED_TOP * height - headTop;
      }

      const actions = Object.fromEntries(
        (Object.keys(clips) as ClipName[]).map((name) => {
          const action = mixer.clipAction(clips[name]!);
          action.reset().play();
          action.setEffectiveWeight(0);
          return [name, action];
        }),
      ) as Partial<Record<ClipName, THREE.AnimationAction>>;

      const pose = (t: number, clock: number) => {
        const L = state.layout;
        const p = poseAt(t, L);
        const { walkEnd, turn, sit, settle } = L.t;
        const turnK = ramp(t, turn);
        const sitK = ramp(t, sit);

        const walkW = Math.min(
          smooth(ramp(t, [T.walkStart - 0.05, T.walkStart + 0.2])),
          1 - smooth(ramp(t, [walkEnd - 0.1, walkEnd + 0.25])),
        );
        const typeW = clips.typing ? smooth(ramp(t, [sit[1] - 0.05, settle[1]])) : 0;
        const sitW = clips.sit ? smooth(ramp(sitK, [0, 0.12])) * (1 - typeW) : 0;
        const weights: Record<ClipName, number> = { walk: walkW, sit: sitW, typing: typeW, idle: Math.max(0, 1 - walkW - sitW - typeW) };
        for (const name of Object.keys(actions) as ClipName[]) actions[name]!.setEffectiveWeight(weights[name]);

        const travelled = (p.rig.hipX - L.startX) / L.u;
        actions.walk!.time = (((travelled * height) / stride) % 1) * clips.walk!.duration;
        actions.idle!.time = clock % clips.idle!.duration;
        if (actions.sit) actions.sit.time = clamp01(sitK) * (clips.sit!.duration - 1e-3);
        if (actions.typing) actions.typing.time = Math.max(0, t - sit[1]) % clips.typing!.duration;
        mixer.update(0);

        const lowered = clips.sit ? smooth(sitK) : easeInOut(ramp(sitK, [0.05, 0.85]));
        const scale = L.u / height;
        rig.scale.setScalar(scale);
        rig.position.set(turnK > 0 ? L.stopX : p.rig.hipX, -L.floorY + seatLift * scale * lowered, 0);
        rig.rotation.y = lerp(Math.PI / 2, 0, easeInOut(turnK));
        canvas.style.opacity = String(smooth(ramp(t, T.appear)));
      };

      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        const L = state.layout;
        const now = performance.now() / 1000;
        const t = state.reduced ? L.t.total + 1 : state.startAt === null ? 0 : now - state.startAt / 1000;
        pose(t, state.reduced ? 0 : now);
        outline.render(scene, camera);
      };
      frame();
      state.onReady(true);
    })().catch((err) => {
      if (!disposed) {
        console.info("3D character unavailable, using the drawn one:", err?.message ?? err);
        state.onReady(false);
      }
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      themeObserver.disconnect();
      state.resize = null;
      gradient.dispose();
      scene.traverse((n) => {
        const mesh = n as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => m.dispose());
      });
      renderer.dispose();
    };
  }, [files]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute left-0 top-0 h-full w-full"
      // Clipped at the floor so nothing shows below it while he is behind the desk.
      style={{ zIndex: Z.character, opacity: 0, clipPath: `inset(0 0 ${Math.max(0, layout.height - layout.floorY - 1)}px 0)` }}
    />
  );
}
