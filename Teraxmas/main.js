window.socket = null;
window.moveX = 0;
window.moveY = 0;
let worldData;
let gamemode = "ffa"
let playerid = "player_object_id_here"
const keys = {"a":false,"b":false,"c":false,"d":false,"e":false,"f":false,"g":false,"h":false,"i":false,"j":false,"k":false,"l":false,"m":false,"n":false,"o":false,"p":false,"q":false,"r":false,"s":false,"t":false,"u":false,"v":false,"w":false,"x":false,"y":false,"z":false,"0":false,"1":false,"2":false,"3":false,"4":false,"5":false,"6":false,"7":false,"8":false,"9":false,"enter":false,"escape":false,"space":false,"backspace":false,"shift":false,"control":false,"alt":false,"arrowup":false,"arrowdown":false,"arrowleft":false,"arrowright":false,"minus":false,"equal":false,"bracketleft":false,"bracketright":false,"backslash":false,"semicolon":false,"quote":false,"comma":false,"period":false,"slash":false,"backquote":false};
const camera = {
  x: 0,
  y: 0,
  zoom:1.5
};
const baseSpeed = 1;
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
// id,library,type,[width, height, x, y, vx, vy],xp,damage,optional:opt], tag
// "id": id, "library": lib, "type": ty, "pos": [w,h,x,y,vx,vy], "exp": xp, "damage": dmg, "hp":hp, "optional": opt, "tag":tag
// opt: [color/hex, radius for circle/tank, collide:[canCollide,BlockOrCircle]]
let objects = [
  //{"id":"test_id","library":"test", "type":"block", "pos":[50,50,10,10,0,0], "optional":["blue",null,[true,"block"]]}
]
async function definitionJsonLoader(what) { 
  try {
    if (!what) {
      return {"error":"did not choose what to load"};
    }
    if (what==="entity") {
    const entityfetch = await fetch("entity.json");
    const entityStuff = await entityfetch.json();
    return entityStuff;
    }
    if (what=="worlds") {
      const worldsfetch = await fetch("worlds.json")
      const worldsStuff = await worldsfetch.json()
      return worldsStuff
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
async function registerJsonVariables() {
  window.entity = await definitionJsonLoader("entity");
  window.worlds = await definitionJsonLoader("worlds");
  return true;
}
async function loadServers() {
  await registerJsonVariables();
  const once = (target, event) => new Promise((resolve) => {
    target.addEventListener(event, resolve, { once: true });
  });
  for (const [id, values] of Object.entries(worlds)) {
    let classes = 'choose'
    if (id == gamemode) classes = 'choose choosen'
    const url = new URL(values.server);
    url.searchParams.set('type', 'ping');
    console.log(url.href);
    const pingsocket = new WebSocket(url.href)
    pingsocket.addEventListener("message", (event) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.type == 'ping') {
        document.getElementById('gamelist').insertAdjacentHTML('beforeend', `<button class="${classes}" id="${id}" onclick="setgamemode('${id}')">${values.label} <span class="counttext">${parsedData.data.online}</span>/<span class="counttext">${parsedData.data.max}</span></button>`);
      }
      if (pingsocket.readyState === WebSocket.OPEN) {
        pingsocket.close();
      }
    }, { once: true });
    await once(pingsocket, 'close');
  };
}
loadServers()
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
// CONNECTION FUNCTION
// I was miraculously able to do a good portion of this myself, wow! (backend, i was able to do half)
// data: {type, data}
// state_variable: {type: 'state_variable', data:{'The Entire state variable': 'is here'}

// robot
function packet(data = {}) {
  if (data.type == 'open') {}

  if (data.type == 'state_variable') {
    const serverObjects = data.data.objects;

    serverObjects.forEach((serverObj) => {
      const existingObj = objects.find((obj) => obj.id === serverObj.id);

      if (existingObj) {
        if (serverObj.id === playerid) {
          existingObj.pos = serverObj.pos; // width
          existingObj.pos = serverObj.pos; // height

          // Sync server-controlled stats
          existingObj.exp = serverObj.exp;
          existingObj.damage = serverObj.damage;
          existingObj.hp = serverObj.hp;
          existingObj.optional = serverObj.optional;
          existingObj.tag = serverObj.tag;
        } else {
          Object.assign(existingObj, serverObj);
        }
      } else {
        objects.push(serverObj);
      }
    });

    objects = objects.filter((localObj) =>
      serverObjects.some((serverObj) => serverObj.id === localObj.id)
    );
  }
}
// self
function send(type, data) {
  if (!socket || socket.readyState !== 1) return;
  socket.send(JSON.stringify({ type, data }))
}
// a bit robot but mostly self
let hasLeft = false;
function handleLeave() {
  if (hasLeft) return;
  hasLeft = true;
  send('leave', player);
}
window.addEventListener('beforeunload', handleLeave);
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) {
    handleLeave();
  }
});
// tutorial
async function connect() {
  window.socket = new WebSocket(server);
   const handleOpen = (event) => {
    console.log('Connected to WSS server');
    socket.send(JSON.stringify({ type: 'greeting', data: { connected: true }}));
     
    send('state', {})
  window.stateInterval = setInterval(() => {
  send('state', {})
    if (moveX != 0 && moveY != 0) send('move', {"x": moveX, "y": moveY})
}, 50);
  };

  const handleMessage = (event) => {
    try {
    const parsedData = JSON.parse(event.data);
      packet(parsedData)
  } catch (error) {
    console.error("handleMessage: ", error);
  }
  };

  const handleError = (error) => {
    console.error('WebSocket error:', error);
  };

  const handleClose = (event) => {
    socket.send(JSON.stringify({ type: 'closing', data: { player: playerid }}));
    console.log(`Disconnected (Code: ${event.code})`);
    
    socket.removeEventListener('open', handleOpen);
    socket.removeEventListener('message', handleMessage);
    socket.removeEventListener('error', handleError);
    socket.removeEventListener('close', handleClose);
    clearInterval(stateInterval)
  };

  socket.addEventListener('open', handleOpen);
  socket.addEventListener('message', handleMessage);
  socket.addEventListener('error', handleError);
  socket.addEventListener('close', handleClose);
  return new Promise((resolve) => {
  if (window.socket.readyState === 1) return resolve(true);
  window.socket.addEventListener("open", () => resolve(true), { once: true });
});
}
//const color = "#e8c764";
//const border = borderColor(color);

