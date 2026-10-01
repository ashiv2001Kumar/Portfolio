/**
 * Timeline for the hero scene. It plays once, driven by time since load.
 *
 * 1. He stands side-on at the left of the stage.
 * 2. He walks to his chair, behind the desk. He is a cut-out rig (hoodie,
 *    thigh, shin and sneaker pieces) posed with two-bone IK; each moment only
 *    decides where the hip and ankles are, so planted feet stay planted.
 * 3. He turns to face the visitor through four drawings: profile, a three-quarter
 *    view, a slight angle and the front-standing sprite.
 * 4. He lowers onto the chair behind the desk and the seated typing sprite,
 *    facing the visitor over his laptop, takes over; then he settles and idles.
 *
 * All lengths are in standing heights (1 = his full height) unless noted.
 */

type Range = readonly [number, number];

/** Rig geometry, measured from the pieces in /public/character. */
export const RIG = {
  body: { w: 0.1936, h: 0.4929, hip: [0.1119, 0.5142] },
  thigh: { w: 0.1039, h: 0.286, hip: [0.0471, 0.0364], knee: [0.0453, 0.2407] },
  shin: { w: 0.0737, h: 0.2593, knee: [0.0329, 0.0444], ankle: [0.0275, 0.2709] },
  foot: { w: 0.1448, h: 0.103, ankle: [0.0266, 0.0373] },
} as const;

/**
 * Front-standing sprite: hair to soles is one standing height; headX is the
 * head centre from its left edge, neck the line just under the chin as a
 * fraction of the sprite's height.
 */
export const FRONT = { w: 0.3102, h: 1, headX: 0.1506, neck: 0.1657, axis: 0.0044 } as const;

/**
 * In-between turn drawings (about 40° and 15° from facing the visitor), same scale as FRONT.
 * `axis` is each drawing's body centre line (chest and waist) relative to its head centre.
 */
export const TURN_A = { w: 0.2937, headX: 0.1464, axis: -0.0122 } as const;
export const TURN_B = { w: 0.2944, headX: 0.1495, axis: 0.0058 } as const;
/** The side-view rig's body centre line relative to its hip joint. */
const PROFILE_AXIS = -0.0139;

/**
 * Seated sprite: facing the visitor, typing on a laptop in front of him, cut
 * flat along the desk top. Scaled so his face matches the front sprite's, and
 * placed so his chin is where the front sprite's chin ends up once lowered;
 * the cut line becomes the desk surface.
 */
export const SEATED = { w: 0.3178, h: 0.3696, deskLine: 0.3459, headX: 0.1593, neck: 0.4289 } as const;
/** The laptop inside the seated sprite, also drawn on its own so it is on the desk before he sits. */
export const LAPTOP = { x: 0.0548, y: 0.2511, w: 0.203, h: 0.1185 } as const;

/** Hair top when seated (his chin is then about 0.64 of his standing height above the floor). */
export const SEATED_TOP = 0.794;
/** Desk surface height above the floor. */
export const DESK_H = SEATED_TOP - SEATED.deskLine;
/** How far the front sprite lowers as he sits. */
const SIT_DROP = 1 - SEATED_TOP;

const THIGH = 0.2043;
const SHIN = 0.2265;
const ANKLE_H = 0.056;
/** A standing leg is almost, but not quite, locked straight. */
const REACH = (THIGH + SHIN) * 0.998;
/** Foot contact points relative to the ankle. */
const BALL_X = 0.083;
const HEEL_X = -0.02;
/** Hips are a little apart, so the far leg hangs slightly behind the near one. */
export const FAR_HIP_OFFSET = { x: -0.014, y: 0.004 };

const STAND_FEET = { near: 0.03, far: -0.03 };
/**
 * Turnaround timing as fractions of the turn: when each drawing takes over.
 * He dips into his knees by `dip` as he starts, then rises by `lift` through
 * the turn. The profile rotates a little in place (narrowing to `side`), each
 * change of drawing is a quick motion-blurred dissolve lasting `blend`, and
 * each new drawing lands a touch narrow and settles out over `settle`. The
 * cuts are spaced so the middle of the turn moves fastest.
 */
const TURN = {
  toA: 0.3,
  toB: 0.5,
  toFront: 0.68,
  side: 0.9,
  land: 0.95,
  settle: 0.16,
  blend: 0.07,
  blur: 0.003,
  dip: 0.004,
  lift: 0.007,
} as const;
const STAND_HIP = ANKLE_H + Math.sqrt(REACH * REACH - STAND_FEET.near ** 2);

