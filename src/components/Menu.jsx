import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import RollingText from "./RollingText.jsx";
import CloseButton from "./CloseButton.jsx";

import { prepareAbout as loadAbout } from "../prepareAbout.js";

export default function Menu({
  onClose,
  onWorks,
  onAbout,
  initialView = "menu",
  reduced,
}) {
  const dialog = useRef(null),
    panel = useRef(null),
    body = useRef(null),
    busy = useRef(false),
    closeTween = useRef(null),
    openTween = useRef(null),
    viewTween = useRef(null),
    closing = useRef(false),
    request = useRef(0),
    mounted = useRef(false);
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState(initialView);
  useLayoutEffect(() => {
    mounted.current = true;
    closing.current = false;
    const previous = document.activeElement;
    dialog.current.showModal();
    const ctx = gsap.context(() => {
      openTween.current = gsap
        .timeline()
        .fromTo(
          panel.current,
          {
            xPercent: reduced ? 0 : 110,
            rotateY: reduced ? 0 : -12,
            opacity: reduced ? 0 : 1,
          },
          {
            xPercent: 0,
            rotateY: 0,
            opacity: 1,
            duration: reduced ? 0.18 : 0.85,
            ease: "power4.out",
          },
          0,
        )
        .from(
          ".menu-top",
          {
            opacity: 0,
            y: reduced ? 0 : -14,
            duration: 0.4,
            ease: "power3.out",
          },
          0.16,
        )
        .from(
          ".menu-bottom>*",
          {
            opacity: 0,
            y: reduced ? 0 : 15,
            duration: 0.5,
            stagger: reduced ? 0 : 0.055,
            ease: "power3.out",
          },
          0.5,
        );
    }, panel);
    return () => {
      mounted.current = false;
      request.current++;
      viewTween.current?.kill();
      ctx.revert();
      openTween.current?.kill();
      closeTween.current?.kill();
      if (previous?.isConnected) previous.focus();
    };
  }, [reduced]);
  useLayoutEffect(() => {
    if (!closing.current) busy.current = false;
    const ctx = gsap.context(() => {
      gsap.set(body.current, { opacity: 1, y: 0, rotateX: 0 });
      gsap.fromTo(
        view === "menu" ? ".menu-link" : ".menu-content>*",
        { opacity: 0, y: reduced ? 0 : 22, rotateX: 0 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: reduced ? 0.15 : 0.6,
          stagger: reduced ? 0 : 0.07,
          delay: view === "menu" ? 0.2 : 0.06,
          ease: "power4.out",
        },
      );
    }, body);
    return () => ctx.revert();
  }, [view, reduced]);
  function navigate(next) {
    if (busy.current || closing.current) return;
    request.current++;
    busy.current = true;
    viewTween.current = gsap.to(body.current, {
      overwrite: true,
      opacity: 0,
      y: reduced ? 0 : -24,
      rotateX: 0,
      duration: reduced ? 0.12 : 0.24,
      ease: "power2.in",
      onComplete: () => setView(next),
    });
  }
  function close(works = false, afterClose) {
    if (closing.current || !mounted.current) return;
    closing.current = true;
    request.current++;
    busy.current = true;
    viewTween.current?.kill();
    openTween.current?.kill();
    gsap.killTweensOf(body.current);
    closeTween.current = gsap
      .timeline({
        onComplete: () =>
          afterClose ? afterClose() : works ? onWorks() : onClose(),
      })
      .to(
        body.current,
        { opacity: 0, y: reduced ? 0 : 20, duration: 0.2, ease: "power2.in" },
        0,
      )
      .to(
        panel.current,
        {
          xPercent: reduced ? 0 : 110,
          rotateY: reduced ? 0 : -8,
          opacity: reduced ? 0 : 1,
          duration: reduced ? 0.2 : 0.55,
          ease: "power3.inOut",
        },
        0.04,
      );
  }
  return (
    <dialog
      className="menu-dialog"
      ref={dialog}
      aria-label="Website menu"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <div
        className="menu-sheet"
        data-view={view}
        data-motion={reduced ? "reduced" : "full"}
        ref={panel}
      >
        <div className="menu-top">
          <span>HARDIK VISUALS®</span>
          <CloseButton onClick={() => close()} label="Close menu" />
        </div>
        <div className="menu-main" ref={body}>
          {view === "menu" ? (
            <nav aria-label="Main navigation">
              {[
                ["works", "01"],
                ["about", "02"],
                ["contact", "03"],
              ].map(([label, num]) => (
                <button
                  className="menu-link"
                  key={label}
                  onPointerEnter={() => {
                    if (label === "about") void loadAbout().catch(() => {});
                  }}
                  onFocus={() => {
                    if (label === "about") void loadAbout().catch(() => {});
                  }}
                  onClick={() => {
                    if (label === "works") close(true);
                    else if (label === "about") {
                      if (busy.current || closing.current) return;
                      busy.current = true;
                      setLoadError(false);
                      const id = ++request.current;
                      void loadAbout()
                        .then(() => {
                          if (mounted.current && id === request.current)
                            close(false, onAbout);
                        })
                        .catch(() => {
                          if (mounted.current && id === request.current) {
                            busy.current = false;
                            setLoadError(true);
                          }
                        });
                    } else navigate(label);
                  }}
                >
                  <small className="menu-number">{num}</small>
                  <span className="menu-label-wrap">
                    <RollingText>
                      {label === "about" ? "about me" : label}
                    </RollingText>
                    {label === "about" && (
                      <small className="menu-about-hint">
                        Get to know the person behind the work.
                      </small>
                    )}
                  </span>
                  <span className="menu-orb">↗︎</span>
                </button>
              ))}
            </nav>
          ) : (
            <div className="menu-content">
              <button className="back-link" onClick={() => navigate("menu")}>
                ← <RollingText>back</RollingText>
              </button>
              {view === "about" ? (
                <>
                  <p className="eyebrow">THE PERSON BEHIND THE FRAME</p>
                  <h2>
                    Make you
                    <br />
                    feel something.
                  </h2>
                  <p>
                    I’m Hardik, a creative director and visual storyteller. I
                    turn ideas into moving images that hold attention and stay
                    with you.
                  </p>
                  <p>Concept. Direction. Motion. Every cut has a reason.</p>
                  <button
                    className="text-link"
                    onClick={() => navigate("contact")}
                  >
                    <RollingText>
                      Let’s make something worth watching
                    </RollingText>{" "}
                    ↗︎
                  </button>
                </>
              ) : (
                <>
                  <p className="eyebrow">AVAILABLE NOW FOR WORK</p>
                  <h2>
                    Let’s make
                    <br />
                    something great.
                  </h2>
                  <div className="contact-links">
                    <a href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=hardik%40hardikvisuals.com" target="_blank" rel="noopener noreferrer">
                      <RollingText>Send an email</RollingText>
                      <span>↗︎</span>
                      <small>hardik@hardikvisuals.com</small>
                    </a>
                    <a
                      href="https://wa.me/917042357394"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <RollingText>WhatsApp</RollingText>
                      <span>↗︎</span>
                      <small>+91 70423 57394</small>
                    </a>
                    <a
                      href="https://calendly.com/hardikvisuals-work/30min"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <RollingText>Book a conversation</RollingText>
                      <span>↗︎</span>
                      <small>Find a time on Calendly</small>
                    </a>
                    <a
                      className="contact-instagram"
                      href="https://www.instagram.com/hardikk.singhh/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <RollingText>More of me &amp; my work</RollingText>
                      <span>↗︎</span>
                      <small>Instagram · @hardikk.singhh</small>
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {loadError && (
          <p role="status">Couldn’t load About. Tap About Me to try again.</p>
        )}
        <div className="menu-bottom">
          <a href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=hardik%40hardikvisuals.com" target="_blank" rel="noopener noreferrer">
            <RollingText>hardik@hardikvisuals.com</RollingText> ↗︎
          </a>
          <a
            href="https://www.instagram.com/hardikk.singhh/"
            target="_blank"
            rel="noreferrer"
          >
            <RollingText>Instagram</RollingText> ↗︎
          </a>
          <span>BASED IN INDIA. CREATING EVERYWHERE.</span>
        </div>
      </div>
    </dialog>
  );
}
