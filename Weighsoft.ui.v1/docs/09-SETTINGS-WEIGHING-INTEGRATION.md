# Settings and Weighing Integration

## Overview

This document provides comprehensive documentation on how settings control weighing behavior, calculations, UI display, and validation. Settings are the central configuration that determines how weighing operations function throughout the system.

## Settings Structure

### Settings Model

**Backend Model:** `app/Models/settings.php`

**Key Fields:**
- `company_id`, `site_id`, `workstation_id` - Scope of settings
- `name` - Settings name/identifier
- `type_of_weighing` - Single (1) or Double (2) weighing
- `tares_enabled` - Enable stored tares
- `stored_tares` - Use stored tares
- `pallet_enabled` - Enable pallet charges
- `moisture_deduction_level` - Prescribed moisture percentage
- `enable_moisture` - Enable moisture deduction
- `enable_handling` - Enable handling charges
- `contract_enabled` - Enable contract linking
- `business_partner` - Require business partner
- `use_product_list` - Require product selection
- `haulier` - Require haulier selection
- `use_cameras` - Enable camera integration
- `display_cameras` - Display cameras on screen
- `print_cameras_on_ticket` - Print camera images on ticket
- `numberplate_recognition` - Enable number plate recognition
- `numberplate_1`, `numberplate_2`, `numberplate_3` - Number plate fields
- `custom_fields` - Enable custom user-defined fields
- `user_defined_input1-20` - Custom field configurations
- `ticket_header`, `ticket_footer` - Custom header/footer
- `display_custom_header_img`, `display_custom_footer_img` - Header/footer images
- `custom_header_text`, `custom_footer_text` - Header/footer text
- `print_ticket` - Auto-print ticket option
- `reprint` - Allow reprint
- `goods_type` - Received Goods (1) or Delivered Goods (2)
- `first_can_axel`, `second_can_axel` - Enable axle weight entry
- `export_AS400` - Export to AS/400
- `silo_verification` - Require silo verification

## Settings Loading in Weighing

### Initial Load

**Controller:** `WeighingCreateCtrl`, `WeighingUpdateCtrl`

**Process:**
1. Settings are loaded via `$Functions.weighingLoad(settings_id)`
2. Settings are stored in `vm.Setting` object
3. Settings ID is stored in `vm.Single.settings_id`

**Code:**
```javascript
vm.SelectOnChange = function(type) {
    case "settings":
        vm.SetSettings();
        $Functions.weighingLoad(vm.selected_settings.id).then(function(data) {
            vm.Setting = data.Setting;
            vm.ReportData.Settings = data.Setting.name;
            // Apply settings to weighing
        });
        break;
}
```

### Settings Selection

**When:** User selects a setting from dropdown

**What Happens:**
1. `vm.SetSettings()` is called
2. `vm.Single.settings_id` is set
3. Settings data is loaded via API
4. All weighing behavior is updated based on settings

**Code:**
```javascript
vm.SetSettings = function() {
    vm.Single.settings_id = vm.selected_settings.id;
    const site = vm.Sites.find((site) => site.value == vm.HeaderSingle.site_id);
    if (site && site.override_silo != null) {
        vm.Single.SiloOverride = site.override_silo;
    }
}
```

## Settings Impact on Weighing Calculations

### Type of Weighing

**Setting:** `type_of_weighing`

**Values:**
- `"1"` or `"single"` - Single weighing (only SecondWeight)
- `"2"` or `"double"` - Double weighing (FirstWeight and SecondWeight)

**Impact:**
```javascript
vm.Single.type_of_weighing = data.Setting.type_of_weighing;
if (vm.Single.type_of_weighing === '1') {
    vm.Single.FirstWeight = 0; // Single weighing doesn't use first weight
}
```

**Net Weight Calculation:**
- Single: `Net Weight = SecondWeight`
- Double: `Net Weight = |SecondWeight - FirstWeight|`

### Pallet Charges

**Setting:** `pallet_enabled`

**Values:** `"true"` or `"false"`

**Impact on Net Weight:**
```javascript
if (vm.Setting.pallet_enabled === "true") {
    vm.nettWeight = Math.abs(vm.Single.SecondWeight - vm.Single.FirstWeight) - (vm.Single.pallet_charges || 0);
} else {
    vm.nettWeight = Math.abs(vm.Single.SecondWeight - vm.Single.FirstWeight);
}
```

