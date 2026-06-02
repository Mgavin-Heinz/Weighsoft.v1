# System Integrations

## Overview

Weighsoft integrates with several external systems and devices to provide a complete weighbridge management solution.

### Related Setup Guides

- `MULTIPLE-SCALE-ENDPOINTS-SETUP-GUIDE.md` - Per-workstation Node-RED endpoint setup (`/nr1`, `/nr2`, etc.) with validation and troubleshooting.

---

## 1. Weighbridge Scale Integration

### Connection Method

**WebSocket Real-Time Connection**

### Architecture

```
Physical Scale Device
      ↓ (Serial/RS232)
Scale Connector Service (Middleware)
      ↓ (WebSocket)
Weighsoft Frontend (AngularJS)
```

### Scale Connector Service

**Technology**: Node.js/Python service (not in this codebase)

**Purpose**: 
- Reads weight data from physical scale via serial port
- Exposes WebSocket endpoint for real-time weight streaming
- Handles scale communication protocols

**Endpoints**:
```javascript
// WebSocket connection
ws://[scale_connector_ip]:port/ws/emso

// HTTP control
POST http://[scale_connector_ip]:port/scale
{
  "record": "scale_identifier",
  "enabled": true,
  "port": "COM1"  // or /dev/ttyUSB0 on Linux
}
```

### Frontend Integration

**Code Location**: `weighing_create.js`, `weighing_update.js`

**WebSocket Connection**:
```javascript
// Connect to scale
scaleSocket = new WebSocket("ws://" + window.__env.scale + "/ws/emso");

scaleSocket.onmessage = function (event) {
    const newWeight = parseFloat(event.data);
    
    // Detect stable weight (multiple consistent readings)
    if (vm.weightSamples.length === requiredStableSamples) {
        vm.Single.FirstWeight = newWeight;  // or SecondWeight
        vm.submit = false;  // Enable save button
    }
};
```

**Stable Weight Detection**:
- Collects multiple samples (configured per weighbridge)
- Samples must be identical to be considered "stable"
- Prevents saving while weight is fluctuating

**Configuration**:
```javascript
// From weighbridge record
vm.WeighBridge.stable_samples = 5;  // Require 5 identical readings
```

### Manual Weight Entry

For scales without automation or backup:

**Configuration**: `weighbridge.manual = "Yes"`

**Behavior**:
- WebSocket connection disabled
- Operator manually enters weight in text field
- No stability detection
- Save button always enabled

---

## 2. Camera Integration

### Connection Method

**HTTP/HTTPS Image Snapshot**

### Supported Camera Types

1. **IP Cameras** (MJPEG/JPEG snapshot)
   - Axis cameras
   - Hikvision cameras
   - Generic IP cameras with snapshot URL

2. **USB Cameras** (via middleware)
   - Requires additional service to expose USB camera as HTTP endpoint

### Camera Configuration

**Database Fields** (`cameras` table):

```php
{
  "name": "Entrance Camera",
  "ip_address": "http://192.168.1.100/snapshot.jpg",
  "auth_type": "basic",  // none, basic, digest
  "username": "admin",
  "password": "password123",
  "camera_active": "true",
  "pn_recog": "false",  // Number plate recognition
  "weighbridge_id": 5
}
```

### Image Capture Process

**Live Preview**:
```javascript
// Poll camera every 5 seconds
mapData.CameraTick = setInterval(function () {
    CamerasService.customPOST({
        "imageUrl": mapData.ip_address,
        "authType": mapData.auth_type || 'none',
        "username": mapData.username,
        "password": mapData.password
    }).then(function (response) {
        mapData.base64 = response;
        mapData.src = "data:image/png;base64," + mapData.base64;
    });
}, 5000);
```

**Image Storage**:
- Images captured at first weight and second weight
- Stored as base64 in `weighingcameras` table
- Linked to `weighing_transaction_id`
- Optional: Print on ticket

**Backend Endpoint**:
```php
// CameraController.php
public static function getImageFromIp($ip_address) {
    // Fetch image from camera
    // Convert to base64
    // Return to frontend
}
```

### Number Plate Recognition (NPR)

**Optional Feature** - Requires additional software

**Configuration**: `camera.pn_recog = "true"`

**Process**:
1. Camera captures image
2. Image sent to NPR service (external)
3. NPR returns text string (number plate)
4. Auto-fills `RegNumber` field

**Backend Endpoint** (Example):
```php
// npr.php (custom script)
GET /weighsoft/backend/npr.php?filename=20251216.143025&ip=192.168.1.100
// Returns: "ABC-123-GP"
```

---

## 3. ESP32 Relay Control (Boom Gates & Traffic Lights)

### Connection Method

**HTTP REST API** (proxied through backend)

### Equipment

- **ESP32 Microcontroller** with 8-channel relay module
- **IP Address**: Static IP on local network
- **Relays**: 8 outputs (typically use 4 for 2 booms + 2 lights)

### Relay Assignment

**Per Weighbridge Configuration**:

