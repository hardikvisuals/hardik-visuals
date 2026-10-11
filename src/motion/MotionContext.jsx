import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const MotionContext = createContext({ reduced: false, setMotion: () => {} });
export function MotionProvider({ children }) {
  const requestedMotion = new URLSearchParams(location.search).get("motion");
  const explicit = useRef(requestedMotion === "reduced" || requestedMotion === "full" ? requestedMotion : null);
  const [reduced, setReduced] = useState(() =>
    explicit.current ? explicit.current === "reduced" : matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (!explicit.current) setReduced(preference.matches);
    };
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useLayoutEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);
  function setMotion(value) {
    explicit.current = value ? "reduced" : "full";
    const url = new URL(location.href);
    url.searchParams.set("motion", explicit.current);
    history.replaceState(null, "", url);
    setReduced(value);
  }
  return (
    <MotionContext.Provider value={{ reduced, setMotion }}>
      {children}
    </MotionContext.Provider>
  );
}
export const useMotion = () => useContext(MotionContext);
