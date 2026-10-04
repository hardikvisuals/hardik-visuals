export default function CloseButton({ onClick, label, className = "" }) {
  return (
    <button
      className={`round-button close-control ${className}`}
      onClick={onClick}
      aria-label={label}
    >
      <span className="close-orbit" />
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    </button>
  );
}
