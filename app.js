"use strict";

const ART = Object.assign({
  gta6: "https://www.rockstargames.com/VI/_next/static/media/Official_Cover_Art_landscape.12.uu2irr.2_a.jpg?akim=1&imdensity=1&imwidth=1920",
  gta6_alt: "https://www.rockstargames.com/VI/_next/static/media/Jason_Lucia_Lock_And_Load_With_Logos_landscape.13z.1pzvhq5dn.jpg?akim=1&imdensity=1&imwidth=1920",
  gta5: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/library_hero.jpg",
  spider: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_hero.jpg",
  ghost: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/library_hero.jpg"
}, window.PSRE_ASSETS || {});

const CATALOG = [
  {id:"store",name:"PlayStation Store",tagline:"Discover your next adventure",description:"Browse new releases, great games, and incredible stories.",theme:"store",symbol:"<div class='tile-store'>▣<span>STORE</span></div>",gradient:"linear-gradient(135deg,#092b62,#1979cc)",action:"Explore"},
  {id:"welcome",name:"Welcome",tagline:"Good afternoon",description:"Continue playing, discover what's new, and make yourself at home.",theme:"welcome",symbol:"<div class='tile-welcome'>△ ◯<br>✕ □</div>",gradient:"linear-gradient(135deg,#19234b,#344678)",action:"Explore"},
  {id:"gta6",name:"Grand Theft Auto VI",tagline:"Grand Theft Auto VI",description:"Welcome to Leonida, home to the neon-soaked streets of Vice City and beyond.",theme:"gta6",symbol:"<div class='tile-vi'><small>grand<br>theft<br>auto</small>VI</div>",gradient:"linear-gradient(135deg,#ffbf9c,#ea7ea9 48%,#6959aa)",art:ART.gta6,action:"Play Game",installed:true},
  {id:"gta5",name:"Grand Theft Auto V",tagline:"Grand Theft Auto V",description:"Step back into Los Santos and the world of Grand Theft Auto V.",theme:"gta5",symbol:"<div class='tile-gta5'>grand<br>theft<br>auto<b>V</b></div>",gradient:"linear-gradient(135deg,#789475,#2a513f)",art:ART.gta5,action:"Play Game",installed:true},
  {id:"astro",name:"ASTRO BOT",tagline:"ASTRO BOT",description:"Join ASTRO on an incredible adventure through imaginative worlds.",theme:"astro",symbol:"<div class='tile-astro'>✦</div>",gradient:"linear-gradient(135deg,#7bd2ff,#1251a0)",action:"Play Game",installed:true},
  {id:"spider",name:"Marvel's Spider-Man 2",tagline:"Marvel's Spider-Man 2",description:"Swing into New York City with two iconic Spider-Men.",theme:"spider",symbol:"<div class='tile-spider'>SPIDER<br>MAN 2</div>",gradient:"linear-gradient(135deg,#cf2b3f,#191e45)",art:ART.spider,action:"Play Game",installed:true},
  {id:"ghost",name:"Ghost of Tsushima",tagline:"Ghost of Tsushima",description:"A journey across Tsushima. Honor the samurai, embrace the ghost.",theme:"ghost",symbol:"<div class='tile-ghost'>GHOST OF<br>TSUSHIMA</div>",gradient:"linear-gradient(135deg,#758585,#242d31)",art:ART.ghost,action:"Play Game",installed:true},
  {id:"library",name:"Game Library",tagline:"Game Library",description:"All your games and applications in one place.",theme:"library",symbol:"<div class='tile-library'>▦</div>",gradient:"linear-gradient(135deg,#132049,#44619a)",action:"View Library"}
];
const MEDIA = [
  {id:"gallery",name:"Media Gallery",tagline:"Media Gallery",description:"Screenshots, captured moments, and clips.",theme:"media",symbol:"<div class='tile-library'>▧</div>",gradient:"linear-gradient(135deg,#274a7b,#161938)",action:"Open"},
  {id:"music",name:"Music",tagline:"Music",description:"Your playlists and favorite tracks.",theme:"media",symbol:"<div class='tile-library'>♫</div>",gradient:"linear-gradient(135deg,#1c8b78,#0e3756)",action:"Open"},
  {id:"streaming",name:"TV & Video",tagline:"TV & Video",description:"Entertainment and streaming on your console.",theme:"media",symbol:"<div class='tile-library'>▷</div>",gradient:"linear-gradient(135deg,#53327d,#11142d)",action:"Open"},
  {id:"library",name:"Media Library",tagline:"Media Library",description:"Browse all of your media apps.",theme:"library",symbol:"<div class='tile-library'>▦</div>",gradient:"linear-gradient(135deg,#19335f,#4366a4)",action:"View Library"}
];

