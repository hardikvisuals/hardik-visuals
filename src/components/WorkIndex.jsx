import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { projects } from "../data.js";
import RollingText from "./RollingText.jsx";

export default function WorkIndex({
  active,
  reduced,
  paused,
  onHover,
  onSelect,
}) {
  const root = useRef(null),
    preview = useRef(null),
    video = useRef(null);
  const [focus, setFocus] = useState(-1);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (active) {
        gsap.set(root.current, { visibility: "visible" });
        gsap.to(root.current, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.fromTo(
          ".work-line button",
          {
            opacity: 0,
            yPercent: reduced ? 0 : 110,
            rotateX: reduced ? 0 : -25,
          },
          {
            opacity: 1,
            yPercent: 0,
            rotateX: 0,
            duration: reduced ? 0.15 : 0.7,
            stagger: reduced ? 0 : 0.055,
            delay: 0.1,
            ease: "power4.out",
          },
        );
      } else
        gsap.to(root.current, {
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => gsap.set(root.current, { visibility: "hidden" }),
        });
    }, root);
    return () => ctx.revert();
  }, [active, reduced]);
  useEffect(() => {
    if (video.current) {
      if (active && !paused && !reduced) video.current.play().catch(() => {});
      else video.current.pause();
    }
    gsap.to(preview.current, {
      opacity: focus >= 0 && active ? 0.55 : 0,
      scale: focus >= 0 ? 1 : 0.92,
      duration: reduced ? 0.15 : 0.45,
      ease: "power3.out",
      overwrite: true,
    });
  }, [focus, active, reduced, paused]);
  function select(i) {
    setFocus(i);
    onHover(i);
  }
  function move(e) {
    if (reduced) return;
    const rect = root.current.getBoundingClientRect();
    gsap.to(preview.current, {
      x: (e.clientX - rect.left - rect.width / 2) * 0.28,
      y: (e.clientY - rect.top - rect.height / 2) * 0.24,
      rotateY: (e.clientX - rect.left - rect.width / 2) * 0.018,
      duration: 0.7,
      ease: "power3.out",
      overwrite: "auto",
    });
  }
  return (
    <div
      className="work-index"
      ref={root}
      aria-label="Work list"
      aria-hidden={!active || undefined}
      inert={!active || undefined}
      onPointerMove={move}
      onPointerLeave={() => {
        setFocus(-1);
        onHover(-1);
      }}
    >
      <span className="work-index-label">SELECTED WORK / 01—09</span>
      <div className="work-index-preview" ref={preview}>
        {focus >= 0 && (
          <>
            <img src={projects[focus].poster} alt="" />
            {!reduced && (
              <video
                ref={video}
                key={focus}
                src={projects[focus].preview}
                muted
                loop
                playsInline
                preload="metadata"
              />
            )}
          </>
        )}
      </div>
      <div className="work-index-rows">
        {projects.map((p, i) => (
          <div className="work-line" key={p.id}>
            <button
              onClick={() => onSelect(i)}
              onPointerEnter={() => select(i)}
              onFocus={() => select(i)}
              onBlur={() => {
                setFocus(-1);
                onHover(-1);
              }}
            >
              <small>{String(i + 1).padStart(2, "0")}</small>
              <RollingText>{p.title}</RollingText>
              <span className="work-line-arrow">↗</span>
            </button>
          </div>
        ))}
      </div>
      <span className="work-index-footnote">
        A COLLECTION OF THINGS THAT MAKE YOU FEEL.
      </span>
    </div>
  );
}