/** Preferred distance between the feet at heel strike (≈ 0.55 m for a 1.75 m person). */
const STEP_LENGTH = 0.31;
/** Seconds per full step at cruising pace; the first and last are a little quicker. */
const STEP_TIME = 0.56;

export const T = {
  appear: [0.15, 0.55] as Range,
  walkStart: 0.8,
} as const;

export type SceneTimes = {
  walkEnd: number;
  /** Side to front turn, standing behind the chair. */
  turn: Range;
  /** Lowering onto the seat; the seated sprite fades in near the end. */
  sit: Range;
  settle: Range;
  total: number;
};

export type SceneLayout = {
  width: number;
  height: number;
  compact: boolean;
  /** Standing height in px; every unit above is multiplied by this. */
  u: number;
  /** The floor he stands on, in px from the stage top. */
  floorY: number;
  /** Hip x at the start, and where he stops (head centre over the seat), in px. */
  startX: number;
  stopX: number;
  walk: { distance: number; steps: Step[] };
  t: SceneTimes;
};

/** One footstep: the swing foot travels between plants while the other foot carries his weight. */
export type Step = {
  foot: "near" | "far";
  from: number;
  to: number;
  t0: number;
  t1: number;
  /** Where the hip is when this step's heel strikes. */
  hip: number;
};

/** Footsteps for a short walk that starts and ends feet together: a half step, full steps, then the trailing foot closes up. */
function planSteps(distance: number, start: number): Step[] {
  const gaps = Math.max(1, Math.round(distance / STEP_LENGTH));
  const plant = (i: number) => (Math.min(i, gaps) * distance) / gaps;
  const steps: Step[] = [];
  let t = start;
  for (let i = 1; i <= gaps + 1; i++) {
    const foot = i % 2 === 1 ? "near" : "far";
    const from = (i <= 2 ? 0 : plant(i - 2)) + STAND_FEET[foot];
    const to = plant(i) + STAND_FEET[foot];
    const last = i === gaps + 1;
    const duration = i === 1 ? STEP_TIME * 0.92 : last ? STEP_TIME * 0.85 : STEP_TIME;
    // At heel strike the hip is a little behind halfway between the feet.
    const hip = last ? distance : lerp(plant(i - 1), plant(i), 0.47);
    steps.push({ foot, from, to, t0: t, t1: t + duration, hip });
    t += duration;
  }
  return steps;
}

/** Desk extents around the stop point, in standing heights. */
export const DESK = { left: -0.5, right: 0.52 } as const;

/**
 * Stage layout. On desktop the intro panel sits on the left and the walk
 * starts just past it; on small screens the stage is its own block under the panel.
 */
export function computeLayout(width: number, height: number, panelRight: number): SceneLayout {
  const compact = width < 1024;
  let u: number;
  let floorY: number;
  let stopX: number;
  let startX: number;

  if (compact) {
    floorY = height * 0.9;
    u = Math.min(height * 0.8, width / 1.4, 440);
    stopX = width - (DESK.right + 0.06) * u;
    startX = Math.max(0.14 * u, stopX - 1.25 * u);
  } else {
    floorY = height * 0.885;
    u = Math.min(height * 0.6, width * 0.36, 620);
    stopX = Math.min(width * 0.78, width - (DESK.right + 0.08) * u);
    startX = Math.max(panelRight + 0.16 * u, 0.14 * u);
    startX = Math.min(startX, stopX - 0.75 * u);
  }

  const distance = Math.max(0.3, (stopX - startX) / u);
  const steps = planSteps(distance, T.walkStart);
  const walkEnd = steps[steps.length - 1].t1;
  const turn: Range = [walkEnd + 0.08, walkEnd + 0.8];
  const sit: Range = [turn[1] + 0.22, turn[1] + 1.1];
  const settle: Range = [sit[1], sit[1] + 0.45];

  return {
    width,
    height,
    compact,
    u,
    floorY,
    startX,
    stopX,
    walk: { distance, steps },
    t: { walkEnd, turn, sit, settle, total: settle[1] + 0.1 },
  };
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ramp = (p: number, [a, b]: Range) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);
const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Ankle position (y up) and foot pitch (deg, + is toes up). */
type LegTarget = { x: number; y: number; pitch: number };
/** CSS rotations for the leg chain; shin and foot are relative to their parent. */
export type LegAngles = { thigh: number; shin: number; foot: number };

