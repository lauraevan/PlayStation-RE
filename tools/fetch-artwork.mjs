#!/usr/bin/env node
/**
 * Optional public-artwork sync for PlayStation-RE.
 *
 * Downloads only images that the publishers publicly host; this does not
 * extract Sony firmware resources, game packages or executable content.
 *
 * Usage:
 *   node tools/fetch-artwork.mjs
 *   node tools/fetch-artwork.mjs --cover-only
 *
 * Requires Node 18+. Writes assets/downloaded/ and assets/local-art.json.
 */
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const out=path.join(root,"assets","downloaded");
const onlyCover=process.argv.includes("--cover-only");
const gtaRoot="https://www.rockstargames.com/VI/_next/static/media/";
const source=[
  {name:"gta6-cover.jpg",kind:"cover",urls:[
    gtaRoot+"Official_Cover_Art_landscape.12.uu2irr.2_a.jpg",
    gtaRoot+"heroKeyArt.acb9b343.jpg"
  ]},
  {name:"gta6-logo.svg",kind:"logo",urls:[gtaRoot+"VIstack.fe9b0515.svg"]},
  {name:"gta6-logo.png",kind:"art",urls:[gtaRoot+"vi.b9b99ab9.png"]},
  {name:"gta6-lock-and-load.jpg",kind:"art",urls:[gtaRoot+"Jason_Lucia_Lock_And_Load_With_Logos_landscape.13z.1pzvhq5dn.jpg"]},
  {name:"gta6-vice-city.jpg",kind:"art",urls:[gtaRoot+"Vice_City_02.1c840675.jpg"]},
  {name:"gta6-lucia.jpg",kind:"art",urls:[gtaRoot+"Lucia_Caminos_01.f5023e0f.jpg"]},
  {name:"gta6-jason.jpg",kind:"art",urls:[gtaRoot+"Jason_Duval_02.c2f33c0d.jpg"]},
  {name:"astro-bot.jpg",kind:"art",urls:["https://image.api.playstation.com/vulcan/ap/rnd/202406/0500/80ecf657918558eeef8da3ee4cef326e4517d34e6c69d950.jpg"]},
  {name:"gta5.jpg",kind:"art",urls:["https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/library_hero.jpg"]},
  {name:"spider-man2.jpg",kind:"art",urls:["https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2651280/library_hero.jpg"]},
  {name:"ghost-tsushima.jpg",kind:"art",urls:["https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/library_hero.jpg"]}
];
const tasks=onlyCover?source.filter(x=>x.kind==="cover"||x.kind==="logo"):source;
await fs.mkdir(out,{recursive:true});
const result={};
let ok=0,failed=0;
for(const task of tasks){
  let success=false;
  for(const url of task.urls){
    try{
      const response=await fetch(url,{signal:AbortSignal.timeout(18000),headers:{"User-Agent":"PlayStation-RE artwork fetcher (educational personal project)"}});
      if(!response.ok)throw new Error("HTTP "+response.status);
      const mime=response.headers.get("content-type")||"";
      if(!mime.startsWith("image/")&&!mime.includes("octet-stream"))throw new Error("Unexpected content type "+mime);
      const buffer=Buffer.from(await response.arrayBuffer());
      if(!buffer.length||buffer.length>35*1024*1024)throw new Error("Invalid file length");
      const isSvg=task.name.endsWith(".svg"),isJpg=task.name.endsWith(".jpg"),isPng=task.name.endsWith(".png");
      if(isSvg && !buffer.toString("utf8",0,500).includes("<svg"))throw new Error("Not an SVG");
      if(isJpg && !(buffer[0]===0xff&&buffer[1]===0xd8))throw new Error("Not a JPEG");
      if(isPng && buffer.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")throw new Error("Not a PNG");
      const filename=path.join(out,task.name);
      await fs.writeFile(filename,buffer);
      console.log("OK   ",task.name,Math.round(buffer.length/1024)+"KiB");
      result[task.name]={"path":"./assets/downloaded/"+task.name,"source":url};
      if(task.kind==="cover")result.cover="./assets/downloaded/"+task.name;
      if(task.kind==="logo")result.logo="./assets/downloaded/"+task.name;
      success=true;ok++;break;
    }catch(err){console.warn("MISS ",task.name,String(err.message).slice(0,100));}
  }
  if(!success)failed++;
}
const manifest=path.join(root,"assets","local-art.json");
await fs.writeFile(manifest,JSON.stringify(result,null,2)+"\n");
console.log("Artwork sync:",ok,"fetched,",failed,"unavailable.");
console.log("The UI will use remote imagery or locally bundled vector fallbacks for unavailable assets.");
