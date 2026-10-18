/* Browser-level regression test for the PS5-style experience.
 * Execute: node tests/console.mjs
 * Requires a local static server at http://127.0.0.1:8765
 */
import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
fs.mkdirSync("test-artifacts",{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const runtimeErrors=[];
page.on("pageerror",e=>runtimeErrors.push(e.message));
const base="http://127.0.0.1:8765/";
try{
  await page.goto(base,{waitUntil:"domcontentloaded"});
  await page.waitForSelector("#gameRow .tile.selected",{timeout:12000});
  await page.waitForTimeout(1700);
  assert.equal(await page.locator("#gameRow .tile.selected").count(),1,"one selected game tile");
  assert.equal(await page.locator("#gamePrimary").innerText(),"Play Game");
  assert.equal(await page.locator("#heroArt .hero-frame").count(),2,"background crossfade layer exists");
  await page.screenshot({path:"test-artifacts/home.png",fullPage:true});
  // The first down movement should focus Play Game, not switch to Media.
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(70);
  assert.equal(await page.locator("#gamePrimary.ps-focused").count(),1,"down enters game hub");
  assert.equal(await page.locator("#gamesTab.selected").count(),1,"down keeps Games active");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(40);
  assert.equal(await page.locator("#gameMore.ps-focused").count(),1,"right focuses game options");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  assert.equal(await page.locator("#launchOverlay:not(.hidden)").count(),1,"Play Game launches concept");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(120);
  assert.equal(await page.locator("#launchOverlay.hidden").count(),1,"Escape closes launch overlay");
  await page.keyboard.press("p");
  await page.waitForTimeout(150);
  assert.equal(await page.locator("#controlCenter:not(.hidden)").count(),1,"PS key opens Control Center");
  assert.equal(await page.locator("#ccActions button").count(),8,"Control Center menu entries");
  await page.screenshot({path:"test-artifacts/control-center.png",fullPage:true});
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#controlCenter.hidden").count(),1,"Escape exits Control Center");
  await page.keyboard.press("Escape");
  await page.keyboard.press("ArrowLeft");
  assert.equal(await page.locator("#gameRow .tile.selected").count(),1);
  await page.locator("#gameRow .tile[data-id=library]").click({force:true});
  await page.locator("#gameRow .tile[data-id=library]").click({force:true});
  assert.equal(await page.locator("#libraryPanel:not(.hidden)").count(),1,"Game Library opens");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#libraryPanel.hidden").count(),1,"Library closes");
  assert.deepEqual(runtimeErrors,[],"no browser JS errors");
  console.log("PS5 browser interaction checks passed");
}catch(error){
  await page.screenshot({path:"test-artifacts/failed.png",fullPage:true}).catch(()=>{});
  console.error(JSON.stringify({runtimeErrors},null,2));
  throw error;
}finally{await browser.close();}