export type Pose = {
  rig: {
    opacity: number;
    /** Hip x in px; hip height in standing heights. */
    hipX: number;
    hipY: number;
    /** Torso lean in degrees, + is forward. */
    lean: number;
    /** Fore-aft hip joint shift from pelvic rotation. */
    pelvis: number;
    near: LegAngles;
    far: LegAngles;
    /** Horizontal squash about the hip while he turns out of profile. */
    scaleX: number;
  };
  /**
   * Front-standing sprite: head centre x in px, how far it has lowered, and
   * the opacity of its head (above the neck line) and body (below it).
   */
  front: { x: number; drop: number; head: number; body: number; scaleX: number };
  /**
   * The two in-between turn drawings: body axis x in px, their opacities and
   * settle squashes, and the smear blur (standing heights) on every turn drawing.
   */
  turn: { axis: number; a: number; b: number; aScale: number; bScale: number; blur: number };
  /**
   * Seated sprite, split at the neck the same way. It never moves, so its
   * laptop stays put on the desk. Heads swap in a single frame so two faces
   * never show at once; only the bodies cross-fade.
   */
  seated: { head: number; body: number };
  /** Laptop screen glow on his face and hands. */
  screen: number;
};

/** Ankle position for a foot resting on the floor at contact x, rolled onto heel or ball. */
function grounded(x: number, pitch: number): LegTarget {
  const pivot = pitch >= 0 ? HEEL_X : BALL_X;
  const r = rad(pitch);
  const vx = pivot * Math.cos(r) + ANKLE_H * Math.sin(r);
  const vy = pivot * Math.sin(r) - ANKLE_H * Math.cos(r);
  return { x: x + pivot - vx, y: -vy, pitch };
}

function solve(hx: number, hy: number, target: LegTarget): LegAngles {
  const dx = target.x - hx;
  const dy = hy - target.y;
  const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(THIGH - SHIN) + 1e-4), (THIGH + SHIN) * 0.9995);
  const toAnkle = Math.atan2(dx, dy);
  const cosHip = (THIGH * THIGH + d * d - SHIN * SHIN) / (2 * THIGH * d);
  // Knees bend forward, toward the direction he faces.
  const thigh = toAnkle + Math.acos(Math.min(1, Math.max(-1, cosHip)));
  const kx = hx + THIGH * Math.sin(thigh);
  const ky = hy - THIGH * Math.cos(thigh);
  const shin = Math.atan2(target.x - kx, ky - target.y);
  return { thigh: -deg(thigh), shin: -deg(shin - thigh), foot: deg(shin) - target.pitch };
}

/** Share of each step spent on both feet before the trailing foot leaves the ground. */
const DOUBLE_SUPPORT = 0.2;
/** Foot pitch at push-off and heel strike (+ is toes up). */
const TOE_OFF = -26;
const HEEL_STRIKE = 15;
/** Heel lift on the stance foot by the time the other foot lands. */
const HEEL_OFF = -16;
/** Largest fore-aft hip shift from pelvic rotation; small enough that the hoodie hem still covers the hip joints. */
const PELVIS = 0.016;
/** How far the hip sits below full reach while walking, so the stance knee stays softly bent. */
const WALK_FLEX = 0.002;
/** Hip dip at each heel strike; the hip rides a smooth wave, lowest as the heel lands and highest over the planted foot. */
const WALK_BOB = 0.022;
/** Torso lean while walking, and how much it rocks with each step. */
const WALK_LEAN = { base: 1.2, rock: 0.5 } as const;

/**
 * Where one foot is at time t, x relative to the walk start. The foot rolls
 * off the ball, swings low, lands on the heel, rolls flat and stays planted
 * while the body passes over it.
 */