**Pallet Charge Calculation:**
```javascript
vm.calculatePalletCharges = function() {
    vm.palletCharges = 0;
    const palletCount = vm.Single.pallet_count ? parseFloat(vm.Single.pallet_count) : 0;
    if (palletCount > 0) {
        vm.palletCharges = vm.selected_pallet.amount * palletCount;
        vm.Single.pallet_charges = vm.palletCharges || 0;
    }
};
```

**When Enabled:**
- Pallet dropdown is shown
- Pallet count field is shown
- Pallet charges are deducted from net weight

### Moisture Deduction

**Settings:**
- `enable_moisture` - Enable moisture deduction (`"true"` or `"false"`)
- `moisture_deduction_level` - Prescribed moisture percentage (number)

**Impact:**
```javascript
vm.calculateMoistureDeduction = function(totalWeight, type) {
    vm.moistureDeduction = 0;
    
    if (vm.Single.SecondWeight > 0 && vm.Single.moisture_deduction > 0) {
        const moisturePercentage = parseFloat(vm.Single.moisture_deduction) - vm.Setting.moisture_deduction_level;
        if (moisturePercentage > 0) {
            vm.moistureCoefficient = 1 - ((100 - vm.Single.moisture_deduction) / (100 - vm.Setting.moisture_deduction_level));
            let totalWeightUpdate = type === 'handling' ? totalWeight - vm.handlingCharges : totalWeight;
            vm.moistureDeduction = totalWeightUpdate * vm.moistureCoefficient;
            vm.Single.moistureDeduction = vm.moistureDeduction || 0;
        }
    }
};
```

**Formula:**
```
moistureCoefficient = 1 - ((100 - actualMoisture) / (100 - prescribedMoisture))
moistureDeduction = totalWeight × moistureCoefficient
```

**Where:**
- `actualMoisture` - From `vm.Single.moisture_deduction`
- `prescribedMoisture` - From `vm.Setting.moisture_deduction_level`
- `totalWeight` - Depends on deduct flow (see below)

### Handling Charges

**Setting:** `enable_handling`

**Values:** `"true"` or `"false"`

**Impact:**
```javascript
vm.calculateHandlingCharges = function(totalWeight, type) {
    vm.handlingCharges = 0;
    
    if (vm.Single.SecondWeight > 0 && vm.Single.handling_charges > 0) {
        const handlingPercentage = parseFloat(vm.Single.handling_charges);
        if (handlingPercentage > 0) {
            const totalWeightUpdate = type === 'moisture' ? totalWeight - vm.moistureDeduction : totalWeight;
            vm.handlingCharges = totalWeightUpdate * (handlingPercentage / 100);
            vm.Single.handlingCharges = vm.handlingCharges || 0;
        }
    }
};
```

**Formula:**
```
handlingCharges = totalWeight × (handlingPercentage / 100)
```

**Where:**
- `handlingPercentage` - From `vm.Single.handling_charges`
- `totalWeight` - Depends on deduct flow (see below)

### Deduct Flow (Site-Level Setting)

**Setting:** `site.deduct_flow` (from Site, not Settings)

**Values:**
- `"default"` - Both calculated on full net weight
- `"moisture"` - Moisture first, then handling
- `"handling"` - Handling first, then moisture

**Impact on Calculation Order:**
```javascript
const flow = vm.Site.deduct_flow || "default";

if (flow === 'moisture') {
    // Calculate moisture first, then handling
    vm.calculateMoistureDeduction(vm.nettWeight, flow);
    vm.calculateHandlingCharges(vm.nettWeight, flow);
} else if (flow === 'handling') {
    // Calculate handling first, then moisture
    vm.calculateHandlingCharges(vm.nettWeight, flow);
    vm.calculateMoistureDeduction(vm.nettWeight, flow);
} else {
    // Calculate both on full nett weight
    vm.calculateMoistureDeduction(vm.nettWeight, flow);
    vm.calculateHandlingCharges(vm.nettWeight, flow);
}

// Final calculation
vm.nettWeight = vm.nettWeight - (vm.Single.handlingCharges || 0) - (vm.Single.moistureDeduction || 0);
```

**Flow Examples:**

**Default Flow:**
```
Base Net Weight = 1000 kg
Moisture Deduction = 1000 × 0.0341 = 34.1 kg
Handling Charges = 1000 × 0.05 = 50 kg
Final Net Weight = 1000 - 34.1 - 50 = 915.9 kg
```

