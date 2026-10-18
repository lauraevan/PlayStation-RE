/* Faithful PS5 home behavior: icon rail, focused labels, Welcome hub and Control Center. */
"use strict";
(() => {
 const $=id=>document.getElementById(id);
 const shell=$("console"),row=$("gameRow");
 if(!shell||!row)return;
 const glyphs={
   Home:'<path d="m3 11 9-8 9 8"/><path d="M5.5 10.3V21h13V10.3"/><path d="M10 21v-7h4v7"/>',
   Switcher:'<rect x="4" y="4" width="11" height="12" rx="1.8"/><path d="M9 20h11V9"/><path d="m17 6 4 0"/>',
   Notifications:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10Z"/><path d="M10 21h4"/>',
   "Game Base":'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3"/><path d="M17 7a3 3 0 0 1 0 6"/><path d="M17 15a5 5 0 0 1 4 5"/>',
   Music:'<path d="M10 19V5l11-2v14"/><ellipse cx="6" cy="19" rx="4" ry="2.5"/><ellipse cx="17" cy="17" rx="4" ry="2.5"/>',
   Downloads:'<path d="M12 3v12m-5-5 5 5 5-5"/><path d="M4 16v4h16v-4"/>',
   Sound:'<path d="M4 10h4l5-5v14l-5-5H4z"/><path d="M17 9a4 4 0 0 1 0 6"/><path d="M20 6a8 8 0 0 1 0 12"/>',
   Power:'<path d="M12 2v10"/><path d="M6.1 5.8a9 9 0 1 0 11.8 0"/>'
 };
 // Put the selection at the left of the icon rail, as on a PlayStation.
 function alignFocus(){
   if(state.library||state.story||state.launch)return;
   const selected=row.querySelector(".tile.selected");
   const caption=shell.querySelector(".focus-caption");
   if(!selected||!caption)return;
   const rowBounds=row.getBoundingClientRect();
   let selectedBounds=selected.getBoundingClientRect();
   const desired=Math.min(35,Math.max(13,row.clientWidth*.025));
   const offset=selectedBounds.left-rowBounds.left-desired;
   if(Math.abs(offset)>1)row.scrollLeft+=offset;
   selectedBounds=selected.getBoundingClientRect();
   const root=shell.getBoundingClientRect();
   caption.style.left=Math.round(selectedBounds.right-root.left+14)+"px";
   caption.style.top=Math.round(selectedBounds.bottom-root.top-29)+"px";
   caption.style.maxWidth=Math.max(130,window.innerWidth-(selectedBounds.right+28))+"px";
   caption.style.display=state.library?"none":"flex";
 }
 const rowBefore=renderRow;
 renderRow=function(){
   rowBefore();
   requestAnimationFrame(alignFocus);
 };
 row.addEventListener("scroll",()=>requestAnimationFrame(alignFocus),{passive:true});
 window.addEventListener("resize",()=>requestAnimationFrame(alignFocus),{passive:true});
 // Keep PS5 information along the bottom of the game hub, rather than on floating website badges.
 const infoBefore=renderInfo;
 renderInfo=function(item){
   infoBefore(item);
   if(item.installed){
     const panel=document.createElement("div");
     panel.className="trophy-hub";
     panel.innerHTML='<span class="trophy-hub-icon" aria-hidden="true">♛</span>'+
       '<div class="trophy-hub-info"><strong>Trophies</strong>'+
       '<div class="trophy-hub-track"><i></i></div>'+
       '<span>12 / 48 earned &nbsp; · &nbsp; 25%</span></div>';
     $("bottomDetails").appendChild(panel);
   }
 };
 // Replace the placeholder glyph Control Center symbols with crisp, properly sized console icons.
 renderControl=function(){
   const list=$("ccActions");list.replaceChildren();
   CC_ACTIONS.forEach((entry,index)=>{
     const button=document.createElement("button");
     button.type="button";button.className="cc-action";
     button.setAttribute("aria-label",entry.label);
     button.setAttribute("title",entry.label);
     button.innerHTML='<span><svg viewBox="0 0 24 24" aria-hidden="true">'+(glyphs[entry.label]||glyphs.Home)+'</svg></span>'+entry.label;
     button.addEventListener("click",entry.action);
     list.appendChild(button);
   });
 };
 let ccIndex=0;
 function highlightCC(){
   Array.from($("ccActions").children).forEach((button,index)=>{
     button.classList.toggle("focused",index===ccIndex);
     button.setAttribute("aria-current",index===ccIndex?"true":"false");
   });
 }
 const controlBefore=openControl;
 openControl=function(){controlBefore();ccIndex=0;highlightCC();};
 const commandsBefore=handleCommand;
 handleCommand=function(command){
   if(state.control){
     if(command==="back"||command==="home"){closeControl();return;}
     if(command==="left"||command==="right"){
       ccIndex=(ccIndex+(command==="right"?1:-1)+CC_ACTIONS.length)%CC_ACTIONS.length;
       highlightCC();cue("navigate");return;
     }
     if(command==="confirm"){const item=$("ccActions").children[ccIndex];if(item)item.click();return;}
     return;
   }
   commandsBefore(command);
 };
 // Keyboard selector shortcuts still operate through the existing gamepad and keyboard input layer.
 const welcome=document.createElement("section");
 welcome.className="welcome-dashboard";
 welcome.setAttribute("aria-label","Welcome hub");
 welcome.innerHTML=[
  '<div class="welcome-banner"><small>WELCOME BACK</small><h1>Welcome</h1></div>',
  '<div class="welcome-widgets">',
  '<button class="welcome-widget welcome-recent" data-dashboard="recent"><small>◉ Recently played</small><strong>Grand Theft Auto VI</strong><span>Continue where you left off</span></button>',
  '<button class="welcome-widget welcome-trophy" data-dashboard="trophies"><small>♛ Trophies</small><strong>12 <em>/ 48</em></strong><span>25% completion</span></button>',
  '<button class="welcome-widget welcome-friends" data-dashboard="friends"><small>● Online friends</small><strong>0 online</strong><span>See your friends and parties</span></button>',
  '<button class="welcome-widget welcome-store" data-dashboard="store"><small>▣ PlayStation Store</small><strong>Discover</strong><span>Browse PlayStation titles</span></button>',
  '<button class="welcome-widget welcome-storage" data-dashboard="storage"><small>▤ Console storage</small><strong>Free space</strong><span class="storage-track"><i></i></span><span>Available space · Demo</span></button>',
  '</div>'
 ].join("");
 $("homePanel").append(welcome);
 welcome.addEventListener("click",event=>{
   const b=event.target.closest("button[data-dashboard]");if(!b)return;
   const id=b.dataset.dashboard;
   if(id==="recent"){select("gta6");return;}
   if(id==="store"){select("store");return;}
   if(id==="trophies"){openModal("Trophies",'<p>Your trophy progress is an illustrative value in this demo.</p>');return;}
   if(id==="friends"){openModal("Game Base",'<p>No connected friends. Online features are not connected.</p>');return;}
   if(id==="storage"){openModal("Storage",'<p>Storage capacity and available space are simulated for this UI concept.</p>');}
 });
 const oldRender=render;
 render=function(){
   oldRender();
   const visible=state.tab==="games"&&state.selected==="welcome";
   shell.classList.toggle("welcome-active",visible);
   requestAnimationFrame(alignFocus);
 };
 // Keep the scene visibly marked as a concept, even in fullscreen.
 render();
})();
