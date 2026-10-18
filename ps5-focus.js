"use strict";
/* Focus navigation and interaction fidelity for the PS5-inspired interface.
 * Preserves all existing game, library, scene and settings behavior.
 */
(() => {
  const $=id=>document.getElementById(id);
  const shell=$("console");
  if(!shell || !window.requestAnimationFrame)return;

  const focus={zone:"rail",action:0,top:0,card:0,library:0,options:0};
  const headers=()=>[$("gamesTab"),$("mediaTab"),$("searchBtn"),$("settingsBtn"),$("profileBtn")];
  const actions=()=>[$("gamePrimary"),$("gameMore")].filter(Boolean);
  const bottom=()=>Array.from($("bottomDetails").querySelectorAll("button"));
  const options=()=>Array.from($("optionsMenu").querySelectorAll(".menu-item"));
  const libraryButtons=()=>Array.from($("libraryGrid").querySelectorAll(".library-item"));
  const libraryFilters=()=>Array.from(document.querySelectorAll(".library-filters button"));

  function clearFocus() {
    shell.querySelectorAll(".ps-focused").forEach(el=>el.classList.remove("ps-focused"));
  }
  function highlight() {
    clearFocus();
    shell.dataset.navZone=focus.zone;
    if(state.modal || state.launch || state.story) return;
    if(state.control) return;
    if(state.options) {
      const entries=options();
      if(entries.length) entries[Math.max(0,Math.min(focus.options,entries.length-1))].classList.add("ps-focused");
      return;
    }
    if(state.library) {
      const entries=libraryButtons();
      if(entries.length) {
        focus.library=Math.min(focus.library,entries.length-1);
        entries[focus.library].classList.add("ps-focused");
        entries[focus.library].scrollIntoView({block:"nearest",inline:"nearest"});
      }
      return;
    }
    let target=null;
    if(focus.zone==="rail")target=$("gameRow").querySelector(".tile.selected");
    if(focus.zone==="header")target=headers()[focus.top];
    if(focus.zone==="action")target=actions()[focus.action]||actions()[0];
    if(focus.zone==="card")target=bottom()[focus.card]||bottom()[0];
    if(target)target.classList.add("ps-focused");
  }

  const previousRender=render;
  render=function() {
    previousRender();
    requestAnimationFrame(highlight);
  };
  const previousLibrary=openLibrary;
  openLibrary=function() {
    previousLibrary();
    focus.zone="library";focus.library=0;
    requestAnimationFrame(highlight);
  };
  const previousCloseLibrary=closeLibrary;
  closeLibrary=function() {
    previousCloseLibrary();
    focus.zone="rail";
    requestAnimationFrame(highlight);
  };
  const previousOptions=openOptions;
  openOptions=function() {
    previousOptions();
    if(state.options){focus.options=0;requestAnimationFrame(highlight);}
  };
  const previousCloseOptions=closeOptions;
  closeOptions=function() {
    previousCloseOptions();
    requestAnimationFrame(highlight);
  };
  const previousControlClose=closeControl;
  closeControl=function() {
    previousControlClose();
    requestAnimationFrame(highlight);
  };

  // Give the real PS5 overlay a compact "Recently created / activity" presentation.
  const cards=$("controlCenter").querySelector(".cc-cards");
  if(cards) {
    cards.innerHTML=[
      '<div class="cc-card cc-playing">',
      '<small>Recently created</small>',
      '<div class="cc-capture"><img src="./assets/gta-vi-cover.jpg" alt="Grand Theft Auto VI cover artwork"><span><strong>Grand Theft Auto VI</strong><small>Media Gallery · Concept</small></span></div>',
      '<span>Capture preview</span>',
      '</div>',
      '<div class="cc-card cc-activity"><small>Activities</small><strong>Continue playing</strong><span>Return to your last activity</span></div>',
      '<div class="cc-card cc-trophy"><small>Trophies</small><strong>12 <span>/ 48</span></strong><div class="cc-progress"><i></i></div><span>Concept progress</span></div>'
    ].join("");
  }

  // PS5 home interactions: DOWN enters a game hub, UP returns to the horizontal game rail.
  const beforeCommand=handleCommand;
  handleCommand=function(command) {
    if(state.launch || state.story || shell.querySelector(".scene-preview:not(.hidden)")) {
      beforeCommand(command);return;
    }
    if(state.modal || state.control){beforeCommand(command);return;}

    if(state.options){
      const entries=options();
      if(command==="back"){closeOptions();return;}
      if(command==="up"){focus.options=(focus.options+entries.length-1)%Math.max(1,entries.length);highlight();cue("navigate");return;}
      if(command==="down"){focus.options=(focus.options+1)%Math.max(1,entries.length);highlight();cue("navigate");return;}
      if(command==="confirm"){entries[focus.options]?.click();return;}
      return;
    }
    if(state.library){
      const entries=libraryButtons();
      const cell=entries[0];
      const width=cell?.getBoundingClientRect().width||160;
      const gap=parseFloat(getComputedStyle($("libraryGrid")).columnGap)||18;
      const cols=Math.max(1,Math.floor(($("libraryGrid").clientWidth+gap)/(width+gap)));
      if(command==="back"||command==="home"){beforeCommand(command);return;}
      if(command==="confirm"){entries[focus.library]?.click();return;}
      if(command==="left")focus.library=Math.max(0,focus.library-1);
      if(command==="right")focus.library=Math.min(entries.length-1,focus.library+1);
      if(command==="up")focus.library=Math.max(0,focus.library-cols);
      if(command==="down")focus.library=Math.min(entries.length-1,focus.library+cols);
      if(["left","right","up","down"].includes(command)){cue("navigate");highlight();}
      return;
    }
    if(command==="home"){beforeCommand(command);return;}
    if(command==="back"){
      if(focus.zone!=="rail"){focus.zone="rail";highlight();cue("back");return;}
      beforeCommand(command);return;
    }
    if(focus.zone==="rail"){
      if(command==="up"){focus.zone="header";focus.top=0;highlight();cue("navigate");return;}
      if(command==="down"){focus.zone="action";focus.action=0;highlight();cue("navigate");return;}
      if(command==="options"){openOptions();return;}
      if(command==="left"||command==="right"){beforeCommand(command);highlight();return;}
      if(command==="confirm"){beforeCommand(command);return;}
    }
    if(focus.zone==="header"){
      if(command==="down"){focus.zone="rail";highlight();cue("navigate");return;}
      if(command==="left"||command==="right"){focus.top=Math.max(0,Math.min(headers().length-1,focus.top+(command==="right"?1:-1)));highlight();cue("navigate");return;}
      if(command==="confirm"){headers()[focus.top]?.click();focus.zone="rail";highlight();return;}
      return;
    }
    if(focus.zone==="action"){
      if(command==="up"){focus.zone="rail";highlight();cue("navigate");return;}
      if(command==="down"){if(bottom().length){focus.zone="card";focus.card=0;highlight();cue("navigate");}return;}
      if(command==="left"||command==="right"){focus.action=Math.max(0,Math.min(actions().length-1,focus.action+(command==="right"?1:-1)));highlight();cue("navigate");return;}
      if(command==="confirm"){actions()[focus.action]?.click();return;}
      if(command==="options"){openOptions();return;}
    }
    if(focus.zone==="card"){
      if(command==="up"){focus.zone="action";highlight();cue("navigate");return;}
      if(command==="left"||command==="right"){focus.card=Math.max(0,Math.min(bottom().length-1,focus.card+(command==="right"?1:-1)));highlight();cue("navigate");return;}
      if(command==="confirm"){bottom()[focus.card]?.click();return;}
    }
    beforeCommand(command);
  };

  shell.addEventListener("pointerdown",event=>{
    const tile=event.target.closest(".tile");
    if(tile){focus.zone="rail";requestAnimationFrame(highlight);}
    else if(event.target.closest(".action-row")){focus.zone="action";focus.action=Math.max(0,actions().findIndex(b=>b===event.target.closest("button")));requestAnimationFrame(highlight);}
  },{passive:true});
  window.addEventListener("resize",()=>requestAnimationFrame(highlight),{passive:true});

  // Controller guidelines: circles for back and the PS button for Control Center.
  // The gamepad polling/keyboard mapping remains in app.js, so both use this focus model.
  focus.zone="rail";
  highlight();
})();