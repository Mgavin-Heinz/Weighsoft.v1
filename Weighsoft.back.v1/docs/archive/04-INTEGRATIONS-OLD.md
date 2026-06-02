# Integration Documentation

## Overview

Weighsoft integrates with various external systems and hardware components to provide a complete weighbridge management solution.

## Scale Hardware Integration

### Scale Service

**Protocol:** HTTP REST API + WebSocket

**Base URL:** Configured via `window.__env.scale` (default: `http://henzard-pi:3000`)

### HTTP Endpoints

#### Start Scale
**POST** `/scale`

Start scale operation.

**Request:**
```json
{
  "record": "record_id",
  "enabled": true,
  "port": "COM1"
}
```

**Response:**
```json
{
  "status": "started"
}
```

#### Stop Scale
**POST** `/scale`

Stop scale operation.

**Request:**
```json
{
  "record": "record_id",
  "enabled": false
}
```

#### Setup Scale
**POST** `/setup`

Configure scale settings.

**Request:**
```json
{
  "type": "setup",
  "data": {
    "port": "COM1",
    "baudrate": 9600
  }
}
```

#### Get Available Ports
**GET** `/ports`

Get list of available serial ports.

**Response:**
```json
[
  "COM1",
  "COM2",
  "COM3"
]
```

### WebSocket Connection

**Endpoint:** `ws://{scale_host}/ws/emso`

**Connection:**
```javascript
scaleSocket = new WebSocket("ws://" + window.__env.scale + "/ws/emso");

scaleSocket.onmessage = function(event) {
  const weight = parseFloat(event.data);
  // Update UI with weight
  vm.currentWeight = weight;
  $scope.$apply();
};

scaleSocket.onerror = function(error) {
  console.error('WebSocket error:', error);
};

scaleSocket.onclose = function() {
  console.log('WebSocket connection closed');
};
```

**Message Format:**
- Weight values sent as strings
- Parse to float for calculations
- Real-time updates during weighing

### Integration Points

**Frontend:**
- `app/js/controllers/weighing_create.js` - Weighing creation
- `app/js/controllers/weighing_update.js` - Weighing updates
- `app/js/controllers/weighbridge_setup.js` - Scale setup
- `app/js/factory.js` - $EMSOservice factory

**Workflow:**
1. User initiates weighing
2. Frontend connects to scale WebSocket
3. Scale sends real-time weight updates
4. User captures weight when stable
5. Weight saved to weighing header

## Camera Integration

### IP Camera Support

**Protocol:** HTTP with authentication

**Supported Authentication:**
- None
- Basic Auth
- Digest Auth

### Camera Configuration

**Database Table:** `cameras`

**Fields:**
- `ip_address` - Camera IP address
- `auth_type` - Authentication type (none, basic, digest)
- `username` - Camera username
- `password` - Camera password

### Image Capture API

**Endpoint:** `POST /api/getImageFromIpString`

**Request:**
```json
{
  "imageUrl": "http://192.168.1.100/image.jpg",
  "authType": "basic",
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
"base64_encoded_image_string"
```

### Integration Points

**Backend:**
- `app/Http/Controllers/CameraController.php` - Camera management
- `app/Http/Controllers/CameraController::getImageFromIp()` - Image capture
- `app/Services/WeighingCameraService.php` - Camera image storage

**Frontend:**
- `app/js/controllers/weighing_create.js` - Image capture during weighing
- Camera images displayed in UI
- Images included on printed tickets

### Workflow

1. User selects camera from list
2. Frontend calls `/api/getImageFromIpString`
3. Backend fetches image from camera IP
4. Image returned as base64 string
5. Image stored in `weighingcameras` table
6. Image linked to weighing transaction
7. Image displayed in UI and printed on tickets

## Number Plate Recognition

### Integration Options

**Manual Entry:**
- User manually enters registration numbers
- Supports up to 3 registration plates
- Stored in `RegNumber`, `RegNumber2`, `RegNumber3`

**Automatic Recognition:**
- Integration with number plate recognition systems
- Camera-based recognition
- Automatic population of registration fields

### Configuration

**Settings:**
- `numberplate_1` - Enable first plate
- `numberplate_2` - Enable second plate
- `numberplate_3` - Enable third plate
- `numberplate_recognition` - Enable auto recognition

### Storage

**Table:** `weighingheaders`
- `RegNumber` - First registration
- `RegNumber2` - Second registration
- `RegNumber3` - Third registration

## RFID Integration

### Vehicle RFID Tags

**Table:** `r_f_i_d_vehicles`

