alert("Made without AI.")
let gamemode = "ffa"
// Libraries: Shape Player Misc Test
// Test: Block Circle
// Test: Include pos:[width and height and x and y and other stuff]
// Player: Type of player: tank, godly, strange
// Player: scale, x, y, experience, other stuff.
// Shape: from entity.json I guess.
// Shape: Include scale, x, y, experience  (experience is scale)
// Misc: Bullet
// Musc: scale,x,y,shape,damage,vx,vy (v = velocity)

// HOW TO USE pos
// id,library,type,[width, height, x, y, vx, vy],xp,damage,optional:[color:default/hex]
// "id": id, "library": lib, "type": ty, "pos": [w,h,x,y,vx,vy], "exp": xp, "damage": dmg, "optional": opt
let objects = [
  {"id":"test_id","library":"test", "type":"block", "pos":[50,50,0,0,0,0], "optional":["blue"]}
]
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
    const err = {"error":er}
    return err;
  }
}
const entity = definitionJsonLoader();
// yes sorry guys I decided to... It's just one function
function borderColor(fillHex, borderBlendHex = "#484848", blendRatio = 0.5) {
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
//const color = "#e8c764";
//const border = borderColor(color);

// Functions
async function play() {
  loadingScreen(true);
  menu(false);
  const loaded = await loadGame();
  if (loaded == true) {
  await loadingScreen(false);
  await renderGame(true);
  alert('started playing')
  } else {
    alert('unable to start playing :(')
    loadingScreen(false);
    menu(true);
    alert('unable to start playing :(')
    const reload = prompt("Reload page? (May fix error, if it does not, it's probably being fixed right now.)")
    if (!reload) alert("Too bad you gotta reload.");
    window.location.reload()
  }
}
function setgamemode(mode) {
  document.getElementById(gamemode).classList.remove('choosen')
  alert("Game mode set to "+mode+" from "+gamemode)
  document.getElementById(mode).classList.add('choosen')
  gamemode = mode
}
function loadingScreen(what) {
  alert("visibility of loading screen set to "+what);
  let ui = document.getElementById("load");
  if (what) {
    ui.style.display = "block"; ui.style.visibility = "fixed"; 
  } else {
    ui.style.display = "none";
  }
  return true;
}
function menu(what) {
  alert("visibility of menu set to "+what);
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
  alert("rendering game");
  let ui = document.getElementById("gamecanvas");
  if (what) {
    ui.style.display = "block";
  } else {
    ui.style.display = "none";
  }
  return true;
}

// MAIN GAME

function idGen() {
  const char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_"
  let result = ''
  for (let i = 0; i < Math.random(4,24); i++) {
        result += char.charAt(Math.floor(Math.random() * char.length));
    }
    return result;
}

function summonObject(lib="test", ty="block", w=50, h=50, x=0, y=0, vx=0, vy=0, xp=0, dmg=0,opt=["default"], id=idGen()) {
  while (objects.some(it => it.id === id)) {
    id = idGen();
  }
  let obj = {
    "id": id, "library": lib, "type": ty, "pos": [w,h,x,y,vx,vy], "exp": xp, "damage": dmg, "optional": opt
  };
  objects.push(obj);
  return obj;
}

let lastTime = 0;
// W w3schools for the tutorial stuff
function renderCanvas() {
  
  const canvas = document.getElementById("gamecanvas");
  const ctx = canvas.getContext("2d");

ctx.setTransform(1, 0, 0, 1, 0, 0); 
ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (objects.length > 0) {
  objects.forEach(o => {
    if (o.library == "test") {
      if (o.type == "block") {
        ctx.fillStyle = o.optional[0];
        ctx.fillRect(o.pos[2], o.pos[3], o.pos[0], o.pos[1]);
      }
    }
    o.pos[2] += o.pos[4]
    o.pos[3] += o.pos[5]
  });
  }
}
function loop(currentTime) {
  requestAnimationFrame(loop);

  const dt = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  renderCanvas();
}

requestAnimationFrame(loop);
