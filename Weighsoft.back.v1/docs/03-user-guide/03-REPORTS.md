# Reports and Data Export

## Overview

Weighsoft provides flexible reporting capabilities through a **configurable reporting engine** that allows users to define custom reports with filters, columns, and groupings.

---

## Report Types

### 1. Transaction Reports
Shows completed weighing transactions with full details.

**Base Data Source**: `weighingheaders` table where `status = 'CLOSED'`

**Common Use Cases**:
- Daily weighing summary
- Product delivery reports
- Business partner activity
- Contract fulfillment tracking
- Audit trails

### 2. Exception Reports
Shows system exceptions and deleted transactions.

**Base Data Source**: `exceptions` table

**Common Use Cases**:
- Deleted transactions audit
- System errors log
- Data modification history
- Security audit trail

---

## Report Configuration

Reports are configured and saved in the `reporting` table with JSON configuration.

### Report Structure

```json
{
  "ReportType": {
    "value": "transaction"  // or "exception"
  },
  "Columns": [
    "Transaction No",
    "Transaction Date",
    "Registration No",
    "Business Partner",
    "Product",
    "Nett Weight",
    "1st Weight User",
    "2nd Weight User"
  ],
  "Filters": [
    "Site",
    "Weighing Types",
    "Product",
    "Business Partner",
    "Date Range"
  ],
  "Groupings": [
    "Product",
    "Business Partner"
  ]
}
```

### Configuration Fields

| Field | Description |
|-------|-------------|
| `show_deleted` | "Yes" or "No" - Include soft-deleted transactions |
| `jsondata` | JSON string containing Columns, Filters, Groupings |
| `name` | Report name |
| `company_id` | Report belongs to this company |

---

## Available Columns

### Transaction Reports

#### Basic Information
| Column Name | Description | Data Source |
|------------|-------------|-------------|
| Transaction Date | Date/time of weighing | `weighingheaders.created_at` |
| Transaction No | Unique transaction ID | `weighingheaders.transaction` |
| Registration No | Vehicle number plate | `weighingheaders.RegNumber` |
| Company | Company name | `companies.registered_name` |
| Site | Site name | `sites.site_name` |
| Workstation | Workstation name | `workstations.workstation_name` |
| Weighbridge | Weighbridge name | `weighbridges.name` |
| Weighing Types | Settings/configuration name | `settings.name` |

#### Master Data
| Column Name | Description | Data Source |
|------------|-------------|-------------|
| Product Code | Product code | `products.code` |
| Product | Product name | `products.name` |
| Grades | Product grade | `weighingheaders.grades` |
| Business Partner Code | BP code | `businesspartners.code` |
| Business Partner | BP name | `businesspartners.name` |
| Haulier Code | Haulier code | `hauliers.code` |
| Haulier | Haulier name | `hauliers.name` |

#### Weight Data
| Column Name | Description | Calculation |
|------------|-------------|-------------|
| 1st Weight | First weighing | `FirstWeight` + measure_type |
| 2nd Weight | Second weighing | `SecondWeight` + measure_type |
| Gross Weight | Total weight | `TotalWeight` + measure_type |
| Nett Weight | Net weight after deductions | `NettWeight` + measure_type |
| Moisture Percentage | Moisture % captured | `moisture_deduction` + "%" |
| Moisture Threshold Percentage | Threshold setting | `moisture_threshold` + "%" |
| Moisture Weight | Weight deducted for moisture | Calculated |

#### Pricing (transaction reports)

Calculated pricing matches the weighing transaction screens (`NettWeight` in **kg**; product unit prices in **per ton**). No extra database columns are added: amounts are computed at report time from `weighingheaders`, `products`, `settings`, and (when applicable) `contract_transactions` / `contracts`.

| Column Name | Description | Calculation |
|------------|-------------|-------------|
| Unit Price (per Ton) | Price per ton used for the line | If the weighing type has contracts enabled and a linked contract with a non-empty `contracts.price`, that price; otherwise `purchase_price` when `settings.goods_type = '1'`, else `sale_price` from `products`. |
| Pricing Excl VAT | Line value excluding VAT | `Unit Price (per Ton) × (NettWeight ÷ 1000)` |
| Pricing VAT | VAT for the line | `ROUND(Pricing Excl VAT × (products.vat ÷ 100), 2)` |
| Pricing Incl VAT | Line total including VAT | `Pricing Excl VAT + Pricing VAT` |

#### Aggregates
| Column Name | Description | Calculation |
|------------|-------------|-------------|
| Count Records | Number of transactions | `count(1)` |
| Sum Nett Weight | Total net weight | `sum(NettWeight)` |
| Sum 1st Weight | Total first weights | `sum(FirstWeight)` |
| Sum 2nd Weight | Total second weights | `sum(SecondWeight)` |
| Sum Pricing Excl VAT | Total excluding VAT | `SUM` of per-row **Pricing Excl VAT** (same rules as above) |
| Sum Pricing VAT | Total VAT | `SUM` of per-row **Pricing VAT** |
| Sum Pricing Incl VAT | Total including VAT | `SUM` of per-row **Pricing Incl VAT** |
| Avg Nett Weight | Average net weight | `avg(NettWeight)` |
| Avg 1st Weight | Average first weight | `avg(FirstWeight)` |
| Avg 2nd Weight | Average second weight | `avg(SecondWeight)` |

