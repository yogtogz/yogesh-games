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
let upgradeBoxes = [];
const keys = {"a":false,"b":false,"c":false,"d":false,"e":false,"f":false,"g":false,"h":false,"i":false,"j":false,"k":false,"l":false,"m":false,"n":false,"o":false,"p":false,"q":false,"r":false,"s":false,"t":false,"u":false,"v":false,"w":false,"x":false,"y":false,"z":false,"0":false,"1":false,"2":false,"3":false,"4":false,"5":false,"6":false,"7":false,"8":false,"9":false,"enter":false,"escape":false,"space":false,"backspace":false,"shift":false,"control":false,"alt":false,"arrowup":false,"arrowdown":false,"arrowleft":false,"arrowright":false,"minus":false,"equal":false,"bracketleft":false,"bracketright":false,"backslash":false,"semicolon":false,"quote":false,"comma":false,"period":false,"slash":false,"backquote":false};
const camera = {
  x: 0,
  y: 0,
  zoom:1.5
};
const worldCache = {"width": 5000, "height": 5000};
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
// opt: [color/hex, radius for circle/tank, collide:[canCollide,BlockOrCircle], tank, [Body Damage 1-9, Max Health 1-9, Bullet Speed 1-9, Bullet Health 1-9, Bullet Penetration 1-9, Bullet Damage 1-9, Reload 1-9, Move Speed 1-9, Shield Regen 1-9, Shield Capacity 1-9], [hasTeam, Team]]
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

window.addEventListener("blur", () => {
  for (const key in keys) {
    keys[key] = false;
  }
})

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    for (const key in keys) {
      keys[key] = false;
    }
  }
})

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
// data: {type, data}
// state_variable: {type: 'state_variable', data:{'The Entire state variable': 'is here'}
// state: {player: number, objects: {}, shapes: {}}

