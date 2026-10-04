import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { tracks } from "../data.js";
import { useMotion } from "../motion/MotionContext.jsx";
import CloseButton from "./CloseButton.jsx";
import RollingText from "./RollingText.jsx";

export default function SoundtrackPicker({ selected, onSelect, onClose }) {
  const dialog = useRef(null),
    panel = useRef(null),
    closing = useRef(false);
  const { reduced } = useMotion();
  useLayoutEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        panel.current,
        { opacity: 0, y: reduced ? 0 : 35, scale: reduced ? 1 : 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: reduced ? 0.15 : 0.55,
          ease: "power4.out",
        },
      );
      gsap.from(".soundtrack-option", {
        opacity: 0,
        y: reduced ? 0 : 12,
        duration: 0.4,
        stagger: reduced ? 0 : 0.035,
        delay: 0.12,
        ease: "power3.out",
      });
    }, panel);
    return () => {
      ctx.revert();
      previous?.focus();
    };
  }, [reduced]);
  function close(index) {
    if (closing.current) return;
    closing.current = true;
    if (typeof index === "number") onSelect(index);
    gsap.to(panel.current, {
      opacity: 0,
      y: reduced ? 0 : 18,
      scale: reduced ? 1 : 0.98,
      duration: 0.2,
      ease: "power2.in",
      onComplete: onClose,
    });
  }
  return (
    <dialog
      ref={dialog}
      className="soundtrack-dialog"
      aria-label="Choose your soundtrack"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <div className="soundtrack-sheet" ref={panel}>
        <div className="soundtrack-heading">
          <span>SET THE MOOD</span>
          <CloseButton
            label="Close soundtrack selection"
            onClick={() => close()}
          />
        </div>
        <h2>Give it a feeling.</h2>
        <p>A soundtrack for your time here.</p>
        <div className="soundtrack-options">
          {tracks.map((track, i) => (
            <button
              className={`soundtrack-option ${i === selected ? "selected" : ""}`}
              key={track.src}
              onClick={() => close(i)}
              aria-pressed={i === selected}
            >
              <small>{String(i + 1).padStart(2, "0")}</small>
              <RollingText>{track.title}</RollingText>
              <span className="soundtrack-mark">
                {i === selected ? "●" : "↗"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}
