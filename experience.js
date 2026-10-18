/* PlayStation-RE: local artwork transitions and interactive fictional scene.
   This is interface art, not an executable GTA VI game. */
"use strict";
(() => {
 const $=id=>document.getElementById(id);
 const shell=$("console"),hero=$("heroArt"),story=$("storyOverlay");
 if(!shell||!hero||!story)return;
 const layers=[document.createElement("div"),document.createElement("div")];
 layers.forEach((el,index)=>{
   el.className="hero-frame";el.dataset.frame=String(index);hero.appendChild(el);
 });
 let active=0,lastUrl="",version=0;
 function crossfade(url){
   const rev=++version;
   if(!url){lastUrl="";layers.forEach(el=>el.classList.remove("active"));return;}
   if(lastUrl===url)return;
   const image=new Image();image.decoding="async";
   image.onload=()=>{
     if(rev!==version)return;
     const next=1-active;
     layers[next].style.backgroundImage='url("'+url.replaceAll('"',"%22")+'")';
     layers[next].classList.add("active");
     layers[active].classList.remove("active");
     active=next;lastUrl=url;
   };
   image.onerror=()=>{if(rev===version){lastUrl="";layers.forEach(el=>el.classList.remove("active"));}};
   image.src=url;
 }
 const priorImage=setImage;
 setImage=function(item){
   priorImage(item);
   crossfade(item.id==="gta6"?"./assets/gta-vi-hero.webp":(item.art||""));
 };
 const priorHeading=renderHeading;
 renderHeading=function(item){
   priorHeading(item);
   if(item.id==="gta6"){
     const logo=$("gameHeading").querySelector(".real-gta-logo");
     if(logo){logo.src="./assets/gta-vi-logo.png";logo.decoding="async";}
   }
 };
 const touch=document.createElement("nav");
 touch.className="touch-console";touch.setAttribute("aria-label","Touch console controls");
 touch.innerHTML='<button type="button" data-control="left" aria-label="Previous game">‹</button>'+
 '<button type="button" data-control="right" aria-label="Next game">›</button>'+
 '<button type="button" data-control="confirm" class="touch-select" aria-label="Select">✕</button>'+
 '<button type="button" data-control="back" aria-label="Back">◯</button>'+
 '<button type="button" data-control="home" class="touch-ps" aria-label="Control Center">PS</button>';
 shell.appendChild(touch);
 touch.addEventListener("click",event=>{
   const button=event.target.closest("button[data-control]");
   if(button)handleCommand(button.dataset.control);
 });
 const preview=document.createElement("section");
 preview.id="scenePreview";
 preview.className="scene-preview hidden";
 preview.setAttribute("aria-hidden","true");
 preview.setAttribute("aria-label","Fictional Vice City interactive scene");
 preview.innerHTML=[
  '<div class="scene-backdrop"></div>',
  '<div class="scene-overlay">',
  '<div class="scene-top"><div class="scene-location">',
  '<span class="scene-label">Leonida · Vice City</span>',
  '<h1 class="scene-heading" id="sceneTitle">Ocean Drive</h1>',
  '<span class="scene-chapter" id="sceneChapter">CHAPTER 01 — SUNSET</span>',
  '</div><div class="scene-status"><strong>VICE CITY</strong>8:42 PM · Sunset',
  '<p>Free-roam scene concept</p></div></div>',
  '<div class="scene-bottom"><div class="scene-radar" aria-label="Illustrative minimap"></div>',
  '<div class="scene-subtitles" id="sceneSubtitle" aria-live="polite">Welcome to Vice City.</div>',
  '<div class="scene-hud"><strong>Scene preview</strong><kbd>←</kbd> <kbd>→</kbd> Move camera',
  '<p><kbd>✕</kbd> Next scene<br><kbd>P</kbd> Pause</p></div></div>',
  '</div>',
  '<span class="scene-demo">FAN-MADE INTERACTIVE SCENE · NOT GTA VI GAMEPLAY</span>',
  '<div class="scene-pause"><div class="scene-pause-card">',
  '<small>GRAND THEFT AUTO VI · CONCEPT</small><h2>Paused</h2>',
  '<button type="button" id="sceneResume">Resume Scene</button>',
  '<button type="button" id="sceneRestart">Restart Scene</button>',
  '<button type="button" id="sceneReturn">Return to Story Menu</button>',
  '<p>This demo uses promotional artwork and interactive UI only. It is not a playable copy of GTA VI.</p>',
  '</div></div>'
 ].join("");
 shell.appendChild(preview);
 const frames=[
  {heading:"Ocean Drive",chapter:"CHAPTER 01 — SUNSET",subtitle:"Welcome to Vice City. Every street has a story.",pan:0,tilt:0},
  {heading:"Leonida Keys",chapter:"CHAPTER 02 — AFTER HOURS",subtitle:"The horizon is all yours.",pan:-37,tilt:3},
  {heading:"Vice City",chapter:"CHAPTER 03 — THE LONG WAY HOME",subtitle:"The city never really sleeps.",pan:32,tilt:-4},
  {heading:"Sunset Run",chapter:"CHAPTER 04 — GOLDEN HOUR",subtitle:"One more ride into the night.",pan:-13,tilt:6}
 ];
 let current=0,playing=false,paused=false,timer=null;
 function showFrame(value){
   current=(value+frames.length)%frames.length;
   const f=frames[current];
   $("sceneTitle").textContent=f.heading;
   $("sceneChapter").textContent=f.chapter;
   $("sceneSubtitle").textContent=f.subtitle;
   preview.style.setProperty("--pan",f.pan+"px");
   preview.style.setProperty("--tilt",f.tilt+"px");
 }
 function stopClock(){if(timer)clearInterval(timer);timer=null;}
 function startClock(){
   stopClock();
   timer=setInterval(()=>{if(playing&&!paused)showFrame(current+1);},8000);
 }
 function pause(value){
   if(!playing)return;
   paused=!!value;
   preview.classList.toggle("scene-paused",paused);
   if(paused)stopClock();else startClock();
 }
 function start(){
   if(state.launch)return;
   state.story=false;show(story,false);
   playing=true;paused=false;
   preview.classList.remove("hidden","scene-paused");
   preview.setAttribute("aria-hidden","false");
   showFrame(0);startClock();
 }
 function returnToStory(){
   stopClock();playing=false;paused=false;
   preview.classList.add("hidden");preview.setAttribute("aria-hidden","true");
   state.story=true;show(story,true);
 }
 $("sceneResume").addEventListener("click",()=>pause(false));
 $("sceneRestart").addEventListener("click",()=>{showFrame(0);pause(false);});
 $("sceneReturn").addEventListener("click",returnToStory);
 // Run in the capture phase ahead of the original "gameplay isn't included" toast.
 $("continueBtn").addEventListener("click",event=>{event.stopImmediatePropagation();start();},true);
 const oldCommand=handleCommand;
 handleCommand=function(command){
   if(playing){
     if(command==="back"||command==="home"||command==="options"){pause(!paused);return;}
     if(paused){if(command==="confirm")pause(false);return;}
     if(command==="left"){showFrame(current-1);startClock();return;}
     if(["right","confirm","up","down"].includes(command)){showFrame(current+1);startClock();return;}
     return;
   }
   oldCommand(command);
 };
 const oldBack=goBack;
 goBack=function(){if(playing){pause(!paused);return;}oldBack();};
 preview.addEventListener("pointermove",event=>{
   if(!playing||paused||event.pointerType==="touch")return;
   const dx=(event.clientX/window.innerWidth-.5)*18;
   const dy=(event.clientY/window.innerHeight-.5)*9;
   preview.style.setProperty("--pan",(frames[current].pan+dx)+"px");
   preview.style.setProperty("--tilt",(frames[current].tilt+dy)+"px");
 },{passive:true});
 document.addEventListener("visibilitychange",()=>{if(document.hidden&&playing)pause(true);});
 let downX=null;
 preview.addEventListener("touchstart",event=>{
   if(playing&&!paused)downX=event.changedTouches[0]?.clientX??null;
 },{passive:true});
 preview.addEventListener("touchend",event=>{
   if(downX===null||paused)return;
   const dx=(event.changedTouches[0]?.clientX??downX)-downX;
   downX=null;
   if(Math.abs(dx)>45){showFrame(current+(dx<0?1:-1));startClock();}
 },{passive:true});
 const game=CATALOG.find(entry=>entry.id==="gta6");
 if(game)game.art="./assets/gta-vi-cover.jpg";
 render();
})();
