alert("Made without AI.")
let baseSpeed = 3; // Base player speed
let gamemode = "ffa"
let playerid = "player_object_id_here"
const keys = {"a":true,"b":false,"c":false,"d":false,"e":false,"f":false,"g":false,"h":false,"i":false,"j":false,"k":false,"l":false,"m":false,"n":false,"o":false,"p":false,"q":false,"r":false,"s":false,"t":false,"u":false,"v":false,"w":false,"x":false,"y":false,"z":false,"0":false,"1":false,"2":false,"3":false,"4":false,"5":false,"6":false,"7":false,"8":false,"9":false,"enter":false,"escape":false,"space":false,"backspace":false,"shift":false,"control":false,"alt":false,"arrowup":false,"arrowdown":false,"arrowleft":false,"arrowright":false,"minus":false,"equal":false,"bracketleft":false,"bracketright":false,"backslash":false,"semicolon":false,"quote":false,"comma":false,"period":false,"slash":false,"backquote":false};
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
// id,library,type,[width, height, x, y, vx, vy],xp,damage,optional:[color default/hex, radius number for a circle or tank)], tag
// "id": id, "library": lib, "type": ty, "pos": [w,h,x,y,vx,vy], "exp": xp, "damage": dmg, "hp":hp, "optional": opt, "tag":tag
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


// MAIN GAME

function idGen() {
  const char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_"
  let result = ''
  const length = Math.floor(Math.random() * (24 - 6 + 1)) + 6;
  for (let i = 0; i < length; i++) {
        result += char.charAt(Math.floor(Math.random() * char.length));
    }
    return result;
}

function summonObject(lib="test", ty="block", w=50, h=50, x=0, y=0, vx=0, vy=0, xp=0, dmg=0, hp=100, opt=["default", null], tag=null,id=idGen()) {
  while (objects.some(it => it.id === id)) {
    id = idGen();
  }
  let obj = {
    "id": id, "library": lib, "type": ty, "pos": [w,h,x,y,vx,vy], "exp": xp, "damage": dmg, "hp":hp, "optional": opt, "tag":tag
  };
  objects.push(obj);
  return obj;
}

function renderGame(what) {
  alert("rendering game");
  let ui = document.getElementById("gamecanvas");
  if (what) {
    ui.style.display = "block";
  } else {
    ui.style.display = "none";
  }
  playerid = summonObject("player","tank", 0, 0, (window.innerWidth/2)-5, (window.innerHeight/2)-5, 0, 0, 100, 100, 100, ["#00FFFF", 10], "player").id;
  return true;
}

function handleKeys() {
  document.onkeydown = function(key) {
  keys[key.key] = true
  };
  document.onkeyup = function(key) {
  keys[key.key] = false
  };
}
let lastTime = 0;
// W w3schools for the tutorial stuff
function renderCanvas() {
  
   const canvas = document.getElementById("gamecanvas");
  const ctx = canvas.getContext("2d");
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

ctx.setTransform(1, 0, 0, 1, 0, 0); 
ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  objects.forEach(o => {
      // I said no AI but like... Math? Me, A Dummy? In Javascript? Robot Time.
if (o.tag == "player" && o.id == playerid) {
  let moveX = 0;
  let moveY = 0;
  if (keys["d"]) moveX += 1;
  if (keys["a"]) moveX -= 1;
  if (keys["s"]) moveY += 1;
  if (keys["w"]) moveY -= 1;
  let length = Math.sqrt(moveX * moveX + moveY * moveY);
  if (length > 0) {
      moveX /= length;
      moveY /= length;
  }
  let diameter = (o.pos[0] + o.pos[1]) / 2 || (o.optional[1] * 2) || 20; 
let actualSpeed = baseSpeed * (50 / diameter);
  o.pos[4] = Number(moveX * actualSpeed) || 0;
  o.pos[5] = Number(moveY * actualSpeed) || 0;
}

    
    if (o.library == "test") {
      if (o.type == "block") {
        ctx.fillStyle = o.optional[0];
        ctx.fillRect(o.pos[2], o.pos[3], o.pos[0], o.pos[1]);
        ctx.strokeStyle = borderColor(o.optional[0]);
        ctx.lineWidth = 1;
        ctx.strokeRect(o.pos[2], o.pos[3], o.pos[0], o.pos[1]);
      }
    } else if (o.library == "player") {
      if (o.type == "tank") {
        ctx.fillStyle = o.optional[0];
        ctx.beginPath();
        ctx.arc(o.pos[2], o.pos[3], o.optional[1] || ((o.pos[0] / o.pos[1]) * 10), 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = borderColor(o.optional[0]);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    o.pos[2] += o.pos[4]
    o.pos[3] += o.pos[5]
  });
  
}
function loop(currentTime) {
  requestAnimationFrame(loop);

  const dt = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  renderCanvas();
}

requestAnimationFrame(loop);
handleKeys(); // Handle key presses