#### Audit Information
| Column Name | Description | Data Source |
|------------|-------------|-------------|
| 1st Weight User | Operator who captured 1st weight | `users.email` (firstWeightUserId) |
| 2nd Weight User | Operator who captured 2nd weight | `users.email` (secondWeightUserId) |
| Verifying User | Supervisor who verified | `users.email` (verifyUserId) |
| Is Deleted? | Shows "DELETED" if soft-deleted | `weighingheaders.deleted_at` |
| Delete Reason | Reason for deletion | `weighingheaders.reason` |
| User that Deleted | Who deleted the transaction | `users.email` (deletedUserId) |

#### Custom Fields
| Column Name | Description | Notes |
|------------|-------------|-------|
| Custom Fields | User-defined fields (1-20) | Dynamically added based on Settings configuration |

**Example**: If Settings has `user_defined_name1 = "Batch Number"` and `user_defined_rep1 = "Yes"`, the column "Batch Number" is added showing `Custom1` field.

### Exception Reports

| Column Name | Description | Data Source |
|------------|-------------|-------------|
| Exception Code | Exception type | `exceptions.code` |
| Exception Description | Description | `exceptions.description` |
| Exception Data | JSON data payload | `exceptions.jsondata` |
| Comment | User comment | `exceptions.comment` |
| Transaction Date | When exception occurred | `exceptions.created_at` |

---

## Available Filters

Filters narrow down the data returned in the report.

| Filter Name | Description | Query Parameter |
|------------|-------------|-----------------|
| Site | Filter by site | `site_id = '{value}'` |
| Weighbridge | Filter by weighbridge | `weighbridge_id = '{value}'` |
| Weighing Types | Filter by settings | `settings_id = '{value}'` |
| Workstation | Filter by workstation | (via JOIN) |
| Product | Filter by product | `product_id = '{value}'` |
| Business Partner | Filter by BP | `businesspartner_id = '{value}'` |
| Haulier | Filter by haulier | `haulier_id = '{value}'` |
| Date Range | Filter by date range | `updated_at BETWEEN '{start}' AND '{end}'` |
| Exception Type | Filter by exception code | `code = '{value}'` |

### Date Range Filter

```json
{
  "startDate": "2025-01-01T00:00:00",
  "endDate": "2025-01-31T23:59:59"
}
```

---

## Available Groupings

Groupings aggregate data by categories (e.g., sum weights by product).

| Grouping Name | Description | Effect |
|--------------|-------------|--------|
| Site | Group by site | Aggregates shown per site |
| Workstation | Group by workstation | Aggregates shown per workstation |
| Weighbridge | Group by weighbridge | Aggregates shown per weighbridge |
| Weighing Types | Group by settings | Aggregates shown per setting |
| Product | Group by product | Aggregates shown per product |
| Business Partner | Group by BP | Aggregates shown per BP |
| Haulier | Group by haulier | Aggregates shown per haulier |
| Month | Group by month/year | Aggregates shown per month |
| Exception Type | Group by exception code | Aggregates shown per exception type |

**Example**: 
- Columns: `["Product", "Sum Nett Weight"]`
- Groupings: `["Product"]`
- Result: Total weight per product

---

## Standard Report Examples

### 1. Daily Weighing Summary

**Purpose**: See all weighings for today

**Configuration**:
```json
{
  "Columns": [
    "Transaction No",
    "Transaction Date",
    "Registration No",
    "Product",
    "Business Partner",
    "Nett Weight",
    "1st Weight User"
  ],
  "Filters": [
    "Date Range",
    "Site"
  ],
  "Groupings": []
}
```

**User Selects**:
- Date Range: Today (2025-12-16 00:00 to 2025-12-16 23:59)
- Site: Main Site

**Result**: List of all transactions for today at Main Site

---

### 2. Product Delivery Summary

**Purpose**: Total deliveries by product for the month

**Configuration**:
```json
{
  "Columns": [
    "Product",
    "Count Records",
    "Sum Nett Weight"
  ],
  "Filters": [
    "Date Range",
    "Site"
  ],
  "Groupings": [
    "Product"
  ]
}
```

**User Selects**:
- Date Range: December 2025
- Site: Main Site

**Result**:
```
Product         | Count | Total Weight
----------------|-------|-------------
Wheat           | 45    | 1,125,500 kg
Maize           | 32    | 890,000 kg
Barley          | 18    | 432,000 kg
```

---