const $ = id => document.getElementById(id);
const audioFiles = {navigate:"./assets/sfx/navigate.wav",confirm:"./assets/sfx/confirm.wav",back:"./assets/sfx/back.wav"};
const audioBank = {};
function cue(name){
 if(state.mute || !audioFiles[name])return;
 try{
  if(!audioBank[name]){audioBank[name]=new Audio(audioFiles[name]);audioBank[name].volume=.24;}
  const sound=audioBank[name].cloneNode();sound.volume=.24;
  const playing=sound.play();if(playing&&playing.catch)playing.catch(()=>{});
 }catch(error){}
}

const state = {tab:"games",selected:"gta6",modal:false,options:false,control:false,launch:false,story:false,library:false,mute:false,profile:"Evan",loadingTimer:null,loadingPercent:0,ccSelection:0,lastGamepadAt:0};
try {state.profile = localStorage.getItem("psre.profile") || "Evan";state.mute = localStorage.getItem("psre.mute")==="true";}catch(e){}
const getList = () => state.tab === "games" ? CATALOG : MEDIA;
const getSelected = () => getList().find(item=>item.id===state.selected) || getList()[0];
const escapeHtml = str => String(str).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function textToast(message){
 const node=$("toast");node.textContent=message;node.classList.add("visible");
 clearTimeout(textToast.timer);textToast.timer=setTimeout(()=>node.classList.remove("visible"),3000);
}
function clock(){
 const d=new Date(); const result=d.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});
 $("clock").textContent=result;$("ccClock").textContent=result;
}
function setImage(item){
 const art=$("heroArt");
 art.dataset.theme=item.theme;
 art.style.setProperty("--hero-image",item.art ? 'url("' + item.art + '")' : "none");
 art.style.setProperty("--hero-opacity",item.art ? "0.82" : "0");
}
function tileMarkup(item){
 const pic=item.art ? '<img class="tile-picture" src="' + escapeHtml(item.art) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : "";
 return pic + '<span class="tile-symbol">' + item.symbol + '</span>';
}
function renderRow(){
 const row=$("gameRow");row.innerHTML="";
 for(const item of getList()){
  const b=document.createElement("button"); b.className="tile"+(item.id===state.selected?" selected":"");
  b.setAttribute("aria-label",item.name);b.setAttribute("aria-current",item.id===state.selected?"true":"false");b.dataset.id=item.id;
  b.style.setProperty("--tile-gradient",item.gradient);b.style.background=item.gradient;b.innerHTML=tileMarkup(item);
  b.addEventListener("click",()=>{
    if(state.selected===item.id)activate(item);else select(item.id);
  });row.appendChild(b);
 }
 const current=row.querySelector(".selected");if(current)current.scrollIntoView({block:"nearest",inline:"nearest"});
}
function renderHeading(item){
 if(item.id==="gta6"){
  $("gameHeading").innerHTML='<div class="brand-gta"><div class="brand-stack">grand<br>theft<br>auto</div><span class="brand-vi">VI</span></div>';
 }else{
  $("gameHeading").innerHTML='<div class="brand-title"><small>'+(state.tab==="games"?"PlayStation 5":"Entertainment")+'</small>'+escapeHtml(item.name)+'</div>';
 }
}
function renderInfo(item){
 const actionLabel=item.action||"Open";
 $("gameInfo").innerHTML='<h1 class="game-name">'+escapeHtml(item.tagline||item.name)+'</h1><p class="game-description">'+escapeHtml(item.description||"")+'</p>'+
 '<div class="action-row"><button id="gamePrimary" class="primary">'+escapeHtml(actionLabel)+'</button><button id="gameMore" class="more-button" aria-label="More options">···</button></div>';
 $("gamePrimary").addEventListener("click",()=>activate(item));
 $("gameMore").addEventListener("click",openOptions);
 const activity=(item.installed?'<button class="activity" id="resumeActivity"><span class="activity-art"></span><span class="activity-copy"><small>Activity</small><strong>Continue Story</strong><span>Resume game session · Local concept</span></span></button>':'');
 $("bottomDetails").innerHTML=activity+'<span class="tiny-prompt">'+(item.installed?"PS5 · In Library · Ready to play (simulation)":"PlayStation 5 · Home")+'</span>';
 const resume=$("resumeActivity");if(resume)resume.addEventListener("click",()=>activate(item));
}
function render(){
 $("gamesTab").classList.toggle("selected",state.tab==="games");
 $("mediaTab").classList.toggle("selected",state.tab==="media");
 const item=getSelected();renderRow();setImage(item);renderHeading(item);renderInfo(item);
 $("avatarLetter").textContent=(state.profile[0]||"E").toUpperCase();
 document.title=item.name+" | PlayStation";
}
function select(id){
 if(!getList().some(item=>item.id===id))return;
 if(state.selected!==id)cue("navigate");state.selected=id;render();
}
function move(delta){
 const list=getList();const index=list.findIndex(i=>i.id===state.selected);
 select(list[(index+delta+list.length)%list.length].id);
}
function switchTab(tab){
 if(!["games","media"].includes(tab))return;
 if(state.tab!==tab)cue("navigate");state.tab=tab;state.selected=tab==="games"?"gta6":"gallery";
 state.library=false;$("libraryPanel").classList.add("hidden");$("homePanel").classList.remove("hidden");
 render();
}
function show(el,yes){
 el.classList.toggle("hidden",!yes);el.setAttribute("aria-hidden",yes?"false":"true");
}
function openModal(title,html){
 closeOptions();state.modal=true;$("modalTitle").textContent=title;$("modalBody").innerHTML=html;
 show($("modalOverlay"),true);
 $("modalClose").focus();
}
function closeModal(){state.modal=false;show($("modalOverlay"),false);}
function settings(){
 openModal("Settings",'<div class="setting"><label for="uiSound">System sound</label><input type="checkbox" id="uiSound" '+(!state.mute?"checked":"")+'></div><div class="setting"><span>Console language</span><span>English (United States)</span></div><div class="setting"><span>Display resolution</span><span>Automatic</span></div><div class="setting"><span>Network</span><span>Connected · Demo</span></div><div class="setting"><span>Controller</span><span>Wireless controller</span></div><button class="modal-action" id="aboutBtn">About this build</button>');
 $("uiSound").addEventListener("change",e=>{state.mute=!e.target.checked;try{localStorage.setItem("psre.mute",state.mute);}catch(e){}textToast(state.mute?"Interface audio disabled":"Interface audio enabled");});
 $("aboutBtn").addEventListener("click",()=>openModal("PlayStation-RE",'<p>Independent web-based console interface recreation. The Grand Theft Auto VI game launch and in-game menu are completely simulated.</p><p>This project does not emulate PS5 firmware or run GTA VI.</p>'));
}
function profile(){
 openModal("User Profile",'<p>Welcome back.</p><div class="setting"><label for="profileInput">Online ID (demo)</label><input id="profileInput" maxlength="24" value="'+escapeHtml(state.profile)+'"></div><div class="setting"><span>Online status</span><span>● Online</span></div><div class="setting"><span>Trophies</span><span>12 · Concept</span></div><button class="modal-action" id="saveProfile">Save profile</button>');
 $("saveProfile").addEventListener("click",()=>{
  state.profile=$("profileInput").value.trim()||"Player";
  try{localStorage.setItem("psre.profile",state.profile);}catch(e){}
  $("avatarLetter").textContent=state.profile[0].toUpperCase();
  closeModal();textToast("Profile updated");
 });
}
function openOptions(){
 if(state.control||state.launch||state.story||state.library)return;
 state.options=true;const selected=getSelected();
 $("optionsMenu").innerHTML='<button class="menu-item" data-option="open">'+escapeHtml(selected.action||"Open")+'</button>'+
 '<button class="menu-item" data-option="information">Information</button><button class="menu-item" data-option="library">View Game Library</button>'+
 '<div class="menu-divider"></div><button class="menu-item" data-option="close">Close</button>';
 $("optionsMenu").querySelectorAll("[data-option]").forEach(btn=>btn.addEventListener("click",()=>{
  const action=btn.dataset.option;closeOptions();
  if(action==="open")activate(selected);
  if(action==="information")openModal(selected.name,'<p>'+escapeHtml(selected.description)+'</p><div class="setting"><span>Platform</span><span>PS5 · Demo</span></div><div class="setting"><span>Status</span><span>UI simulation</span></div>');
  if(action==="library")openLibrary();
 }));
 show($("optionsOverlay"),true);
}
function closeOptions(){state.options=false;show($("optionsOverlay"),false);}
function openLibrary(){
 state.library=true;closeOptions();show($("libraryPanel"),true);show($("homePanel"),false);
 renderLibrary("all");
}
function closeLibrary(){state.library=false;show($("libraryPanel"),false);show($("homePanel"),true);}
function renderLibrary(filter){
 document.querySelectorAll(".filter").forEach(e=>e.classList.toggle("selected",e.dataset.filter===filter));
 const items=(filter==="media"?MEDIA:filter==="installed"?CATALOG.filter(x=>x.installed):CATALOG);
 const grid=$("libraryGrid");grid.innerHTML="";
 items.forEach(item=>{
  const b=document.createElement("button");b.className="library-item";
  b.innerHTML='<span class="library-art" style="--tile-gradient:'+item.gradient+'"><span class="tile-symbol">'+item.symbol+'</span></span><strong>'+escapeHtml(item.name)+'</strong><small>'+escapeHtml(item.installed?"Installed · PS5":"Application")+'</small>';
  b.addEventListener("click",()=>{if(filter==="media")switchTab("media");else switchTab("games");select(item.id);closeLibrary();if(item.installed)textToast(item.name+" selected");});
  grid.appendChild(b);
 });
}
const CC_ACTIONS=[
 {label:"Home",icon:"⌂",action:()=>closeControl()},
 {label:"Switcher",icon:"▣",action:()=>{closeControl();openLibrary();}},
 {label:"Notifications",icon:"♧",action:()=>{closeControl();openModal("Notifications",'<p>You are all caught up.</p><p>Activity and game status are simulated locally.</p>');}},
 {label:"Game Base",icon:"♙",action:()=>{closeControl();openModal("Game Base",'<p>Friends and parties are not connected in this demo.</p>');}},
 {label:"Music",icon:"♫",action:()=>{closeControl();switchTab("media");}},
 {label:"Downloads",icon:"↓",action:()=>{closeControl();openModal("Downloads / Uploads",'<p>No active downloads. Local demonstration only.</p>');}},
 {label:"Sound",icon:"◖",action:()=>{state.mute=!state.mute;try{localStorage.setItem("psre.mute",state.mute);}catch(e){}textToast(state.mute?"Sound muted":"Sound enabled");}},
 {label:"Power",icon:"⏻",action:()=>{closeControl();openModal("Power",'<p>Finish this console session?</p><button id="sleepBtn" class="modal-action">Enter Rest Mode (demo)</button>');$("sleepBtn").addEventListener("click",()=>{closeModal();textToast("Rest Mode simulation");});}}
];
function renderControl(){
 $("ccActions").innerHTML="";
 CC_ACTIONS.forEach(item=>{
  const b=document.createElement("button");b.className="cc-action";
  b.innerHTML='<span>'+escapeHtml(item.icon)+'</span>'+escapeHtml(item.label);
  b.addEventListener("click",item.action);$("ccActions").appendChild(b);
 });
}
function openControl(){
 if(state.modal)closeModal();if(state.options)closeOptions();
 if(state.launch||state.story)return;
 state.control=true;renderControl();show($("controlCenter"),true);
}
function closeControl(){state.control=false;show($("controlCenter"),false);}
function toggleControl(){state.control?closeControl():openControl();}
function activate(item){
 cue("confirm");
 if(item.id==="library"){openLibrary();return;}
 if(item.id==="store"){openModal("PlayStation Store",'<p>Welcome to the store preview. This page is an interactive console UI demonstration, not a real storefront.</p>');return;}
 if(item.id==="welcome"){openModal("Welcome",'<p>Welcome back, '+escapeHtml(state.profile)+'.</p><p>Select a game to start or press <b>P</b> for Control Center.</p>');return;}
 if(state.tab==="media"){openModal(item.name,'<p>'+escapeHtml(item.description)+'</p><p>This media application is a visual preview.</p>');return;}
 if(item.installed){launch(item);return;}
 textToast(item.name);
}
function launch(item){
 closeOptions();closeModal();closeControl();closeLibrary();
 if(state.loadingTimer)clearInterval(state.loadingTimer);
 state.launch=true;state.story=false;state.loadingPercent=0;
 $("launchText").textContent="Starting game...";
 $("progressFill").style.width="0%";
 show($("launchOverlay"),true);
 // A visual sequence only; it does not start any executable or remote game.
 let step=0;const messages=["Starting game...","Preparing game data...","Loading story...","Entering Vice City..."];
 state.loadingTimer=setInterval(()=>{
  if(!state.launch){clearInterval(state.loadingTimer);state.loadingTimer=null;return;}
  step++;state.loadingPercent=Math.min(100,Math.round(100*(1-Math.pow(1-step/34,2))));
  $("progressFill").style.width=state.loadingPercent+"%";
  $("launchText").textContent=messages[Math.min(3,Math.floor(step/9))];
  if(step>=34){
   clearInterval(state.loadingTimer);state.loadingTimer=null;state.launch=false;
   show($("launchOverlay"),false);state.story=true;show($("storyOverlay"),true);
   if(item.id!=="gta6")textToast(item.name+" · Fictional demo screen");
  }
 },125);
}
function cancelLaunch(){
 state.launch=false;if(state.loadingTimer)clearInterval(state.loadingTimer);
 state.loadingTimer=null;show($("launchOverlay"),false);
}
function exitStory(){state.story=false;show($("storyOverlay"),false);}
function goBack(){
 cue("back");
 if(state.modal){closeModal();return;}
 if(state.options){closeOptions();return;}
 if(state.control){closeControl();return;}
 if(state.launch){cancelLaunch();return;}
 if(state.story){exitStory();return;}
 if(state.library){closeLibrary();return;}
 if(state.tab==="media"){switchTab("games");return;}
 select("gta6");
}
function pressSelect(){
 if(state.modal)return;
 if(state.control){closeControl();return;}
 if(state.options){const b=$("optionsMenu").querySelector(".menu-item");if(b)b.click();return;}
 if(state.launch)return;
 if(state.story){$("continueBtn").click();return;}
 if(state.library)return;
 activate(getSelected());
}
function handleCommand(command){
 if(command==="back"){goBack();return;}
 if(command==="home"){toggleControl();return;}
 if(command==="options"){openOptions();return;}
 if(command==="confirm"){pressSelect();return;}
 if(state.modal||state.options||state.control||state.launch||state.story||state.library)return;
 if(command==="left")move(-1);if(command==="right")move(1);
 if(command==="up"&&state.tab==="media")switchTab("games");
 if(command==="down"&&state.tab==="games")switchTab("media");
}
function handleKeyboard(e){
 const input=e.target instanceof HTMLElement && ["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName);
 if(input){if(e.key==="Escape"){e.preventDefault();goBack();}return;}
 const mapping={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down",Enter:"confirm",Escape:"back",Backspace:"back",p:"home",P:"home",o:"options",O:"options"};
 if(e.key==="f"||e.key==="F"){if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.();return;}
 if(mapping[e.key]){e.preventDefault();handleCommand(mapping[e.key]);}
}
function pollController(){
 if(navigator.getGamepads){
  const pads=navigator.getGamepads();const pad=Array.from(pads||[]).find(Boolean);
  if(pad){
   const now=performance.now();
   if(now-state.lastGamepadAt>185){
    const pressed=n=>pad.buttons[n]&&pad.buttons[n].pressed;
    let command=null;
    if(pressed(0))command="confirm";else if(pressed(1))command="back";
    else if(pressed(9)||pressed(16))command="home";
    else if(pressed(14)||pad.axes[0]<-.55)command="left";
    else if(pressed(15)||pad.axes[0]>.55)command="right";
    else if(pressed(12)||pad.axes[1]<-.6)command="up";
    else if(pressed(13)||pad.axes[1]>.6)command="down";
    if(command){handleCommand(command);state.lastGamepadAt=now;}
   }
  }
 }
 requestAnimationFrame(pollController);
}

$("gamesTab").addEventListener("click",()=>switchTab("games"));
$("mediaTab").addEventListener("click",()=>switchTab("media"));
$("settingsBtn").addEventListener("click",settings);
$("profileBtn").addEventListener("click",profile);
$("searchBtn").addEventListener("click",()=>{openModal("Search",'<p>Search your game library.</p><input id="searchInput" type="search" placeholder="Search games" aria-label="Search games" style="width:100%;max-width:100%"><div id="searchResults"></div>');const input=$("searchInput");input.focus();input.addEventListener("input",()=>{$("searchResults").innerHTML="";CATALOG.filter(g=>g.name.toLowerCase().includes(input.value.toLowerCase())&&input.value).forEach(g=>{const b=document.createElement("button");b.className="menu-item";b.textContent=g.name;b.addEventListener("click",()=>{closeModal();switchTab("games");select(g.id);});$("searchResults").appendChild(b);});});});
$("modalClose").addEventListener("click",closeModal);
$("modalOverlay").addEventListener("click",e=>{if(e.target===$("modalOverlay"))closeModal();});
$("optionsOverlay").addEventListener("click",e=>{if(e.target===$("optionsOverlay"))closeOptions();});
$("libraryBack").addEventListener("click",closeLibrary);
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>renderLibrary(b.dataset.filter)));
$("cancelLaunch").addEventListener("click",cancelLaunch);
$("storyBackBtn").addEventListener("click",exitStory);
$("storySettingsBtn").addEventListener("click",()=>{textToast("Display · Audio · Controls · Demo configuration");});
$("continueBtn").addEventListener("click",()=>textToast("Story gameplay is not included in this concept."));
document.addEventListener("keydown",handleKeyboard);
clock();setInterval(clock,15000);renderControl();render();requestAnimationFrame(pollController);
