import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const MotionContext = createContext({ reduced: false, setMotion: () => {} });
export function MotionProvider({ children }) {
  const explicit = useRef(new URLSearchParams(location.search).get("motion"));
  const [reduced, setReduced] = useState(() => explicit.current === "reduced");
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
