import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createSpiral } from "../motion/createSpiral.js";
import { projects } from "../data.js";
import WorkIndex from "./WorkIndex.jsx";

const Gallery = forwardRef(function Gallery(
  { entered, paused, recessed, playing, mode, reduced, onHover, onSelect },
  ref,
) {
  const host = useRef(null),
    scene = useRef(null),
    callbacks = useRef({ onHover, onSelect });
  callbacks.current = { onHover, onSelect };
  const [fallback, setFallback] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    scene.current = createSpiral(host.current, projects, {
      reduced,
      onHover: (i) => callbacks.current.onHover(i),
      onSelect: (i) => callbacks.current.onSelect(i),
      onReady: () => setReady(true),
      onUnavailable: () => {
        setFallback(true);
        setReady(true);
      },
    });
    return () => scene.current?.dispose();
  }, [reduced]);
  useEffect(() => {
    if (entered) scene.current?.enter();
  }, [entered, reduced]);
  useEffect(
    () => scene.current?.setPaused(paused || !entered || mode === "list"),
    [paused, entered, mode, reduced],
  );
  useEffect(() => scene.current?.setPlaying(playing), [playing, reduced]);
  useEffect(() => scene.current?.setRecessed(recessed), [recessed, reduced]);
  useEffect(() => {
    if (entered && mode === "spiral") scene.current?.unfurl();
  }, [mode]);
  useImperativeHandle(ref, () => ({
    impulse: () => scene.current?.impulse(),
    unfurl: () => scene.current?.unfurl(),
    nudge: (d) => scene.current?.nudge(d),
    focus: (i) => scene.current?.focus(i),
  }));
  return (
    <div
      className={`gallery ${mode === "list" ? "is-list" : ""}`}
      aria-label="Selected work gallery"
    >
      <div
        className={`spiral-stage ${fallback ? "fallback-stage" : ""}`}
        ref={host}
        data-ready={ready}
        aria-label="Interactive 3D portfolio spiral"
      />
      {fallback && mode !== "list" && (
        <div className="fallback-spiral">
          {projects.map((p, i) => (
            <button
              key={p.id}
              style={{ "--i": i }}
              onClick={() => onSelect(i)}
              aria-label={`Play ${p.title}`}
            >
              <img src={p.poster} alt={p.title} />
            </button>
          ))}
        </div>
      )}
      <WorkIndex
        active={mode === "list"}
        paused={paused}
        reduced={reduced}
        onHover={onHover}
        onSelect={onSelect}
      />
      <div
        className="sr-only gallery-keyboard"
        aria-label="Keyboard project selection"
      >
        {projects.map((p, i) => (
          <button
            key={p.id}
            onFocus={() => {
              scene.current?.focus(i);
              onHover(i);
            }}
            onBlur={() => onHover(-1)}
            onClick={() => onSelect(i)}
          >
            Play {p.title}
          </button>
        ))}
      </div>
    </div>
  );
});
export default Gallery;