**Moisture First Flow:**
```
Base Net Weight = 1000 kg
Moisture Deduction = 1000 × 0.0341 = 34.1 kg
Adjusted Weight = 1000 - 34.1 = 965.9 kg
Handling Charges = 965.9 × 0.05 = 48.3 kg
Final Net Weight = 965.9 - 48.3 = 917.6 kg
```

**Handling First Flow:**
```
Base Net Weight = 1000 kg
Handling Charges = 1000 × 0.05 = 50 kg
Adjusted Weight = 1000 - 50 = 950 kg
Moisture Deduction = 950 × 0.0341 = 32.4 kg
Final Net Weight = 950 - 32.4 = 917.6 kg
```

## Settings Impact on UI Display

### Tares Enabled

**Setting:** `tares_enabled`

**Values:** `"true"` or `"false"`

**Impact:**
```javascript
if (vm.Setting.tares_enabled !== 'true') {
    vm.Single.actiontype = "New"; // Reset form
}
vm.Setting.tares_enabled = data.Setting.tares_enabled;
vm.Setting.stored_tares = data.Setting.stored_tares;
```

**When Enabled:**
- Tare dropdown is shown
- Stored tares are loaded
- FirstWeight can be set from tare
- Validation: Cannot use tares with single weighing

**Validation:**
```javascript
if (vm.Single.tares_enabled === "true" && vm.Single.type_of_weighing === '1') {
    Error = Error + "Can't do tares with single weighing. \n";
}
```

### Stored Tares

**Setting:** `stored_tares`

**Values:** `"true"` or `"false"`

**Impact:**
```javascript
if (data.stored_tares !== undefined) {
    vm.Tares = data.stored_tares;
    vm.Single.FirstWeight = 0; // Reset first weight
}
```

**When Enabled:**
- Tare list is populated from stored tares
- User can select from existing tares
- FirstWeight is automatically set from selected tare

### Pallet Enabled

**Setting:** `pallet_enabled`

**Impact:**
```javascript
if (data.pallet_enabled !== undefined) {
    vm.Pallets = data.pallet_enabled; // Load pallet list
}
```

**When Enabled:**
- Pallet dropdown is shown
- Pallet count field is shown
- Pallet charges are calculated and deducted

### Business Partner

**Setting:** `business_partner`

**Values:** `"Yes"` or `"false"`

**Impact:**
```javascript
if (data.business_partner !== undefined) {
    vm.BusinessPartners = data.business_partner; // Load business partners
}
```

**When Enabled:**
- Business partner dropdown is shown
- Business partner is required for save
- Contracts are filtered by business partner

**Validation:**
```javascript
if (vm.Setting.business_partner == "Yes" && !vm.Single.businesspartner_id) {
    Error += "Please select Business Partner.\n";
}
```

### Product List

**Setting:** `use_product_list`

**Values:** `"Yes"` or `"false"`

**Impact:**
```javascript
if (data.use_product_list !== undefined) {
    vm.Products = data.use_product_list; // Load products
}
```

**When Enabled:**
- Product dropdown is shown
- Product is required for save
- Contracts are filtered by product
- Invoice uses product pricing

**Validation:**
```javascript
if (vm.Setting.use_product_list == "Yes" && !vm.Single.product_id) {
    Error += "Please select Product.\n";
}
```

### Haulier

**Setting:** `haulier`

**Values:** `"Yes"` or `"false"`

**Impact:**
```javascript
if (data.haulier !== undefined) {
    vm.Hauliers = data.haulier; // Load hauliers
}
```

**When Enabled:**
- Haulier dropdown is shown
- Haulier is required for save
- Haulier information appears on ticket

**Validation:**
```javascript
if (vm.Setting.haulier == "Yes" && !vm.Single.haulier_id) {
    Error += "Please select Haulier.\n";
}
```

### Contract Enabled

**Setting:** `contract_enabled`

**Values:** `"true"` or `"false"`

**Impact:**
```javascript
vm.selected_settings.contract_enabled = vm.Setting.contract_enabled;
```

**When Enabled:**
- Contract dropdown is shown (filtered by business partner + product)
- Contract status is tracked (promised, delivered, remaining)
- Contract pricing overrides product pricing
- Contract fulfillment is calculated

**Contract Loading:**
```javascript
vm.loadContracts = function(item) {
    if (vm.selected_settings.contract_enabled === "false") return;
    // Load contracts filtered by business partner and product
};
```

### Cameras

