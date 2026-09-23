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
