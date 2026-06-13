import { Component, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule, DecimalPipe } from "@angular/common";
import { ApiService } from "../core/api.service";

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    DecimalPipe,
  ],
  template: `
    <div class="products-page">
      <div class="page-header">
        <h2 class="page-title">Products & Categories</h2>
        <div class="header-actions">
          <button
            mat-stroked-button
            (click)="toggleForm('category')"
            id="toggle-category-form-btn"
          >
            <mat-icon>{{ showCategoryForm ? "close" : "add_circle" }}</mat-icon>
            {{ showCategoryForm ? "Cancel" : "Add Category" }}
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="toggleForm('product')"
            id="toggle-product-form-btn"
          >
            <mat-icon>{{ showProductForm ? "close" : "add_circle" }}</mat-icon>
            {{ showProductForm ? "Cancel" : "Add Product" }}
          </button>
        </div>
      </div>

      <!-- Add Category Form (Collapsible) -->
      <div *ngIf="showCategoryForm" class="form-card glass-card">
        <div class="form-card-header">
          <mat-icon>category</mat-icon>
          <span>Add New Category</span>
        </div>
        <form
          [formGroup]="catForm"
          (ngSubmit)="addCategory()"
          class="inner-form"
        >
          <div class="form-row">
            <mat-form-field appearance="outline" style="flex: 1;">
              <mat-label>Category Name</mat-label>
              <input
                matInput
                formControlName="name"
                placeholder="e.g. Fertilizers"
              />
            </mat-form-field>
            <mat-form-field appearance="outline" style="flex: 2;">
              <mat-label>Description (optional)</mat-label>
              <input
                matInput
                formControlName="description"
                placeholder="Brief description"
              />
            </mat-form-field>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!catForm.get('name')?.value"
              class="submit-btn"
            >
              <mat-icon>add</mat-icon>
              Add Category
            </button>
          </div>
        </form>
      </div>

      <!-- Add Product Form (Collapsible) -->
      <div *ngIf="showProductForm" class="form-card glass-card">
        <div class="form-card-header">
          <mat-icon>inventory_2</mat-icon>
          <span>Add New Product</span>
        </div>
        <form
          [formGroup]="productForm"
          (ngSubmit)="addProduct()"
          class="inner-form"
        >
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Product Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Urea" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="categoryId">
                <mat-option *ngFor="let c of categories" [value]="c.id">{{
                  c.name
                }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Unit</mat-label>
              <input
                matInput
                formControlName="unit"
                placeholder="e.g. bag, kg, litre"
              />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Price per Unit (₹)</mat-label>
              <input
                matInput
                type="number"
                formControlName="pricePerUnit"
                placeholder="0"
              />
            </mat-form-field>
          </div>
          <button
            mat-raised-button
            color="accent"
            type="submit"
            class="submit-btn"
            [disabled]="
              !productForm.get('name')?.value ||
              !productForm.get('categoryId')?.value
            "
          >
            <mat-icon>add</mat-icon>
            Add Product
          </button>
        </form>
      </div>

      <!-- Category Cards Grid -->
      <div class="categories-overview" *ngIf="selectedCategory === null">
        <div class="section-header-row">
          <h3 class="section-title">
            Categories <span class="count-badge">{{ categories.length }}</span>
          </h3>
          <span class="total-products"
            >{{ products.length }} total products</span
          >
        </div>
        <div class="category-grid">
          <div
            *ngFor="let cat of categories; let i = index"
            class="category-card glass-card"
            [style.animation-delay]="i * 0.08 + 's'"
            (click)="selectCategory(cat)"
            id="cat-card-{{ cat.id }}"
          >
            <div class="cat-icon" [style.background]="getCatColor(i, 'bg')">
              <span class="cat-emoji">{{ getCatEmoji(cat.name) }}</span>
            </div>
            <div class="cat-info">
              <div class="cat-name">{{ cat.name }}</div>
              <div class="cat-count">
                {{ getProductCount(cat.id) }} products
              </div>
            </div>
            <div class="cat-meta">
              <div class="cat-avg" *ngIf="getAvgPrice(cat.id) as avg">
                Avg ₹{{ avg | number: "1.0-0" }}
              </div>
              <mat-icon class="cat-arrow">chevron_right</mat-icon>
            </div>
          </div>

          <!-- Empty state for no categories -->
          <div *ngIf="categories.length === 0" class="empty-categories">
            <mat-icon>category</mat-icon>
            <span>No categories yet. Add your first category!</span>
          </div>
        </div>
      </div>

      <!-- Products in Selected Category -->
      <div *ngIf="selectedCategory !== null">
        <div class="category-view-header">
          <button mat-button (click)="selectedCategory = null" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
            All Categories
          </button>
          <div class="category-view-title">
            <div
              class="cat-icon-sm"
              [style.background]="
                getCatColor(getCatIndex(selectedCategory), 'bg')
              "
            >
              <span>{{ getCatEmoji(selectedCategory.name) }}</span>
            </div>
            <h3>{{ selectedCategory.name }}</h3>
            <span class="count-badge"
              >{{ getFilteredProducts().length }} products</span
            >
          </div>
          <button
            mat-raised-button
            color="primary"
            (click)="showProductFormForCategory()"
            class="add-product-here-btn"
          >
            <mat-icon>add</mat-icon>
            Add Product Here
          </button>
        </div>

        <div class="product-grid">
          <div
            *ngFor="let p of getFilteredProducts(); let i = index"
            class="product-card glass-card"
            [style.animation-delay]="i * 0.06 + 's'"
            id="product-{{ p.id }}"
          >
            <div class="product-icon">📦</div>
            <div class="product-details">
              <div class="product-name">{{ p.name }}</div>
              <div class="product-unit">{{ p.unit }}</div>
            </div>
            <div class="product-price">
              ₹{{ p.pricePerUnit | number: "1.2-2" }}
            </div>
          </div>

          <div
            *ngIf="getFilteredProducts().length === 0"
            class="empty-products glass-card"
          >
            <mat-icon>inventory</mat-icon>
            <span>No products in this category</span>
            <button mat-stroked-button (click)="showProductFormForCategory()">
              <mat-icon>add</mat-icon> Add First Product
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .products-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
        animation: fadeIn 0.4s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
      }

      .page-title {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: var(--clr-text);
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }

      /* Forms */
      .form-card {
        overflow: hidden;
        animation: slideDown 0.3s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .form-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 24px;
        border-bottom: 1px solid var(--clr-border);
        font-size: 14px;
        font-weight: 600;
        color: var(--clr-text);
      }

      .form-card-header mat-icon {
        color: var(--clr-primary-light);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .inner-form {
        padding: 24px;
      }

      .form-row {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }

      .submit-btn {
        background: var(--grad-primary) !important;
        color: white !important;
        height: 56px;
        white-space: nowrap;
      }

      .submit-btn mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 4px;
      }

      /* Section Header */
      .section-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .section-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--clr-text);
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .count-badge {
        font-size: 11px;
        padding: 2px 10px;
        border-radius: var(--radius-full);
        background: var(--clr-primary-glow);
        color: var(--clr-primary-light);
        font-weight: 600;
      }

      .total-products {
        font-size: 12px;
        color: var(--clr-text-muted);
      }

      /* Category Grid */
      .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 16px;
      }

      .category-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
        animation: slideUp 0.4s ease-out both;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .category-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
      }

      .cat-icon {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-md);
        display: grid;
        place-items: center;
        flex-shrink: 0;
      }

      .cat-emoji {
        font-size: 26px;
      }

      .cat-info {
        flex: 1;
      }
      .cat-name {
        font-size: 15px;
        font-weight: 700;
        color: var(--clr-text);
      }
      .cat-count {
        font-size: 12px;
        color: var(--clr-text-muted);
        margin-top: 3px;
      }

      .cat-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
      }

      .cat-avg {
        font-size: 12px;
        font-weight: 600;
        color: var(--clr-text-secondary);
      }

      .cat-arrow {
        color: var(--clr-text-muted) !important;
        font-size: 20px !important;
        width: 20px !important;
        height: 20px !important;
      }

      .empty-categories {
        grid-column: 1/-1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 48px;
        color: var(--clr-text-muted);
      }

      .empty-categories mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.3;
      }

      /* Category View */
      .category-view-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      .back-btn {
        color: var(--clr-text-muted) !important;
      }

      .category-view-title {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      .cat-icon-sm {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-sm);
        display: grid;
        place-items: center;
        font-size: 18px;
      }

      .category-view-title h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: var(--clr-text);
      }

      .add-product-here-btn {
        margin-left: auto;
        background: var(--grad-primary) !important;
        color: white !important;
      }

      /* Product Grid */
      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }

      .product-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 16px;
        animation: slideUp 0.4s ease-out both;
        transition: transform 0.2s;
        overflow: hidden;
      }

      .product-card:hover {
        transform: translateY(-2px);
      }

      .product-icon {
        font-size: 28px;
        flex-shrink: 0;
      }

      .product-details {
        flex: 1;
        min-width: 0; /* allows text truncation */
      }
      .product-name {
        font-size: 14px;
        font-weight: 700;
        color: var(--clr-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .product-unit {
        font-size: 11px;
        color: var(--clr-text-muted);
        margin-top: 2px;
      }

      .product-price {
        font-size: 15px;
        font-weight: 800;
        color: var(--clr-success);
        white-space: nowrap;
        flex-shrink: 0;
      }

      .empty-products {
        grid-column: 1/-1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 48px;
        color: var(--clr-text-muted);
      }

      .empty-products mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.3;
      }
    `,
  ],
})
export class ProductsComponent implements OnInit {
  categories: any[] = [];
  products: any[] = [];
  selectedCategory: any = null;
  showCategoryForm = false;
  showProductForm = false;

