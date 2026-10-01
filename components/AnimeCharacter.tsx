"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  DESK_H,
  FAR_HIP_OFFSET,
  FRONT,
  LAPTOP,
  RIG,
  SEATED,
  TURN_A,
  TURN_B,
  finalPose,
  poseAt,
  type LegAngles,
  type Pose,
  type SceneLayout,
} from "@/lib/hero-timeline";

export const CHARACTER_IMAGES = [
  "/character/body.webp",
  "/character/thigh.webp",
  "/character/shin.webp",
  "/character/foot.webp",
  "/character/turn-a.webp",
  "/character/turn-b.webp",
  "/character/front.webp",
  "/character/seated.webp",
  "/character/seated-light.webp",
  "/character/laptop.webp",
  "/character/laptop-dark.webp",
];

/** Stacking order inside the stage; the desk component uses the same scale. */
export const Z = {
  floor: 0,
  chair: 1,
  character: 2,
  deskTop: 3,
  laptop: 4,
  seated: 5,
  glow: 6,
  deskFront: 7,
  holo: 8,
} as const;

type Elements = Record<string, HTMLDivElement | null>;

function Piece({ src }: { src: string }) {
  return (
    <Image src={src} alt="" fill unoptimized loading="eager" draggable={false} className="pointer-events-none select-none" />
  );
}

