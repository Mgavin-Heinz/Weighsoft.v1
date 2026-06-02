# User Roles and Permissions

## Overview

Weighsoft uses a **role-based permission system** where each user is assigned a **User Type** that determines what features and data they can access.

## User Type Structure

User types are stored in the `usertypes` table and contain the following permission fields:

### Permission Fields

Each permission field can be set to:
- `"true"` - User has access
- `"false"` or `null` - User does not have access

| Permission Field | Description |
|-----------------|-------------|
| `level` | Hierarchy level (1 = highest, determines what other user types can be managed) |
| `companies` | Can view/manage companies |
| `sites` | Can view/manage sites |
| `workstations` | Can view/manage workstations |
| `weighbridges` | Can view/manage weighbridges |
| `cameras` | Can view/manage cameras |
| `weigh_types` | Can view/manage weighing type settings |
| `weighing` | Can perform weighing operations |
| `verify` | Can verify weighings (for silo verification workflow) |
| `reprint` | Can reprint tickets and edit past transactions |
| `business_partner` | Can view/manage business partners |
| `products` | Can view/manage products |
| `hauliers` | Can view/manage hauliers |
| `stored_tares` | Can view/manage stored tare weights |
| `rfid_vehicle` | Can view/manage RFID vehicle tags |
| `axel_types` | Can view/manage axle types |
| `axel_settings` | Can view/manage axle settings |
| `transaction_report` | Can access transaction reports |
| `exception_report` | Can access exception reports |
| `users` | Can view/manage users |
| `user_types` | Can view/manage user types (roles) |
| `delete_transaction_flag` | Can delete weighing transactions |

## Common User Role Examples

### 1. **System Administrator**
**Typical Permissions:**
- **Level**: 1 (highest)
- **All Setup Permissions**: companies, sites, workstations, weighbridges, cameras, weigh_types
- **All Master Data**: business_partner, products, hauliers, stored_tares, rfid_vehicle
- **All Operations**: weighing, verify, reprint
- **All Reports**: transaction_report, exception_report
- **User Management**: users, user_types
- **Delete Transactions**: true

**Use Case:** Full system control, configuration, and management

---

### 2. **Site Manager**
**Typical Permissions:**
- **Level**: 2
- **Setup**: sites, workstations, weighbridges (view only)
- **Master Data**: business_partner, products, hauliers
- **Operations**: weighing, verify, reprint
- **Reports**: transaction_report, exception_report
- **User Management**: users (limited to their site)
- **Delete Transactions**: true

**Use Case:** Manages operations at a specific site, can modify transactions and generate reports

---

### 3. **Weighbridge Operator**
**Typical Permissions:**
- **Level**: 3
- **Setup**: None (or view-only)
- **Master Data**: View only (cannot create/edit)
- **Operations**: weighing
- **Reports**: None (or view only)
- **User Management**: None
- **Delete Transactions**: false

**Use Case:** Performs day-to-day weighing operations, cannot modify configuration or delete transactions

---

### 4. **Verifier/Supervisor**
**Typical Permissions:**
- **Level**: 2
- **Setup**: None
- **Master Data**: View only
- **Operations**: verify, reprint
- **Reports**: transaction_report, exception_report
- **User Management**: None
- **Delete Transactions**: false

**Use Case:** Reviews and approves weighings that require verification (e.g., silo reconciliation)

---

### 5. **Reports Only**
**Typical Permissions:**
- **Level**: 4
- **Setup**: None
- **Master Data**: View only
- **Operations**: None
- **Reports**: transaction_report, exception_report
- **User Management**: None
- **Delete Transactions**: false

**Use Case:** Business users who need to view reports but not perform weighing operations

---

## User Data Structure

Each user record contains:

```php
{
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "contact_num": "0821234567",
    "email": "john.doe@example.com",
    "password": "[hashed]",
    "role_id": 3,  // References usertypes.id
    "company_id": 1,  // User's assigned company
    "site_id": 2,     // User's assigned site (optional)
    "workstations_id": 5,  // User's assigned workstation (optional)
    "fingerprint": "base64_encoded_fingerprint_data"  // Optional biometric
}
```

## Permission Hierarchy

### Level System

The `level` field creates a hierarchy where:
- **Lower numbers** = **Higher privilege**
- Users can only manage other users with **equal or higher level numbers**
- Example: Level 2 user can manage Level 3, 4, 5 users but NOT Level 1 users

### Scope Restrictions

Users are typically restricted to:
- **Their assigned company** (company_id)
- **Their assigned site** (site_id) - if specified
- **Their assigned workstation** (workstation_id) - if specified

Example: A user assigned to `company_id=1, site_id=2` can only:
- View/create weighings for that company and site
- Access master data for that company and site
- Cannot see data from other companies or sites

## Menu Display

The frontend menu dynamically shows/hides options based on user permissions:

```javascript
// From services.js - menu generation based on permissions
if (permissions.companies === "true") {
    vm.Setup.addItem("Companies", "/app/company", "fa-cc");
}
if (permissions.weighing === "true") {
    vm.Weighing.addItem("Weighing", "/app/weighing", "fa-edit");
}
if (permissions.transaction_report === "true") {
    vm.Reports.addItem("Reporting Centre", "/app/exceptions", "fa-warning");
}
```

## Authentication

### JWT (JSON Web Token)
- User logs in with email/password
- Backend returns JWT token containing user ID and permissions
- Token is sent with every API request
- Token expires after a set period (configurable)

### Fingerprint Authentication (Optional)
- Users can be authenticated via fingerprint scanner
- Fingerprint data stored in user record
- Used for secure operations or high-security sites

## Best Practices

### Role Design
1. **Principle of Least Privilege**: Only grant permissions users need
2. **Separation of Duties**: Operators shouldn't manage master data
3. **Audit Trail**: Use delete_transaction_flag sparingly to maintain data integrity

### User Assignment
1. Assign users to specific **sites** for multi-site deployments
2. Assign users to specific **workstations** for dedicated operator stations
3. Leave site/workstation blank for roaming users (managers, admins)

### Security
1. Regularly review user permissions
2. Deactivate users who leave (soft delete)
3. Use fingerprint authentication for high-value operations
4. Monitor exception reports for suspicious activities

