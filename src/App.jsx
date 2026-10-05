import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { asset } from "./assets.js";
import Intro from "./components/Intro.jsx";
import Cursor from "./components/Cursor.jsx";
import Magnetic from "./components/Magnetic.jsx";
import VideoPlayer from "./components/VideoPlayer.jsx";
import Menu from "./components/Menu.jsx";
import RollingText from "./components/RollingText.jsx";
import SoundtrackPicker from "./components/SoundtrackPicker.jsx";
import MascotArt from "./components/MascotArt.jsx";
import { useMotion } from "./motion/MotionContext.jsx";
import { createAudio } from "./motion/audio.js";
import { projects, tracks, facts } from "./data.js";

const Gallery = lazy(() => import("./components/Gallery.jsx"));

export default function App() {
  const { reduced } = useMotion();
  const [entered, setEntered] = useState(false),
    [mode, setMode] = useState("spiral"),
    [sound, setSound] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(0),
    [trackOpen, setTrackOpen] = useState(false),
    [menu, setMenu] = useState(false);
  const [playing, setPlaying] = useState(!reduced),
    [hovered, setHovered] = useState(-1),
    [selected, setSelected] = useState(null);
  const [fact, setFact] = useState(0),
    [holding, setHolding] = useState(false);
  const audio = useRef(null),
    gallery = useRef(null),
    header = useRef(null),
    footer = useRef(null),
    mascot = useRef(null),
    mascotArt = useRef(null);
  const holdTimer = useRef(null),
    didHold = useRef(false);
  useEffect(() => {
    audio.current = createAudio();
    return () => {
      audio.current.dispose();
      clearTimeout(holdTimer.current);
    };
  }, []);
  useEffect(() => setPlaying(!reduced), [reduced]);
  useEffect(() => {
    audio.current?.suspend(selected !== null);
  }, [selected]);
  useEffect(() => {
    const mobile = matchMedia("(max-width:600px)");
    const change = () => {
      if (mobile.matches) setMode("spiral");
    };
    mobile.addEventListener("change", change);
    return () => mobile.removeEventListener("change", change);
  }, []);
  useLayoutEffect(() => {
    if (!entered) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        header.current,
        { opacity: 0, y: reduced ? 0 : -32 },
        { opacity: 1, y: 0, duration: 0.65, delay: 0.38, ease: "power3.out" },
      );
      gsap.fromTo(
        footer.current,
        { opacity: 0, y: reduced ? 0 : 25 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.6, ease: "power3.out" },
      );
    });
    return () => context.revert();
  }, [entered, reduced]);
  function enter(withSound) {
    setSound(withSound);
    audio.current.setEnabled(withSound);
    audio.current.effect("click");
    setEntered(true);
  }
  function chooseTrack(i) {
    setSelectedTrack(i);
    audio.current?.select(i);
  }
  function toggleSound() {
    const value = !sound;
    setSound(value);
    audio.current.setEnabled(value);
  }
  const hover = useCallback((i) => {
    setHovered(i);
    if (i >= 0) audio.current?.effect();
  }, []);
  const open = useCallback((i) => {
    setSelected(i);
    setTrackOpen(false);
    audio.current?.effect("click");
  }, []);
  function startHold(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    didHold.current = false;
    setHolding(true);
    holdTimer.current = setTimeout(() => {
      didHold.current = true;
      setHolding(false);
      gallery.current?.impulse();
      mascotArt.current?.play();
      audio.current?.effect("click");
    }, 750);
  }
  function releaseHold() {
    clearTimeout(holdTimer.current);
    setHolding(false);
  }
  function reactMascot() {
    if (didHold.current) {
      didHold.current = false;
      return;
    }
    mascotArt.current?.play();
    audio.current?.effect("click");
    if (!reduced)
      gsap.fromTo(
        mascot.current,
        { scaleX: 1.12, scaleY: 0.83, rotation: -7 },
        {
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          duration: 0.7,
          ease: "elastic.out(1,.4)",
        },
      );
  }
  return (
    <>
      <div
        className={`experience ${entered ? "entered" : ""}`}
        style={{
          "--gallery-texture": `url("${asset("assets/graphite-texture.webp")}")`,
        }}
        inert={!entered || undefined}
        aria-hidden={!entered || undefined}
      >
        <div className="background-texture" />
        <div className="gallery-grid" />
        <div className="edge-shade" />
        <main id="works">
          <h1 className="sr-only">
            Hardik Visuals — Creative director and visual storyteller. Selected
            work.
          </h1>
          <Suspense fallback={null}>
            <Gallery
              ref={gallery}
              entered={entered}
              paused={menu || selected !== null}
              recessed={menu}
              playing={playing}
              mode={mode}
              reduced={reduced}
              onHover={hover}
              onSelect={open}
            />
          </Suspense>
        </main>
        <header className="site-header" ref={header}>
          <div className="brand">
            <button
              className={`mascot-button ${holding ? "holding" : ""}`}
              aria-label="Play a mascot expression. Hold to send the spiral spinning."
              onPointerDown={startHold}
              onPointerUp={releaseHold}
              onPointerCancel={releaseHold}
              onPointerLeave={releaseHold}
              onClick={reactMascot}
            >
              <span className="mascot-images" ref={mascot}>
                <MascotArt ref={mascotArt} />
              </span>
              <span className="mascot-tooltip">click me. hold me.</span>
              <svg className="hold-ring" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" />
              </svg>
            </button>
            <span className="wordmark">
              hardik
              <br />
              visuals<span className="brand-dot">®</span>
            </span>
          </div>
          <div className="view-switch" role="group" aria-label="Gallery view">
            <button
              className={mode === "spiral" ? "active" : ""}
              aria-pressed={mode === "spiral"}
              onClick={() => {
                setMode("spiral");
                audio.current.effect("click");
              }}
            >
              <RollingText>spiral</RollingText>
            </button>
            <i />
            <button
              className={mode === "list" ? "active" : ""}
              aria-pressed={mode === "list"}
              onClick={() => {
                setMode("list");
                audio.current.effect("click");
              }}
            >
              <RollingText>list</RollingText>
            </button>
          </div>
          <Magnetic
            className="pill menu-button"
            onClick={() => {
              setMenu(true);
              setTrackOpen(false);
              audio.current.effect("click");
            }}
          >
            <RollingText>menu</RollingText> <span className="button-dot" />
          </Magnetic>
        </header>
        <div className="gallery-caption" aria-live="polite">
          {hovered >= 0 && (
            <>
              <span className="caption-number">
                {String(hovered + 1).padStart(2, "0")} / 09
              </span>
              <strong>{projects[hovered].title}</strong>
              <span>{projects[hovered].category}</span>
              <span className="caption-play">↗︎</span>
            </>
          )}
        </div>
        <footer className="site-footer" ref={footer}>
          <button
            className="identity"
            onClick={() => {
              setFact((fact + 1) % facts.length);
              reactMascot();
            }}
          >
            <span className="identity-icon">
              <span className="identity-portrait">
                <img src={asset("assets/portrait.jpg")} alt="Hardik" width="94" height="94" />
              </span>
              <i>↗︎</i>
            </span>
            <span className="identity-copy">
              <span className="eyebrow">A LITTLE ABOUT ME</span>
              <span key={fact} className="fact-text">
                {facts[fact]}
              </span>
            </span>
          </button>
          <div className="gallery-controls">
            <div className="gallery-transport">
              <button
                onClick={() => gallery.current?.nudge(-1)}
                aria-label="Previous work"
              >
                ↑
              </button>
              <button
                onClick={() => setPlaying(!playing)}
                aria-label={
                  playing ? "Pause gallery motion" : "Resume gallery motion"
                }
                aria-pressed={!playing}
              >
                {playing ? <span className="pause-icon" /> : "▷"}
              </button>
              <button
                onClick={() => gallery.current?.nudge(1)}
                aria-label="Next work"
              >
                ↓
              </button>
            </div>
            <span>
              {mode === "spiral"
                ? "SCROLL OR DRAG TO EXPLORE"
                : "SELECT A FILM TO WATCH"}
            </span>
          </div>
          <div className="sound-controls">
            <button
              className="track-button"
              onClick={() => setTrackOpen(!trackOpen)}
              aria-expanded={trackOpen}
            >
              <span className={`equalizer ${sound ? "is-playing" : ""}`}>
                <i />
                <i />
                <i />
                <i />
              </span>
              <span>{tracks[selectedTrack].title}</span>
            </button>
            <Magnetic
              className="round-button sound-button"
              onClick={toggleSound}
              aria-label={sound ? "Mute sound" : "Turn sound on"}
              aria-pressed={sound}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
                {sound ? (
                  <path
                    d="M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                ) : (
                  <path
                    d="m16 9 5 6m0-6-5 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                )}
              </svg>
            </Magnetic>
          </div>
        </footer>
        {trackOpen && (
          <SoundtrackPicker
            selected={selectedTrack}
            onSelect={(i) => {
              chooseTrack(i);
              if (!sound) {
                setSound(true);
                audio.current.setEnabled(true);
              }
            }}
            onClose={() => setTrackOpen(false)}
          />
        )}
      </div>
      <Intro
        onEnter={enter}
        selectedTrack={selectedTrack}
        onTrack={chooseTrack}
        reduced={reduced}
      />
      {menu && (
        <Menu
          onClose={() => setMenu(false)}
          onWorks={() => {
            setMode("spiral");
            setMenu(false);
            gallery.current?.unfurl();
          }}
          reduced={reduced}
        />
      )}
      {selected !== null && (
        <VideoPlayer
          project={projects[selected]}
          muted={!sound}
          onClose={() => setSelected(null)}
          reduced={reduced}
        />
      )}
      <Cursor />
    </>
  );
}
