let gamemode = "ffa"
async function definitionJsonLoader(what) { 
  try {
    const entityfetch = await fetch("entity.json");
    const entityStuff = await entityfetch.json();
    if (!what) {
      return {"error":"did not choose what to load"};
    }
    if (what==="entity") {
    return entityStuff;
    }
  } catch(er) {
    alert("Error in async")
    alert("scary async error: "+er);
    console.warn("Unable to load json. Client will fail to be able to play :(");
    console.warn("scary async error:" + er);
    return er;
  }
}
function loadEntities(json = {"error":"did not put json when running loadEntities"}) { // replace with something I guess.
  console.log("loading entities")
  return json;
}
const entity = loadEntities(definitionJsonLoader("entity"));

// Temporary AI generated code helper
function getArrasBorderColor(fillHex, borderBlendHex = "#484848", blendRatio = 0.5) {
    const hexToRgb = (hex) => {
        let cleanHex = hex.replace('#', '');
        return {
            r: parseInt(cleanHex.substring(0, 2), 16),
            g: parseInt(cleanHex.substring(2, 4), 16),
            b: parseInt(cleanHex.substring(4, 6), 16)
        };
    };

    const fill = hexToRgb(fillHex);
    const blend = hexToRgb(borderBlendHex);

    let r = Math.round(fill.r * (1 - blendRatio) + blend.r * blendRatio);
    let g = Math.round(fill.g * (1 - blendRatio) + blend.g * blendRatio);
    let b = Math.round(fill.b * (1 - blendRatio) + blend.b * blendRatio);

    const toHex = (c) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ---- Execution Verification ----
//const centerColor = "#e8c764";
//const exactArrasBorder = getArrasBorderColor(centerColor);
//console.log("Arras.io Exact Border Code:", exactArrasBorder); 

// Functions
async function play() {
  await loadingScreen(true);
  await menu(false);
  await loadGame();
  await loadingScreen(false);
  await renderGame(true);
  alert('started playing')
}
function setgamemode(mode) {
  document.getElementById(gamemode).classList.remove('choosen')
  alert("Game mode set to "+mode)
  document.getElementById(mode).classList.add('choosen')
}
function loadingScreen(what) {
  let ui = document.getElementById("load");
  if (what) {
    ui.style.display = "fixed";
  } else {
    ui.style.display = "none";
  }
  return true;
}
function menu(what) {
  let ui = document.getElementById("menu");
  if (what) {
    ui.style.display = "block";
  } else {
    ui.style.display = "none";
  }
}
function loadGame() {
  alert("loading game");
  return true;
}
function renderGame(what) {
  let ui = document.getElementById("gamecanvas");
  if (what) {
    ui.style.display = "fixed";
  } else {
    ui.style.display = "none";
  }
  return true;
}