### 3. Business Partner Activity

**Purpose**: See which suppliers/customers are most active

**Configuration**:
```json
{
  "Columns": [
    "Business Partner",
    "Product",
    "Count Records",
    "Sum Nett Weight",
    "Avg Nett Weight"
  ],
  "Filters": [
    "Date Range",
    "Business Partner"
  ],
  "Groupings": [
    "Business Partner",
    "Product"
  ]
}
```

**Result**:
```
Business Partner | Product | Count | Total Weight | Avg Weight
-----------------|---------|-------|--------------|------------
ABC Farms        | Wheat   | 12    | 300,000 kg  | 25,000 kg
ABC Farms        | Maize   | 8     | 200,000 kg  | 25,000 kg
XYZ Suppliers    | Wheat   | 20    | 450,000 kg  | 22,500 kg
```

---

### 4. Audit Trail Report

**Purpose**: See who did what, including deleted transactions

**Configuration**:
```json
{
  "show_deleted": "Yes",
  "Columns": [
    "Transaction No",
    "Transaction Date",
    "Registration No",
    "Nett Weight",
    "1st Weight User",
    "2nd Weight User",
    "Is Deleted?",
    "Delete Reason",
    "User that Deleted"
  ],
  "Filters": [
    "Date Range"
  ],
  "Groupings": []
}
```

**Result**: Shows all transactions including deleted ones with full audit trail

---

### 5. Contract Fulfillment Report

**Purpose**: Track deliveries against contracts

**Process**:
1. Run Product Delivery Summary (Report #2)
2. Filter by specific Business Partner
3. Compare "Sum Nett Weight" to contract amount
4. Alternatively, use Contract Transactions screen

**Note**: Contract reports may need custom development or manual comparison.

---

## Report Execution

### UI Workflow

1. **User navigates to "Reporting Centre"** (`/app/exceptions`)
2. **Selects existing report** from list (or creates new)
3. **Configures filters**:
   - Select Site
   - Select Date Range
   - Select Product (optional)
   - Select Business Partner (optional)
4. **Clicks "Run Report"**
5. **System generates report** (backend builds dynamic SQL query)
6. **Results displayed in table** (DataTables grid)
7. **User can**:
   - **Export to Excel** (client-side export)
   - **Print** (browser print)
   - **Email** (if configured)

### API Endpoint

```http
POST /api/reporting/{report_id}/edit

Body:
{
  "site_id": "2",
  "weighingtypes_id": "5",
  "product_id": "",
  "businesspartner_id": "",
  "haulier_id": "",
  "DateRange": "{\"startDate\":\"2025-12-01\",\"endDate\":\"2025-12-31\"}"
}

Response:
{
  "data": [ /* array of result rows */ ],
  "Sum": [ /* aggregate totals */ ]
}
```

---

## Report Output Formats

### 1. Screen Display (DataTables)
- Interactive table with sorting, filtering
- Pagination
- Column visibility toggle

### 2. Excel Export
- Client-side export (no server processing)
- Includes all columns
- Formatting preserved

### 3. PDF (Future Enhancement)
- Not currently implemented
- Would require server-side PDF generation

### 4. Email (Optional)
**Configuration Required**: SMTP settings

**Process**:
```php
// ReportEmailer service
$this->ReportEmailer->SendReportEmails($report_id);
```

---

## Custom Fields in Reports

When a weighing type (Settings) has custom fields defined:

**Settings**:
- `user_defined_name1 = "Batch Number"`
- `user_defined_rep1 = "Yes"` (show in reports)
- `user_defined_name2 = "Moisture %"`
- `user_defined_rep2 = "Yes"`

**Report Configuration**:
```json
{
  "Columns": [
    "Transaction No",
    "Product",
    "Nett Weight",
    "Custom Fields"
  ],
  "Filters": [
    "Weighing Types"  // Must filter by specific Settings
  ]
}
```

**Result**: Columns "Batch Number" and "Moisture %" automatically added to report

---

## Performance Considerations

### Large Datasets
- Reports with > 10,000 rows may be slow
- Recommend filtering by Date Range
- Use Groupings for summary reports

### Indexes
Key indexes for report performance:
- `weighingheaders.site_id`
- `weighingheaders.company_id`
- `weighingheaders.status`
- `weighingheaders.updated_at` (for date range queries)
- `weighingheaders.businesspartner_id`
- `weighingheaders.product_id`

---

## Report Permissions

### Access Control
- User must have `transaction_report = "true"` or `exception_report = "true"`
- Users can only see reports for their assigned company
- Site-level users only see data for their site

### Data Visibility
```php
// Controller checks user's company_id
if (isset($_GET['company_id'])) {
    $this->model = $this->model->where('company_id', '=', $_GET['company_id']);
}
```

---

## Next Steps

- See `05-INTEGRATIONS.md` for AS/400 export format
- See `04-UI-REQUIREMENTS.md` for report screen layouts

