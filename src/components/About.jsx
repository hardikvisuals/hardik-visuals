import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { asset } from '../assets.js';
import { useMotion } from '../motion/MotionContext.jsx';
import { createAboutMotion } from '../motion/aboutMotion.js';
import '../about.css';
import lottie from 'lottie-web';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import signatureData from '../signature.json';
import imageSizes from '../aboutImageSizes.json';
import '@fontsource-variable/manrope';
import '@fontsource-variable/bodoni-moda/wght-italic.css';

const media = name => asset(`assets/about-v5/${name}`);
const instagram = 'https://www.instagram.com/hardikk.singhh/';
const teaching = 'https://www.instagram.com/hardikk.says/';
const challenge = 'https://www.instagram.com/reel/DZCu9nRoV0q/';
const pushups = 'https://www.instagram.com/reel/DJraxi2SoAf/';
function Arrow() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>; }
function Signature({animated=false}) {
 const host=useRef(null);
 useLayoutEffect(()=>{
  const animation=lottie.loadAnimation({container:host.current,renderer:'svg',loop:false,autoplay:false,animationData:JSON.parse(JSON.stringify(signatureData))});
  let tween;
  const ready=()=>{const state={frame:0};if(animated){tween=gsap.to(state,{frame:animation.totalFrames-1,ease:'none',onUpdate:()=>animation.goToAndStop(state.frame,true),scrollTrigger:{trigger:host.current.closest('.about-opening'),scroller:host.current.closest('.about-page'),start:'top top',end:'bottom bottom',scrub:.4}});ScrollTrigger.refresh();}else animation.goToAndStop(animation.totalFrames-1,true);};
  animation.addEventListener('DOMLoaded',ready);
  return()=>{tween?.scrollTrigger?.kill();tween?.kill();animation.destroy();};
 },[animated]);
 return <div ref={host} className="about-signature" role="img" aria-label="Hardik’s signature"/>;
}
function Photo({name,caption,className='',speed=0,alt}) {
  return <figure className={`about-photo ${className}`} {...(speed?{'data-parallax':speed}:{})}>
    <img width={imageSizes[name]?.[0]} height={imageSizes[name]?.[1]} src={media(`${name}.webp`)} alt={alt || caption} loading="lazy" decoding="async"/>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}