```php
{
  "incoming_boom_ip": "192.168.1.50",
  "incoming_boom_relay": 1,  // Relay #1
  "exiting_boom_ip": "192.168.1.50",
  "exiting_boom_relay": 2,   // Relay #2
  "incoming_light_ip": "192.168.1.50",
  "incoming_light_relay": 3, // Relay #3
  "exiting_light_ip": "192.168.1.50",
  "exiting_light_relay": 4   // Relay #4
}
```

### API Calls

**Frontend → Backend → ESP32**

**Frontend Service** (`$esp32Control`):
```javascript
$esp32Control.controlRelay(ip, relayNumber, state)
  .then(function() {
    toastr.success('Boom opened successfully');
  });
```

**Backend Controller** (`ESP32RelayController.php`):
```php
POST /api/esp32/relay
{
  "ip": "192.168.1.50",
  "relay_number": 1,
  "state": true  // true=ON, false=OFF
}

// Controller forwards to ESP32
GET http://192.168.1.50/relay?num=1&state=1
```

### Relay Semantics

| Device | ON (true) | OFF (false) |
|--------|-----------|-------------|
| **Boom** | Open (raised) | Closed (lowered) |
| **Light** | Green (safe) | Red (stop) |

### Typical Workflow

```javascript
// Vehicle arrives
vm.controlIncomingLight('red');     // Stop
vm.controlIncomingBoom('close');     // Closed

// Ready to enter
vm.controlIncomingLight('green');    // Go
vm.controlIncomingBoom('open');      // Open

// Vehicle on scale
vm.controlIncomingBoom('close');     // Close behind
vm.controlIncomingLight('red');      // No more vehicles

// Weighing complete
vm.controlExitingLight('green');     // Go
vm.controlExitingBoom('open');       // Open exit

// Vehicle exits
vm.controlExitingBoom('close');      // Close
```

---

## 4. AS/400 (IBM System i) Export

### Connection Method

**File-based Export** - Write text file to shared directory

### Use Case

Export completed weighing transactions to legacy AS/400 system for ERP/accounting integration.

### Configuration

**Per Weighing Type** (`settings` table):

```php
{
  "export_AS400": "/mnt/as400_share/WEIGHDATA.txt",  // File path
  // or "false" to disable
}
```

### Export Trigger

**When**: After second weight is captured (transaction closed)

**Code Location**: `WeighingHeadersController.php` → `update()` method

### Export Format

**Fixed-width ASCII text file**, one line per transaction:

```php
$as400 = "";
$as400 .= $this->appendData($transaction_no, 6, "0");       // 6 chars, left-pad with 0
$as400 .= $this->appendData($product_code, 6, "0");         // 6 chars
$as400 .= $this->appendData($custom_field_4, 18);           // 18 chars
$as400 .= $this->appendData($number_plate, 9);              // 9 chars
$as400 .= $this->appendData($business_partner_code, 6);     // 6 chars
$as400 .= $this->appendData($custom_field_1, 13);           // 13 chars (comment)
$as400 .= $this->appendData("BS: " . $custom_field_2, 9);   // 9 chars
$as400 .= $this->appendData("OS:" . $custom_field_3, 8);    // 8 chars
$as400 .= $this->appendData($custom_field_5, 18);           // 18 chars
$as400 .= $this->appendData($custom_field_6, 18);           // 18 chars
$as400 .= $this->appendData($custom_field_7, 18);           // 18 chars
$as400 .= $this->appendData($custom_field_8, 18);           // 18 chars
$as400 .= $this->appendData($custom_field_9, 18);           // 18 chars
$as400 .= $this->appendData($custom_field_10, 18);          // 18 chars
$as400 .= $this->appendData($custom_field_11, 18);          // 18 chars
$as400 .= $this->appendData($first_weight_date, 10);        // 10 chars (yyyy/mm/dd)
$as400 .= $this->appendData($first_weight_time, 8);         // 8 chars (hh:mm)
$as400 .= $this->appendData($second_weight_date, 10);       // 10 chars
$as400 .= $this->appendData($second_weight_time, 8);        // 8 chars
$as400 .= $this->appendData(intval($first_weight), 12);     // 12 chars, integer
$as400 .= $this->appendData(intval($second_weight), 12);    // 12 chars

// Append to file
file_put_contents($settings["export_AS400"], $as400 . "\r\n", FILE_APPEND | LOCK_EX);
```

**Example Line**:
```
000123PROD01F1PX1_DATA_______ABC123XYZ   COMMENT______BS: 12345OS:67890...
```

### File Handling

- **Append Mode**: Each transaction adds one line
- **File Lock**: `LOCK_EX` prevents corruption during concurrent writes
- **Line Ending**: `\r\n` (Windows-style)
- **Character Set**: ASCII
- **No Header Row**: Just data lines

### AS/400 Processing

**Typical Setup**:
1. AS/400 monitors shared folder
2. Reads new lines from file
3. Imports into AS/400 database tables
4. Archives/deletes processed lines

**Note**: AS/400 side not part of Weighsoft - handled by customer's IT team

---

## 5. Fingerprint Scanner Integration

### Connection Method

**Third-party Service** - EMSO or similar biometric software

### Use Case