function walkFoot(steps: Step[], foot: Step["foot"], t: number): LegTarget {
  const own = steps.filter((s) => s.foot === foot);
  const current = own.find((s) => t >= s.t0 && t < s.t1);
  const closing = (s: Step) => s === steps[steps.length - 1];

  if (current) {
    const k = ramp(t, [current.t0, current.t1]);
    const first = current === steps[0];
    // From standing the foot is still under him, so it only peels off a little.
    const toeOff = first ? TOE_OFF * 0.35 : closing(current) ? TOE_OFF * 0.7 : TOE_OFF;
    if (k < DOUBLE_SUPPORT) {
      return grounded(current.from, lerp(first ? 0 : HEEL_OFF, toeOff, smooth(k / DOUBLE_SUPPORT)));
    }
    const s = (k - DOUBLE_SUPPORT) / (1 - DOUBLE_SUPPORT);
    const travel = current.to - current.from;
    const x = lerp(current.from, current.to, 0.5 - 0.5 * Math.cos(Math.PI * s));
    const strike = closing(current) ? 2 : HEEL_STRIKE;
    const pitch = s < 0.45 ? lerp(toeOff, -4, smooth(s / 0.45)) : lerp(-4, strike, smooth((s - 0.45) / 0.55));
    const lift = (0.012 + 0.025 * Math.min(1, travel / 0.6)) * Math.sin(Math.PI * Math.pow(s, 0.75));
    const base = grounded(x, pitch);
    return { ...base, y: base.y + lift };
  }

  const landed = [...own].reverse().find((s) => t >= s.t1);
  const next = own.find((s) => t < s.t0);
  const x = landed ? landed.to : STAND_FEET[foot];
  let pitch = landed ? lerp(closing(landed) ? 2 : HEEL_STRIKE, 0, smooth(ramp(t, [landed.t1, landed.t1 + 0.11]))) : 0;
  if (next) {
    const other = steps[steps.indexOf(next) - 1];
    if (other) pitch += HEEL_OFF * smooth(ramp(t, [lerp(other.t0, other.t1, 0.4), other.t1]));
  }
  return grounded(x, pitch);
}

/** Hip travel at time t: a smooth curve through the hip position at each heel strike. */
function walkHip(steps: Step[], start: number, t: number): number {
  const keys = [{ t: start, x: 0 }, ...steps.map((s) => ({ t: s.t1, x: s.hip }))];
  if (t <= start) return 0;
  const last = keys.length - 1;
  if (t >= keys[last].t) return keys[last].x;
  const j = keys.findIndex((_, i) => i < last && t < keys[i + 1].t);
  const slope = (i: number) =>
    i === 0 || i === last ? 0 : (keys[i + 1].x - keys[i - 1].x) / (keys[i + 1].t - keys[i - 1].t);
  const a = keys[j];
  const b = keys[j + 1];
  const h = b.t - a.t;
  const s = (t - a.t) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * a.x +
    (s3 - 2 * s2 + s) * h * slope(j) +
    (-2 * s3 + 3 * s2) * b.x +
    (s3 - s2) * h * slope(j + 1)
  );
}

/** Highest the hip can be while the leg still reaches its ankle target with the knee barely bent. */
function reachHeight(hx: number, target: LegTarget) {
  const dx = Math.min(Math.abs(target.x - hx), REACH * 0.95);
  return target.y + Math.sqrt(REACH * REACH - dx * dx);
}

/** Smooth minimum, so the hip never kinks when the limiting leg changes. */
function smin(a: number, b: number, k: number) {
  const h = clamp01(0.5 + (0.5 * (b - a)) / k);
  return lerp(b, a, h) - k * h * (1 - h);
}

