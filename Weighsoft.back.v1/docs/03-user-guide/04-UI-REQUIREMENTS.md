# UI Requirements and Screen Layouts

## Overview

Weighsoft is a **web-based application** built with AngularJS 1.4.8 and Bootstrap 4.5.0. The UI is optimized for **desktop use** at weighbridge operator stations.

---

## Platform Requirements

### Primary Platform: Desktop Web Browser

**Minimum Requirements**:
- **Screen Resolution**: 1366x768 or higher (1920x1080 recommended)
- **Browsers Supported**: 
  - Google Chrome (recommended)
  - Mozilla Firefox
  - Microsoft Edge
  - Internet Explorer 11 (legacy support)
- **Internet Connection**: Required (calls backend API)
- **Local Network**: Required for scale connectivity

### Mobile/Tablet Support

**Current Status**: Limited/Not optimized

**Considerations**:
- Responsive Bootstrap grid used
- Some screens work on tablets (10" or larger)
- Touch-friendly controls not implemented
- Camera preview may not work on mobile
- Scale WebSocket connection may be unreliable

**Recommendation**: Use desktop/laptop computers at weighbridge stations

---

## Application Layout

### Main Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Header Bar (Logo, User Info, Notifications)       │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │         Main Content Area               │
│  Menu    │                                          │
│          │    ┌──────────────────────────┐         │
│  • Setup │    │  Page Title              │         │
│  • Weigh │    ├──────────────────────────┤         │
│  • Ops   │    │                          │         │
│  • Rpts  │    │   Form / Grid Content    │         │
│          │    │                          │         │
│          │    │                          │         │
│          │    └──────────────────────────┘         │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
│  Footer (Version Info, Copyright)                  │
└─────────────────────────────────────────────────────┘
```

### Header Components

- **Logo** (left) - Company branding
- **Page Title** (center-left) - Current screen name
- **User Info** (right) - Logged-in user name, role
- **Notifications** (right) - System alerts (optional)
- **Logout Button** (right)

### Sidebar Menu

**Collapsible menu** with icon + text:

```
Setup
  ├─ Companies
  ├─ Sites
  ├─ Work Stations
  ├─ Weighbridges
  ├─ Weighbridge Setup
  ├─ Cameras
  └─ Weigh Types

Weighing
  ├─ Weighing
  ├─ Verify
  └─ Reprint

Operations
  ├─ Contracts
  ├─ Pallets
  ├─ Tares
  ├─ Master Data
  │   ├─ Business Partners
  │   ├─ Products
  │   ├─ Hauliers
  │   ├─ RFID Vehicles
  │   └─ Axel Settings
  ├─ Reports
  │   ├─ Reporting Centre
  │   └─ Transaction
  └─ User Settings
      ├─ Users
      └─ User Types
```

**Menu Behavior**:
- Dynamically shows/hides based on user permissions
- Active item highlighted
- Parent items expand/collapse
- Icons indicate category

---

## Key Screens

### 1. Login Screen

**URL**: `/login`

**Layout**:
```
┌─────────────────────────────┐
│                             │
│      [Company Logo]         │
│                             │
│  ┌───────────────────────┐  │
│  │ Email                 │  │
│  │ [___________________] │  │
│  │                       │  │
│  │ Password              │  │
│  │ [___________________] │  │
│  │                       │  │
│  │  [  Login  ]          │  │
│  └───────────────────────┘  │
│                             │
│   Version: 0.10.3           │
└─────────────────────────────┘
```

**Fields**:
- Email (text input)
- Password (password input)
- Login button

**Behavior**:
- On submit: POST to `/api/authenticate`
- Returns JWT token + user permissions
- Redirects to `/app/weighing`

---

### 2. Weighing Selection Screen

**URL**: `/app/weighing`

**Purpose**: Select Company → Site → Workstation before starting weighing

**Layout**:
```
┌────────────────────────────────────────────────────┐
│  Weighing List                                     │
├────────────────────────────────────────────────────┤
│                                                    │
│  [Company Dropdown ▼]                              │
│                                                    │
│  [Site Dropdown ▼]                                 │
│                                                    │
│  [Workstation Dropdown ▼]                          │
│                                                    │
│  [ Start Weighing ]                                │
│                                                    │
│  ──────────────────────────────────────────────    │
│                                                    │
│  Active Weighings (Status: OPEN)                  │
│  ┌────────────────────────────────────────────┐   │
│  │ TX#  │ Reg#    │ Product │ 1st Wt │ Date  │   │
│  ├────────────────────────────────────────────┤   │
│  │ 0001 │ ABC123  │ Wheat   │ 28500  │ 12:30 │ ► │
│  │ 0002 │ XYZ789  │ Maize   │ 31200  │ 13:45 │ ► │
│  └────────────────────────────────────────────┘   │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Behavior**:
- Dropdowns cascade (select company → loads sites for that company)
- **Start Weighing** button navigates to `/app/weigh/create` with params
- **Active Weighings** grid shows OPEN transactions
- Click row to continue weighing (navigate to `/app/weigh/update`)

---

### 3. Weighing Create Screen

**URL**: `/app/weigh/create`

**Purpose**: Capture first weight (or single weight)

**Layout** (See full HTML template at `app/tpls/weighing/create.html`):

```
┌─────────────────────────────────────────────────────────────┐
│  Weighing Create                                            │
│  Company: ABC Ltd   Site: Main Site   Workstation: WS-01   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Weighing System Type ▼]    [Weighbridge ▼]               │
│                                                             │
│  ┌───────────────────────────────────────┐                 │
│  │  Current Weight: 28,500 kg            │ (Live update)   │
│  │  Status: Stable ✓                     │                 │
│  └───────────────────────────────────────┘                 │
│                                                             │
│  ─── Boom & Light Control ───────────────────────────────  │
│  Incoming Boom:  [Open ▲] [Close ▼]                        │
│  Exiting Boom:   [Open ▲] [Close ▼]                        │
│  Incoming Light: [Green ●] [Red ●]                          │
│  Exiting Light:  [Green ●] [Red ●]                          │
│                                                             │
│  ─── Vehicle & Product Info ──────────────────────────────  │
│  Number Plate 1: [_____________] [↻ NPR] [✓ Verify]        │
│  Haulier:        [Select Haulier ▼]                         │
│  Business Partner: [Select BP ▼]                            │
│  Product:        [Select Product ▼]                         │
│  Contract:       [Select Contract ▼] (if applicable)        │
│                                                             │
│  ─── Weights ──────────────────────────────────────────────  │
│  Tare (if enabled): [Select Tare ▼]                         │
│  First Weight:   28,500 kg  (auto-filled from scale)       │
│  Second Weight:  ─────      (not yet captured)             │
│                                                             │
│  ─── Deductions ───────────────────────────────────────────  │
│  Moisture %:     [___] %                                    │
│  Handling %:     [___] %                                    │
│  Pallet Count:   [___]                                      │
│                                                             │
│  ─── Custom Fields ────────────────────────────────────────  │
│  Batch Number:   [_____________]                            │
│  ... (up to 20 custom fields)                               │
│                                                             │
│  ─── Camera Preview ───────────────────────────────────────  │
│  [📷 Camera 1] [📷 Camera 2] [📷 Camera 3]                   │
│                                                             │
│  [  Save  ]  [  Cancel  ]                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key UI Elements**:

1. **Weight Display Widget**
   - Large, prominent display
   - Real-time updates via WebSocket
   - Color-coded: Green (stable), Yellow (settling), Red (unstable)

2. **ESP32 Controls** (if configured)
   - Button groups for boom/light control
   - Visual feedback on button press
   - Success/error toasts

3. **Number Plate Recognition**
   - Text input
   - Refresh button (↻) triggers camera OCR
   - Verification checkbox
   - Visual indicator (red=unverified, green=verified)

4. **Dropdowns (ui-select)**
   - Searchable dropdowns
   - Type-ahead filtering
   - Shows code + name

5. **Camera Previews**
   - Live image thumbnails (if cameras enabled)
   - Click to enlarge
   - Updates every 5 seconds

6. **Save Button**
   - Disabled if weight unstable (for auto scales)
   - Validates required fields
   - Shows loading spinner during save

**Responsive Behavior**:
- Form fields in 2-column grid on desktop
- Collapses to 1 column on smaller screens

---

### 4. Weighing Update Screen

**URL**: `/app/weigh/update`

**Purpose**: Capture second weight for double weighing

**Similar to Create Screen**, but:
- First weight **read-only** (shows captured value + timestamp)
- Second weight captured from scale
- Net weight calculated and displayed
- Contract status updated (if applicable)

**Additional Display**:
```
┌─────────────────────────────────────────┐
│  First Weight:  28,500 kg               │
│  Captured: 2025-12-16 08:30:15          │
│  By: john.doe@example.com               │
├─────────────────────────────────────────┤
│  Second Weight: 8,500 kg  (current)     │
│                                         │
│  ─── Calculations ───────────────────   │
│  Gross Weight:     20,000 kg            │
│  Moisture Deduct:     -350 kg           │
│  Handling Charges:    -400 kg           │
│  Pallet Charges:      -250 kg           │
│  ────────────────────────────────────   │
│  Net Weight:       19,000 kg            │
└─────────────────────────────────────────┘
```

---

### 5. Reprint List Screen

**URL**: `/app/reprint_list`

**Purpose**: Search and reprint/edit/delete past transactions

**Layout**:
```
┌───────────────────────────────────────────────────────────┐
│  Reprint / Edit Transactions                              │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Filters:                                                 │
│  Company: [Select ▼]  Site: [Select ▼]  WS: [Select ▼]   │
│  Date Range: [2025-12-01] to [2025-12-16]                │
│  Search: [_______________] 🔍                             │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ TX#  │ Date       │ Reg#   │ BP      │ Net Wt │ ⚙️  │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ 0045 │ 2025-12-16 │ ABC123 │ XYZ Ltd │ 19000  │ ⋮   │ │
│  │ 0044 │ 2025-12-16 │ DEF456 │ ABC Co  │ 22500  │ ⋮   │ │
│  │ 0043 │ 2025-12-15 │ GHI789 │ XYZ Ltd │ 18750  │ ⋮   │ │
│  └─────────────────────────────────────────────────────┘ │
│  Showing 1-50 of 234  [Previous] [Next]                  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Actions Menu (⋮)**:
- **Print** - Regenerate ticket
- **Edit** - Modify transaction details
- **Delete** - Soft delete with reason

**DataTables Features**:
- Column sorting
- Pagination (50 rows per page)
- Search filter (searches all columns)
- Export to Excel (optional)

---

### 6. Reporting Centre Screen

**URL**: `/app/exceptions`

**Purpose**: Configure and run reports

**Layout**:
```
┌───────────────────────────────────────────────────────────┐
│  Reporting Centre                                         │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Select Report: [Daily Summary ▼]  [New Report]          │
│                                                           │
│  ─── Filters ───────────────────────────────────────────  │
│  Site:              [Main Site ▼]                         │
│  Weighing Type:     [Inbound Wheat ▼]                     │
│  Date Range:        [2025-12-01] to [2025-12-16]         │
│  Product:           [All ▼]                                │
│  Business Partner:  [All ▼]                                │
│                                                           │
│  [  Run Report  ]  [  Save Report  ]  [  Email  ]        │
│                                                           │
│  ─── Results ────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Product │ Count │ Total Weight │ Avg Weight        │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ Wheat   │ 45    │ 1,125,500 kg │ 25,011 kg         │ │
│  │ Maize   │ 32    │   890,000 kg │ 27,813 kg         │ │
│  │ Barley  │ 18    │   432,000 kg │ 24,000 kg         │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  [  Export to Excel  ]  [  Print  ]                       │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

### 7. Master Data Screens (List)

**Example**: Business Partners List (`/app/businesspartners`)

**Standard List Layout**:
```
┌───────────────────────────────────────────────────────────┐
│  Business Partners                            [+ Add New] │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Search: [_______________] 🔍                             │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Code   │ Name            │ Contact      │ ✏️  │ 🗑️   │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ BP001  │ ABC Farms Ltd   │ 082-123-4567 │ ✏️  │ 🗑️   │ │
│  │ BP002  │ XYZ Suppliers   │ 083-234-5678 │ ✏️  │ 🗑️   │ │
│  │ BP003  │ DEF Transport   │ 084-345-6789 │ ✏️  │ 🗑️   │ │
│  └─────────────────────────────────────────────────────┘ │
│  Showing 1-50 of 124  [Previous] [Next]                  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Standard Features**:
- **+ Add New** button (top-right)
- **Search** box (top)
- **DataTables grid** with sorting, pagination
- **Edit** (✏️) icon per row
- **Delete** (🗑️) icon per row

**Form Screen** (Add/Edit):
- Modal dialog or full page
- Form fields (code, name, contact, email, etc.)
- Save / Cancel buttons
- Validation on submit

---

## UI Components Used

### 1. Dropdowns (ui-select)

**Library**: [AngularUI ui-select](https://github.com/angular-ui/ui-select)

**Features**:
- Type-ahead search
- Custom templates
- Loading indicator
- Clear button

**Example**:
```html
<ui-select ng-model="System.selected_product" theme="selectize">
    <ui-select-match>{{$select.selected.name}}</ui-select-match>
    <ui-select-choices repeat="option in System.Products | filter: $select.search">
        <div ng-bind-html="option.name | highlight: $select.search"></div>
    </ui-select-choices>
</ui-select>
```

### 2. DataTables

**Library**: [DataTables](https://datatables.net/)

**Features**:
- Column sorting
- Pagination
- Search
- Export (Excel, PDF, Print)
- Responsive

### 3. Toastr Notifications

**Library**: [Toastr](https://github.com/CodeSeven/toastr)

**Types**:
- **Success** (green) - "Weighing saved successfully"
- **Error** (red) - "Failed to save weighing"
- **Warning** (yellow) - "Weight is unstable"
- **Info** (blue) - "Loading..."

**Position**: Top-right corner

### 4. SweetAlert Dialogs

**Library**: [SweetAlert](https://sweetalert.js.org/)

**Use Cases**:
- Confirmation dialogs ("Are you sure you want to delete?")
- Error messages
- Input prompts (e.g., "Enter reason for deletion")

### 5. Loading Spinner

**Implementation**: `$rootScope.Start()` / `$rootScope.Loaded()`

**Behavior**:
- Full-screen overlay with spinner
- Blocks user interaction
- Shown during API calls

---

## Print Layouts

### Weighing Ticket

**Template**: `app/tpls/print/ticket.tpl.html`

**Layout** (Thermal printer, 80mm width):

```
┌─────────────────────────────────────┐
│    [Company Logo/Header]            │
│                                     │
│  WEIGHING TICKET                    │
│                                     │
│  Transaction: 000123                │
│  Date: 2025-12-16 14:30             │
│                                     │
│  ─────────────────────────────────  │
│  Number Plate:  ABC-123-GP          │
│  Business Partner: ABC Farms Ltd    │
│  Product:      Wheat                │
│  Haulier:      XYZ Transport        │
│                                     │
│  ─────────────────────────────────  │
│  First Weight:   28,500 kg          │
│  Time In:        2025-12-16 08:30   │
│  Operator:       John Doe           │
│                                     │
│  Second Weight:   8,500 kg          │
│  Time Out:       2025-12-16 14:30   │
│  Operator:       Jane Smith         │
│                                     │
│  ─────────────────────────────────  │
│  Gross Weight:   20,000 kg          │
│  Deductions:       -350 kg          │
│  Net Weight:     19,650 kg          │
│                                     │
│  ─────────────────────────────────  │
│  [Camera Photo 1] [Camera Photo 2]  │
│                                     │
│  ─────────────────────────────────  │
│  [Footer Text]                      │
│  Signature: ___________________     │
│                                     │
└─────────────────────────────────────┘
```

**Print Trigger**:
- Automatic on save (if configured: `print_ticket = "Yes"`)
- Manual from Reprint screen
- Uses `window.print()` (browser print dialog)

---

## Responsive Design

### Breakpoints

| Breakpoint | Screen Size | Layout |
|------------|-------------|--------|
| xs | < 768px | Single column, menu collapsed |
| sm | 768px - 991px | 2 columns where possible |
| md | 992px - 1199px | Standard desktop |
| lg | ≥ 1200px | Wide desktop |

### Mobile Considerations

**What Works**:
- Login screen
- List screens (scrollable tables)
- Simple forms

**What Doesn't Work Well**:
- Weighing screens (too many fields)
- Camera preview (layout issues)
- Multi-column forms
- Real-time weight display

**Recommendation**: 
- Desktop/laptop for weighing operations
- Tablets acceptable for reports and master data
- Mobile not recommended

---

## Accessibility

### Current State
- Basic keyboard navigation
- No ARIA labels
- No screen reader support
- No high-contrast mode

### Future Enhancements
- Add ARIA labels to all form fields
- Keyboard shortcuts for common actions
- Screen reader compatibility
- High-contrast theme

---

## Branding and Theming

### Customization Points

1. **Logo** - `app/assets/images/logo.png`
2. **Colors** - Bootstrap theme variables
3. **Ticket Header/Footer** - Configured per weighing type
4. **Page Title** - Shows version numbers

### Version Display

**Location**: Footer and page title

**Format**:
```
Frontend Version: 0.10.3
Backend Version: 0.10.3
Connector Version: 0.10.3
```

---

## Next Steps

- See `05-INTEGRATIONS.md` for external system connections
- See `06-DATA-MODEL.md` for database structure

