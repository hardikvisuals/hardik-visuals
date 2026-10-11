import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const expressions = ["idle", "sad", "smile", "wow"];
const EXPRESSION_DURATION = 4366;
// Cache compressed bytes, not live animated image elements. Each take gets its
// own object URL so an already-playing browser image cannot start halfway in.
const cache = new Map();
function prepare(index) {
  if (!cache.has(index)) {
    const promise = fetch(`/optimized/mascot-${expressions[index]}-v10.webp`)
      .then((response) => {
        if (!response.ok) throw new Error("Mascot unavailable");
        return response.blob();
      })
      .catch((error) => {
        cache.delete(index);
        throw error;
      });
    cache.set(index, promise);
  }
  return cache.get(index);
}
const MascotArt = forwardRef(function MascotArt({ active, reduced }, ref) {
  const [take, setTake] = useState(null);
  const [ready, setReady] = useState(false);
  const bag = useRef([]),
    last = useRef(-1),
    sequence = useRef(0);
  const timer = useRef(null),
    busy = useRef(false),
    url = useRef(null),
    alive = useRef(false);
  function nextIndex() {
    if (!bag.current.length) {
      bag.current = [0, 1, 2, 3];
      for (let i = 3; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag.current[i], bag.current[j]] = [bag.current[j], bag.current[i]];
      }
      if (bag.current[0] === last.current)
        [bag.current[0], bag.current[1]] = [bag.current[1], bag.current[0]];
    }
    return bag.current[0];
  }
  function warm() {
    if (alive.current && active && !reduced)
      void prepare(nextIndex()).catch(() => {});
  }
  function finish(id) {
    if (!alive.current || sequence.current !== id) return;
    sequence.current++;
    clearTimeout(timer.current);
    busy.current = false;
    setReady(false);
    setTake(null);
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
    warm();
  }
  async function play() {
    if (!active || reduced || busy.current) return;
    busy.current = true;
    const id = ++sequence.current;
    const index = nextIndex();
    setReady(false);
    timer.current = setTimeout(() => finish(id), 10000);
    try {
      const blob = await prepare(index);
      if (!alive.current || sequence.current !== id) return;
      bag.current.shift();
      last.current = index;
      url.current = URL.createObjectURL(blob);
      setTake({ index, id, src: url.current });
    } catch {
      finish(id);
    }
  }
  useImperativeHandle(ref, () => ({ play }));
  useEffect(() => {
    alive.current = true;
    warm();
    return () => {
      alive.current = false;
      sequence.current++;
      busy.current = false;
      clearTimeout(timer.current);
      if (url.current) URL.revokeObjectURL(url.current);
      url.current = null;
      setTake(null);
      setReady(false);
    };
  }, [active, reduced]);
  return (
    <span
      className="mascot-art"
      data-expression={take ? expressions[take.index] : "start"}
    >
      <img
        className="mascot-start"
        src="/optimized/mascot-start-v10.webp"
        width="256"
        height="252"
        alt=""
        style={{ opacity: 1 }}
      />
      {take && (
        <img
          key={take.id}
          className="mascot-fallback"
          src={take.src}
          alt=""
          style={{ opacity: ready ? 1 : 0 }}
          onLoad={() => {
            if (sequence.current !== take.id) return;
            clearTimeout(timer.current);
            setReady(true);
            timer.current = setTimeout(
              () => finish(take.id),
              EXPRESSION_DURATION,
            );
          }}
          onError={() => finish(take.id)}
        />
      )}
    </span>
  );
});
export default MascotArt;
