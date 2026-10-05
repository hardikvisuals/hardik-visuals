import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { asset } from "../assets.js";

const expressions = ["idle", "sad", "smile", "wow"];
const EXPRESSION_DURATION = 4366;

const MascotArt = forwardRef(function MascotArt(_, ref) {
  const [take, setTake] = useState(null);
  const [ready, setReady] = useState(false);
  const bag = useRef([]);
  const last = useRef(-1);
  const sequence = useRef(0);
  const timer = useRef(null);

  function finish(id) {
    if (sequence.current !== id) return;
    clearTimeout(timer.current);
    setReady(false);
    setTake(null);
  }

  function play() {
    if (take) return;
    if (!bag.current.length) {
      bag.current = [0, 1, 2, 3];
      for (let i = 3; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag.current[i], bag.current[j]] = [bag.current[j], bag.current[i]];
      }
      if (bag.current[0] === last.current)
        [bag.current[0], bag.current[1]] = [bag.current[1], bag.current[0]];
    }
    const index = bag.current.shift();
    last.current = index;
    const id = ++sequence.current;
    clearTimeout(timer.current);
    setReady(false);
    setTake({ index, id });
    // A stalled request must also return to the starting face.
    timer.current = setTimeout(() => finish(id), 10000);
  }

  useImperativeHandle(ref, () => ({ play }));
  useEffect(() => () => {
    sequence.current++;
    clearTimeout(timer.current);
  }, []);

  return (
    <span className="mascot-art" data-expression={take ? expressions[take.index] : "start"}>
      <img className="mascot-start" src={asset("assets/mascot/start-hq-v6.webp")} alt=""
        style={{ opacity: 1 }} />
      {take && (
        <img key={take.id} className="mascot-fallback"
          src={asset(`assets/mascot/${expressions[take.index]}-hq-v6.webp`)} alt=""
          style={{ opacity: ready ? 1 : 0 }}
          onLoad={async (event) => {
            await event.currentTarget.decode().catch(() => {});
            if (sequence.current !== take.id) return;
            // Animated WebP preserves alpha without a hardware video decoder.
            // Reveal only after load; ignore callbacks from interrupted takes.
            clearTimeout(timer.current);
            setReady(true);
            timer.current = setTimeout(() => finish(take.id), EXPRESSION_DURATION);
          }}
          onError={() => finish(take.id)} />
      )}
    </span>
  );
});
export default MascotArt;