  catForm = this.fb.group({
    name: ["", Validators.required],
    description: [""],
  });
  productForm = this.fb.group({
    name: ["", Validators.required],
    categoryId: [null, Validators.required],
    unit: ["bag"],
    pricePerUnit: [0],
  });

  private readonly CAT_COLORS = [
    { bg: "rgba(99,102,241,0.15)" },
    { bg: "rgba(34,197,94,0.15)" },
    { bg: "rgba(245,158,11,0.15)" },
    { bg: "rgba(239,68,68,0.15)" },
    { bg: "rgba(59,130,246,0.15)" },
    { bg: "rgba(139,92,246,0.15)" },
    { bg: "rgba(20,184,166,0.15)" },
    { bg: "rgba(249,115,22,0.15)" },
  ];

  private readonly CAT_EMOJIS: Record<string, string> = {
    Fertilizers: "🌿",
    Pesticides: "🧪",
    Herbicides: "🌾",
    Fungicides: "🍄",
    Seeds: "🌱",
    Insecticides: "🐛",
    Micronutrients: "⚗️",
    Organic: "♻️",
    "Growth Promoters": "📈",
  };

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    this.api.categories().subscribe((c) => (this.categories = c));
    this.api.products().subscribe((p) => (this.products = p));
  }

  toggleForm(type: "category" | "product") {
    if (type === "category") {
      this.showCategoryForm = !this.showCategoryForm;
      this.showProductForm = false;
    } else {
      this.showProductForm = !this.showProductForm;
      this.showCategoryForm = false;
    }
  }

  showProductFormForCategory() {
    if (this.selectedCategory) {
      this.productForm.patchValue({ categoryId: this.selectedCategory.id });
    }
    this.showProductForm = true;
    this.showCategoryForm = false;
  }

  selectCategory(cat: any) {
    this.selectedCategory = cat;
    this.showProductForm = false;
    this.showCategoryForm = false;
  }

  addCategory() {
    const name = this.catForm.value.name || "";
    if (!name) return;
    this.api.addCategory(name).subscribe(() => {
      this.catForm.reset();
      this.showCategoryForm = false;
      this.reload();
    });
  }

  addProduct() {
    const v = this.productForm.value;
    const category = this.categories.find((c) => c.id === v.categoryId);
    this.api
      .addProduct({
        name: v.name,
        unit: v.unit,
        pricePerUnit: v.pricePerUnit,
        category,
      })
      .subscribe(() => {
        this.productForm.reset({ unit: "bag", pricePerUnit: 0 });
        this.showProductForm = false;
        this.reload();
      });
  }

  getFilteredProducts(): any[] {
    if (!this.selectedCategory) return this.products;
    return this.products.filter(
      (p) => p.category?.id === this.selectedCategory.id,
    );
  }

  getProductCount(catId: number): number {
    return this.products.filter((p) => p.category?.id === catId).length;
  }

  getAvgPrice(catId: number): number {
    const cats = this.products.filter((p) => p.category?.id === catId);
    if (!cats.length) return 0;
    return (
      cats.reduce((sum, p) => sum + (p.pricePerUnit || 0), 0) / cats.length
    );
  }

  getCatIndex(cat: any): number {
    return this.categories.findIndex((c) => c.id === cat.id);
  }

  getCatColor(index: number, _type: string): string {
    return this.CAT_COLORS[index % this.CAT_COLORS.length].bg;
  }

  getCatEmoji(name: string): string {
    return this.CAT_EMOJIS[name] || "📦";
  }
}
