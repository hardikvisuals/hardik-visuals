import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
export function createAboutMotion(root, reduced) {
  let alive=true,velocity=0,marqueeX=0,direction=1,ripple=null;
  const content=root.querySelector('.about-content');
  const lenis=reduced?null:new Lenis({wrapper:root,content,autoRaf:false,lerp:0.09,smoothWheel:true,syncTouch:false});
  lenis?.on('scroll',event=>{velocity=Math.max(-24,Math.min(24,event.velocity));if(Math.abs(event.velocity)>.1)direction=event.direction;ScrollTrigger.update();});
  const cursor=root.querySelector('.about-pointer');
  const pointer={x:-100,y:-100,rx:-100,ry:-100};
  const move=e=>{pointer.x=e.clientX;pointer.y=e.clientY;if(cursor)cursor.dataset.active=Boolean(e.target.closest('a,button,img,video'));};
  if(!reduced&&matchMedia('(pointer:fine)').matches)root.addEventListener('pointermove',move);
  const band=root.querySelector('.about-marquee-track');
  let bandWidth=band?.scrollWidth/2||0;
  // All continuous About motion shares GSAP's ticker, including smooth scroll.
  const tick=(time,delta)=>{
    if(document.hidden)return;
    lenis?.raf(time*1000);
    const dt=Math.min(delta/16.667,3);velocity*=Math.pow(.9,dt);
    if(band&&!reduced){marqueeX-=direction*(.3+Math.abs(velocity)*.045)*dt;if(marqueeX<-bandWidth)marqueeX=0;if(marqueeX>0)marqueeX=-bandWidth;gsap.set(band,{x:marqueeX});}
    if(cursor&&!reduced){pointer.rx+=(pointer.x-pointer.rx)*.32;pointer.ry+=(pointer.y-pointer.ry)*.32;cursor.style.transform=`translate3d(${pointer.rx}px,${pointer.ry}px,0)`;}
    ripple?.tick(time,velocity);
  };
  if(!reduced)gsap.ticker.add(tick);
  const ctx=gsap.context(()=>{
    if(reduced)return;
    const signature=gsap.timeline({scrollTrigger:{trigger:'.about-opening',scroller:root,start:'top top',end:'bottom bottom',scrub:1.1}});
    signature.to('.about-hero-photo',{scale:1.09,yPercent:-5,duration:3,ease:'none'},0).to('.about-hero-line.top',{xPercent:-12,duration:3,ease:'none'},0).to('.about-hero-line.bottom',{xPercent:12,duration:3,ease:'none'},0);
    gsap.to('.about-progress',{scaleX:1,ease:'none',scrollTrigger:{trigger:content,scroller:root,start:'top top',end:'bottom bottom',scrub:true}});
    root.querySelectorAll('[data-parallax]').forEach(el=>gsap.fromTo(el,{y:25},{y:-Number(el.dataset.parallax)*.65,ease:'none',scrollTrigger:{trigger:el,scroller:root,start:'top bottom',end:'bottom top',scrub:1}}));
    gsap.from('.about-dual .artist-face',{xPercent:-16,opacity:.4,ease:'none',scrollTrigger:{trigger:'.about-dual',scroller:root,start:'top bottom',end:'center center',scrub:1}});
    gsap.from('.about-dual .athlete-face',{xPercent:16,opacity:.4,ease:'none',scrollTrigger:{trigger:'.about-dual',scroller:root,start:'top bottom',end:'center center',scrub:1}});
    root.querySelectorAll('.about-fan-card').forEach((el,i)=>gsap.from(el,{y:100,opacity:0,duration:.8,delay:i*.06,ease:'power3.out',scrollTrigger:{trigger:'.about-social',scroller:root,start:'top 75%',once:true}}));
    root.querySelectorAll('.about-introduction>div>span,.about-stats>div').forEach((el,i)=>gsap.from(el,{y:24,opacity:0,duration:.65,delay:i*.09,ease:'power3.out',scrollTrigger:{trigger:el.parentElement,scroller:root,start:'top 88%',once:true}}));
    if(matchMedia('(min-width: 900px)').matches){const strip=root.querySelector('.about-interest-grid');gsap.to(strip,{x:()=>-Math.max(0,strip.scrollWidth-root.clientWidth*.88),ease:'none',scrollTrigger:{trigger:'.about-interests',scroller:root,start:'top top',end:()=>`+=${Math.max(root.clientWidth,strip.scrollWidth-root.clientWidth*.88)}`,scrub:1,pin:true,anticipatePin:1,invalidateOnRefresh:true}});}
  },root);
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const el=entry.target;
    if(!reduced)ctx.add(()=>{if(el.matches('.about-photo')){gsap.fromTo(el.querySelector('img,video'),{scale:1.07,opacity:.5},{scale:1,opacity:1,duration:1,ease:'power3.out'});}else gsap.fromTo(el,{y:20,opacity:0},{y:0,opacity:1,duration:.75,ease:'power3.out'});});
    observer.unobserve(el);
  }),{root,threshold:.12});
  root.querySelectorAll('[data-reveal],.about-interest-grid>.about-photo').forEach(el=>observer.observe(el));
  if(!reduced&&matchMedia('(min-width: 900px) and (pointer:fine)').matches)import('./aboutRipple.js').then(({createAboutRipple})=>{if(alive)ripple=createAboutRipple(root.querySelector('.collage-centre>.about-photo'),root);}).catch(()=>{});
  let refreshTimer;const refresh=()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>{if(alive){bandWidth=band?.scrollWidth/2||0;lenis?.resize();ScrollTrigger.refresh();}},180);};refresh();
  root.querySelectorAll('img').forEach(img=>img.addEventListener('load',refresh));document.fonts.ready.then(refresh);
  const resize=new ResizeObserver(()=>lenis?.resize());resize.observe(content);
  return {scrollTo:el=>lenis?lenis.scrollTo(el,{offset:-95,duration:1.1}):el.scrollIntoView({behavior:'instant'}),destroy(){alive=false;clearTimeout(refreshTimer);gsap.ticker.remove(tick);observer.disconnect();resize.disconnect();root.removeEventListener('pointermove',move);ripple?.destroy();lenis?.destroy();ctx.revert();root.querySelectorAll('img').forEach(img=>img.removeEventListener('load',refresh));}};
}