Authenticate operators via fingerprint instead of password for high-security operations.

### Configuration

**Per User** (`users` table):

```php
{
  "fingerprint": "base64_encoded_fingerprint_template"
}
```

**Per Site** (`sites` table):

```php
{
  "fingerprint_verify": "Yes"  // Require fingerprint for weighing
}
```

### Integration Points

**Frontend Service** (`$EMSOservice`):
```javascript
$EMSOservice.DoVerification();
// Calls external fingerprint software
// Returns user ID if match found
```

**Verification Feedback**:
```javascript
$rootScope.FingerFeedback = "StartVerification";
// External software monitors this variable
// Sets it to user ID when fingerprint matched
```

**Note**: External fingerprint software not part of this codebase - custom integration per deployment.

---

## 6. RFID Vehicle Tags (Planned/Partial)

### Connection Method

**Not fully implemented** - Database tables exist

### Use Case

Automatically identify vehicle via RFID tag as it enters weighbridge.

### Database Structure

**Table**: `rfidvehicles`

```php
{
  "id": 1,
  "rfid_tag": "E200 1234 5678 9ABC",
  "vehicle_registration": "ABC-123-GP",
  "tare_weight": 8500,
  "company_id": 1,
  "site_id": 2
}
```

### Integration Requirements

- RFID reader hardware
- Middleware service to read RFID tags
- Auto-fill vehicle details when tag detected
- Link to stored tare weights

**Status**: Database ready, integration code not implemented

---

## 7. Email Reports

### Connection Method

**SMTP** (if configured)

### Use Case

Automatically email reports to stakeholders.

### Configuration

**Laravel `.env` file**:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=reports@example.com
MAIL_PASSWORD=password123
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=reports@example.com
MAIL_FROM_NAME="Weighsoft Reports"
```

### Implementation

**Code Location**: `app/Services/ReportEmailer.php`

**Trigger**: Manual from Reporting Centre

```php
// ReportingController.php
public function email(Request $request) {
    $this->ReportEmailer->SendReportEmails($input["id"]);
}
```

**Email Content**:
- Report results as HTML table or PDF attachment
- Subject: "Weighsoft Report: [Report Name]"
- Recipient list configured per report

**Status**: Partially implemented

---

## 8. Database Replication/Backup

### Connection Method

**MySQL Replication** or **Scheduled Backups**

### Use Case

- Data redundancy
- Disaster recovery
- Reporting database (separate from production)

### Recommendations

**MySQL Replication**:
```sql
-- Master server
CREATE USER 'replicator'@'%' IDENTIFIED BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'replicator'@'%';

-- Slave server
CHANGE MASTER TO
  MASTER_HOST='master_ip',
  MASTER_USER='replicator',
  MASTER_PASSWORD='password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=0;
START SLAVE;
```

**Scheduled Backups**:
```bash
# Daily backup at 2am
0 2 * * * mysqldump -u backup_user -p weighsoft_db > /backups/weighsoft_$(date +\%Y\%m\%d).sql
```

---

## Integration Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Weighsoft System                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌──────────────┐             │
│  │   Frontend   │◄───────►│   Backend    │             │
│  │  (AngularJS) │  HTTP   │  (Laravel)   │             │
│  └──────┬───────┘         └──────┬───────┘             │
│         │                        │                     │
│         │ WebSocket              │ HTTP                │
│         ▼                        ▼                     │
│  ┌──────────────┐         ┌──────────────┐             │
│  │    Scale     │         │   Camera     │             │
│  │  Connector   │         │     IP       │             │
│  └──────┬───────┘         └──────────────┘             │
│         │                                               │
│         │ Serial/USB                                    │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │   Physical   │                                       │
│  │    Scale     │                                       │
│  └──────────────┘                                       │
│                                                         │
│  ┌──────────────┐         ┌──────────────┐             │
│  │    MySQL     │         │    ESP32     │             │
│  │   Database   │         │   Relays     │             │
│  └──────┬───────┘         └──────────────┘             │
│         │                                               │
│         │ Replication                                   │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │  Slave DB    │                                       │
│  │  (Backup)    │                                       │
│  └──────────────┘                                       │
│                                                         │
│  ┌──────────────┐         ┌──────────────┐             │
│  │   AS/400     │◄────────│  File Export │             │
│  │     ERP      │  Shared │              │             │
│  └──────────────┘  Folder └──────────────┘             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Integration Checklist for New Deployment

- [ ] **Scale Connector** - Install and configure for serial communication
- [ ] **Camera IPs** - Configure static IPs and test snapshot URLs
- [ ] **ESP32 Devices** - Configure static IPs and test relay control
- [ ] **AS/400 Export** - Set up shared folder and file permissions
- [ ] **Fingerprint** - Install biometric software (if required)
- [ ] **RFID** - Install reader hardware (if required)
- [ ] **Email** - Configure SMTP settings in .env
- [ ] **Database Backup** - Set up automated backups or replication

---

## Next Steps

- See `06-DATA-MODEL.md` for database structure
- See `02-BUSINESS-WORKFLOWS.md` for how integrations fit into workflows

