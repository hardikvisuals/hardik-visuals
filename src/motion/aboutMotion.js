import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
gsap.registerPlugin(ScrollTrigger);
export function createAboutMotion(root, reduced) {
  let alive = true,
    velocity = 0,
    marqueeX = 0,
    direction = 1,
    ripple = null;
  const content = root.querySelector(".about-content");
  const finePointer = matchMedia("(pointer:fine)").matches;
  const lenis =
    reduced || !finePointer
      ? null
      : new Lenis({
          wrapper: root,
          content,
          autoRaf: false,
          lerp: 0.09,
          smoothWheel: true,
          syncTouch: false,
        });
  lenis?.on("scroll", (event) => {
    velocity = Math.max(-24, Math.min(24, event.velocity));
    if (Math.abs(event.velocity) > 0.1) direction = event.direction;
    ScrollTrigger.update();
  });
  const cursor = root.querySelector(".about-pointer");
  const pointer = { x: -100, y: -100, rx: -100, ry: -100 };
  const move = (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (cursor)
      cursor.dataset.active = Boolean(e.target.closest("a,button,img,video"));
  };
  if (!reduced && finePointer) root.addEventListener("pointermove", move);
  const band = root.querySelector(".about-marquee-track");
  let bandWidth = band?.scrollWidth / 2 || 0,
    bandVisible = false;
  const bandObserver = new IntersectionObserver(
    ([entry]) => {
      bandVisible = entry.isIntersecting;
    },
    { root },
  );
  if (band) bandObserver.observe(band);
  // All continuous About motion shares GSAP's ticker, including smooth scroll.
  const tick = (time, delta) => {
    if (document.hidden) return;
    lenis?.raf(time * 1000);
    const dt = Math.min(delta / 16.667, 3);
    velocity *= Math.pow(0.9, dt);
    if (band && bandVisible && !reduced) {
      marqueeX -= direction * (0.3 + Math.abs(velocity) * 0.045) * dt;
      if (marqueeX < -bandWidth) marqueeX = 0;
      if (marqueeX > 0) marqueeX = -bandWidth;
      gsap.set(band, { x: marqueeX });
    }
    if (
      cursor &&
      !reduced &&
      finePointer &&
      (Math.abs(pointer.x - pointer.rx) > 0.1 ||
        Math.abs(pointer.y - pointer.ry) > 0.1)
    ) {
      pointer.rx += (pointer.x - pointer.rx) * 0.32;
      pointer.ry += (pointer.y - pointer.ry) * 0.32;
      cursor.style.transform = `translate3d(${pointer.rx}px,${pointer.ry}px,0)`;
    }
    ripple?.tick(time, velocity);
  };
  if (!reduced) gsap.ticker.add(tick);
  const responsive = gsap.matchMedia();
  const ctx = gsap.context(() => {
    if (reduced) return;
    const signature = gsap.timeline({
      scrollTrigger: {
        trigger: ".about-opening",
        scroller: root,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.1,
      },
    });
    signature
      .to(
        ".about-hero-photo",
        { scale: 1.09, yPercent: -5, duration: 3, ease: "none" },
        0,
      )
      .to(
        ".about-hero-line.top",
        { xPercent: -12, duration: 3, ease: "none" },
        0,
      )
      .to(
        ".about-hero-line.bottom",
        { xPercent: 12, duration: 3, ease: "none" },
        0,
      );
    gsap.to(".about-progress", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: content,
        scroller: root,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });
    root.querySelectorAll("[data-parallax]").forEach((el) =>
      gsap.fromTo(
        el,
        { y: finePointer ? 25 : 10 },
        {
          y: -Number(el.dataset.parallax) * (finePointer ? 0.65 : 0.25),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            scroller: root,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      ),
    );
    gsap.from(".about-dual .artist-face", {
      xPercent: -16,
      opacity: 0.4,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-dual",
        scroller: root,
        start: "top bottom",
        end: "center center",
        scrub: 1,
      },
    });
    gsap.from(".about-dual .athlete-face", {
      xPercent: 16,
      opacity: 0.4,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-dual",
        scroller: root,
        start: "top bottom",
        end: "center center",
        scrub: 1,
      },
    });
    root.querySelectorAll(".about-fan-card").forEach((el, i) =>
      gsap.from(el, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-social",
          scroller: root,
          start: "top 75%",
          once: true,
        },
      }),
    );
    root.querySelectorAll(".about-introduction>div>span").forEach((el, i) =>
      gsap.from(el, {
        y: 24,
        opacity: 0,
        duration: 0.65,
        delay: i * 0.09,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el.parentElement,
          scroller: root,
          start: "top 88%",
          once: true,
        },
      }),
    );
    responsive.add(
      "(min-width: 1200px) and (pointer:fine)",
      () => {
        const strip = root.querySelector(".about-interest-grid");
        gsap.to(strip, {
          x: () => -Math.max(0, strip.scrollWidth - root.clientWidth * 0.88),
          ease: "none",
          scrollTrigger: {
            trigger: ".about-interests",
            scroller: root,
            start: "top top",
            end: () =>
              `+=${Math.max(root.clientWidth, strip.scrollWidth - root.clientWidth * 0.88)}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      },
      root,
    );
  }, root);
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (!reduced)
          ctx.add(() => {
            if (el.matches(".about-photo")) {
              gsap.fromTo(
                el.querySelector("img,video"),
                { scale: 1.07, opacity: 0.5 },
                { scale: 1, opacity: 1, duration: 1, ease: "power3.out" },
              );
            } else
              gsap.fromTo(
                el,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.75, ease: "power3.out" },
              );
          });
        observer.unobserve(el);
      }),
    { root, threshold: 0.12 },
  );
  root
    .querySelectorAll("[data-reveal],.about-interest-grid>.about-photo")
    .forEach((el) => observer.observe(el));
  if (!reduced && matchMedia("(min-width: 900px) and (pointer:fine)").matches)
    import("./aboutRipple.js")
      .then(({ createAboutRipple }) => {
        if (alive)
          ripple = createAboutRipple(
            root.querySelector(".collage-centre>.about-photo"),
            root,
          );
      })
      .catch(() => {});
  let refreshTimer;
  const refresh = () => {
    if (!alive) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      if (alive) {
        bandWidth = band?.scrollWidth / 2 || 0;
        lenis?.resize();
        ScrollTrigger.refresh();
      }
    }, 180);
  };
  refresh();
  window.addEventListener("resize", refresh);
  document.fonts.ready.then(refresh);
  const resize = new ResizeObserver(() => lenis?.resize());
  resize.observe(content);
  return {
    scrollTo: (el) =>
      lenis
        ? lenis.scrollTo(el, { offset: -95, duration: 1.1 })
        : el.scrollIntoView({
            behavior: reduced ? "instant" : "smooth",
            block: "start",
          }),
    destroy() {
      alive = false;
      clearTimeout(refreshTimer);
      gsap.ticker.remove(tick);
      observer.disconnect();
      bandObserver.disconnect();
      resize.disconnect();
      responsive.revert();
      window.removeEventListener("resize", refresh);
      root.removeEventListener("pointermove", move);
      ripple?.destroy();
      lenis?.destroy();
      ctx.revert();
    },
  };
}
