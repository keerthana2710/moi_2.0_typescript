export function setItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error('LocalStorage error:', error);
  }
}

export function getItem(key) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error('LocalStorage error:', error);
  }
}
