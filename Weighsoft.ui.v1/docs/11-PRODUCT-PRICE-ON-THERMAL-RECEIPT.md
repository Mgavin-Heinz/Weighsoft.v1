# Product Price on Thermal Receipt

**Version:** 0.10.40  
**Date:** 2026-03-23  
**Type:** Frontend Feature

---

## Overview

When a product is selected on a weighing, the thermal receipt now displays the product's price below the Product line. The price shown depends on the weighing direction:

- **Dispatched goods** (`goods_type !== "1"`) → shows **Sale Price**
- **Received goods** (`goods_type === "1"`) → shows **Purchase Price**

The price row is hidden when:
- Products are not enabled on the weighing type (`use_product_list` is off)
- No product is selected
- The selected product has no price set (null)

A price of exactly `0.00` **is shown** (not hidden) since zero is a valid configured price.

---

## Files Changed

| File | What changed |
|------|-------------|
| `app/tpls/print/receipt.tpl.html` | Added price row after Product row |
| `app/js/controllers/weighing_create.js` | Populate `productPrice` / `productPriceLabel` in `SelectOnChange('product')` and `SetReportingData()` |
| `app/js/controllers/weighing_update.js` | Same as above |
| `app/js/controllers/reprint_print.js` | Populate `productPrice` / `productPriceLabel` in `loadRelatedData()` product match |
| `app/tpls/products/list.html` | Added Purchase Price and Sale Price columns to the products table |

---

## Implementation Detail

### 1. Template — `receipt.tpl.html`

A new row was inserted directly after the existing Product row (line ~155):

```html
<div class="row" ng-if="setting.use_product_list && reportData.productPrice != null">
    <div class="col-sm-12">
        <p class="ticket-title">{{reportData.productPriceLabel}}:</p>
    </div>
    <div class="col-sm-12">
        <p>{{reportData.productPrice | number:2}}</p>
    </div>
</div>
```

Key design decisions:
- `!= null` (not falsy check) so `0.00` is still displayed
- `reportData.productPriceLabel` contains the dynamic label — no business logic in the template
- `| number:2` ensures consistent 2 decimal place formatting

### 2. Price Calculation Logic (all three controllers)

The same helper pattern is used in all three controllers. In `SelectOnChange('product')`:

```javascript
var rawPrice = (vm.Setting.goods_type === "1") ? product.purchase_price : product.sale_price;
var parsedPrice = parseFloat(rawPrice);
vm.ReportData.productPrice = isNaN(parsedPrice) ? null : parsedPrice;
vm.ReportData.productPriceLabel = (vm.Setting.goods_type === "1") ? "Purchase Price" : "Sale Price";
```

In `SetReportingData()` / `loadRelatedData()` (with null-safe else branch):

```javascript
if (selections.product) {
    var rawPrice = (vm.Setting.goods_type === "1") ? selections.product.purchase_price : selections.product.sale_price;
    var parsedPrice = parseFloat(rawPrice);
    vm.ReportData.productPrice = isNaN(parsedPrice) ? null : parsedPrice;
    vm.ReportData.productPriceLabel = (vm.Setting.goods_type === "1") ? "Purchase Price" : "Sale Price";
} else {
    vm.ReportData.productPrice = null;
    vm.ReportData.productPriceLabel = null;
}
```

Why `isNaN(parseFloat(rawPrice))` instead of `!rawPrice`:
- `parseFloat(null)` returns `NaN` → correctly hidden
- `parseFloat("0")` returns `0` → `isNaN(0)` is false → correctly shown as 0.00
- A falsy check (`!rawPrice`) would hide a legitimate $0.00 price

### 3. `goods_type` value reference

This matches the existing backend pattern in `TicketPdfService.php` and `XeroInvoiceService.php`:

| `goods_type` DB value | Meaning | Price shown |
|-----------------------|---------|-------------|
| `"1"` | Received Goods | `purchase_price` |
| Any other value | Dispatched Goods | `sale_price` |

### 4. Where prices come from

Prices are read from the `products` table at runtime (not stored on `weighingheaders`). This matches the existing behaviour across invoices and PDF tickets — reprints will always show the current product price.

The product data flow:
1. Backend `ProductController::LoadData()` returns `purchase_price` and `sale_price`
2. `factory.js` `$Functions.Product()` and `weighingLoad` map these into `vm.Products` array items
3. Each controller reads `product.purchase_price` / `product.sale_price` from that array

### 5. Products List — `products/list.html`

Two new columns added to the table:

