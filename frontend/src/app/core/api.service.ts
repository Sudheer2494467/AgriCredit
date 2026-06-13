import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "./environment";
import { Category, Farmer, Product, Stock } from "./models";

@Injectable({ providedIn: "root" })
export class ApiService {
  constructor(private http: HttpClient) {}

  dashboard() {
    return this.http.get<any>(`${environment.apiUrl}/reports/dashboard`);
  }

  farmers(q = "") {
    return this.http.get<Farmer[]>(`${environment.apiUrl}/farmers`, {
      params: q ? { q } : {},
    });
  }
  getFarmer(id: number) {
    return this.http.get<Farmer>(`${environment.apiUrl}/farmers/${id}`);
  }
  saveFarmer(payload: Farmer) {
    return payload.id
      ? this.http.put<any>(`${environment.apiUrl}/farmers/${payload.id}`, payload)
      : this.http.post<any>(`${environment.apiUrl}/farmers`, payload);
  }
  deleteFarmer(id: number) {
    return this.http.delete(`${environment.apiUrl}/farmers/${id}`);
  }

  // Category endpoints
  categories() {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }
  addCategory(name: string) {
    return this.http.post<Category>(`${environment.apiUrl}/categories`, {
      name,
    });
  }

  // Product endpoints
  products() {
    return this.http.get<Product[]>(`${environment.apiUrl}/products`);
  }
  addProduct(payload: any) {
    return this.http.post<Product>(`${environment.apiUrl}/products`, payload);
  }

  // Stock endpoints
  stock() {
    return this.http.get<Stock[]>(`${environment.apiUrl}/stock`);
  }
  stockIn(stockId: number, quantity: number) {
    return this.http.post(`${environment.apiUrl}/stock/${stockId}/in`, {
      quantity,
    });
  }
  stockMovements() {
    return this.http.get<any[]>(`${environment.apiUrl}/stock/movements`);
  }

  // Credit endpoints
  createCredit(payload: any) {
    return this.http.post(`${environment.apiUrl}/credit`, payload);
  }
  farmerCredits(farmerId: number) {
    return this.http.get<any[]>(
      `${environment.apiUrl}/credit/farmer/${farmerId}`,
    );
  }
  farmerPendingCredits(farmerId: number) {
    return this.http.get<any[]>(
      `${environment.apiUrl}/credit/farmer/${farmerId}/pending`,
    );
  }
  approveCredit(voucherId: number) {
    return this.http.put(`${environment.apiUrl}/credit/${voucherId}/approve`, {});
  }

  // Market price endpoints (persistent DB — new)
  getMarketPrices() {
    return this.http.get<any>(`${environment.apiUrl}/api/market-prices`);
  }
  updateMarketPrice(id: number, payload: any) {
    return this.http.put<any>(`${environment.apiUrl}/api/market-prices/${id}`, payload);
  }
  createMarketPrice(payload: any) {
    return this.http.post<any>(`${environment.apiUrl}/api/market-prices`, payload);
  }
  deleteMarketPrice(id: number) {
    return this.http.delete(`${environment.apiUrl}/api/market-prices/${id}`);
  }

  // Legacy crop price endpoint (kept for dashboard backward-compat)
  getCropPrices() {
    return this.http.get<any>(`${environment.apiUrl}/api/market-prices`);
  }

  // Settlement endpoints
  createSettlement(payload: any) {
    return this.http.post(`${environment.apiUrl}/settlement`, payload);
  }
  settlements(farmerId: number) {
    return this.http.get<any[]>(
      `${environment.apiUrl}/settlement/farmer/${farmerId}`,
    );
  }

  // Interest endpoints
  calculateInterest(payload: any) {
    return this.http.post(`${environment.apiUrl}/interest/calculate`, payload);
  }

  // Farmer transaction history
  farmerTransactionHistory(farmerId: number) {
    return this.http.get<any[]>(
      `${environment.apiUrl}/farmers/${farmerId}/transactions`,
    );
  }

  // Auth endpoints
  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/change-password`, { currentPassword, newPassword });
  }

  // Settings endpoints
  getSettings() {
    return this.http.get<any>(`${environment.apiUrl}/api/settings`);
  }
  updateSettings(payload: any) {
    return this.http.put(`${environment.apiUrl}/api/settings`, payload);
  }

  // CSV Export utility
  exportCsv(filename: string, headers: string[], data: any[], mapper: (row: any) => string[]) {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += headers.join(",") + "\n";
    
    // Add data rows
    data.forEach(row => {
      const rowData = mapper(row).map(val => {
        // Escape quotes and wrap in quotes if contains comma
        const strVal = String(val || '').replace(/"/g, '""');
        return strVal.includes(',') ? `"${strVal}"` : strVal;
      });
      csvContent += rowData.join(",") + "\n";
    });
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
