//(() => {
window.socket = null; // hmm.. why is it a window, that's like not even required!!!!!!!!!
let moveX = 0;
let moveY = 0;
let lastMoveX = 0;
let lastMoveY = 0;
let mouseX = 0;
let mouseY = 0;
let gamemode = "ffa"; // Free For All: Nothing Costs Money For Anyone.
let playerid = "player_object_id_here"; // Will be randomly generated do not worry guys
let autospin = false;
let autofire = false;
let isFiring = false;
let wasFiring = false;
const keys = {"a":false,"b":false,"c":false,"d":false,"e":false,"f":false,"g":false,"h":false,"i":false,"j":false,"k":false,"l":false,"m":false,"n":false,"o":false,"p":false,"q":false,"r":false,"s":false,"t":false,"u":false,"v":false,"w":false,"x":false,"y":false,"z":false,"0":false,"1":false,"2":false,"3":false,"4":false,"5":false,"6":false,"7":false,"8":false,"9":false,"enter":false,"escape":false,"space":false,"backspace":false,"shift":false,"control":false,"alt":false,"arrowup":false,"arrowdown":false,"arrowleft":false,"arrowright":false,"minus":false,"equal":false,"bracketleft":false,"bracketright":false,"backslash":false,"semicolon":false,"quote":false,"comma":false,"period":false,"slash":false,"backquote":false};
const camera = {
  x: 0,
  y: 0,
  zoom:1.5
};
const worldCache = {};
const baseSpeed = 5;
// Tanks: TankId: [TankName, TankType, HasAuto, [HealerBody, HealerRate], PlayerSpeed, BodyDamage, Turrets:[[TurretType, TurretRecoil, TurretAngle, TurretX, TurretY, TurretWidth, TurretHeight, BulletDamage, BulletSpeed, BulletScale, IsHealer, HealRate], more_turrets], upgrades: [TankId1, TankId2, TankId3]]
// Tank Types: Normal, Smasher | Turret Types: Normal
// Libraries: Shape Player Misc Test
// Test: Block Circle
// Test: Include pos:[width and height and x and y and other stuff]
// Player: Type of player: tank, godly, strange
// Player: scale, x, y, experience, other stuff.
// Wall: Walls: Wall Triwall/3wall Quadwall/4wall etc. see RenderCanvas() for the names.
// Wall: all of pos, optional/color, and canCollide, Block or circle.
// Misc: Bullet
// Musc: scale,x,y,shape,damage,vx,vy (v = velocity)

// HOW TO USE pos
// id,library,type,[width, height, x, y, vx, vy, angle],xp,damage,optional:opt], tag
// "id": id, "library": lib, "type": ty, "pos": [w,h,x,y,vx,vy, angle], "exp": xp, "damage": dmg, "hp":[hp, max], "optional": opt, "tag":tag, "name": optional_name
// opt: [color/hex, radius for circle/tank, collide:[canCollide,BlockOrCircle], tank, [Body Damage 1-9, Max Health 1-9, Bullet Speed 1-9, Bullet Health 1-9, Bullet Penetration 1-9, Bullet Damage 1-9, Reload 1-9, Move Speed 1-9, Shield Regen 1-9, Shield Capacity 1-9]]
let objects = [
  //{"id":"test_id","library":"test", "type":"block", "pos":[50,50,10,10,0,0,0], "optional":["blue",null,[true,"block"]]}
]
let shapes = []
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
        worldCache[id] = values
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
        let cleanHex = String(hex ?? '').replace('#', '');
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

