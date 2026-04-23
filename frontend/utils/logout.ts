export function clearLocalStorage() {
  localStorage.removeItem("_t");
  localStorage.removeItem("_id");
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("showCompleted");
}
