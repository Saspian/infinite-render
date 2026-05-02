import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function logout(statusCode: number, router: AppRouterInstance) {
  if (statusCode === 401) {
    clearLocalStorage();
    router.replace("/login");
    return;
  }
}

export function clearLocalStorage() {
  localStorage.removeItem("_t");
  localStorage.removeItem("_u");
  localStorage.removeItem("_id");
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("showCompleted");
}
