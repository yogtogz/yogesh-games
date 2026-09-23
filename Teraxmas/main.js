async function definitionJsonLoader() {
  try {
    const entityfetch = await fetch("entity.json");
    const entityStuff = await entityfetch.json();
    return entityStuff;
  } catch(er) {
    alert("Error in async")
    alert(er);
    console.warn("Unable to load json. Client will fail to be able to play :(");
    console.warn(er);
    return er;
  }
}
const entity = definitionJsonLoader();
alert("Attempting Entity Json Load");
alert("err: "+entity);
console.log(entity);

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