```html
<th>Purchase Price</th>
<th>Sale Price</th>
...
<td data-ng-bind="data.purchase_price | number:2"></td>
<td data-ng-bind="data.sale_price | number:2"></td>
```

---

## No Backend / DB Changes Required

- `purchase_price` and `sale_price` already exist on the `products` table (`DECIMAL(10,2) DEFAULT NULL`)
- `goods_type` already exists on the `settings` table
- Both fields are already returned by the existing API endpoints
- No migrations needed

---

## Testing Guide

### Prerequisites

- A weighing type (settings) configured with:
  - "Use Product List" enabled
  - Ticket Template set to **Thermal**
- At least one product with **sale_price** set
- At least one product with **purchase_price** set
- A site with both a "Dispatched Goods" weigh type and a "Received Goods" weigh type configured (or two separate weigh types)

### Test 1 — Dispatched: Sale Price on Create (1st Weight / Tare)

1. Navigate to **Weighing > Create New Weighing**
2. Select a weighing type that is **Dispatched** (goods_type ≠ "1") with Thermal template
3. Select a product that has a **sale_price** set
4. Complete the first weight (press the weigh/tare button)
5. **Expected:** The thermal receipt shows a "Sale Price:" row below the Product line with the correct value formatted to 2 decimal places

### Test 2 — Received: Purchase Price on Create (1st Weight / Tare)

1. Navigate to **Weighing > Create New Weighing**
2. Select a weighing type that is **Received Goods** (goods_type = "1") with Thermal template
3. Select a product that has a **purchase_price** set
4. Complete the first weight
5. **Expected:** The thermal receipt shows a "Purchase Price:" row with the correct value

### Test 3 — Price hidden when no product selected

1. Navigate to **Weighing > Create New Weighing**
2. Select a weighing type with Thermal template and products enabled
3. Do **not** select a product
4. Complete the first weight
5. **Expected:** No price row appears on the receipt at all

### Test 4 — Price hidden when product has no price configured

1. Ensure a product exists with both `purchase_price` and `sale_price` set to NULL in the database (or create a new product without entering prices)
2. Select that product on a weighing
3. Complete the first weight
4. **Expected:** No price row appears on the receipt

### Test 5 — Sale Price on 2nd Weight (Update)

1. Navigate to **Weighing > Reprints** and open an **OPEN** transaction for 2nd weighing
2. Confirm the product is selected (or select one)
3. Complete the 2nd weight / save
4. **Expected:** The receipt shows the correct price based on goods_type

### Test 6 — Price on Reprint

1. Navigate to **Weighing > Reprints**
2. Select a **CLOSED** transaction that has a product linked
3. Click **Reprint**
4. **Expected:** The receipt shows the correct price (Sale Price for dispatched, Purchase Price for received) matching the goods_type of that weighing type

### Test 7 — Non-thermal template (regression check)

1. Use a weighing type configured with **Normal** ticket template (not Thermal)
2. Complete a weighing with a product
3. **Expected:** Normal receipt is unaffected — no price row changes (the price row is only in `receipt.tpl.html` which is the thermal template)

### Test 8 — Products list shows prices

1. Navigate to **Settings > Products** (or the Products section)
2. **Expected:** The table now shows two additional columns: **Purchase Price** and **Sale Price** with values formatted to 2 decimal places. Products without prices show empty/null cells.

### Test 9 — Zero price edge case

1. Set a product's `sale_price` to `0.00` in the database
2. Select that product on a Dispatched weighing with Thermal template
3. Complete the first weight
4. **Expected:** "Sale Price: 0.00" IS shown on the receipt (zero is a valid configured price, not the same as "no price")

---

## Regression Checklist

- [ ] Normal (non-thermal) receipts are unchanged
- [ ] Invoice printing is unaffected
- [ ] Weighings without products enabled show no price row
- [ ] Weighings with products disabled (use_product_list = No/false) show no price row
- [ ] Reprint edit form (editing transaction details) is unaffected — it has no ticket-print directive
- [ ] All existing columns on the Products list still display correctly

---

## Related Files (for reference)

- Backend price logic: `Weighsoft.back.v1/app/Services/TicketPdfService.php` (lines 78-81)
- Backend Xero price logic: `Weighsoft.back.v1/app/Services/XeroInvoiceService.php` (lines 306-309)
- Product data mapping: `Weighsoft.ui.v1/app/js/factory.js` — `$Functions.Product()`
- Ticket directive: `Weighsoft.ui.v1/app/js/directives/ticket/ticket.directive.js`
