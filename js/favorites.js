export const FAVORITES_STORAGE_KEY = "yodo.favorites.v1";

export function readFavorites(products) {
  let serialized;
  try {
    serialized = localStorage.getItem(FAVORITES_STORAGE_KEY);
  } catch (error) {
    console.error("Les favoris enregistrés n’ont pas pu être lus.", error);
    return new Set();
  }
  if (serialized === null) return new Set();

  let savedIds;
  try {
    savedIds = JSON.parse(serialized);
  } catch (error) {
    console.error("Les favoris enregistrés contiennent des données JSON invalides.", error);
    return new Set();
  }
  if (!Array.isArray(savedIds)) {
    console.error("Les favoris enregistrés n’ont pas le format attendu.");
    return new Set();
  }

  const favorites = new Set();
  savedIds.forEach((id) => {
    if (typeof id !== "string" || !products[id]) {
      console.warn("Un favori invalide a été ignoré.", id);
      return;
    }
    favorites.add(id);
  });
  return favorites;
}

export function writeFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
    return true;
  } catch (error) {
    console.error("Les favoris n’ont pas pu être enregistrés.", error);
    return false;
  }
}
