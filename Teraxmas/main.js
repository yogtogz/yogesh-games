async function definitionJsonLoader() {
  try {
    const entityfetch = await fetch("entity.json");
    const entityStuff = await response.json();
    return entityStuff;
  } catch(er) {
    alert(er);
  }
}
const entity = definitionJsonLoader();
alert(entity)
