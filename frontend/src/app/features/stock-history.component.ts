import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    DatePipe
  ],
  template: `
    <div class="page-header">
      <h2 class="page-title">Stock Movement History</h2>
      <p class="page-subtitle">Audit trail of all inventory changes</p>
    </div>

    <div class="filters-card glass-card">
      <div class="filter-group">
        <mat-icon>filter_list</mat-icon>
        <span class="filter-label">Filters</span>
      </div>
      <div class="filter-controls">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Movement Type</mat-label>
          <mat-select [(ngModel)]="filterType" (selectionChange)="applyFilter()">
            <mat-option value="">All Types</mat-option>
            <mat-option value="IN">Stock In (Purchases/Returns)</mat-option>
            <mat-option value="OUT">Stock Out (Sales/Credits)</mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Search Product</mat-label>
          <input matInput [(ngModel)]="searchQuery" (input)="applyFilter()" placeholder="e.g. Urea">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>
    </div>

    <div class="table-wrap glass-card">
      <table mat-table [dataSource]="filteredMovements">
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date & Time</th>
          <td mat-cell *matCellDef="let m">{{ m.movedAt | date:'MMM d, y, h:mm a' }}</td>
        </ng-container>
        
        <ng-container matColumnDef="product">
          <th mat-header-cell *matHeaderCellDef>Product</th>
          <td mat-cell *matCellDef="let m">
            <span class="product-name">{{ m.product?.name }}</span>
            <span class="product-cat">{{ m.product?.category?.name }}</span>
          </td>
        </ng-container>
        
        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Type</th>
          <td mat-cell *matCellDef="let m">
            <span class="type-badge" [class.type-in]="m.movementType === 'IN'" [class.type-out]="m.movementType === 'OUT'">
              <mat-icon class="type-icon">{{ m.movementType === 'IN' ? 'arrow_downward' : 'arrow_upward' }}</mat-icon>
              {{ m.movementType }}
            </span>
          </td>
        </ng-container>
        
        <ng-container matColumnDef="qty">
          <th mat-header-cell *matHeaderCellDef>Quantity</th>
          <td mat-cell *matCellDef="let m">
            <span class="qty-value" [class.text-success]="m.movementType === 'IN'" [class.text-danger]="m.movementType === 'OUT'">
              {{ m.movementType === 'IN' ? '+' : '-' }}{{ m.quantity }} {{ m.product?.unit }}s
            </span>
          </td>
        </ng-container>
        
        <ng-container matColumnDef="note">
          <th mat-header-cell *matHeaderCellDef>Note / Reason</th>
          <td mat-cell *matCellDef="let m" class="note-cell">{{ m.note }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols"></tr>
      </table>
      
      <div class="empty-state" *ngIf="filteredMovements.length === 0">
        <mat-icon>history</mat-icon>
        <p>No stock movements found matching your filters.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 4px;
    }

    .page-subtitle {
      color: var(--clr-text-muted);
      margin: 0;
      font-size: 14px;
    }

    .filters-card {
      padding: 16px 24px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--clr-text-secondary);
      font-weight: 600;
    }
    
    .filter-group mat-icon {
      color: var(--clr-primary-light);
    }

    .filter-controls {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-field {
      flex: 1;
      min-width: 250px;
    }

    .product-name {
      display: block;
      font-weight: 600;
      color: var(--clr-text);
    }

    .product-cat {
      display: block;
      font-size: 11px;
      color: var(--clr-text-muted);
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    
    .type-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .type-in {
      background: var(--clr-success-soft);
      color: var(--clr-success);
    }

    .type-out {
      background: var(--clr-warning-soft);
      color: var(--clr-warning);
    }

    .qty-value {
      font-weight: 700;
      font-size: 14px;
    }

    .text-success { color: var(--clr-success); }
    .text-danger { color: var(--clr-warning); }

    .note-cell {
      color: var(--clr-text-secondary);
      font-style: italic;
      font-size: 13px;
    }

    .empty-state {
      padding: 48px;
      text-align: center;
      color: var(--clr-text-muted);
    }
    
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.3;
      margin-bottom: 16px;
    }
  `]
})
export class StockHistoryComponent implements OnInit {
  cols = ['date', 'product', 'type', 'qty', 'note'];
  movements: any[] = [];
  filteredMovements: any[] = [];
  
  filterType = '';
  searchQuery = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.stockMovements().subscribe(data => {
      // Sort by date descending
      this.movements = data.sort((a: any, b: any) => 
        new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime()
      );
      this.applyFilter();
    });
  }

  applyFilter(): void {
    let result = this.movements;
    
    if (this.filterType) {
      result = result.filter(m => m.movementType === this.filterType);
    }
    
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(m => 
        m.product?.name?.toLowerCase().includes(q) || 
        m.product?.category?.name?.toLowerCase().includes(q) ||
        m.note?.toLowerCase().includes(q)
      );
    }
    
    this.filteredMovements = result;
  }
}
