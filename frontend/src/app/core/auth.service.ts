import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "./environment";
import { tap } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(private http: HttpClient) {}

  private normalizeRole(role: string): string {
    if (role === "ROLE_ADMIN" || role === "ADMIN") {
      return "ADMIN";
    }

    if (role === "ROLE_USER" || role === "USER" || role === "FARMER") {
      return "FARMER";
    }

    return role;
  }

  login(username: string, password: string) {
    return this.http
      .post<{
        token: string;
        role: string;
        farmerId?: number;
      }>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem("token", res.token);
          localStorage.setItem("role", this.normalizeRole(res.role));
          if (res.farmerId) {
            localStorage.setItem("farmerId", res.farmerId.toString());
          }
        }),
      );
  }

  token(): string | null {
    return localStorage.getItem("token");
  }
  getRole(): string | null {
    return localStorage.getItem("role");
  }
  getFarmerId(): number | null {
    const id = localStorage.getItem("farmerId");
    return id ? parseInt(id, 10) : null;
  }
  isAuthenticated(): boolean {
    const token = this.token();
    if (!token) return false;
  
    try {
     
      const base64Url = token.split(".")[1] || "";
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      
      const pad = base64.length % 4;
      const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
      const payload = JSON.parse(atob(padded));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.clear();
        return false;
      }
    } catch (e) {
      localStorage.clear();
      return false;
    }
    return true;
  }
  isAdmin(): boolean {
    return this.getRole() === "ADMIN";
  }
  isFarmer(): boolean {
    return this.getRole() === "FARMER";
  }
  logout(): void {
    localStorage.clear();
  }
}
