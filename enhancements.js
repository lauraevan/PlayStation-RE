/* PlayStation-RE: visual accuracy & interaction extension.
   Uses the small, framework-free browser shell and Rockstar's public promotional media. */
"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const ROOT="https://www.rockstargames.com/VI/_next/static/media/";
  const IMAGE_CANDIDATES={
    cover:[
      ROOT+"Official_Cover_Art_landscape.12.uu2irr.2_a.jpg",
      ROOT+"Jason_Lucia_Lock_And_Load_With_Logos_landscape.13z.1pzvhq5dn.jpg",
      ROOT+"heroKeyArt.acb9b343.jpg"
    ],
    logo:[
      ROOT+"VIstack.fe9b0515.svg",
      ROOT+"vi.b9b99ab9.png"
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
    if(item.id==="gta6" && chosen.cover) item={...item,art:chosen.cover};
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
    const thumbnails=IMAGE_CANDIDATES.posters.map((src,i)=>'<a href="'+src+'" target="_blank" rel="noopener noreferrer" style="display:block;color:white;text-decoration:none"><img src="'+src+'" alt="Rockstar Games promotional image '+(i+1)+'" onerror="this.style.opacity=0.15" style="width:100%;height:100px;object-fit:cover;border-radius:5px"><small>Artwork '+(i+1)+'</small></a>').join("");
    openModal("Media Gallery",'<p>GTA VI official promotional artwork. Images may depend on the publisher website being available.</p><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">'+thumbnails+'</div><a class="gta-logo-link" href="https://www.rockstargames.com/VI/media/artwork-wallpapers" target="_blank" rel="noopener noreferrer">Browse the full official media library ↗</a>');
  }
  function discoverArt(){
    Promise.all([
      firstImage(IMAGE_CANDIDATES.cover),
      firstImage(IMAGE_CANDIDATES.logo)
    ]).then(([cover,logo])=>{
      chosen.cover=cover;chosen.logo=logo;
      const item=CATALOG.find(x=>x.id==="gta6");
      if(item&&cover){item.art=cover;ART.gta6=cover;}
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
