export default function RollingText({ children, className = "" }) {
  const text = String(children);
  return (
    <span className={`rolling-text ${className}`}>
      <span className="sr-only">{text}</span>
      <span className="rolling-letters" aria-hidden="true">
        {[...text].map((letter, i) => (
          <span
            className="rolling-letter"
            style={{ "--letter-delay": `${i * 12}ms` }}
            key={i}
          >
            <span>{letter === " " ? "\u00a0" : letter}</span>
            <span>{letter === " " ? "\u00a0" : letter}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