// Functions
async function play() {
  loadingScreen(true);
  menu(false);
  window.server = worlds.ffa.server
  const loaded = await connect();
  if (loaded) {
  await loadingScreen(false);
  await renderGame(true);
  alert('started playing')
  } else {
    alert('unable to start playing :(')
    loadingScreen(false);
    menu(true);
    alert(loaded)
    const reload = confirm("Reload page? (May fix error, if it does not, it's probably being fixed right now.)")
    if (!reload) alert("Too bad you gotta reload.");
    const devkey = prompt("Enter skip reload key to continue (Not reccomended, non devs.)", "Yes please don't read the source code.");
    if (devkey != "banana") window.location.reload();
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
    loadServers();
  } else {
    ui.style.display = "none";
  }
}
// AI math. I'm dumber.
// Checks if a specific object (obj1) is touching any valid colliders in the game world
function isTouchingAnything(obj1) {
  // Check if obj1 itself has collisions turned off via optional[2][0]
  if (obj1.optional && Array.isArray(obj1.optional[2]) && obj1.optional[2][0] === false) {
    return false;
  }

  // Helper to determine shape type based on optional[2][1] or defaults
  const getShapeType = (obj) => {
    if (obj.optional && Array.isArray(obj.optional[2]) && obj.optional[2][1]) {
      return obj.optional[2][1].toLowerCase(); // "circle" or "block"
    }
    if (obj.library === "player" || obj.type === "circle") {
      return "circle";
    }
    return "block";
  };

  const type1 = getShapeType(obj1);

  // Loop through all game objects
  for (let obj2 of objects) {
    // Don't check an object against itself
    if (obj1.id === obj2.id) continue;

    // Skip if target object has disabled collisions via optional[2][0]
    if (obj2.optional && Array.isArray(obj2.optional[2]) && obj2.optional[2][0] === false) {
      continue;
    }

    const type2 = getShapeType(obj2);
    const isObj1Circle = (type1 === "circle");
    const isObj2Circle = (type2 === "circle");

    let colliding = false;

    if (isObj1Circle && isObj2Circle) {
      // Circle vs Circle
      const r1 = obj1.optional[1] || 10;
      const r2 = obj2.optional[1] || 10;
      const dx = obj1.pos[2] - obj2.pos[2];
      const dy = obj1.pos[3] - obj2.pos[3];
      colliding = Math.sqrt(dx * dx + dy * dy) < (r1 + r2);
    } else if (!isObj1Circle && !isObj2Circle) {
      // Block vs Block (Rect vs Rect)
      colliding = (
        obj1.pos[2] < obj2.pos[2] + obj2.pos[0] &&
        obj1.pos[2] + obj1.pos[0] > obj2.pos[2] &&
        obj1.pos[3] < obj2.pos[3] + obj2.pos[1] &&
        obj1.pos[3] + obj1.pos[1] > obj2.pos[3]
      );
    } else {
      // Circle vs Block (Mixed)
      const circle = isObj1Circle ? obj1 : obj2;
      const rect = isObj1Circle ? obj2 : obj1;
      const radius = circle.optional[1] || 10;

      const closestX = Math.max(rect.pos[2], Math.min(circle.pos[2], rect.pos[2] + rect.pos[0]));
      const closestY = Math.max(rect.pos[3], Math.min(circle.pos[3], rect.pos[3] + rect.pos[1]));

      const dx = circle.pos[2] - closestX;
      const dy = circle.pos[3] - closestY;
      colliding = (dx * dx + dy * dy) < (radius * radius);
    }

    if (colliding) {
      return true; // Stop immediately on first collision
    }
  }

  return false; // Path is clear!
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
function summonObject(lib="test", ty="block", w=50, h=50, x=0, y=0, vx=0, vy=0, xp=0, dmg=0, hp=100, opt=["default", null,[false,"block"]], tag=null,id=idGen()) {
  if (lib == "player") send('player_new', [lib, ty, w, h, x, y, vx, vy, xp, dmg, hp, opt, tag, id])
}
async function renderGame(what) {
  alert("rendering game");
  let ui = document.getElementById("gamecanvas");
  if (what) {
  let tankColor = (window.entity && window.entity.player && window.entity.player.tank)
    ? window.entity.player.tank.color 
    : "#3ca4cb";
    playerid = idGen()
    summonObject("player","tank", 0, 0, Math.random() * worlds[gamemode].width, Math.random() * worlds[gamemode].height, 0, 0, 100, 100, 100, [tankColor, 10], "player", playerid)
    requestAnimationFrame(loop);
    handleKeys(); // Handle key presses
    ui.style.display = "block";
    return true;
    } else {
    ui.style.display = "none";
  }
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
// Math and Rendering? Me, A Dummy? In Javascript? Robot Time.
let player = objects.find(o => o.tag === "player" && o.id === playerid);
  if (player) {
    camera.x += (player.pos[2] - camera.x) * 0.1;
    camera.y += (player.pos[3] - camera.y) * 0.1;
  }
  ctx.save();
  ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);
  let currentWorld = worlds && worlds[gamemode] ? worlds[gamemode] : { width: 50000, height: 50000 };
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, currentWorld.width, currentWorld.height);
  ctx.strokeStyle = "#cccccc";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, currentWorld.width, currentWorld.height);
  // grid would be nice
  ctx.strokeStyle = "#e5e5e5";
  ctx.lineWidth = 1;
  let gridSize = 20;
  // Wow, this code appeared out of nowhere!
  for (let x = 0; x <= currentWorld.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, currentWorld.height);
    ctx.stroke();
  }
  for (let y = 0; y <= currentWorld.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(currentWorld.width, y);
    ctx.stroke();
  }
objects.forEach(o => {
    if (o.tag == "player" && o.id == playerid) {
  moveX = 0;
  moveY = 0;
  if (keys["d"]) moveX += 1;
  if (keys["a"]) moveX -= 1;
  if (keys["s"]) moveY += 1;
  if (keys["w"]) moveY -= 1;
  let length = Math.sqrt(moveX * moveX + moveY * moveY);
  if (length > 0) {
      moveX /= length;
      moveY /= length;
  }
      o.pos = moveX * baseSpeed;
  o.pos = moveY * baseSpeed;
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
})
  ctx.restore();
}
function loop(currentTime) {
  requestAnimationFrame(loop);

  lastTime = currentTime;
  const dt = (currentTime - lastTime) / 1000;

  renderCanvas();
}

window.onwheel = function(event) {
  if (event.deltaY > 0) {
    camera.zoom = Math.max(0.5, camera.zoom - 0.1);
  } else {
    camera.zoom = Math.min(50, camera.zoom + 0.1);
  }
};

