import { Component, OnInit } from "@angular/core";
import { CommonModule, AsyncPipe } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatIconModule } from "@angular/material/icon";
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ApiService } from "../core/api.service";

@Component({
  selector: "app-farmer-ledger",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    AsyncPipe,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2 class="page-title">Farmer Ledger</h2>
        <p class="page-subtitle">Search for a farmer to view their complete transaction history and profile</p>
      </div>

      <div class="search-layout">
        <mat-card class="search-card glass-card">
          <div class="search-header">
            <mat-icon>search</mat-icon>
            <span>Find Farmer Profile</span>
          </div>
          
          <mat-form-field appearance="outline" class="full-width">
            <input type="text" matInput [formControl]="searchCtrl" [matAutocomplete]="auto" placeholder="Type farmer name, village, or phone...">
            <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFarmer" (optionSelected)="goToFarmer($event.option.value)">
              <mat-option *ngFor="let f of filteredFarmers | async" [value]="f">
                {{ f.name }} ({{ f.village }} - {{ f.phone }})
              </mat-option>
            </mat-autocomplete>
          </mat-form-field>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 800px;
        margin: 0 auto;
        animation: fadeIn 0.4s ease-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .page-header {
        margin-bottom: 32px;
      }

      .page-title {
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 8px;
        color: var(--clr-text);
      }

      .page-subtitle {
        color: var(--clr-text-muted);
        margin: 0;
      }

      .search-layout {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .search-card {
        padding: 32px;
      }
      
      .search-header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 18px;
        font-weight: 600;
        color: var(--clr-text);
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--clr-border);
      }
      
      .search-header mat-icon {
        color: var(--clr-primary-light);
      }
      
      .full-width {
        width: 100%;
      }
    `
  ]
})
export class FarmerLedgerComponent implements OnInit {
  farmers: any[] = [];
  searchCtrl = new FormControl();
  filteredFarmers!: Observable<any[]>;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.api.farmers().subscribe(data => {
      this.farmers = data;
      this.filteredFarmers = this.searchCtrl.valueChanges.pipe(
        startWith(''),
        map(value => {
          const name = typeof value === 'string' ? value : (value as any)?.name;
          return name ? this._filterFarmers(name as string) : this.farmers.slice();
        })
      );
    });
  }
  
  private _filterFarmers(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.farmers.filter(f => 
      f.name.toLowerCase().includes(filterValue) || 
      (f.phone && f.phone.includes(filterValue)) ||
      (f.village && f.village.toLowerCase().includes(filterValue))
    );
  }

  displayFarmer(farmer: any): string {
    return farmer && farmer.name ? `${farmer.name} (${farmer.village})` : '';
  }

  goToFarmer(farmer: any) {
    if (farmer && farmer.id) {
      this.router.navigate(['/farmer', farmer.id]);
    }
  }
}
