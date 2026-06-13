import { Routes } from "@angular/router";
import { DashboardComponent } from "./features/dashboard.component";
import { FarmerDashboardComponent } from "./features/farmer-dashboard.component";
import { FarmersComponent } from "./features/farmers.component";
import { ProductsComponent } from "./features/products.component";
import { StockComponent } from "./features/stock.component";
import { CreditEntryComponent } from "./features/credit-entry.component";
import { SettlementComponent } from "./features/settlement.component";
import { ReportsComponent } from "./features/reports.component";
import { LoginComponent } from "./features/login.component";
import { authGuard } from "./core/auth.guard";
import { adminGuard } from "./core/admin.guard";
import { farmerGuard } from "./core/farmer.guard";


export const routes: Routes = [
  { path: "login", component: LoginComponent },

  { path: "", redirectTo: "/login", pathMatch: "full" },


  {
    path: "",
    canActivate: [authGuard, adminGuard],
    children: [
      { path: "admindashboard", component: DashboardComponent },
      { path: "farmers", component: FarmersComponent },
      { path: "products", component: ProductsComponent },
      { path: "stock", component: StockComponent },
      {
        path: "stock-history",
        loadComponent: () =>
          import("./features/stock-history.component").then(
            (m) => m.StockHistoryComponent,
          ),
      },
      {
        path: "farmer/:id",
        loadComponent: () =>
          import("./features/farmer-dashboard.component").then(
            (m) => m.FarmerDashboardComponent,
          ),
      },
      { path: "credit", component: CreditEntryComponent },
      { path: "settlement", component: SettlementComponent },
      {
        path: "farmer-ledger",
        loadComponent: () =>
          import("./features/farmer-ledger.component").then(
            (m) => m.FarmerLedgerComponent,
          ),
      },
      { path: "reports", component: ReportsComponent },
      {
        path: "settings",
        loadComponent: () =>
          import("./features/settings.component").then(
            (m) => m.SettingsComponent,
          ),
      },

      {
        path: "market-prices",
        loadComponent: () =>
          import("./features/crop-prices.component").then(
            (m) => m.CropPricesComponent,
          ),
      },
    ],
  },


  {
    path: "farmer-dashboard",
    canActivate: [farmerGuard],
    component: FarmerDashboardComponent,
  },
  {
    path: "my-credits",
    canActivate: [farmerGuard],
    loadComponent: () =>
      import("./features/my-credits.component").then(
        (m) => m.MyCreditsComponent,
      ),
  },
  {
    path: "crop-prices",
    canActivate: [farmerGuard],
    loadComponent: () =>
      import("./features/crop-prices.component").then(
        (m) => m.CropPricesComponent,
      ),
  },

  
  { path: "**", redirectTo: "login" },
];
