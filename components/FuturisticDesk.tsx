import { DESK, DESK_H, type SceneLayout } from "@/lib/hero-timeline";
import { Z } from "./AnimeCharacter";

/** Thickness of the visible desk surface, from its back edge to the front lip. */
const TOP_DEPTH = 0.024;
/** Height of the slab's front edge. */
const LIP = 0.022;

const bars = [38, 62, 46, 80, 58, 92, 70, 54];

/** The workstation around the character: floor, chair, desk and holographic display, all positioned from the scene layout. */
export default function FuturisticDesk({ layout }: { layout: SceneLayout }) {
  const { u, floorY, stopX, height } = layout;
  const deskLeft = stopX + DESK.left * u;
  const deskWidth = (DESK.right - DESK.left) * u;
  const deskTop = floorY - DESK_H * u;
  const holoLeft = stopX + 0.2 * u;
  const holoWidth = 0.27 * u;
  const holoHeight = 0.25 * u;
  const font = Math.max(7, 0.016 * u);

  return (
    <>
      {/* Floor deck with a perspective grid and a soft pool of light under the desk. */}
      <div
        className="pointer-events-none absolute inset-x-0"
        style={{ top: floorY - 0.05 * u, height: height - floorY + 0.05 * u, zIndex: Z.floor }}
      >
        <div
          className="absolute inset-x-0 top-0 h-3/5 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--floor-grid-x) 1px, transparent 1px), linear-gradient(var(--floor-grid-y) 1px, transparent 1px)",
            backgroundSize: `${0.12 * u}px ${0.035 * u}px`,
          }}
        />
        <div className="absolute inset-x-0 top-[0.05px] h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
        <div
          className="absolute rounded-[50%]"
          style={{
            left: deskLeft - 0.1 * u,
            width: deskWidth + 0.2 * u,
            top: 0.02 * u,
            height: 0.12 * u,
            background: "radial-gradient(closest-side, var(--scene-pool), transparent)",
          }}
        />
      </div>

      {/* Ambient light behind the workstation. */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: stopX - 0.8 * u,
          top: floorY - 1.15 * u,
          width: 1.6 * u,
          height: 1.15 * u,
          zIndex: Z.floor,
          background: "var(--scene-ambient)",
        }}
      />

      {/* Chair back, seen over the desk behind him. */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: stopX - 0.21 * u,
          top: floorY - 0.76 * u,
          width: 0.42 * u,
          height: (0.76 - DESK_H + 0.01) * u,
          zIndex: Z.chair,
        }}
      >
        <div
          className="absolute inset-0 border border-ice/10"
          style={{
            borderRadius: `${0.09 * u}px ${0.09 * u}px ${0.02 * u}px ${0.02 * u}px`,
            background: "linear-gradient(180deg, var(--chair-1), var(--chair-2))",
            boxShadow: "inset 0 1px 0 rgb(var(--shine-rgb) / 0.12), 0 0 30px -10px rgb(var(--accent-rgb) / 0.35)",
          }}
        />
        <div
          className="absolute bg-cyan/70"
          style={{ left: 0.035 * u, top: 0.06 * u, bottom: 0.02 * u, width: Math.max(1.5, 0.006 * u), boxShadow: "0 0 8px rgb(var(--accent-rgb) / 0.8)", borderRadius: 4 }}
        />
        <div
          className="absolute bg-cyan/70"
          style={{ right: 0.035 * u, top: 0.06 * u, bottom: 0.02 * u, width: Math.max(1.5, 0.006 * u), boxShadow: "0 0 8px rgb(var(--accent-rgb) / 0.8)", borderRadius: 4 }}
        />
        <div
          className="absolute border border-ice/10 bg-[var(--chair-pad)]"
          style={{ left: 0.08 * u, right: 0.08 * u, top: 0.025 * u, height: 0.07 * u, borderRadius: 0.03 * u }}
        />
      </div>

      {/* Desk surface: its back edge is the line the seated sprite is cut along. */}
      <div
        className="desk-top pointer-events-none absolute"
        style={{
          left: deskLeft,
          top: deskTop,
          width: deskWidth,
          height: TOP_DEPTH * u + 1,
          zIndex: Z.deskTop,
          borderRadius: `${0.012 * u}px ${0.012 * u}px 0 0`,
        }}
      />

      {/* Front lip of the desk slab, with a cyan light strip underneath. */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: deskLeft - 0.01 * u,
          top: deskTop + TOP_DEPTH * u,
          width: deskWidth + 0.02 * u,
          height: LIP * u,
          zIndex: Z.deskFront,
          borderRadius: 0.008 * u,
          background: "linear-gradient(180deg, var(--desk-lip-1), var(--desk-lip-2))",
          boxShadow: "inset 0 1px 0 rgb(var(--shine-rgb) / 0.4), 0 6px 18px -4px rgb(var(--accent-rgb) / 0.45)",
        }}
      >
        <div className="absolute inset-x-[6%] bottom-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
      </div>

      {/* Front panel, down to the floor; it hides his legs while he is behind the desk. */}
      <div
        className="desk-front pointer-events-none absolute overflow-hidden"
        style={{
          left: deskLeft + 0.035 * u,
          top: deskTop + (TOP_DEPTH + LIP) * u,
          width: deskWidth - 0.07 * u,
          height: (DESK_H - TOP_DEPTH - LIP + 0.035) * u,
          zIndex: Z.deskFront,
          borderRadius: `0 0 ${0.012 * u}px ${0.012 * u}px`,
          boxShadow: "0 24px 50px -20px rgb(0 0 0 / 0.8)",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgb(var(--shine-rgb)/0.05)_42%,transparent_54%)]" />
        <div
          className="absolute bg-cyan/50"
          style={{ left: 0.03 * u, top: 0.03 * u, bottom: 0.04 * u, width: Math.max(1, 0.003 * u), boxShadow: "0 0 8px rgb(var(--accent-rgb) / 0.7)" }}
        />
        <div
          className="absolute bg-cyan/50"
          style={{ right: 0.03 * u, top: 0.03 * u, bottom: 0.04 * u, width: Math.max(1, 0.003 * u), boxShadow: "0 0 8px rgb(var(--accent-rgb) / 0.7)" }}
        />
        <div className="absolute flex items-center gap-[0.6em] font-mono text-ice/50" style={{ left: 0.07 * u, top: 0.05 * u, fontSize: font }}>
          <span className="status-dot !h-[0.6em] !w-[0.6em]" />
          <span className="tracking-[0.25em]">WS-01 · ONLINE</span>
        </div>
        <div className="absolute font-mono tracking-[0.2em] text-ice/35" style={{ right: 0.07 * u, top: 0.05 * u, fontSize: font }}>
          X 128.40 · Y 044.20
        </div>
        <div
          className="absolute flex items-end gap-[3px] opacity-70"
          style={{ left: 0.07 * u, bottom: 0.07 * u, height: 0.05 * u }}
        >
          {bars.map((h, i) => (
            <span key={i} className="w-[3px] rounded-sm bg-cyan/50" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div
          className="absolute rounded-full bg-gradient-to-r from-transparent via-sky/40 to-transparent"
          style={{ left: "20%", right: "20%", bottom: 0.05 * u, height: 1 }}
        />
      </div>

      {/* Holographic display on the desk. */}
      <div
        className="pointer-events-none absolute"
        style={{ left: holoLeft, top: deskTop - holoHeight - 0.03 * u, width: holoWidth, height: holoHeight + 0.03 * u, zIndex: Z.holo }}
      >
        <div
          className="absolute rounded-[50%]"
          style={{
            left: holoWidth * 0.2,
            right: holoWidth * 0.2,
            bottom: -0.008 * u,
            height: 0.03 * u,
            background: "radial-gradient(closest-side, rgb(var(--shine-rgb) / 0.9), rgb(var(--accent-rgb) / 0.4) 50%, transparent)",
          }}
        />
        <div
          className="absolute"
          style={{
            left: holoWidth * 0.12,
            right: holoWidth * 0.12,
            bottom: 0.01 * u,
            height: 0.06 * u,
            background: "linear-gradient(0deg, rgb(var(--accent-rgb) / 0.28), transparent)",
            clipPath: "polygon(30% 100%, 70% 100%, 100% 0, 0 0)",
          }}
        />
        <div
          className="holo-float absolute inset-x-0 top-0 overflow-hidden border border-cyan/40 bg-cyan/[0.07]"
          style={{
            height: holoHeight * 0.82,
            borderRadius: 0.012 * u,
            boxShadow: "0 0 24px -6px rgb(var(--accent-rgb) / 0.55), inset 0 0 18px rgb(var(--accent-rgb) / 0.12)",
          }}
        >
          <div className="scanline" />
          <div className="flex items-center justify-between border-b border-cyan/25 px-[6%] font-mono text-ice/70" style={{ height: "18%", fontSize: font }}>
            <span className="tracking-[0.2em]">BUILD</span>
            <span className="text-cyan">● LIVE</span>
          </div>
          <div className="flex h-[48%] items-end gap-[4%] px-[6%] pt-[6%]">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan/30 to-ice/80" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="space-y-[5%] px-[6%] pt-[6%]">
            <div className="h-[3px] w-[80%] rounded bg-ice/40" />
            <div className="h-[3px] w-[55%] rounded bg-sky/50" />
            <div className="h-[3px] w-[68%] rounded bg-ice/25" />
          </div>
        </div>
      </div>

      {/* Floating data chips around the workstation. */}
      <div
        className="glass-soft holo-float pointer-events-none absolute rounded-lg px-[0.9em] py-[0.6em] font-mono text-ice/80"
        style={{ left: stopX + 0.26 * u, top: floorY - 0.98 * u, fontSize: font * 1.05, zIndex: Z.holo, animationDelay: "-2s" }}
      >
        <div className="tracking-[0.2em] text-ice/45">DEPLOY</div>
        <div className="mt-[0.3em] flex items-center gap-[0.5em]">
          <span className="status-dot !h-[0.6em] !w-[0.6em]" /> PASSING
        </div>
      </div>
      {!layout.compact && (
        <div
          className="glass-soft holo-float pointer-events-none absolute rounded-lg px-[0.9em] py-[0.6em] font-mono text-ice/80"
          style={{ left: stopX - 0.5 * u, top: floorY - 1.14 * u, fontSize: font * 1.05, zIndex: Z.holo, animationDelay: "-4s" }}
        >
          <div className="tracking-[0.2em] text-ice/45">LATENCY</div>
          <div className="mt-[0.3em] text-cyan">24 ms</div>
        </div>
      )}
    </>
  );
}