// robot. I hate using robot bro I keep getting errors from it I would have probably done better myself
// take this as a lesson, devtool lurkers.
function packet(data) {
  if (data?.type == "upgraded") objects.every(item => item.id === playerid).optional[3] = data.data
  if (data?.type !== 'state_variable') return;

  for (const [localList, serverList, isObjects] of [
    [objects, data.data.objects || [], true],
    [shapes, data.data.shapes || [], false]
  ]) {
    const localMap = new Map(localList.map(item => [item.id, item]));
    const serverIds = new Set();

    for (const sItem of serverList) {
      serverIds.add(sItem.id);
      const existing = localMap.get(sItem.id);

      if (existing) {
                if (isObjects && sItem.id === playerid) {
          const localAngle = existing.pos ? existing.pos[6] : 0;
          const prevRenderX = existing.renderX ?? sItem.pos[2]
          const prevRenderY = existing.renderY ?? sItem.pos[3]
          Object.assign(existing, sItem)
          if (typeof localAngle === 'number') existing.pos[6] = localAngle;
          existing.renderX = prevRenderX
          existing.renderY = prevRenderY;
          existing.renderAngle = existing.pos ? existing.pos[6] : 0
        } else {
          const prevRenderX = existing.renderX ?? existing.pos?.[2] ?? sItem.pos[2];
          const prevRenderY = existing.renderY ?? existing.pos?.[3] ?? sItem.pos[3]
          const prevRenderAngle = existing.renderAngle ?? existing.pos?.[6] ?? 0
          Object.assign(existing, sItem);
          if (isObjects) {
            existing.renderX = prevRenderX
            existing.renderY = prevRenderY
            existing.renderAngle = prevRenderAngle;
          }
        }
      } else {
        if (isObjects && Array.isArray(sItem.pos)) {
          sItem.renderX = sItem.pos[2];
          sItem.renderY = sItem.pos[3];
          sItem.renderAngle = sItem.pos[6] || 0;
        }

        localList.push(sItem);
      }
    }

    for (let i = localList.length - 1; i >= 0; i--) {
      if (!serverIds.has(localList[i].id)) localList.splice(i, 1);
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
      window.socket.send(JSON.stringify({ type: 'greeting', data: { connected: true } }))

      window.stateInterval = setInterval(() => {
        if (moveX !== lastMoveX || moveY !== lastMoveY) {
          send('move', { id: playerid, x: moveX, y: moveY, collide: true });
          lastMoveX = moveX;
          lastMoveY = moveY;
        }

        let playerthingy = objects.find(child => child.id === playerid)
        if (playerthingy?.pos) {
        if (autospin) {
          playerthingy.pos[6] = (playerthingy.pos[6] + 0.03) % (2 * Math.PI)
        }
        wasFiring = isFiring
        isFiring = Boolean(autofire || keys.space || keys.click);
        if (isFiring != wasFiring) send('shoot', {id: playerid, isFiring: isFiring, angle: playerthingy.pos[6]});
        }
        send('state', { id: playerid, angle: playerthingy?.pos ? playerthingy.pos[6] : 0 });
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
  const me = objects.find(o => o.id === playerid);
  if (me?.pos && !autospin) {
    me.pos[6] = Math.atan2(mouseY - window.innerHeight / 2, mouseX - window.innerWidth / 2);
  }
});
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
function summonObject(lib="test", ty="block", w=50, h=50, x=0, y=0, vx=0, vy=0, xp=0, dmg=0, hp=[100,100], opt=["default", null,[false,"block"], null, null, [false, "blue"]], tag=null,id=idGen(), name = "") {
  if (lib == "player") send('player_new', [lib, ty, w, h, x, y, vx, vy, xp, dmg, hp, opt, tag, id, name])
}
async function renderGame(what) {
  let ui = document.getElementById("gamecanvas");
  if (what) {
  let tankColor = (window.entity && window.entity.player && window.entity.player.tank)
    ? window.entity.player.tank.color 
    : "#3ca4cb";
    playerid = idGen()
    summonObject("player","tank", 0, 0, Math.random() * worldCache[gamemode].width, Math.random() * worldCache[gamemode].height, 0, 0, 100, 100, [100, 100], [tankColor, 10, [true, "block"], "basic", [0,0,0,0,0,0,0,0,0,0], [false, "blue"]], "player", playerid, (document.getElementById('name').value.trim() !== "" ?  document.getElementById('name').value : "Nameless Tank"))
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
function lerpAngle(current, target, t) {
  let diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * t;
}

document.getElementById("gamecanvas").addEventListener("click", (e) => {
  const rect = e.target.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  for (const box of upgradeBoxes) {
    if (cx >= box.x && cx <= box.x + box.w && cy >= box.y && cy <= box.y + box.h) {
      send('upgrade', { id: playerid, tank: box.tankId });
      break;
    }
  }
});

let lastTime = 0;
// W w3schools for the tutorial stuff
function renderCanvas(dt = 0.016) {
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
 ctx.scale(dpr,dpr);
// Math and Rendering? Me, A Dummy? In Javascript? Robot Time.
  let player = objects.find(o => o.id === playerid);
  if (player) {
    camera.x += ((player.renderX ?? player.pos[2]) - camera.x) * 0.25;
    camera.y += ((player.renderY ?? player.pos[3]) - camera.y) * 0.25;
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
const renderOrder = ['bullet', 'player', 'test 2', 'wall'];
objects.sort((a, b) => renderOrder.indexOf(a.library) - renderOrder.indexOf(b.library));
objects.forEach(o => {
  if (Array.isArray(o.pos)) {
    if (typeof o.renderX !== 'number') {
      o.renderX = o.pos[ 2];
      o.renderY = o.pos[ 3];
    } else {
      const smooth = 1 - Math.pow(0.001, dt);
      o.renderX += (o.pos[ 2] - o.renderX) * smooth;
      o.renderY += (o.pos[ 3] - o.renderY) * smooth;
    }
  }


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

    // Keep aim angle updated every frame using smoothed renderX/renderY
    if (o.pos && !autospin) {
      const screenX = window.innerWidth / 2 + (o.renderX - camera.x) * camera.zoom;
      const screenY = window.innerHeight / 2 + (o.renderY - camera.y) * camera.zoom;
      if (Number.isFinite(Math.atan2(mouseY - screenY, mouseX - screenX))) o.pos[6] = Math.atan2(mouseY - screenY, mouseX - screenX);
    }

    playername = o.name;
    playerxp = o.exp;
  }

  if (o.library == "test") {
    if (o.type == "block") {
      ctx.fillStyle = o.optional[0];
      ctx.fillRect(o.renderX, o.renderY, o.pos[0], o.pos[1]);
      ctx.strokeStyle = borderColor(o.optional[0]);
      ctx.lineWidth = 1;
      ctx.strokeRect(o.renderX, o.renderY, o.pos[0], o.pos[1]);
    }
    if (o.type == "circle") {
      ctx.fillStyle = o.optional[0];
      ctx.beginPath();
      ctx.arc(o.renderX, o.renderY, o.optional[1] || ((o.pos[0] / o.pos[1]) * 10), 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = borderColor(o.optional[0]);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  } else if (o.library == "player") {
    const radius = o.optional[1] || ((o.pos[0] / o.pos[1]) * 10) || 10;
    const build = entity.builds[o.optional?.[3] || 'basic'] || [];
    const bodyType = (o.type && o.type !== 'tank' ? o.type : (build[1] || 'normal'))

    if (o.type == "tank" || bodyType === 'smasher' || bodyType === 'landmine' || bodyType === 'spike') {
      const targetAngle = o.pos[6] || 0;
      if (o.id === playerid || typeof o.renderAngle !== 'number') {
        o.renderAngle = targetAngle;
      } else {
        let diff = ((targetAngle - o.renderAngle + Math.PI) % (Math.PI * 2)) - Math.PI;
        if (diff < -Math.PI) diff += Math.PI * 2;
        o.renderAngle += diff * 0.25;
      }

      const turrets = build[6] || [];

      const serverAlpha = typeof o.alpha === 'number' ? o.alpha : 1;
      const drawAlpha = (o.id === playerid) ? Math.max(0.25, serverAlpha) : serverAlpha;

      ctx.save();
      ctx.globalAlpha = drawAlpha;
      ctx.translate(o.renderX, o.renderY);
      ctx.rotate(o.renderAngle);

      if (bodyType === 'smasher' || bodyType === 'landmine' || bodyType === 'spike') {
        o.smasherSpin = ((o.smasherSpin || 0) + (bodyType === 'spike' ? 0.06 : 0.04)) % (Math.PI * 2);

        if (bodyType === 'spike') {
          ctx.save();
          ctx.rotate(o.smasherSpin);
          ctx.beginPath();
          const spikes = 12;
          const outerR = radius * 1.38;
          const innerR = radius * 1.05;
          for (let i = 0; i < spikes * 2; i++) {
            const r = (i % 2 === 0) ? outerR : innerR;
            const a = (i * Math.PI) / spikes;
            const sx = Math.cos(a) * r;
            const sy = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fillStyle = '#555555';
          ctx.fill();
          ctx.strokeStyle = '#333333';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        } else {
          // Landmine second counter-rotating hexagon layer
          if (bodyType === 'landmine') {
            ctx.save();
            ctx.rotate(-o.smasherSpin * 1.4);
            ctx.beginPath();
            const outerLandmineR = radius * 1.32;
            for (let i = 0; i < 6; i++) {
              const a = (i * Math.PI) / 3;
              const sx = Math.cos(a) * outerLandmineR;
              const sy = Math.sin(a) * outerLandmineR;
              if (i === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.closePath();
            ctx.fillStyle = '#444444';
            ctx.fill();
            ctx.strokeStyle = '#2b2b2b';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          }

          // Smasher & Landmine primary spinning hexagon shell
          ctx.save();
          ctx.rotate(o.smasherSpin);
          ctx.beginPath();
          const shellRadius = radius * 1.22;
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3;
            const sx = Math.cos(a) * shellRadius;
            const sy = Math.sin(a) * shellRadius;
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fillStyle = '#555555';
          ctx.fill();
          ctx.strokeStyle = '#333333';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.fillStyle = '#999999';
      ctx.strokeStyle = borderColor('#999999');
      ctx.lineWidth = 2;

      for (const t of turrets) {
        if (t[0] === 'auto') continue;
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
      ctx.fillStyle = o.optional?.[0] || '#3ca4cb';
      ctx.fill();
      ctx.strokeStyle = borderColor(o.optional?.[0] || '#3ca4cb');
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const autoTurrets = turrets.filter(t => t[0] === 'auto');
      if (autoTurrets.length > 0) {
        ctx.fillStyle = '#999999';
        ctx.strokeStyle = borderColor('#999999');
        ctx.lineWidth = 2;

        for (const t of autoTurrets) {
          const baseRad = (t[2] * Math.PI) / 180;
          const rad = (typeof o.autoAngle === 'number')
            ? (o.autoAngle - o.renderAngle + baseRad)
            : baseRad;
          ctx.rotate(rad);
          ctx.beginPath();
          ctx.rect(t[4], t[3] - t[5] / 2, t[6], t[5]);
          ctx.fill();
          ctx.stroke();
          ctx.rotate(-rad);
        }

        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = '#999999';
        ctx.fill();
        ctx.strokeStyle = borderColor('#999999');
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.rotate(-o.renderAngle);

      if (o.name && drawAlpha > 0.05) {
        ctx.font = 'bold 6px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.strokeText(o.name, 0, -radius - 1);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(o.name, 0, -radius - 1);
      }

      ctx.restore();
    }
  } else if (o.library == "wall") {
    if (o.type == "wall") {
      if (o.optional[3][2] == 'circle') {
        ctx.fillStyle = o.optional[0]
        ctx.beginPath();
        ctx.arc(o.renderX, o.renderY, o.optional[1] || ((o.pos[0] / o.pos[1]) * 10), 0, 2 * Math.PI)
        ctx.fill();
        ctx.strokeStyle = borderColor(o.optional[0])
        ctx.lineWidth = 4;
        ctx.stroke();
      } else {
        ctx.fillStyle = o.optional[0];
        ctx.fillRect(o.renderX, o.renderY, o.pos[0], o.pos[1]);
        ctx.strokeStyle = borderColor(o.optional[0]);
        ctx.lineWidth = 6;
        ctx.strokeRect(o.renderX, o.renderY, o.pos[0], o.pos[1]);
      }
    }
    let multiwall = false;
    let wallsides = 3;
    if (o.type == 'triwall') { multiwall = true; wallsides = 3; }
    if (o.type == 'quadwall') { multiwall = true; wallsides = 4; }
    if (o.type == 'quintwall' || o.type == '5wall') { multiwall = true; wallsides = 5; }
    if (o.type == 'sexwall' || o.type == 'hexwall' || o.type == '6wall') { multiwall = true; wallsides = 6; }
    if (o.type == 'sepwall' || o.type == 'hepwall' || o.type == 'septawall' || o.type == 'heptawall' || o.type == '7wall') { multiwall = true; wallsides = 7; }
    if (o.type == 'octowall' || o.type == 'octawall' || o.type == '8wall') { multiwall = true; wallsides = 8; }
    if (o.type == 'nonawall' || o.type == '9wall') { multiwall = true; wallsides = 9; }
    if (o.type == 'decawall' || o.type == '10wall') { multiwall = true; wallsides = 10; }
    if (o.type == 'hendecawall' || o.type == '11wall') { multiwall = true; wallsides = 11; }
    if (o.type == 'dodecawall' || o.type == '12wall') { multiwall = true; wallsides = 12; }
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
      ctx.fillStyle = o.optional[0]
      ctx.fill();
      ctx.strokeStyle = borderColor(o.optional[0])
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  } else if (o.library == "bullet") {
    ctx.fillStyle = o.optional[0]
    ctx.beginPath();
    ctx.arc(o.renderX, o.renderY, o.optional[1] || ((o.pos[0] / o.pos[1]) * 10), 0, 2 * Math.PI)
    ctx.fill();
    ctx.strokeStyle = borderColor(o.optional[0])
    ctx.lineWidth = 1;
    ctx.stroke();
  }
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
  const currentTankId = player?.optional?.[3] || 'basic';
  const currentBuild = entity?.builds?.[currentTankId];
  const upgradesMap = (currentBuild?.[7] && typeof currentBuild[7] === 'object' && !Array.isArray(currentBuild[7]))
    ? currentBuild[7]
    : {};
  const currentLvl = player ? scoreCalc(player.exp || 0).lvl : 0;
  const availableUpgrades = Object.entries(upgradesMap).filter(([_, reqLvl]) => currentLvl >= reqLvl);

  if (player && availableUpgrades.length > 0) {
    const cardColors = ['#6cf0f0', '#87f06c', '#f06c6c', '#f0d96c', '#b66cf0', '#f09c6c'];
    const cardSize = 78;
    const gap = 10;
    const startX = 16;
    const startY = 16;

    // Diep-style header pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(startX, startY, Math.max(130, availableUpgrades.length * (cardSize + gap) - gap), 24, 6);
    ctx.fill();
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Upgrades', startX + 10, startY + 12);

    availableUpgrades.forEach(([upId, reqLvl], idx) => {
      const upBuild = entity?.builds?.[upId];
      if (!upBuild) return;

      const bx = startX + idx * (cardSize + gap);
      const by = startY + 32;
      const bg = cardColors[idx % cardColors.length];

      upgradeBoxes.push({ x: bx, y: by, w: cardSize, h: cardSize, tankId: upId });

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bx, by, cardSize, cardSize, 8);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = borderColor(bg);
      ctx.stroke();

      const cx = bx + cardSize / 2;
      const cy = by + cardSize / 2 - 6;
      const previewSpin = (performance.now() / 900) % (Math.PI * 2);
      const upType = (upBuild[1] || 'Normal').toLowerCase();
      const upTurrets = upBuild[6] || [];
      const pRad = 13;

      ctx.translate(cx, cy);
      ctx.rotate(previewSpin);

      if (upType === 'smasher' || upType === 'landmine' || upType === 'spike') {
        ctx.beginPath();
        const pts = upType === 'spike' ? 24 : 6;
        for (let i = 0; i < pts; i++) {
          const r = upType === 'spike' ? (i % 2 === 0 ? pRad * 1.38 : pRad * 1.05) : pRad * 1.25;
          const a = (i * Math.PI * 2) / pts;
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fillStyle = '#555555';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#333333';
        ctx.stroke();
      }

      ctx.fillStyle = '#999999';
      ctx.strokeStyle = '#555555';
      ctx.lineWidth = 2;
      for (const t of upTurrets) {
        if (t[0] === 'auto') continue;
        const rad = (t[2] * Math.PI) / 180;
        ctx.rotate(rad);
        ctx.beginPath();
        ctx.rect(t[4] * 1.2, (t[3] - t[5] / 2) * 1.2, t[6] * 1.2, t[5] * 1.2);
        ctx.fill();
        ctx.stroke();
        ctx.rotate(-rad);
      }

      ctx.beginPath();
      ctx.arc(0, 0, pRad, 0, Math.PI * 2);
      ctx.fillStyle = player.optional?.[5][0] ? player.optional?.[5][1] || player.optional?.[0] : "#f14e54"
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = borderColor(player.optional?.[0] || '#3ca4cb');
      ctx.stroke();
      
      const previewAutos = upTurrets.filter(t => t[0] === 'auto');
      if (previewAutos.length > 0) {
        ctx.fillStyle = '#999999';
        ctx.strokeStyle = '#555555';
        for (const t of previewAutos) {
          const rad = (t[2] * Math.PI) / 180;
          ctx.rotate(rad);
          ctx.beginPath();
          ctx.rect(t[4] * 1.2, (t[3] - t[5] / 2) * 1.2, t[6] * 1.2, t[5] * 1.2);
          ctx.fill();
          ctx.stroke();
          ctx.rotate(-rad);
        }
        ctx.beginPath();
        ctx.arc(0, 0, pRad * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = '#999999';
        ctx.fill();
        ctx.stroke();
      }

      ctx.rotate(-previewSpin);
      ctx.translate(-cx, -cy);

      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(upBuild[0], cx, by + cardSize - 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(upBuild[0], cx, by + cardSize - 5);
      ctx.restore();
    });
  }
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

  const dt = lastTime ? Math.min(0.1, (currentTime - lastTime) / 1000) : 0.016;
  lastTime = currentTime;

  renderCanvas(dt);
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
