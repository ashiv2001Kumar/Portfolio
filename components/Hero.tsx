import HeroStage from "./HeroStage";
import HolographicPanel from "./HolographicPanel";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden lg:block lg:h-[100svh] lg:min-h-[660px]"
    >
      <HeroStage panel={<HolographicPanel />} />

      <a
        href="#about"
        className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
        aria-label="Scroll to About"
      >
        <span className="hud-label !text-[0.6rem]">scroll</span>
        <span className="relative h-9 w-px overflow-hidden bg-ice/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scan_2.2s_linear_infinite] bg-gradient-to-b from-transparent to-cyan" />
        </span>
      </a>
    </section>
  );
}
