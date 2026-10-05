import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { asset } from "../assets.js";
import Magnetic from "./Magnetic.jsx";
import RollingText from "./RollingText.jsx";
import SoundtrackPicker from "./SoundtrackPicker.jsx";
import { useMotion } from "../motion/MotionContext.jsx";
import { tracks } from "../data.js";

export default function Intro({ onEnter, selectedTrack, onTrack, reduced }) {
  const root = useRef(null),
    film = useRef(null),
    live = useRef(null),
    face = useRef(null),
    glow = useRef(null),
    fallbackTimer = useRef(null),
    exitTimeline = useRef(null);
  const { setMotion } = useMotion();
  const [ready, setReady] = useState(false),
    [imageIntro, setImageIntro] = useState(() =>
      matchMedia("(max-width: 900px), (pointer: coarse)").matches,
    ),
    [leaving, setLeaving] = useState(false),
    [picker, setPicker] = useState(false);
  useEffect(() => {
    if (!imageIntro) film.current.play().catch(() => setImageIntro(true));
    return () => {
      clearTimeout(fallbackTimer.current);
      exitTimeline.current?.kill();
    };
  }, [imageIntro]);
  useLayoutEffect(() => {
    if (!ready) return;
    // The live layers use the exact final film frame, at identical coordinates.
    // Swap without a crossfade (which dims/ghosts letters), then move as one.
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .set(live.current, { opacity: 1, y: 0 }, 0)
        .set(film.current, { opacity: 0 }, 0)
        .to(
          live.current,
          {
            y: reduced ? 0 : -26,
            duration: reduced ? 0.15 : 1.1,
            ease: "power3.inOut",
          },
          0.16,
        )
        .fromTo(
          ".entry-button-wrap",
          { opacity: 0, y: reduced ? 0 : 32, scale: reduced ? 1 : 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: reduced ? 0.15 : 0.7,
            ease: "power4.out",
          },
          0.72,
        )
        .fromTo(
          ".mood-trigger",
          { opacity: 0, y: reduced ? 0 : 16 },
          { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
          0.94,
        )
        .fromTo(
          ".silent-entry",
          { opacity: 0, y: reduced ? 0 : 9 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
          1.12,
        );
    }, root);
    return () => ctx.revert();
  }, [ready, reduced]);
  function response(active) {
    if (leaving || !face.current) return;
    gsap.to(glow.current, {
      opacity: active ? 0.65 : 0,
      scale: active ? 1.25 : 0.6,
      duration: reduced ? 0.15 : 0.6,
      ease: "power3.out",
      overwrite: true,
    });
    if (!reduced)
      gsap.to(face.current, {
        y: active ? -8 : 0,
        rotation: active ? 7 : 0,
        scale: active ? 1.08 : 1,
        duration: 0.65,
        ease: "elastic.out(1,.7)",
        overwrite: true,
      });
  }
  function enter(sound) {
    if (!ready || leaving) return;
    setLeaving(true);
    onEnter(sound);
    gsap.killTweensOf(face.current);
    gsap.killTweensOf(glow.current);
    const destination = document
      .querySelector(".mascot-button")
      ?.getBoundingClientRect();
    const source = face.current.getBoundingClientRect();
    const tl = gsap.timeline();
    exitTimeline.current = tl;
    tl.to(
      root.current.querySelectorAll(
        ".intro-copy,.entry-controls,.intro-top,.intro-bottom",
      ),
      {
        opacity: 0,
        y: reduced ? 0 : -22,
        duration: 0.32,
        stagger: 0.035,
        ease: "power3.in",
      },
      0,
    );
    if (!reduced && destination)
      tl.to(
        face.current,
        {
          x:
            destination.left +
            destination.width / 2 -
            source.left -
            source.width / 2,
          y:
            destination.top +
            destination.height / 2 -
            source.top -
            source.height / 2,
          scale: destination.width / source.width,
          rotation: -12,
          duration: 0.9,
          ease: "power3.inOut",
        },
        0.05,
      );
    tl.to(
      root.current,
      {
        opacity: 0,
        duration: reduced ? 0.2 : 0.65,
        ease: "power3.inOut",
        onComplete: () => {
          if (root.current) root.current.style.visibility = "hidden";
        },
      },
      reduced ? 0.12 : 0.35,
    );
  }
  return (
    <section
      className={`intro ${ready ? "intro-ready" : ""}`}
      ref={root}
      aria-label="Introduction"
      aria-hidden={leaving || undefined}
      inert={leaving || undefined}
    >
      <div className="intro-top">
        <span>HARDIK VISUALS®</span>
        <span>A LITTLE FEELING. A LASTING IMPRESSION.</span>
      </div>
      <div className="intro-composition">
        <video
          ref={film}
          className="intro-film"
          src={imageIntro ? undefined : asset("assets/intro.mp4")}
          style={{ visibility: imageIntro ? "hidden" : "visible" }}
          muted
          playsInline
          autoPlay
          preload="auto"
          onEnded={() => {
            setReady(true);
          }}
          onError={() => setImageIntro(true)}
          aria-label="Hardik Visuals introduction film"
        />
        {imageIntro && !ready && (
          <img
            className="intro-fallback"
            src={asset("assets/intro-motion-v2.webp")}
            alt="Hardik Visuals introduction"
            onLoad={() => {
              clearTimeout(fallbackTimer.current);
              // Same 6.6-second film as an image animation: no iOS video play overlay.
              fallbackTimer.current = setTimeout(() => setReady(true), reduced ? 0 : 6600);
            }}
            onError={() => setReady(true)}
          />
        )}
        <div
          className="intro-live"
          ref={live}
          inert={!ready || undefined}
          aria-hidden={!ready || undefined}
        >
          <div className="intro-face-glow" ref={glow} />
          <img
            className="intro-face"
            ref={face}
            src={asset("assets/intro-face-frame.webp")}
            alt=""
          />
          <div className="intro-copy">
            <img
              className="intro-title-frame"
              src={asset("assets/intro-handoff.webp")}
              alt=""
            />
            <h2 className="sr-only">creative director & visual storyteller</h2>
            <p className="sr-only">your fav. artist</p>
          </div>
          <div className="entry-controls">
            <div className="entry-button-wrap">
              <Magnetic
                className="pill enter-button"
                disabled={leaving}
                onPointerEnter={() => response(true)}
                onPointerLeave={() => response(false)}
                onClick={() => enter(true)}
              >
                <RollingText>enter with sound</RollingText>
                <span className="entry-button-orb">
                  <span className="button-dot" />
                  <span className="entry-arrow">↗︎</span>
                </span>
              </Magnetic>
            </div>
            <button
              className="mood-trigger"
              onClick={() => setPicker(true)}
              aria-haspopup="dialog"
            >
              <span className="mood-mini-disc" />
              <span>
                <small>set the mood</small>
                <RollingText>{tracks[selectedTrack].title}</RollingText>
              </span>
              <span className="mood-chevron">⌄</span>
            </button>
          </div>
        </div>
      </div>
      <div className="intro-bottom">
        <button
          className="motion-choice"
          onClick={() => setMotion(!reduced)}
          aria-pressed={!reduced}
        >
          {reduced ? "reduced motion" : "full motion"}
          <span>↗︎</span>
        </button>
        {ready ? (
          <button
            className="quiet-button silent-entry"
            disabled={leaving}
            onClick={() => enter(false)}
          >
            <RollingText>enter without sound</RollingText>
            <span>↗︎</span>
          </button>
        ) : (
          <span className="film-progress" aria-label="Introduction playing">
            <i />
          </span>
        )}
        <span>BASED IN INDIA. CREATING EVERYWHERE.</span>
      </div>
      {picker && (
        <SoundtrackPicker
          selected={selectedTrack}
          onSelect={onTrack}
          onClose={() => setPicker(false)}
        />
      )}
    </section>
  );
}
