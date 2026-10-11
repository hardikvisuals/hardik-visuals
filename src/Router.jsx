import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import App from "./App.jsx";
import { createAudio } from "./motion/audio.js";
import { useMotion } from "./motion/MotionContext.jsx";

import { loadAbout, prepareAbout } from "./prepareAbout.js";
const About = lazy(loadAbout);
const canonicalPath = (value) => value.replace(/\/$/, "") || "/";
const titles = {
  "/": "Hardik Visuals | Video Editor & Motion Designer",
  "/about": "About Hardik — Creative Director & Artist | Hardik Visuals",
};
export default function Router() {
  const audio = useRef(null);
  const [sound, setSound] = useState(false);
  useEffect(() => () => audio.current?.dispose(), []);
  function toggleSound() {
    audio.current ||= createAudio();
    audio.current.setEnabled(!sound);
    setSound(!sound);
  }
  const [path, setPath] = useState(canonicalPath(location.pathname));
  const [returnView, setReturnView] = useState(null);
  const [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  const curtain = useRef(null),
    request = useRef(0),
    pending = useRef(false);
  const { reduced } = useMotion();
  useEffect(() => {
    const pop = () => {
      request.current++;
      pending.current = false;
      setBusy(false);
      setError(false);
      gsap.killTweensOf(curtain.current);
      gsap.set(curtain.current, { opacity: 0 });
      setReturnView("works");
      setPath(canonicalPath(location.pathname));
    };
    window.addEventListener("popstate", pop);
    return () => {
      request.current++;
      gsap.killTweensOf(curtain.current);
      window.removeEventListener("popstate", pop);
    };
  }, []);
  useLayoutEffect(() => {
    document.title = titles[path] || "Page not found | Hardik Visuals";
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute(
        "href",
        `https://hardikvisuals.com${path === "/" ? "/" : path}`,
      );
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute(
        "content",
        `https://hardikvisuals.com${path === "/" ? "/" : path}`,
      );
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", document.title);
    const tween = gsap.to(curtain.current, {
      opacity: 0,
      scale: 1.08,
      duration: reduced ? 0.12 : 0.8,
      ease: "power2.out",
      onComplete: () => {
        pending.current = false;
        setBusy(false);
      },
    });
    return () => tween.kill();
  }, [path, reduced]);
  async function navigate(next, view = "works") {
    if (pending.current) return;
    const id = ++request.current;
    pending.current = true;
    setBusy(true);
    setError(false);
    try {
      if (next === "/about") await prepareAbout();
      if (id !== request.current) return;
      gsap.fromTo(
        curtain.current,
        { opacity: 0, scale: 1.14 },
        {
          opacity: 1,
          scale: 1,
          duration: reduced ? 0.12 : 0.65,
          ease: "power2.inOut",
          overwrite: true,
          onComplete: () => {
            if (id !== request.current) return;
            setReturnView(view);
            history.pushState(null, "", next + location.search);
            setPath(next);
          },
        },
      );
    } catch {
      if (id !== request.current) return;
      pending.current = false;
      setBusy(false);
      setError(true);
    }
  }
  return (
    <>
      {path === "/about" ? (
        <Suspense
          fallback={
            <div className="about-loader" data-motion={reduced ? "reduced" : "full"} role="status" aria-label="Loading About">
              <img src="/optimized/mascot-start-v10.webp" width="96" height="95" alt="" />
              <span aria-hidden="true">✦</span>
            </div>
          }
        >
          <About onNavigate={(view) => navigate("/", view)} sound={sound} onToggleSound={toggleSound} />
        </Suspense>
      ) : path === "/" ? (
        <App
          audio={audio}
          sound={sound}
          setSound={setSound}
          initialEntered={returnView !== null}
          initialMenu={returnView === "contact"}
          onAbout={() => navigate("/about")}
        />
      ) : (
        <main className="not-found">
          <p>HARDIK VISUALS® / 404</p>
          <h1>Outside the frame.</h1>
          <p>This page couldn’t be found.</p>
          <a href="/">Back to the work ↗</a>
        </main>
      )}
      <div
        className="route-curtain"
        data-busy={busy}
        ref={curtain}
        aria-hidden="true"
      />
      {error && (
        <p className="route-status" role="alert">
          This page couldn’t load.<a href="/about">Try again ↗</a>
        </p>
      )}
    </>
  );
}
