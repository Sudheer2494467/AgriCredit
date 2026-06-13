import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";

/** Guards routes that only admins can access */
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.isAuthenticated()) {
    localStorage.clear();
    router.navigate(["/login"]);
    return false;
  }

  if (!auth.isAdmin()) {
    router.navigate(["/login"]);
    return false;
  }

  return true;
};