**Settings:**
- `use_cameras` - Enable camera integration
- `display_cameras` - Display cameras on screen
- `print_cameras_on_ticket` - Print camera images on ticket

**Impact:**
```javascript
vm.selected_settings.use_cameras = data.Setting.use_cameras;
vm.selected_settings.display_cameras = data.Setting.display_cameras;

if (vm.Setting.use_cameras !== 'No' || vm.Setting.use_cameras !== 'false') {
    if (data.use_cameras !== undefined) {
        allCameras = data.use_cameras.filter(camera => camera.camera_active === 'true');
    }
}

if (vm.Setting.use_cameras !== 'No' || vm.Setting.use_cameras !== 'false') {
    vm.Single.printcamera = vm.Setting.use_cameras == 'Yes' && vm.Setting.print_cameras_on_ticket == 'Yes' ? 'Yes' : 'No';
    vm.Cameras = allCameras;
    // Start camera polling
    vm.Cameras.forEach(function(mapData) {
        mapData.CameraTick = setInterval(function() {
            // Poll camera for images
        }, 5000);
    });
}
```

**When Enabled:**
- Camera images are displayed on screen
- Camera images are polled every 5 seconds
- Camera images can be printed on ticket
- Number plate recognition can use camera images

### Number Plate Recognition

**Settings:**
- `numberplate_recognition` - Enable number plate recognition
- `numberplate_1`, `numberplate_2`, `numberplate_3` - Number plate field options

**Backend:** Recognition uses the Laravel API endpoint `POST /api/numberplate-recognition`. The backend calls OpenAI Vision with the current camera snapshot. The **OpenAI API key** must be set in the backend `.env` as `OPENAI_API_KEY`; if it is missing or empty, LPR returns a “not configured” error.

**Impact:** When the user clicks the NPR button, the frontend sends the current NPR camera snapshot (base64) via Restangular to `numberplate-recognition`. The returned `plate_number` is written into Number Plate 1, and `NumberplateChange()` runs (duplicate check, Smart Hauliers, etc.). NPR runs only when `numberplate_recognition == 'Yes'` and `numberplate_1 == 'Yes'`, and when a valid base64 image is available from the NPR camera.

**When Enabled:**
- Number plate fields are shown (1, 2, or 3)
- Number plate recognition API is called (OpenAI Vision via backend)
- Camera images are used for recognition (snapshot from camera with `pn_recog === 'true'`)
- Duplicate number plate validation is performed

### Custom Fields

**Setting:** `custom_fields`

**Values:** `"true"` or `"false"`

**Settings:** `user_defined_input1-20`

**Field Types:**
- `"N"` - None (hidden)
- `"TO"` - Text Optional
- `"TC"` - Text Compulsory
- `"SO"` - List Optional
- `"SC"` - List Compulsory
- `"P"` - Percentage

**Impact:**
- Custom fields are shown based on configuration
- Fields can be optional or compulsory
- Fields can appear on ticket/report
- Percentage fields are used in calculations

### Axle Weights

**Settings:**
- `first_can_axel` - Enable first weight axle entry
- `second_can_axel` - Enable second weight axle entry

**Impact:**
- Axle weight fields are shown
- Multiple axle weights can be entered
- Axle weights are summed for total weight
- Axle setups are loaded from backend

### Ticket Customization

**Settings:**
- `ticket_header` - Show custom header
- `ticket_footer` - Show custom footer
- `display_custom_header_img` - Header image URL
- `display_custom_footer_img` - Footer image URL
- `custom_header_text` - Header text
- `custom_footer_text` - Footer text

**Impact:**
```javascript
vm.ReportData.Header = data.Setting.custom_header_text;
vm.ReportData.HeaderImg = data.Setting.display_custom_header_img;
vm.ReportData.Footer = data.Setting.custom_footer_text;
vm.ReportData.FooterImg = data.Setting.display_custom_footer_img;
```

**When Enabled:**
- Custom header/footer appears on ticket
- Images are displayed
- Text is displayed
- Can be different per setting

## Settings Impact on Validation

### Required Fields

Settings determine which fields are required:

```javascript
// Business Partner
if (vm.Setting.business_partner == "Yes" && !vm.Single.businesspartner_id) {
    Error += "Please select Business Partner.\n";
}

// Product
if (vm.Setting.use_product_list == "Yes" && !vm.Single.product_id) {
    Error += "Please select Product.\n";
}

// Haulier
if (vm.Setting.haulier == "Yes" && !vm.Single.haulier_id) {
    Error += "Please select Haulier.\n";
}

// Settings ID
if (typeof vm.Single.settings_id === "undefined" || vm.Single.settings_id == null) {
    Error += "Please select Settings.\n";
}
```

