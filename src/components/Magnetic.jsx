import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useMotion } from "../motion/MotionContext.jsx";

export default function Magnetic({
  children,
  className = "",
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...props
}) {
  const ref = useRef(null),
    active = useRef(false);
  const { reduced } = useMotion();
  useEffect(() => {
    const node = ref.current;
    return () => gsap.killTweensOf(node);
  }, []);
  function move(event) {
    if (event.pointerType !== "mouse" || reduced) return;
    const box = ref.current.getBoundingClientRect();
    const x = event.clientX - box.left - box.width / 2,
      y = event.clientY - box.top - box.height / 2;
    gsap.to(ref.current, {
      x: x * 0.11,
      y: -5 + y * 0.1,
      rotateY: x * 0.055,
      rotateX: -y * 0.12,
      scale: 1.055,
      duration: 0.28,
      ease: "power3.out",
      overwrite: true,
    });
  }
  function enter(event) {
    active.current = true;
    if (!reduced)
      gsap.to(ref.current, {
        y: -5,
        scale: 1.055,
        duration: 0.32,
        ease: "back.out(1.8)",
        overwrite: true,
      });
    onPointerEnter?.(event);
  }
  function leave(event) {
    active.current = false;
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: reduced ? 0.12 : 0.55,
      ease: "elastic.out(1,.55)",
      overwrite: true,
    });
    onPointerLeave?.(event);
  }
  function press() {
    if (!reduced)
      gsap.to(ref.current, {
        scale: 0.97,
        y: 0,
        duration: 0.15,
        ease: "power3.out",
        overwrite: true,
      });
  }
  function release() {
    if (!reduced)
      gsap.to(ref.current, {
        scale: active.current ? 1.055 : 1,
        y: active.current ? -5 : 0,
        duration: 0.3,
        ease: "back.out(1.5)",
        overwrite: true,
      });
  }
  return (
    <button
      ref={ref}
      className={`magnetic ${className}`}
      onPointerMove={move}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onPointerDown={press}
      onPointerUp={release}
      onFocus={enter}
      onBlur={leave}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