function Leg({ u, side }: { u: number; side: "near" | "far" }) {
  const { thigh: T, shin: S, foot: F } = RIG;
  const px = (v: number) => v * u;
  return (
    <div
      data-part={`${side}Root`}
      className="absolute left-0 top-0"
      style={side === "far" ? { filter: "brightness(0.62)" } : undefined}
    >
      <div
        data-part={`${side}Thigh`}
        className="absolute"
        style={{
          left: -px(T.hip[0]),
          top: -px(T.hip[1]),
          width: px(T.w),
          height: px(T.h),
          transformOrigin: `${px(T.hip[0])}px ${px(T.hip[1])}px`,
        }}
      >
        <Piece src="/character/thigh.webp" />
        <div
          data-part={`${side}Shin`}
          className="absolute"
          style={{
            left: px(T.knee[0] - S.knee[0]),
            top: px(T.knee[1] - S.knee[1]),
            width: px(S.w),
            height: px(S.h),
            transformOrigin: `${px(S.knee[0])}px ${px(S.knee[1])}px`,
          }}
        >
          <Piece src="/character/shin.webp" />
          <div
            data-part={`${side}Foot`}
            className="absolute"
            style={{
              left: px(S.ankle[0] - F.ankle[0]),
              top: px(S.ankle[1] - F.ankle[1]),
              width: px(F.w),
              height: px(F.h),
              transformOrigin: `${px(F.ankle[0])}px ${px(F.ankle[1])}px`,
            }}
          >
            <Piece src="/character/foot.webp" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** A sprite drawn as two layers split at the neck line, so the head and body can fade separately. */
function SplitPiece({ src, lightSrc, name, neck }: { src: string; lightSrc?: string; name: string; neck: number }) {
  const line = `${neck * 100}%`;
  // The head layer runs a pixel past the line so no seam shows between the halves.
  const head = `linear-gradient(to bottom, black calc(${line} + 1px), transparent calc(${line} + 1px))`;
  const body = `linear-gradient(to bottom, transparent ${line}, black ${line})`;
  return (
    <>
      <div data-part={`${name}Body`} className="absolute inset-0" style={{ opacity: 0, maskImage: body, WebkitMaskImage: body }}>
        {lightSrc ? (
          <>
            <div className="dark-only absolute inset-0">
              <Piece src={src} />
            </div>
            <div className="light-only absolute inset-0">
              <Piece src={lightSrc} />
            </div>
          </>
        ) : (
          <Piece src={src} />
        )}
      </div>
      <div data-part={`${name}Head`} className="absolute inset-0" style={{ opacity: 0, maskImage: head, WebkitMaskImage: head }}>
        <Piece src={src} />
      </div>
    </>
  );
}

function style(el: HTMLDivElement | null | undefined, props: Partial<Record<"transform" | "opacity" | "visibility" | "filter", string>>) {
  if (el) Object.assign(el.style, props);
}

function setLeg(el: Elements, side: "near" | "far", a: LegAngles, x: number, y: number) {
  style(el[`${side}Root`], { transform: `translate3d(${x}px, ${y}px, 0)` });
  style(el[`${side}Thigh`], { transform: `rotate(${a.thigh}deg)` });
  style(el[`${side}Shin`], { transform: `rotate(${a.shin}deg)` });
  style(el[`${side}Foot`], { transform: `rotate(${a.foot}deg)` });
}

function applyPose(p: Pose, L: SceneLayout, el: Elements) {
  const u = L.u;
  const { rig, front } = p;
  style(el.rig, {
    opacity: String(rig.opacity),
    visibility: rig.opacity > 0.001 ? "visible" : "hidden",
    transform: `translate3d(${rig.hipX}px, ${L.floorY - rig.hipY * u}px, 0) scaleX(${rig.scaleX})`,
  });
  style(el.body, { transform: `rotate(${rig.lean}deg)` });
  setLeg(el, "near", rig.near, rig.pelvis * u, 0);
  setLeg(el, "far", rig.far, (FAR_HIP_OFFSET.x - rig.pelvis) * u, -FAR_HIP_OFFSET.y * u);
  style(el.front, {
    visibility: Math.max(front.head, front.body) > 0.001 ? "visible" : "hidden",
    transform: `translate3d(${front.x - FRONT.headX * u}px, ${L.floorY - u + front.drop * u}px, 0) scaleX(${front.scaleX})`,
  });
  for (const [part, opacity, scaleX, T] of [
    ["turnA", p.turn.a, p.turn.aScale, TURN_A],
    ["turnB", p.turn.b, p.turn.bScale, TURN_B],
  ] as const) {
    style(el[part], {
      opacity: String(opacity),
      visibility: opacity > 0.001 ? "visible" : "hidden",
      transform: `translate3d(${p.turn.axis - (T.axis + T.headX) * u}px, ${L.floorY - u + front.drop * u}px, 0) scaleX(${scaleX})`,
    });
  }
  const smear = p.turn.blur > 0.0001 ? `blur(${(p.turn.blur * u).toFixed(2)}px)` : "none";
  for (const part of ["rig", "front", "turnA", "turnB"]) style(el[part], { filter: smear });
  style(el.frontHead, { opacity: String(front.head) });
  style(el.frontBody, { opacity: String(front.body) });
  style(el.seatedHead, { opacity: String(p.seated.head) });
  style(el.seatedBody, { opacity: String(p.seated.body) });
  style(el.glow, { opacity: String(p.screen) });
}

/**
 * The character: side-view rig for the walk, front-standing sprite for the
 * turn, and the seated sprite at the desk. Poses come from the timeline and
 * are written straight to the DOM each frame, so React only renders on resize.
 */
export default function AnimeCharacter({
  layout,
  startAt,
  reduced,
  hideFigure = false,
}: {
  layout: SceneLayout;
  /** performance.now() when the intro started, or null while images load. */
  startAt: number | null;
  reduced: boolean;
  /** Leave out the drawn figure (the 3D one is shown instead); the laptop and screen glow stay. */
  hideFigure?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el: Elements = {};
    root.current?.querySelectorAll<HTMLDivElement>("[data-part]").forEach((node) => {
      el[node.dataset.part!] = node;
    });
    if (reduced) {
      applyPose(finalPose(layout), layout, el);
      return;
    }
    if (startAt === null) {
      applyPose(poseAt(0, layout), layout, el);
      return;
    }
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - startAt) / 1000;
      const done = t >= layout.t.total;
      applyPose(done ? finalPose(layout) : poseAt(t, layout), layout, el);
      if (!done) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [layout, startAt, reduced, hideFigure]);

  const { u, floorY, stopX } = layout;
  const B = RIG.body;
  const seatedLeft = stopX - SEATED.headX * u;
  const seatedTop = floorY - (DESK_H + SEATED.deskLine) * u;

  return (
    <div ref={root} className="contents">
      {/* Clipped at the floor so nothing shows below it while he lowers behind the desk. */}
      {!hideFigure && (
      <div
        className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
        style={{ height: floorY + 1, zIndex: Z.character }}
      >
        <div
          data-part="rig"
          className="absolute left-0 top-0 will-change-transform"
          style={{ opacity: 0, visibility: "hidden", zIndex: 4 }}
        >
          <Leg u={u} side="far" />
          <Leg u={u} side="near" />
          <div
            data-part="body"
            className="absolute"
            style={{
              left: -B.hip[0] * u,
              top: -B.hip[1] * u,
              width: B.w * u,
              height: B.h * u,
              transformOrigin: `${B.hip[0] * u}px ${B.hip[1] * u}px`,
            }}
          >
            <Piece src="/character/body.webp" />
          </div>
        </div>

        <div
          data-part="front"
          className="absolute left-0 top-0 will-change-transform"
          style={{
            width: FRONT.w * u,
            height: FRONT.h * u,
            visibility: "hidden",
            zIndex: 1,
            transformOrigin: `${(FRONT.headX + FRONT.axis) * u}px 0`,
          }}
        >
          <SplitPiece src="/character/front.webp" name="front" neck={FRONT.neck} />
        </div>

        {/* Older drawings stack above newer ones, so each fades off the top of the next. */}
        {(
          [
            ["turnA", TURN_A, "/character/turn-a.webp", 3],
            ["turnB", TURN_B, "/character/turn-b.webp", 2],
          ] as const
        ).map(([part, T, src, z]) => (
          <div
            key={part}
            data-part={part}
            className="absolute left-0 top-0 will-change-transform"
            style={{ width: T.w * u, height: u, visibility: "hidden", zIndex: z, transformOrigin: `${(T.headX + T.axis) * u}px 0` }}
          >
            <Piece src={src} />
          </div>
        ))}
      </div>
      )}

      <div
        className="pointer-events-none absolute"
        style={{
          left: seatedLeft + LAPTOP.x * u,
          top: seatedTop + LAPTOP.y * u,
          width: LAPTOP.w * u,
          height: LAPTOP.h * u,
          zIndex: Z.laptop,
        }}
      >
        <div className="dark-only absolute inset-0">
          <Piece src="/character/laptop.webp" />
        </div>
        <div className="light-only absolute inset-0">
          <Piece src="/character/laptop-dark.webp" />
        </div>
      </div>

      {!hideFigure && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: seatedLeft,
            top: seatedTop,
            width: SEATED.w * u,
            height: SEATED.h * u,
            zIndex: Z.seated,
          }}
        >
          <SplitPiece src="/character/seated.webp" lightSrc="/character/seated-light.webp" name="seated" neck={SEATED.neck} />
        </div>
      )}

      {/* Laptop light on his face and hands once he is typing. */}
      <div
        data-part="glow"
        className="pointer-events-none absolute mix-blend-screen"
        style={{
          left: stopX - 0.25 * u,
          top: floorY - (DESK_H + 0.4) * u,
          width: 0.5 * u,
          height: 0.4 * u,
          zIndex: Z.glow,
          opacity: 0,
        }}
      >
        <div
          className="screen-glow h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--accent-rgb) / 0.16), rgb(var(--accent-2-rgb) / 0.06) 55%, transparent)",
          }}
        />
      </div>
    </div>
  );
}
