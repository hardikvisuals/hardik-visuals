import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMotion } from "../motion/MotionContext.jsx";

export default function Cursor() {
  const { reduced } = useMotion();
  const [host, setHost] = useState(document.body);
  const ring = useRef(null),
    dot = useRef(null);
  useEffect(() => {
    // Native dialogs live above normal page layers. Keep the cursor in that
    // same layer, outside the animated sheet so its coordinates stay stable.
    const updateHost = () => {
      const dialogs = document.querySelectorAll("dialog[open]");
      setHost(dialogs[dialogs.length - 1] || document.body);
    };
    const observer = new MutationObserver(updateHost);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    updateHost();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!matchMedia("(pointer:fine)").matches || reduced) return;
    let x = -100,
      y = -100,
      rx = -100,
      ry = -100,
      frame,
      visible = false;
    function move(event) {
      x = event.clientX;
      y = event.clientY;
      if (!visible) {
        visible = true;
        rx = x;
        ry = y;
        document.body.classList.add("has-cursor");
      }
      const target = event.target.closest(
        "button,a,video,input,select,[data-cursor]",
      );
      ring.current.dataset.active = target ? "true" : "false";
      ring.current.dataset.video =
        event.target.tagName === "VIDEO" ? "true" : "false";
    }
    function tick() {
      rx += (x - rx) * 0.38;
      ry += (y - ry) * 0.38;
      dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      frame = requestAnimationFrame(tick);
    }
    function down() {
      ring.current.classList.add("pressed");
    }
    function up() {
      ring.current.classList.remove("pressed");
    }
    function leave() {
      visible = false;
      document.body.classList.remove("has-cursor");
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
      document.body.classList.remove("has-cursor");
    };
  }, [reduced]);
  return createPortal(
    <>
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-ring" ref={ring}>
        <i />
      </div>
    </>,
    host,
  );
}