**Fields:**
- `RegNumber` - Vehicle registration
- `rfid_tag` - RFID tag identifier
- `company_id` - Company association
- `site_id` - Site association

### Integration Points

**Backend:**
- `app/Http/Controllers/RFIDVehicleController.php` - RFID vehicle management

**Frontend:**
- `app/js/controllers/rfid_vehicles.js` - RFID vehicle management

### Workflow

1. RFID reader scans tag
2. System looks up vehicle by RFID tag
3. Vehicle registration auto-populated
4. Vehicle details loaded from database

## Fingerprint Authentication

### Biometric Integration

**Purpose:** User authentication and verification

**Integration Points:**
- Fingerprint scanner hardware
- Biometric authentication service
- User verification workflow

### Configuration

**Settings:**
- Fingerprint verification enabled per setting
- User fingerprint data stored (encrypted)

### Workflow

1. User places finger on scanner
2. System verifies fingerprint
3. User authenticated for weighing operation
4. Verification logged in weighing header

## AS/400 Integration

### Legacy System Export

**Purpose:** Export data to IBM AS/400 system

**Configuration:**
- `export_AS400` - Enable export
- `AS_400_path` - Export file path

### Export Format

**File Format:** Fixed-width text file

**Export Triggers:**
- On weighing completion (when `export_AS400` setting is enabled and not "false")
- Automatic append to file specified in `settings.export_AS400` path

**File Format Details:**

The AS/400 export uses a fixed-width format with specific field lengths:

| Field | Length | Description | Source |
|-------|--------|-------------|--------|
| TRANSNO | 6 | Transaction number (zero-padded) | `weighingheaders.transaction` |
| PRODUCT | 6 | Product code (zero-padded) | `products.code` |
| F1PX1 | 18 | Custom field 4 | `weighingheaders.Custom4` |
| VEHREG | 9 | Vehicle registration | `weighingheaders.RegNumber` |
| CUSTOMER | 6 | Business partner code | `business_partners.code` |
| COMMENT | 13 | Custom field 1 | `weighingheaders.Custom1` |
| BS | 9 | "BS: " + Custom field 2 | `weighingheaders.Custom2` |
| OS | 8 | "OS:" + Custom field 3 | `weighingheaders.Custom3` |
| F2PX1 | 18 | Custom field 5 | `weighingheaders.Custom5` |
| F3PX1 | 18 | Custom field 6 | `weighingheaders.Custom6` |
| F4PX1 | 18 | Custom field 7 | `weighingheaders.Custom7` |
| F5PX1 | 18 | Custom field 8 | `weighingheaders.Custom8` |
| F6PX1 | 18 | Custom field 9 | `weighingheaders.Custom9` |
| F7PX1 | 18 | Custom field 10 | `weighingheaders.Custom10` |
| F8PX1 | 18 | Custom field 11 | `weighingheaders.Custom11` |
| W1_D | 10 | First weight date (yyyy/mm/dd) | `weighingtransactions.created_at` |
| W1_T | 8 | First weight time (hh:mm) | `weighingtransactions.created_at` |
| W2_D | 10 | Second weight date (yyyy/mm/dd) | `weighingtransactions.created_at` |
| W2_T | 8 | Second weight time (hh:mm) | `weighingtransactions.created_at` |
| W1_MASS | 12 | First weight (integer) | `weighingheaders.FirstWeight` |
| W2_MASS | 12 | Second weight (integer) | `weighingheaders.SecondWeight` |

**Total Record Length:** 245 characters

**Formatting Rules:**
- Numeric fields (TRANSNO, PRODUCT, W1_MASS, W2_MASS): Zero-padded left
- Text fields: Space-padded right
- Dates: Converted from `YYYY-MM-DD` to `yyyy/mm/dd`
- Times: Extracted as `hh:mm` from timestamp
- Weights: Converted to integers (decimal portion removed)

**Implementation:**
```php
public function appendData($value, $len, $fill = " ")
{
    if (strlen($value) < $len) {
        $value = str_pad($value, $len, $fill, STR_PAD_LEFT);
    }
    if (strlen($value) > $len) {
        $value = substr($value, 0, $len);
    }
    return $value;
}
```

**Export Process:**
1. Check if `settings.export_AS400 != "false"` and not empty
2. Build fixed-width record using `appendData()` function
3. Append record to file specified in `settings.export_AS400` path
4. Use file locking (`FILE_APPEND | LOCK_EX`) for thread safety
5. Add `\r\n` line ending

**Error Handling:**
- If file write fails, database transaction is rolled back
- Exception is logged and re-thrown

