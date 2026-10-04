import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import CloseButton from "./CloseButton.jsx";

export default function VideoPlayer({ project, muted, onClose, reduced }) {
  const dialog = useRef(null),
    video = useRef(null),
    panel = useRef(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    video.current.volume = 0.8;
    video.current.play().catch(() => {});
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  useLayoutEffect(() => {
    const ctx = gsap.context(() =>
      gsap.from(panel.current, {
        y: reduced ? 0 : 70,
        scale: reduced ? 1 : 0.92,
        opacity: 0,
        duration: reduced ? 0.15 : 0.65,
        ease: "power4.out",
      }),
    );
    return () => ctx.revert();
  }, [reduced]);
  function close() {
    video.current.pause();
    gsap.to(panel.current, {
      opacity: 0,
      y: reduced ? 0 : 30,
      scale: reduced ? 1 : 0.97,
      duration: 0.25,
      ease: "power2.in",
      onComplete: onClose,
    });
  }
  return (
    <dialog
      className="video-dialog"
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
      aria-label={`${project.title} video player`}
    >
      <div className="video-panel" ref={panel}>
        <div className="video-topline">
          <span>
            <small>{String(project.id + 1).padStart(2, "0")} / 09</small>
            {project.title}
          </span>
          <CloseButton
            className="video-close"
            onClick={close}
            label="Close video"
          />
        </div>
        <video
          ref={video}
          src={project.video}
          poster={project.poster}
          autoPlay
          muted={muted}
          playsInline
          controls
          preload="metadata"
          onError={() => setError(true)}
        />
        {error && (
          <p className="video-error">
            This film couldn’t load.{" "}
            <a href={project.video} target="_blank" rel="noreferrer">
              Open the original video ↗
            </a>
          </p>
        )}
        <div className="video-caption">
          <span>{project.category}</span>
          <span>HARDIK VISUALS®</span>
        </div>
      </div>
    </dialog>
  );
}
