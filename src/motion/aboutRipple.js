import * as THREE from 'three';
export function createAboutRipple(figure,root){
 const img=figure?.querySelector('img');if(!img)return null;
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});}catch{return null;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const canvas=renderer.domElement;canvas.className='about-ripple';canvas.setAttribute('aria-hidden','true');figure.appendChild(canvas);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,2);camera.position.z=1;
 const uniforms={map:{value:null},strength:{value:0},time:{value:0},pointer:{value:new THREE.Vector2(.5,.5)}};
 const material=new THREE.ShaderMaterial({uniforms,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`uniform sampler2D map;uniform float strength;uniform float time;uniform vec2 pointer;varying vec2 vUv;
 void main(){vec2 uv=vUv;float d=distance(uv,pointer);float ripple=sin(d*24.-time*1.6)*exp(-d*5.)*strength;uv+=vec2(ripple,ripple*.55);gl_FragColor=texture2D(map,clamp(uv,.002,.998));
 #include <colorspace_fragment>
 }`});
 const geometry=new THREE.PlaneGeometry(2,2);scene.add(new THREE.Mesh(geometry,material));
 let visible=false,disposed=false,texture=null,hover=false;
 function load(){if(texture||!img.complete||!img.naturalWidth)return;texture=new THREE.Texture(img);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;uniforms.map.value=texture;}
 const resize=()=>{const r=img.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);canvas.style.height=`${r.height}px`;};
 const ro=new ResizeObserver(resize);ro.observe(img);resize();
 const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)load();},{root,rootMargin:'100px'});io.observe(figure);
 const move=e=>{const r=img.getBoundingClientRect();uniforms.pointer.value.set((e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height);hover=true;};
 const leave=()=>{hover=false;};figure.addEventListener('pointermove',move);figure.addEventListener('pointerleave',leave);img.addEventListener('load',load);
 return {tick(t,v){if(!visible||disposed||!texture||document.hidden)return;if(Math.abs(v)<.03&&!hover&&Math.abs(uniforms.strength.value)<.0001)return;uniforms.time.value=t;uniforms.strength.value+=(Math.min(.009,Math.abs(v)*.00035)+(hover?.002:0)-uniforms.strength.value)*.1;renderer.render(scene,camera);},destroy(){disposed=true;io.disconnect();ro.disconnect();figure.removeEventListener('pointermove',move);figure.removeEventListener('pointerleave',leave);img.removeEventListener('load',load);texture?.dispose();geometry.dispose();material.dispose();renderer.dispose();canvas.remove();}};
}
