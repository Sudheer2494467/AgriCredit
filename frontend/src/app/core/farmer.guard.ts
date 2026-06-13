import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";


export const farmerGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.isAuthenticated()) {
    router.navigate(["/login"]);
    return false;
  }

  if (!auth.isFarmer()) {
    router.navigate(["/admindashboard"]);
    return false;
  }

  return true;
};