### Type of Weighing Validation

```javascript
// Single weighing requires second weight only
if (vm.Setting.type_of_weighing == "1" && vm.Single.SecondWeight == 0) {
    Error += "Please enter Second Weight.\n";
}

// Double weighing requires both weights
if (vm.Setting.type_of_weighing == "2" && (vm.Single.FirstWeight == 0 || vm.Single.SecondWeight == 0)) {
    Error += "Please enter both First and Second Weights.\n";
}
```

### Tares Validation

```javascript
// Cannot use tares with single weighing
if (vm.Single.tares_enabled === "true" && vm.Single.type_of_weighing === '1') {
    Error = Error + "Can't do tares with single weighing. \n";
}
```

## Settings Impact on Invoice Generation

### Goods Type

**Setting:** `goods_type`

**Values:**
- `"1"` or `"Received Goods"` - Use purchase price
- `"2"` or `"Delivered Goods"` - Use sale price

**Impact:**
```javascript
const productPrice = vm.Setting.goods_type === "1" 
    ? vm.selected_product.purchase_price 
    : vm.selected_product.sale_price;
```

### Contract Pricing

**Setting:** `contract_enabled`

**Impact:**
```javascript
if (vm.Setting.contract_enabled && vm.selected_contract) {
    if (vm.selected_contract.price && vm.selected_contract.price.length > 0) {
        unitPrice = parseFloat(vm.selected_contract.price);
    }
}
```

**When Enabled:**
- Contract price overrides product price
- Contract fulfillment is tracked
- Contract status is displayed

## Settings Impact on Ticket Printing

### Print Options

**Setting:** `print_ticket`

**Values:**
- `"none"` - No auto-print
- `"auto"` - Auto-print on save
- `"manual"` - Manual print only

### Camera Images

**Settings:** `use_cameras`, `print_cameras_on_ticket`

**Impact:**
```javascript
vm.Single.printcamera = vm.Setting.use_cameras == 'Yes' && vm.Setting.print_cameras_on_ticket == 'Yes' ? 'Yes' : 'No';
```

**When Enabled:**
- Camera images are included on ticket
- Images are base64 encoded
- Multiple camera images can be printed

### Custom Header/Footer

**Settings:** `ticket_header`, `ticket_footer`, `display_custom_header_img`, `display_custom_footer_img`, `custom_header_text`, `custom_footer_text`

**Impact:**
- Custom header/footer appears on ticket
- Images are displayed
- Text is displayed
- Can be different per setting

## Settings Impact on Scale Integration

### Manual vs Automatic

**Setting:** Controlled by weighbridge, not settings directly

**Impact:**
```javascript
if (vm.WeighBridge.manual === "Yes") {
    // Close WebSocket, disable automatic weight capture
    if (scaleSocket) {
        scaleSocket.close();
        scaleSocket = null;
    }
    scaleSocket = undefined;
    vm.submit = false;
}

if (vm.WeighBridge.manual === "No") {
    // Start WebSocket, enable automatic weight capture
    vm.ResetWeighing();
}
```

### Tares and Weight Capture

**Setting:** `tares_enabled`

**Impact:**
```javascript
if (vm.Setting.tares_enabled === "true") {
    // If tares are enabled, set the second weight and update net weight
    vm.Single.SecondWeight = newWeight;
    vm.updateNetWeight();
} else {
    // Otherwise, set the first weight
    vm.Single.FirstWeight = newWeight;
}
```

## Settings Impact on Contract Fulfillment

### Contract Enabled

**Setting:** `contract_enabled`

**Impact:**
```javascript
vm.deriveContractStatus = function() {
    if (vm.Single.actiontype === "New" && vm.Setting.tares_enabled !== "true" && vm.Setting.type_of_weighing === '1') {
        loadContractTransactions();
    } else {
        let thisWeighingAmount = 0;
        if (vm.Single.SecondWeight && vm.Single.SecondWeight > 0) {
            thisWeighingAmount = vm.nettWeight ? vm.nettWeight : Math.abs(parseFloat(vm.Single.FirstWeight) - parseFloat(vm.Single.SecondWeight));
        }
        if (vm.Setting.tares_enabled === "true") {
            // Calculate contract status with tares
            vm.contractStatus.promised = vm.selected_contract.amount;
            vm.contractStatus.delivered = thisWeighingAmount + vm.contractStatus.delivered;
            vm.contractStatus.remaining = vm.contractStatus.remaining - thisWeighingAmount;
        }
    }
};
```