### Integration Points

**Backend:**
- `app/Http/Controllers/WeighingHeadersController.php` - Export logic in `update()` method
- `appendData()` helper function for field formatting
- Settings configuration (`export_AS400` field)
- File system write operation

## Email Integration

### Report Email Service

**Purpose:** Automated report delivery

**Configuration:**
- Report definitions in `reporting` table
- Email addresses (semicolon-separated)
- Time frame for reports

### Email Content

**Format:** HTML email with CSV attachments

**Attachments:**
- One CSV file per weighing type
- Report data for date range
- Named by weighing type

### Integration Points

**Backend:**
- `app/Services/ReportEmailer.php` - Email service
- `app/Mail/Report.php` - Email mailable
- `app/Console/Commands/SendReports.php` - Scheduled command

### Workflow

1. Scheduled cron job runs
2. Command processes report definitions
3. Report data generated
4. CSV files created
5. Email sent with attachments
6. `last_report_on` updated

## WebSocket Integration

### Real-Time Communication

**Purpose:** Real-time weight updates from scale

**Protocol:** WebSocket (ws://)

**Endpoints:**
- Scale weight updates: `ws://{scale_host}/ws/emso`

### Connection Management

**Frontend:**
```javascript
// Connect
scaleSocket = new WebSocket("ws://" + window.__env.scale + "/ws/emso");

// Handle messages
scaleSocket.onmessage = function(event) {
  const weight = parseFloat(event.data);
  updateWeight(weight);
};

// Cleanup
scaleSocket.close();
```

**Error Handling:**
- Connection retry logic
- Error notification
- Graceful degradation

## External API Integration

### RESTful API Design

**Base URL:** Configured via `window.__env.base`

**Authentication:** JWT Bearer token

**Format:** JSON request/response

### API Client (Restangular)

**Configuration:**
```javascript
RestangularProvider.setBaseUrl(window.__env.base);
RestangularProvider.setDefaultHeaders({
  'Authorization': 'Bearer ' + token
});
```

**Usage:**
```javascript
// Get list
Restangular.all('weighingheaders').getList().then(...);

// Get single
Restangular.one('weighingheaders', id).get().then(...);

// Create
Restangular.all('weighingheaders').post(data).then(...);

// Update
Restangular.one('weighingheaders', id).customPUT(data).then(...);

// Delete
Restangular.one('weighingheaders', id).remove().then(...);
```

## Print Integration

### Ticket Printing

**Purpose:** Print weighing tickets

**Format:** HTML template with print styles

**Integration:**
- Browser print dialog
- Print-specific CSS
- Ticket template directive

### Invoice Printing

**Purpose:** Print invoices

**Format:** HTML template

**Content:**
- Invoice header
- Line items
- Totals
- Footer

## Data Export

### CSV Export

**Purpose:** Export data for external systems

**Format:** CSV with headers

**Export Options:**
- Report data export
- Transaction export
- Custom date ranges

### Integration Points

**Frontend:**
- DataTables export buttons
- Report generation
- Manual export functions

## Third-Party Libraries

### Frontend Libraries

- **Bootstrap 4.5.0** - UI components
- **DataTables** - Table functionality
- **Moment.js** - Date handling
- **Toastr** - Notifications
- **UI Router** - Routing
- **Restangular** - API client

### Backend Libraries

- **Laravel 8.40** - Framework
- **JWT Auth** - Authentication
- **Swagger** - API documentation

## Integration Testing

### Scale Integration Testing

1. Connect to scale service
2. Test WebSocket connection
3. Verify weight updates
4. Test start/stop commands

### Camera Integration Testing

1. Configure camera IP
2. Test image capture
3. Verify authentication
4. Test image storage

### API Integration Testing

1. Test authentication
2. Test CRUD operations
3. Test error handling
4. Test data validation

## Security Considerations

### Scale Integration

- Secure WebSocket connections (wss:// in production)
- Authentication for scale service
- Input validation for weight data

### Camera Integration

- Secure camera authentication
- Encrypted password storage
- Secure image transmission

### API Integration

- JWT token security
- HTTPS in production
- Input validation
- SQL injection prevention

## Troubleshooting

### Scale Connection Issues

- Verify scale service is running
- Check network connectivity
- Verify WebSocket endpoint
- Check firewall settings

### Camera Issues

- Verify camera IP accessibility
- Check authentication credentials
- Verify camera supports HTTP image access
- Check network connectivity

### API Issues

- Verify API base URL
- Check JWT token validity
- Verify network connectivity
- Check CORS settings