// robot. I hate using robot bro I keep getting errors from it I would have probably done better myself
// take this as a lesson, devtool lurkers.
function packet(data) {
  if (!data || typeof data !== 'object') return;

  if (data.type === 'state_variable') {
    const serverObjects = data.data.objects || [];
    const serverShapes = data.data.shapes || [];
  
    // --- SYNC OBJECTS ---
    // 1. Add new objects or update existing ones
    serverObjects.forEach((serverObj) => {
      const existingObj = objects.find((obj) => obj.id === serverObj.id);
  
      if (existingObj) {
        if (serverObj.id === playerid) {
          // Only update width [0] and height; keep local x, y, vx, vy
          existingObj.pos[0] = serverObj.pos[0];
          existingObj.pos[1] = serverObj.pos[1];
  
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
  
    // 2. Remove deleted objects in-place
    for (let i = objects.length - 1; i >= 0; i--) {
      const localObj = objects[i];
      const stillOnServer = serverObjects.some((sObj) => sObj.id === localObj.id);
      if (!stillOnServer) {
        objects.splice(i, 1);
      }
    }
  
    // --- SYNC SHAPES ---
    // 1. Add new shapes or update existing ones
    serverShapes.forEach((serverShape) => {
      const existingShape = shapes.find((shape) => shape.id === serverShape.id);
  
      if (existingShape) {
        Object.assign(existingShape, serverShape);
      } else {
        shapes.push(serverShape);
      }
    });
  
    // 2. Remove deleted shapes in-place
    for (let i = shapes.length - 1; i >= 0; i--) {
      const localShape = shapes[i];
      const stillOnServer = serverShapes.some((sShape) => sShape.id === localShape.id);
      if (!stillOnServer) {
        shapes.splice(i, 1);
      }
    }
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
  send('leave', playerid);
}
window.addEventListener('beforeunload', handleLeave);
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) {
    handleLeave();
  }
});
// originally tutorial, improved by robot
function connect() {
  return new Promise((resolve, reject) => {
    window.socket = new WebSocket(server);
    let lastMoveX = 0;
    let lastMoveY = 0;

    const handleOpen = () => {
      console.log('Connected to WSS server');
      window.socket.send(JSON.stringify({ type: 'greeting', data: { connected: true } }));
      send('state', {first: true});

      window.stateInterval = setInterval(() => {
        if (moveX !== 0 || moveY !== 0 || lastMoveX !== 0 || lastMoveY !== 0) {
          send('move', { id: playerid, x: moveX, y: moveY, collide: true });
          lastMoveX = moveX;
          lastMoveY = moveY;
        }
        let playerthingy = objects.find(child => child.id === playerid)
        if (playerthingy?.pos) {
          console.log(playerthingy.pos[6])
        if (autospin) {
          console.log("spin")
          playerthingy.pos[6] = (playerthingy.pos[6] + 0.02) % (2 * Math.PI)
        } else {
          console.log("look")
          playerthingy.pos[6] = Math.atan2(mouseY - window.innerHeight / 2, mouseX - window.innerWidth / 2);
        }
        send('state', { id: playerid, angle: playerthingy.pos[6] });
        wasFiring = isFiring
        isFiring = Boolean(autofire || keys.space || keys.click);
        if (isFiring != wasFiring) send('shoot', {id: playerid, isFiring: isFiring, angle: playerthingy.pos[6]});
        }
      }, 50);

      resolve(true); // Only unblocks `await connect()` AFTER everything above is ready
    };

    const handleMessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        packet(parsedData);
      } catch (error) {
        console.error("handleMessage error:", error);
      }
    };

    const handleError = (error) => {
      console.error('WebSocket error:', error);
      reject(error);
    };

    const handleClose = (event) => {
      console.log(`Disconnected (Code: ${event.code})`);
      clearInterval(window.stateInterval);
      window.socket.removeEventListener('open', handleOpen);
      window.socket.removeEventListener('message', handleMessage);
      window.socket.removeEventListener('error', handleError);
      window.socket.removeEventListener('close', handleClose);
    };

    window.socket.addEventListener('open', handleOpen, { once: true });
    window.socket.addEventListener('message', handleMessage);
    window.socket.addEventListener('error', handleError);
    window.socket.addEventListener('close', handleClose);
  });
}
document.addEventListener('contextmenu', (event) => {
  event.preventDefault()
})
window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
})
// Functions
async function play() {
  loadingScreen(true);
  menu(false);
  window.server = worlds.ffa.server
  const loaded = await connect();
  if (loaded) {
  await renderGame(true);
  await loadingScreen(false);
  alert('started playing')
  } else {
    alert('unable to start playing :(')
    loadingScreen(false);
    menu(true);
    alert(loaded)
    const reload = confirm("Reload page? (May fix error, if it does not, it's probably being fixed right now)")
    if (!reload) alert("Too bad you gotta reload.");
    const devkey = prompt("Enter skip reload key to continue (Not reccomended, non devs.)", "Yes please don't read the source code");
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
function summonObject(lib="test", ty="block", w=50, h=50, x=0, y=0, vx=0, vy=0, xp=0, dmg=0, hp=[100,100], opt=["default", null,[false,"block"], null, null], tag=null,id=idGen(), name = "") {
  if (lib == "player") send('player_new', [lib, ty, w, h, x, y, vx, vy, xp, dmg, hp, opt, tag, id, name])
}
async function renderGame(what) {
  let ui = document.getElementById("gamecanvas");
  if (what) {
  let tankColor = (window.entity && window.entity.player && window.entity.player.tank)
    ? window.entity.player.tank.color 
    : "#3ca4cb";
    playerid = idGen()
    summonObject("player","tank", 0, 0, Math.random() * worldCache[gamemode].width, Math.random() * worldCache[gamemode].height, 0, 0, 100, 100, [100, 100], [tankColor, 10, [true, "block"], "basic", [0,0,0,0,0,0,0,0,0,0]], "player", playerid, (document.getElementById('name').value.trim() !== "" ?  document.getElementById('name').value : "Nameless Tank"))
    requestAnimationFrame(loop);
    handleKeys(); // Handle key presses
    ui.style.display = "block";
    return true;
    } else {
    ui.style.display = "none";
  }
}

function handleKeys() {
  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'e') {
      autofire = !autofire
    }
    if (e.key.toLowerCase() === 'c') {
      autospin = !autospin
    }
  })
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  })
  document.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    keys.click = true
  } else if (e.button === 2) {
    keys.rightclick = true
  }
})
document.addEventListener("mouseup", (e) => {
  if (e.button === 0) {
    keys.click = false
  } else if (e.button === 2) {
    keys.rightclick = false
  }
})

}
// Robot Function
function scoreCalc(totalScore) {
  let levels = 0;
  let score = totalScore;
  let step = 100;
  let requiredForNext = 100;

  while (score >= requiredForNext) {
    score -= requiredForNext;
    levels++;

    if (levels % 9 === 0) {
      step *= 10;
    }

    requiredForNext += step;
  }

  return {
    lvl: levels,
    score: score
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
  let playername;
  let playerxp;

ctx.setTransform(1, 0, 0, 1, 0, 0); 
ctx.clearRect(0, 0, canvas.width, canvas.height);
// Math and Rendering? Me, A Dummy? In Javascript? Robot Time.
let player = objects.find(o => o.id === playerid);
  if (player) {
    camera.x += (player.pos[2] - camera.x) * 0.1;
    camera.y += (player.pos[3] - camera.y) * 0.1;
  }
  ctx.save();
  ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);
  let currentWorld = worldCache[gamemode] ? worldCache[gamemode] : (worlds && worldCache[gamemode] ? worldCache[gamemode] : { width: 1000, height: 1000 });
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
    if (o.id == playerid) {
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
  o.pos[4] = moveX * baseSpeed;
  o.pos[5] = moveY * baseSpeed;

  playername = o.name
  playerxp = o.exp
}
    if (o.library == "test") {
      if (o.type == "block") {
        ctx.fillStyle = o.optional[0];
        ctx.fillRect(o.pos[2], o.pos[3], o.pos[0], o.pos[1]);
        ctx.strokeStyle = borderColor(o.optional[0]);
        ctx.lineWidth = 1;
        ctx.strokeRect(o.pos[2], o.pos[3], o.pos[0], o.pos[1]);
      }
      if (o.type == "circle") {
        ctx.fillStyle = o.optional[0];
        ctx.beginPath();
        ctx.arc(o.pos[2], o.pos[3], o.optional[1] || ((o.pos[0] / o.pos[1]) * 10), 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = borderColor(o.optional[0]);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else if (o.library == "player") {
      const radius = o.optional[1] || ((o.pos[0] / o.pos[1]) * 10) || 10;
      if (o.type == "tank") {
        ctx.translate(o.pos[2], o.pos[3]);
        ctx.rotate(o.pos[6] || 0);
        
        const turrets = entity.builds[o.optional?.[3] || 'basic']?.[6] || [];
        
        ctx.fillStyle = '#999999';
        ctx.strokeStyle = borderColor('#999999');
        ctx.lineWidth = 2;
        
        for (const t of turrets) {
          const rad = (t[2] * Math.PI) / 180;
          ctx.rotate(rad);
        
          ctx.beginPath();
          ctx.rect(t[4], t[3] - t[5] / 2, t[6], t[5]);
          ctx.fill();
          ctx.stroke();
        
          ctx.rotate(-rad);
        }
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = o.optional?.[0] || '#00b2e1';
        ctx.fill();
        ctx.strokeStyle = borderColor(o.optional?.[0] || '#00b2e1');
        ctx.stroke();

        ctx.fillStyle = o.optional[0];
        ctx.beginPath();
        ctx.arc(o.pos[2], o.pos[3], radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = borderColor(o.optional[0]);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (o.name) {
        ctx.font = 'bold 6px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.strokeText(o.name, o.pos[2], o.pos[3] - radius - 3);
    
        ctx.fillStyle = '#ffffff';
        ctx.fillText(o.name, o.pos[2], o.pos[3] - radius - 3);
      }
    } else if (o.library == "wall") {
      if (o.type == "wall") {
        if (o.optional[3][2] == 'circle') {
          ctx.fillStyle = o.optional[0];
          ctx.beginPath();
          ctx.arc(o.pos[2], o.pos[3], o.optional[1] || ((o.pos[0] / o.pos[1]) * 10), 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = borderColor(o.optional[0]);
          ctx.lineWidth = 4;
          ctx.stroke();
        } else {
          ctx.fillStyle = o.optional[0];
          ctx.fillRect(o.pos[2], o.pos[3], o.pos[0], o.pos[1]);
          ctx.strokeStyle = borderColor(o.optional[0]);
          ctx.lineWidth = 6;
          ctx.strokeRect(o.pos[2], o.pos[3], o.pos[0], o.pos[1]);
        }
      }
      let multiwall = false
      let wallsides = 3
      if (o.type == 'triwall') {multiwall = true; wallsides = 3}
      if (o.type == 'quadwall') {multiwall = true; wallsides = 4}
      if (o.type == 'quintwall' || o.type == '5wall') {multiwall = true; wallsides = 5}
      if (o.type == 'sexwall' || o.type == 'hexwall' || o.type == '6wall') {multiwall = true; wallsides = 6}
      if (o.type == 'sepwall' || o.type == 'hepwall' || o.type == 'septawall' || o.type == 'heptawall' || o.type == '7wall') {multiwall = true; wallsides = 7}
      if (o.type == 'octowall' || o.type == 'octawall' || o.type == '8wall') {multiwall = true; wallsides = 8}
      if (o.type == 'nonawall' || o.type == '9wall') {multiwall = true; wallsides = 9}
      if (o.type == 'decawall' || o.type == '10wall') {multiwall = true; wallsides = 10}
      if (o.type == 'hendecawall' || o.type == '11wall') {multiwall = true; wallsides = 11}
      if (o.type == 'dodecawall' || o.type == '12wall') {multiwall = true; wallsides = 12}
      if (multiwall) {
        for (let i = 0; i < wallsides; i++) {
          const angle = i * (Math.PI * 2) / wallsides;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.fillStyle = o.optional[0];
        ctx.fill();
        ctx.strokeStyle = borderColor(o.optional[0]);
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    } else if(o.library == "bullet") {
      ctx.fillStyle = o.optional[0];
        ctx.beginPath();
        ctx.arc(o.pos[2], o.pos[3], o.optional[1] || ((o.pos[0] / o.pos[1]) * 10), 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = borderColor(o.optional[0]);
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    o.pos[2] += o.pos[4]
    o.pos[3] += o.pos[5]
})
  shapes.forEach((s) => {
    const shape = entity.shapes.find(child => child.type === s.type);
    for (let i = 0; i < sides; i++) {
      const angle = i * (Math.PI * 2) / Number(shape.sides);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fillStyle = shape.color;
    ctx.fill();
    ctx.strokeStyle = borderColor(shape.color);
    ctx.lineWidth = 5;
    ctx.stroke();
  });
  ctx.restore();
    // time to make myself an xp bar (robotless, but tutorialful)
  const xpsize = { "x": window.innerWidth / 3, "y": window.innerHeight / 20 }
  const xploc = { "x": (window.innerWidth / 2) - (xpsize.x / 2), "y": window.innerHeight - xpsize.y - 10 };
  ctx.beginPath();
  ctx.fillStyle = '#aeaeae'; // AEiou.
  ctx.strokeStyle = '#0c0c0c'; // 0c0c0c0c0c0c0c0c0c0c0c0c....
  ctx.lineWidth = 6; // hopefully... this is good.
  ctx.roundRect(xploc.x, xploc.y, xpsize.x, xpsize.y, 20);
  ctx.fill();
  ctx.stroke();
  
  const calcName = {"x": window.innerWidth / 2, "y": xploc.y - 16}
  const calcScore = {"x": window.innerWidth / 2, "y": xploc.y + (xpsize.y / 2)}
  ctx.beginPath();
  ctx.font = 'Bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  ctx.strokeText(playername || "A Strange Player", calcName.x, calcName.y);
  ctx.fillStyle = 'white';
  ctx.fillText(playername || "A Strange Player", calcName.x, calcName.y);
  ctx.strokeText("Level " + String(scoreCalc(playerxp).lvl), calcScore.x, calcScore.y);
  ctx.fillText("Level " + String(scoreCalc(playerxp).lvl), calcScore.x, calcScore.y);
  ctx.fill();
  
  ctx.beginPath();
  ctx.fillStyle = '#00FF00'
  ctx.roundRect(xploc.x, xploc.y, scoreCalc(playerxp).score / xpsize.x, xpsize.y);
  ctx.fill();
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
document.getElementById('play').addEventListener('click', play);
//})()