**When Enabled:**
- Contract status is tracked
- Promised, delivered, and remaining amounts are calculated
- Contract fulfillment is displayed
- Contract pricing is used

## Settings Impact on Number Formatting

### Site Decimals

**Setting:** `site.decimals` (from Site, not Settings)

**Impact:**
```javascript
vm.formatNumber = function(i) {
    const decimals = Number.isInteger(vm?.Site?.decimals) && vm.Site.decimals >= 0
        ? vm.Site.decimals
        : 0;
    
    // Format number with specified decimals
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(n * factor) / factor;
    
    return decimals > 0 ? rounded.toFixed(decimals) : rounded;
};
```

**Usage:**
- All weight values are formatted with site decimals
- Display consistency across weighing
- Calculations use full precision, display uses decimals

## Settings Workflow

### Complete Settings-to-Weighing Flow

1. **Settings Selection**
   - User selects settings from dropdown
   - `vm.SetSettings()` is called
   - Settings ID is stored

2. **Settings Load**
   - `$Functions.weighingLoad(settings_id)` is called
   - Settings data is loaded from backend
   - Related data is loaded (pallets, tares, products, etc.)

3. **UI Update**
   - Fields are shown/hidden based on settings
   - Dropdowns are populated
   - Validation rules are applied

4. **Weighing Entry**
   - User enters weights
   - Calculations are performed based on settings
   - Net weight is updated

5. **Validation**
   - Required fields are checked
   - Settings-specific validation is applied
   - Errors are displayed

6. **Save**
   - Weighing header is saved with settings_id
   - All settings-dependent data is saved
   - Ticket is printed if configured

## Critical Settings Relationships

### Settings + Site Configuration

Settings work in combination with Site configuration:

- **Site Decimals:** Controls number formatting
- **Site Deduct Flow:** Controls calculation order
- **Site Measure Type:** Controls unit display
- **Site Override Silo:** Controls silo verification

### Settings + Weighbridge Configuration

Settings work with weighbridge configuration:

- **Manual vs Automatic:** Controls weight capture method
- **Stable Samples:** Controls weight stability detection
- **Weight Regex:** Controls weight parsing

### Settings + Contract Configuration

Settings enable contract features:

- **Contract Enabled:** Enables contract linking
- **Business Partner + Product:** Required for contracts
- **Contract Pricing:** Overrides product pricing

## Settings Validation Rules

### Incompatible Combinations

1. **Tares + Single Weighing:**
   ```javascript
   if (tares_enabled === "true" && type_of_weighing === '1') {
       Error = "Can't do tares with single weighing.";
   }
   ```

2. **Required Field Dependencies:**
   - If `business_partner = "Yes"`, business partner is required
   - If `use_product_list = "Yes"`, product is required
   - If `haulier = "Yes"`, haulier is required

## Settings API Integration

### Loading Settings

**Endpoint:** `GET /api/settings`

**Parameters:**
- `company_id`, `site_id`, `workstation_id` (optional)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Setting Name",
    "company_id": "uuid",
    "site_id": "uuid",
    "workstation_id": "uuid",
    "type_of_weighing": "1",
    "pallet_enabled": "true",
    // ... all settings fields
  }
]
```

### Loading Weighing Data with Settings

**Endpoint:** `GET /api/weighingLoad/{settings_id}`

**Response:**
```json
{
  "Setting": { /* settings object */ },
  "haulier": [ /* haulier list */ ],
  "stored_tares": [ /* tare list */ ],
  "business_partner": [ /* business partner list */ ],
  "use_product_list": [ /* product list */ ],
  "use_cameras": [ /* camera list */ ],
  "pallet_enabled": [ /* pallet list */ ],
  "contract_enabled": [ /* contract list */ ]
}
```

## Summary

Settings are the central configuration that controls:

1. **Calculations:** Net weight, deductions, charges
2. **UI Display:** Fields shown/hidden, dropdowns populated
3. **Validation:** Required fields, incompatible combinations
4. **Integration:** Cameras, contracts, invoices, tickets
5. **Workflow:** Weighing type, tares, pallets, custom fields

Every aspect of weighing behavior is controlled by settings, making them the most critical configuration in the system.