export function poseAt(t: number, L: SceneLayout): Pose {
  const u = L.u;
  const startX = L.startX / u;
  const { steps } = L.walk;

  const shift = (target: LegTarget): LegTarget => ({ ...target, x: startX + target.x });
  const near = shift(walkFoot(steps, "near", t));
  const far = shift(walkFoot(steps, "far", t));
  // Turn: the body axis glides from where the profile stands to where the front view stands,
  // and every drawing is placed on it, so he turns in place instead of hopping sideways.
  const turnK = ramp(t, L.t.turn);
  const axis = L.stopX / u + lerp(PROFILE_AXIS, FRONT.axis, smooth(turnK));
  const hipX = startX + walkHip(steps, T.walkStart, t) + (axis - PROFILE_AXIS - L.stopX / u);
  // The pelvis turns a little with each step, bringing the leading hip forward.
  const pelvis = Math.max(-PELVIS, Math.min(PELVIS, (near.x - far.x) * 0.06));
  const still = Math.max(
    1 - smooth(ramp(t, [T.walkStart, T.walkStart + 0.15])),
    smooth(ramp(t, [L.t.walkEnd, L.t.walkEnd + 0.2])),
  );
  // Step phase: 0 and 1 at heel strikes. The walk starts and ends on both feet, so there is no
  // dip before the first strike or after the last one.
  const step = steps.find((s) => t >= s.t0 && t < s.t1);
  const k = step ? ramp(t, [step.t0, step.t1]) : 0;
  const first = step === steps[0];
  const last = step === steps[steps.length - 1];
  const dip = !step || (first && k < 0.5) || (last && k > 0.5) ? 0 : 0.5 + 0.5 * Math.cos(2 * Math.PI * k);
  const wave = STAND_HIP - WALK_FLEX - WALK_BOB * dip;
  // The legs still have to reach their feet; the soft minimum keeps that limit from kinking the curve.
  const reach = smin(reachHeight(hipX + pelvis, near), reachHeight(hipX + FAR_HIP_OFFSET.x - pelvis, far), 0.01);
  const hipY = lerp(smin(wave, reach, 0.012), STAND_HIP, still);
  const rock = step ? Math.sin(2 * Math.PI * k) : 0;

  // Turn: held drawings, like hand-drawn animation. Each cut is a single frame so two poses
  // never overlap; the profile starts the rotation by narrowing, and every new drawing lands
  // slightly narrow and settles out, which reads as the body still turning into it.
  const into = (cut: number) => smooth(ramp(turnK, [cut - TURN.blend / 2, cut + TURN.blend / 2]));
  const settleFrom = (cut: number) => lerp(TURN.land, 1, smooth(ramp(turnK, [cut, cut + TURN.settle])));
  const inA = into(TURN.toA);
  const inB = into(TURN.toB);
  const frontIn = into(TURN.toFront);
  // Each new drawing is fully there, underneath, as soon as the old one starts fading off it,
  // so he never turns see-through mid-dissolve.
  const under = (k: number) => (k > 0 ? 1 : 0);
  const sideScale = lerp(1, TURN.side, smooth(ramp(turnK, [0, TURN.toA])));
  const frontScale = turnK > 0 ? settleFrom(TURN.toFront) : 1;
  const rigOpacity = Math.min(smooth(ramp(t, T.appear)), 1 - inA);
  // Blur peaks mid-dissolve, like a smear frame, so the change of drawing reads as fast motion.
  const blur =
    TURN.blur *
    Math.max(...[TURN.toA, TURN.toB, TURN.toFront].map((cut) => clamp01(1 - Math.abs(turnK - cut) / (TURN.blend / 2))));
  const lift =
    TURN.lift * Math.sin(Math.PI * ramp(turnK, [0.15, 1])) - TURN.dip * Math.sin(Math.PI * ramp(turnK, [0, 0.3]));

  // Sit: lower behind the desk, dipping a touch as his weight lands and settling back to seated
  // height. The heads swap the moment he is there; the bodies cross-fade around it.
  const sitK = ramp(t, L.t.sit);
  const drop = SIT_DROP * easeInOut(ramp(sitK, [0.05, 0.85])) + 0.006 * Math.sin(Math.PI * ramp(sitK, [0.62, 0.85]));
  const seated = sitK >= 0.85 ? 1 : 0;
  const seatedBody = smooth(ramp(sitK, [0.72, 0.92]));
  const frontOut = smooth(ramp(sitK, [0.92, 1]));

  return {
    rig: {
      opacity: rigOpacity,
      hipX: hipX * u,
      hipY: hipY + lift,
      lean: (WALK_LEAN.base + WALK_LEAN.rock * rock) * (1 - still),
      pelvis,
      near: solve(hipX + pelvis, hipY + lift, near),
      far: solve(hipX + FAR_HIP_OFFSET.x - pelvis, hipY + lift, far),
      scaleX: sideScale,
    },
    front: { x: (axis - FRONT.axis) * u, drop: drop - lift, head: under(frontIn) * (1 - seated), body: under(frontIn) * (1 - frontOut), scaleX: frontScale },
    turn: {
      axis: axis * u,
      a: under(inA) * (1 - inB),
      b: under(inB) * (1 - frontIn),
      aScale: settleFrom(TURN.toA),
      bScale: settleFrom(TURN.toB),
      blur,
    },
    seated: { head: seated, body: seatedBody },
    screen: smooth(ramp(t, [L.t.sit[1] - 0.1, L.t.settle[1] + 0.3])),
  };
}

/** The final, seated pose; used for reduced motion and once the intro has played. */
export function finalPose(L: SceneLayout): Pose {
  return poseAt(L.t.total + 1, L);
}
