package com.fertilizer.shop.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "credit_items")
public class CreditItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JsonIgnore
    private CreditVoucher voucher;

    @Enumerated(EnumType.STRING)
    private CreditItemType type;

    @ManyToOne
    private ProductCategory category;

    @ManyToOne
    private Product product;

    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal total;

    public CreditItem() {}
    public CreditItem(Long id, CreditVoucher voucher, CreditItemType type, ProductCategory category, Product product,
                      BigDecimal quantity, BigDecimal price, BigDecimal total) {
        this.id = id; this.voucher = voucher; this.type = type; this.category = category; this.product = product;
        this.quantity = quantity; this.price = price; this.total = total;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CreditVoucher getVoucher() { return voucher; }
    public void setVoucher(CreditVoucher voucher) { this.voucher = voucher; }
    public CreditItemType getType() { return type; }
    public void setType(CreditItemType type) { this.type = type; }
    public ProductCategory getCategory() { return category; }
    public void setCategory(ProductCategory category) { this.category = category; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public static CreditItemBuilder builder() { return new CreditItemBuilder(); }
    public static class CreditItemBuilder {
        private Long id; private CreditVoucher voucher; private CreditItemType type; private ProductCategory category;
        private Product product; private BigDecimal quantity; private BigDecimal price; private BigDecimal total;
        public CreditItemBuilder id(Long id) { this.id = id; return this; }
        public CreditItemBuilder voucher(CreditVoucher voucher) { this.voucher = voucher; return this; }
        public CreditItemBuilder type(CreditItemType type) { this.type = type; return this; }
        public CreditItemBuilder category(ProductCategory category) { this.category = category; return this; }
        public CreditItemBuilder product(Product product) { this.product = product; return this; }
        public CreditItemBuilder quantity(BigDecimal quantity) { this.quantity = quantity; return this; }
        public CreditItemBuilder price(BigDecimal price) { this.price = price; return this; }
        public CreditItemBuilder total(BigDecimal total) { this.total = total; return this; }
        public CreditItem build() { return new CreditItem(id, voucher, type, category, product, quantity, price, total); }
    }
}
