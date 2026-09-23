async function definitionJsonLoader() {
  try {
    const entityfetch = await fetch("entity.json");
    const entityStuff = await response.json();
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
alert(entity);
console.log(entity);
