/* PlayStation-RE: visual accuracy & interaction extension.
   Uses the small, framework-free browser shell and Rockstar's public promotional media. */
"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const ROOT="https://www.rockstargames.com/VI/_next/static/media/";
  const IMAGE_CANDIDATES={
    cover:[
      "./assets/gta-vi-cover.jpg",
      "https://blog.zh-hant.playstation.com/tachyon/sites/8/2026/06/cd149a81d72b805918215f472544c9b320667327.jpg",
      ROOT+"Official_Cover_Art_landscape.12.uu2irr.2_a.jpg",
      ROOT+"Jason_Lucia_Lock_And_Load_With_Logos_landscape.13z.1pzvhq5dn.jpg",
      ROOT+"heroKeyArt.acb9b343.jpg"
    ],
    logo:[
      "./assets/gta-vi-logo.png",
      "https://crystalpng.com/wp-content/uploads/2025/02/gta-6-logo-03.png",
      ROOT+"VIstack.fe9b0515.svg",
      ROOT+"vi.b9b99ab9.png"
    ],
    hero:[
      "./assets/gta-vi-hero.webp",
      "https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_Beach_landscape.0419q._86ukpt.jpg",
      "https://assets.games.gg/gta_6_confirmed_guns_trailers_screenshots_hero_72646daa1c.webp"
    ],
    posters:[
      ROOT+"Jason_Lucia_Lock_And_Load_With_Logos_landscape.13z.1pzvhq5dn.jpg",
      ROOT+"Official_Cover_Art_landscape.12.uu2irr.2_a.jpg",
      ROOT+"Vice_City_02.1c840675.jpg",
      ROOT+"Lucia_Caminos_01.f5023e0f.jpg",
      ROOT+"Jason_Duval_02.c2f33c0d.jpg",
      ROOT+"Hero_BG.d0b73d7a.jpg"
    ]
  };
  const chosen={};
  const ASTRO_COVER="https://image.api.playstation.com/vulcan/ap/rnd/202406/0500/80ecf657918558eeef8da3ee4cef326e4517d34e6c69d950.jpg";
  const artOverrides=[
    {id:"astro",url:ASTRO_COVER},
    {id:"spider",url:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2651280/library_hero.jpg"}
  ];
  artOverrides.forEach(({id,url})=>{
    const game=CATALOG.find(g=>g.id===id);
    if(game)game.art=url;
  });
  function firstImage(list){
    return new Promise(resolve=>{
      function next(index){
        if(index>=list.length){resolve(null);return;}
        const image=new Image();image.decoding="async";
        image.onload=()=>resolve(list[index]);
        image.onerror=()=>next(index+1);
        image.src=list[index];
      }
      next(0);
    });
  }
  const caption=document.createElement("div");
  caption.className="focus-caption";
  caption.setAttribute("aria-hidden","true");
  $("gameRow").after(caption);
  function updateFocusCaption(){
    const row=$("gameRow"),selectedTile=row.querySelector(".tile.selected");
    if(!selectedTile){caption.style.display="none";return;}
    caption.style.display="flex";
    const item=getSelected();
    caption.replaceChildren();
    if(item.installed){
      const system=document.createElement("span");system.className="focus-platform";system.textContent="PS5";caption.append(system);
    }
    const title=document.createElement("span");title.textContent=item.name;caption.append(title);
    const bounds=selectedTile.getBoundingClientRect();
    const root=$("console").getBoundingClientRect();
    caption.style.left=Math.max(18,bounds.left-root.left)+"px";
    caption.style.top=(bounds.bottom-root.top+12)+"px";
  }
  const originalRenderRow=renderRow;
  renderRow=function(){originalRenderRow();updateFocusCaption();};
  const originalRenderHeading=renderHeading;
  renderHeading=function(item){
    originalRenderHeading(item);
    if(item.id==="gta6" && chosen.logo){
      const logo=document.createElement("img");
      logo.src=chosen.logo;logo.alt="Grand Theft Auto VI";
      logo.className="real-gta-logo";
      logo.onerror=()=>logo.remove();
      $("gameHeading").prepend(logo);
      const fallback=$("gameHeading").querySelector(".brand-gta");
      logo.onload=()=>{if(fallback)fallback.style.display="none";};
    }
  };
  const originalRenderInfo=renderInfo;
  renderInfo=function(item){
    originalRenderInfo(item);
    const description=$("gameInfo").querySelector(".game-description");
    if(item.id==="gta6"&&description)description.textContent="Vice City, USA.";
    const text=$("bottomDetails").querySelector(".tiny-prompt");
    if(text)text.textContent=item.installed?"PS5":"";
    const info=$("bottomDetails").querySelector(".activity-copy span");
    if(info)info.textContent="Resume activity";
  };
  const originalSetImage=setImage;
  setImage=function(item){
    if(item.id==="gta6" && (chosen.hero||chosen.cover)) item={...item,art:chosen.hero||chosen.cover};
    originalSetImage(item);
  };
  const originalActivate=activate;
  activate=function(item){
    if(item.id==="welcome"){welcome();return;}
    if(item.installed&&item.id!=="gta6"){
      openModal(item.name,'<p>This title is shown for console navigation accuracy. Only the GTA VI mock launch has a simulated scene.</p><div class="setting"><span>Platform</span><span>PS5</span></div><div class="setting"><span>Status</span><span>Not connected to game executable</span></div>');
      return;
    }
    if(item.id==="gallery"){gallery();return;}
    originalActivate(item);
  };
  function welcome(){
    openModal("Welcome",'<p>Good to see you again, '+escapeHtml(state.profile)+'.</p><div class="activity-card-grid">'+
    '<article><small>◉ Friends</small><strong>Online Friends</strong><span>0 online</span></article>'+
    '<article><small>★ Trophies</small><strong>Level 12</strong><span>Recent achievements</span></article>'+
    '<article><small>▣ PlayStation Store</small><strong>Latest Games</strong><span>Discover something new</span></article>'+
    '<article><small>◷ Activities</small><strong>Recent Activity</strong><span>Resume where you left off</span></article></div>');
  }
  function gallery(){
    const thumbnails=[chosen.cover,chosen.hero,...IMAGE_CANDIDATES.posters].filter(Boolean).map((src,i)=>'<a href="'+src+'" target="_blank" rel="noopener noreferrer" style="display:block;color:white;text-decoration:none"><img src="'+src+'" alt="Rockstar Games promotional image '+(i+1)+'" onerror="this.style.opacity=0.15" style="width:100%;height:100px;object-fit:cover;border-radius:5px"><small>Artwork '+(i+1)+'</small></a>').join("");
    openModal("Media Gallery",'<p>GTA VI official promotional artwork. Images may depend on the publisher website being available.</p><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">'+thumbnails+'</div><a class="gta-logo-link" href="https://www.rockstargames.com/VI/media/artwork-wallpapers" target="_blank" rel="noopener noreferrer">Browse the full official media library ↗</a>');
  }
  async function discoverArt(){
    try{
      const response=await fetch("./assets/local-art.json",{cache:"no-store"});
      if(response.ok){
        const local=await response.json();
        if(local.cover) IMAGE_CANDIDATES.cover.unshift(local.cover);
        if(local.logo) IMAGE_CANDIDATES.logo.unshift(local.logo);
        if(local.hero) IMAGE_CANDIDATES.hero.unshift(local.hero);
      }
    }catch{}

    Promise.all([
      firstImage(IMAGE_CANDIDATES.cover),
      firstImage(IMAGE_CANDIDATES.logo),
      firstImage(IMAGE_CANDIDATES.hero)
    ]).then(([cover,logo,hero])=>{
      chosen.cover=cover;chosen.logo=logo;chosen.hero=hero;
      if(hero){document.documentElement.style.setProperty("--gta-hero", 'url("'+hero.replace(/"/g,"%22")+'")');}
      const item=CATALOG.find(x=>x.id==="gta6");
      if(item&&cover){item.art=cover;ART.gta6=cover;}
      if(item&&hero){chosen.hero=hero;}
      if(logo){
        const storyMark=document.querySelector(".story-wordmark");
        if(storyMark && !storyMark.querySelector("img")){
          const storyLogo=document.createElement("img");storyLogo.src=logo;storyLogo.alt="Grand Theft Auto VI";
          storyLogo.className="story-logo-art";storyMark.replaceChildren(storyLogo);
        }
        const loadingMark=document.querySelector(".giant-vi");
        if(loadingMark && !document.querySelector(".launch-logo-art")){
          const launchLogo=document.createElement("img");launchLogo.src=logo;launchLogo.alt="Grand Theft Auto VI";
          launchLogo.className="launch-logo-art";loadingMark.replaceWith(launchLogo);
          const word=document.querySelector(".loading-title");if(word)word.remove();
        }
      }
      render();
    }).catch(()=>{});
  }
  const originalCloseLibrary=closeLibrary;
  closeLibrary=function(){originalCloseLibrary();setTimeout(updateFocusCaption,0);};
  window.addEventListener("resize",()=>requestAnimationFrame(updateFocusCaption),{passive:true});
  document.addEventListener("fullscreenchange",()=>setTimeout(updateFocusCaption,100));
  // Native-like focus feedback using tiny procedural beeps. No system audio extracted.
  let audioCtx=null;
  function tick(type){
    if(state.mute)return;
    try{
      const Context=window.AudioContext||window.webkitAudioContext;
      if(!Context)return;
      audioCtx=audioCtx||new Context();
      const osc=audioCtx.createOscillator(),volume=audioCtx.createGain();
      osc.type="sine";osc.frequency.value=type==="select"?560:660;
      volume.gain.value=0.012;
      osc.connect(volume);volume.connect(audioCtx.destination);
      osc.start();volume.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.043);
      osc.stop(audioCtx.currentTime+.05);
    }catch{}
  }
  let lastFocus=state.selected;
  const originalSelect=select;
  select=function(id){
    const prior=state.selected;originalSelect(id);
    if(state.selected!==prior){tick("focus");lastFocus=state.selected;}
  };
  $("gameRow").addEventListener("click",()=>{if(lastFocus!==state.selected)tick("focus");});
  document.querySelectorAll(".utilities button,.tab").forEach(button=>button.addEventListener("click",()=>tick("select")));
  // Hide the focus caption while the library is open.
  const originalOpenLibrary=openLibrary;
  openLibrary=function(){originalOpenLibrary();caption.style.display="none";};
  // Loading a local title is a prop only. Nothing is downloaded or executed.
  if(typeof window!=="undefined"){
    document.addEventListener("contextmenu",e=>{
      if(e.target.closest?.(".tile")){
        e.preventDefault();
        const tile=e.target.closest(".tile");
        const item=getList().find(x=>x.id===tile.dataset.id);
        if(item){select(item.id);openOptions();}
      }
    });
  }
  render();
  discoverArt();
})();