function Loop({name,poster,label,reduced}) {
  const ref=useRef(null);
  useEffect(()=>{
    const video=ref.current;
    if(reduced) return;
    let visible=false;
    const update=()=>{if(visible&&!document.hidden){if(!video.src)video.src=media(`${name}.mp4`);video.play().catch(()=>{});}else video.pause();};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:0.3});
    observer.observe(video);document.addEventListener('visibilitychange',update);
    return ()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);video.pause();video.removeAttribute('src');video.load();};
  },[name,reduced]);
  return <video ref={ref} muted playsInline loop preload="none" poster={media(`${poster}.webp`)} aria-label={label}/>;
}
export default function About({onNavigate}) {
  const root=useRef(null),title=useRef(null),motion=useRef(null);
  const {reduced,setMotion}=useMotion();
  const [menu,setMenu]=useState(false);
  useLayoutEffect(()=>{motion.current=createAboutMotion(root.current,reduced);return()=>motion.current?.destroy();},[reduced]);
  useEffect(()=>{const previous=document.title;document.title='About Hardik — Artist & Athlete';title.current?.focus({preventScroll:true});return()=>{document.title=previous;};},[]);
  const moveTo=id=>{setMenu(false);const target=root.current.querySelector(`#${id}`);if(target)motion.current?.scrollTo(target);};
  return <main className="about-page" data-motion={reduced?"reduced":"full"} ref={root} aria-label="About Hardik">
    <div className="about-progress" aria-hidden="true"/><div className="about-pointer" aria-hidden="true"/><div className="about-content"><div className="about-contours" aria-hidden="true"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMid slice"><path d="M-130 140C150-80 580-150 440 145S160 570 530 505 640 170 920 90 1290 210 1520-70M-90 270C220 35 590-30 520 220S235 645 615 593 720 260 1000 210 1290 375 1520 110M-70 460C135 330 185 540 120 730S430 1160 580 880 790 540 1010 600 1050 990 1450 900M-90 600C110 470 40 740 205 915S470 985 565 775 850 470 1070 510 1190 805 1450 725M890-130C770 80 820 180 710 310S540 395 700 470 1070 405 1150 290 1100-60 1330-90"/></svg></div>
    <header className="about-nav">
      <a href="/" onClick={e=>{e.preventDefault();onNavigate('works');}} className="about-wordmark" aria-label="Hardik Visuals — back to work"><span>HARDIK</span><b>VISUALS®</b></a>
      <span className="about-nav-note">A LITTLE LESS WORK.<br/>A LITTLE MORE ME.</span>
      <div className="about-nav-actions"><button className="about-contact" onClick={()=>onNavigate('contact')}>LET’S TALK <Arrow/></button><button className={`about-menu-button ${menu?'is-open':''}`} aria-label={menu?'Close about navigation':'Open about navigation'} aria-expanded={menu} onClick={()=>setMenu(!menu)}><span/><span/></button></div>
      {menu&&<nav className="about-nav-panel" aria-label="About navigation"><button onClick={()=>onNavigate('works')}>Selected work <Arrow/></button><button onClick={()=>moveTo('about-story')}>My story <Arrow/></button><button onClick={()=>moveTo('artist-athlete')}>Artist / Athlete <Arrow/></button><button onClick={()=>onNavigate('contact')}>Get in touch <Arrow/></button></nav>}
    </header>
    <section className="about-opening" aria-labelledby="about-title">
      <div className="about-opening-sticky">
        <p className="about-kicker">HARDIK, OUTSIDE THE TIMELINE</p>
        <div className="about-hero-line top" aria-hidden="true">ALWAYS <em>CURIOUS.</em> ALWAYS <em>CREATING.</em></div>
        <div className="about-hero-line bottom" aria-hidden="true">A LITTLE MORE <em>HUMAN.</em></div>
        <div className="about-hero-photo"><img src={media('portrait.webp')} alt="Hardik taking a break during training" fetchPriority="high"/></div>
        <Signature animated={!reduced}/>
        <h1 id="about-title" ref={title} tabIndex="-1" className="sr-only">Hardik. Creative director, visual storyteller, athlete.</h1>
        <div className="about-hero-bottom"><span>CREATING SINCE 2020</span><span>SCROLL TO GET TO KNOW ME <span aria-hidden="true">↓</span></span></div>
      </div>
    </section>
    <section className="about-manifesto" id="about-story">
      <p className="about-kicker" data-reveal>THREE SIDES. ONE PERSON.</p>
      <h2 data-reveal><em>Creative</em> director.<br/>Visual <em>storyteller.</em><br/>And always an<br/><em>athlete.</em></h2>
      <div className="about-introduction" data-reveal><p>I’m Hardik. I make films, lift heavy, and usually have another idea before I’ve finished the last one. I’m drawn to the details — in a frame, a fit, or a moment worth keeping.</p><div><span>CREATING SINCE 2020</span><span>B.Sc. IN ANIMATION, VFX &amp; GAMING</span><span>BASED IN INDIA. CURIOUS ABOUT EVERYWHERE.</span></div></div>
    </section>
    <section className="about-life" aria-labelledby="life-title">
      <div className="about-section-label"><span>01 / LIFE IN FRAMES</span><span>THE CAMERA ROLL, WITH CONTEXT.</span></div>
      <div className="about-collage">
        <Photo name="camera" caption="BEHIND THE CAMERA" className="collage-camera" speed={55}/>
        <Photo name="fashion" caption="THE FIT MATTERS, TOO." className="collage-fashion" speed={95}/>
        <div className="collage-centre"><Photo name="cinema" caption="CHASING THAT ONE SHOT"/><h2 id="life-title">It started with<br/><em>“what if?”</em></h2><p>In lockdown, I started cutting CS:GO and Valorant montages. Premiere Pro became After Effects. Gaming edits became anime edits, 3D experiments, and eventually my first client.</p><p>Then I turned the camera on the world around me. Training sessions. Friends. Real life. That’s where editing became storytelling.</p><Signature/></div>
        <Photo name="cat" caption="A VERY IMPORTANT COLLABORATOR" className="collage-cat" speed={35}/>
        <figure className="about-photo collage-game" data-parallax="70"><Loop name="gaming-loop" poster="immortal" label="Hardik’s Valorant gameplay" reduced={reduced}/><figcaption>REACHING IMMORTAL</figcaption></figure>
        <Photo name="friends" caption="OFF THE CLOCK" className="collage-friends" speed={45}/><Photo name="pfp-v7" caption="THE PERSON BEHIND THE WORK" className="collage-pfp" speed={30}/>
      </div>
    </section>
    <section id="artist-athlete" className="about-dual" aria-label="Artist and athlete">
      <img className="artist-face" src={media('artist.webp')} alt="Hardik in a black shirt, in profile" loading="lazy"/>
      <div className="about-dual-copy"><article><span className="about-kicker">IN MY ELEMENT</span><h2><em>The</em><br/>ARTIST</h2><p>Frames, feeling, and the tiny details that make something stay with you.</p><button className="about-square" onClick={()=>onNavigate('works')} aria-label="Explore my creative work"><Arrow/></button></article><article><span className="about-kicker">OUT OF MY COMFORT ZONE</span><h2><em>The</em><br/>ATHLETE</h2><p>Heavy lifts. Longer runs. A good reason to try again tomorrow.</p><button className="about-square" onClick={()=>moveTo('about-athlete')} aria-label="Explore my training story"><Arrow/></button></article></div>
      <img className="athlete-face" src={media('athlete.webp')} alt="Hardik’s athlete portrait in profile" loading="lazy"/>
    </section>
    <section className="about-training" id="about-athlete">
      <div className="about-section-label"><span>02 / MORE THAN A PERSONAL BEST</span><span>POWERLIFTING. RUNNING. SHOWING UP.</span></div>
      <div className="about-training-layout"><div className="about-training-copy" data-reveal><h2>A little<br/><em>stronger.</em><br/>Every time.</h2><p>Training is a big part of who I am. Some days it’s chasing a new lift. One day, it was deciding to run my first 10K — and actually doing it.</p><p>I spent over a year as a Velkor-sponsored athlete. These days, I’m chasing a 200 kg+ squat, a 250 kg deadlift, and getting better at running and calisthenics.</p><a className="about-text-link" href={challenge} target="_blank" rel="noreferrer">Watch the 50-rep challenge <Arrow/></a></div><div className="about-training-images"><Photo name="deadlift-v7" caption="ONE MORE REP." speed={55}/><a className="about-challenge-photo" href={challenge} target="_blank" rel="noreferrer" aria-label="Watch my 150 kg for 50 reps deadlift video on Instagram"><Photo name="challenge" caption="150 KG × 50 REPS — WATCH THE FILM"/><span className="about-play">↗</span></a></div></div>
      <div className="about-stats" data-reveal><div><strong>200<span>+ kg</span></strong><p>Deadlift at 60 kg body weight</p></div><div><strong>170<span>kg × 30</span></strong><p>Deadlift rep challenge</p></div><div><strong>10<span>km</span></strong><p>My first run. My first 10K.</p></div></div>
      <a className="about-challenge-note" href={pushups} target="_blank" rel="noreferrer"><span>AND THEN THERE WAS THAT TIME…</span><strong>I attempted 500 push-ups in 15 minutes.</strong><Arrow/></a>
    </section>
    <section className="about-pool"><Photo name="swim" caption="OFFLINE. IN MY ELEMENT." speed={45}/><h2 data-reveal>A little room<br/>to <em>just be.</em></h2></section>
    <div className="about-marquee" aria-hidden="true"><div className="about-marquee-track"><span>CREATIVE DIRECTOR / EDITOR / 3D ARTIST / </span><span>CREATIVE DIRECTOR / EDITOR / 3D ARTIST / </span></div></div>
    <section className="about-interests" aria-labelledby="interests-title"><div className="about-section-label"><span>03 / THE REST OF THE CAMERA ROLL</span><span>NO BRIEF. JUST LIFE.</span></div><h2 id="interests-title" data-reveal>Good fits.<br/><em>Small obsessions.</em></h2><div className="about-interest-grid"><Photo name="night" caption="FASHION / FINDING MY OWN WAY" speed={35}/><Photo name="perfume" caption="SCENT / A GROWING COLLECTION" speed={65}/><figure className="about-photo"><Loop name="ride" poster="helmet" label="A short motorcycle moment from Hardik’s camera roll" reduced={reduced}/><figcaption>OUTSIDE / TAKING THE LONG WAY</figcaption></figure><Photo name="coffee" caption="COFFEE / THE USUAL SUSPECT" speed={40}/><Photo name="marshall" caption="MUSIC / ON REPEAT"/><Photo name="cake" caption="ANOTHER LAP AROUND THE SUN"/><Photo name="monster" caption="BEFORE THE SESSION"/><Photo name="fit-v7" caption="FINDING THE FIT"/><Photo name="spiderman" caption="JUST ONE MORE MISSION"/><Photo name="food" caption="GOOD COMPANY. BETTER FOOD."/><Photo name="back" caption="BUILT ONE SESSION AT A TIME"/><Photo name="run" caption="OUTSIDE / A LITTLE FURTHER."/></div></section>
    <section className="about-teaching"><Photo name="filmset-v7" caption="STILL LEARNING. ALWAYS." speed={45}/><div data-reveal><span className="about-kicker">HARDIK SAYS</span><h2>Learn it.<br/>Make it.<br/><em>Pass it on.</em></h2><p>I learned by trying things, pulling edits apart, and trying again. Now I’m sharing the details of my own editing process — the techniques, decisions, and little discoveries behind the finished frame.</p><a href={teaching} className="about-text-link" target="_blank" rel="noreferrer">Learn with me on Hardik Says <Arrow/></a></div></section>
    <aside className="about-credits"><span>CREATOR WORK &amp; STUDIO COLLABORATIONS</span><div><strong>Sony</strong><strong>Valorant</strong><strong>Kamoka</strong><strong>1M+ video views</strong></div><p>Contributed through studio collaborations. Creator work across audiences of 100K+, 200K+ and 1M+.</p></aside>
    <section className="about-social"><p className="about-kicker">THE STORY KEEPS GOING</p><h2>MORE OF ME.<br/><em>Less of a bio.</em></h2><div className="about-fan">{['friends','back','fashion','swim','squat','night','run'].map((name,i)=><a className="about-fan-card" key={name} style={{'--i':i-3}} href={instagram} target="_blank" rel="noreferrer" aria-label={`See more of Hardik on Instagram — ${name}`}><img width={imageSizes[name]?.[0]} height={imageSizes[name]?.[1]} src={media(`${name}.webp`)} alt="A moment from Hardik’s life" loading="lazy"/></a>)}</div><a className="about-social-link" href={instagram} target="_blank" rel="noreferrer">@hardikk.singhh <Arrow/></a></section>
    <footer className="about-ending"><Signature/><h2>ALWAYS<br/><em>making more.</em></h2><div className="about-ending-layout"><nav aria-label="Continue exploring"><span className="about-kicker">KEEP EXPLORING</span><button onClick={()=>onNavigate('works')}>THE WORK <Arrow/></button><button onClick={()=>moveTo('about-story')}>THE STORY <Arrow/></button><button onClick={()=>onNavigate('contact')}>LET’S TALK <Arrow/></button></nav><div className="about-helmet"><img src={media('helmet.webp')} alt="Hardik wearing a black motorcycle helmet" loading="lazy"/><span>SEE YOU IN THE NEXT FRAME.</span></div><nav aria-label="Follow Hardik"><span className="about-kicker">ELSEWHERE</span><a href={instagram} target="_blank" rel="noreferrer">INSTAGRAM <Arrow/></a><a href={teaching} target="_blank" rel="noreferrer">HARDIK SAYS <Arrow/></a><a href="mailto:hardikvisuals.work@gmail.com">EMAIL ME <Arrow/></a></nav></div><div className="about-ending-bottom"><span>© {new Date().getFullYear()} HARDIK VISUALS</span><button onClick={()=>setMotion(!reduced)}>{reduced?'REDUCED MOTION':'FULL MOTION'} <span aria-hidden="true">↗</span></button><span>MADE WITH A LITTLE OBSESSION.</span></div></footer>
  </div></main>;
}

