Login (POST /api/authenticate)
Purpose: Authenticates a user and generates an authentication token.
Endpoint: /api/authenticate
Body (form-data):
email: User's email (e.g., admin@gmail.com)
password: User's password (e.g., Alicia07)
Response: Returns a token on successful authentication, which is used to authorize future requests.
Register (POST /api/register)
Purpose: Registers a new user.
Endpoint: /api/register
Body (form-data):
email: New user's email (e.g., johannesburg@fueltronic.co.za)
password: User's password (e.g., Monday@011)
name: Name of the user (e.g., Johannesburg)
Response: Returns the user details along with an authentication token on successful registration.
3. Get Authenticated User (GET /api/authenticate/user)
Purpose: Retrieves the authenticated user's details.
Endpoint: /api/authenticate/user
Query Parameters:
token: The authentication token for identifying the user.
Response: Returns the authenticated user's information.
4. Refresh Token (GET /api/refresh)
Purpose: Refreshes the authentication token.
Endpoint: /api/refresh
Query Parameters:
token: The current token to be refreshed.
Response: Returns a new token to continue making authorized requests.
5. List Sites (GET /api/site)
Purpose: Retrieves a list of sites.
Endpoint: /api/site
Query Parameters:
token: The authentication token to authorize the request.
Response: Returns a list of all sites associated with the authenticated user.
6. Create Site (POST /api/site)
Purpose: Creates a new site.
Endpoint: /api/site
Query Parameters:
token: The authentication token to authorize the request.
Body (form-data):
site_type: The type of the site (e.g., DFGH)
site_name: The name of the site (e.g., Reddersburg)
site_active: Whether the site is active (true)
normal_weighing: Whether normal weighing is allowed (true)
axle_weighing: Whether axle weighing is allowed (true)
public_weighing: Whether public weighing is allowed (true)
company_id: The ID of the company associated with the site (e.g., 1)
Response: Returns the details of the newly created site.
7. Get Single Site (GET /api/site/{{ActiveSite}})
Purpose: Retrieves the details of a specific site by its ID.
Endpoint: /api/site/{{ActiveSite}}
Query Parameters:
token: The authentication token.
Response: Returns the details of the requested site.
8. Update Site (PUT /api/sites/{{ActiveSite}})
Purpose: Updates an existing site’s details.
Endpoint: /api/sites/{{ActiveSite}}
Query Parameters:
token: The authentication token.
name: The updated name of the site (e.g., London).
Response: Returns the updated site details.
9. Delete Site (DELETE /api/sites/{{ActiveSite}})
Purpose: Deletes a specific site by its ID.
Endpoint: /api/sites/{{ActiveSite}}
Query Parameters:
token: The authentication token.
Response: Confirms the deletion of the site.
10. List Workstations (GET /api/workstation)
Purpose: Retrieves a list of workstations.
Endpoint: /api/workstation
Query Parameters:
token: The authentication token.
Response: Returns a list of all workstations associated with the authenticated user.
11. Get Single Workstation (GET /api/workstation/{{ActiveSite}})
Purpose: Retrieves the details of a specific workstation by its site ID.
Endpoint: /api/workstation/{{ActiveSite}}
Query Parameters:
token: The authentication token.
Response: Returns the details of the requested workstation.
Update Workstation (PUT /api/workstation/{{ActiveSite}})
Purpose: Updates an existing workstation’s details.
Endpoint: /api/workstation/{{ActiveSite}}
Query Parameters:
token: The authentication token.
name: The updated name of the workstation (e.g., London).
Response: Returns the updated workstation details.
2. Delete Workstation (DELETE /api/sites/{{ActiveSite}})
Purpose: Deletes a specific workstation by its site ID.
Endpoint: /api/sites/{{ActiveSite}}
Query Parameters:
token: The authentication token.
Response: Confirms the deletion of the workstation.
3. List Settings (GET /api/settings)
Purpose: Retrieves a list of settings for the authenticated user or site.
Endpoint: /api/settings
Query Parameters:
token: The authentication token.
Response: Returns a list of settings.
4. Create Settings (POST /api/settings)
Purpose: Creates a new settings entry.
Endpoint: /api/settings
Query Parameters:
token: The authentication token.
Body (form-data):
normal_weighing: Whether normal weighing is enabled (1)
axle_weighing: Whether axle weighing is enabled (1)
public_weighing: Whether public weighing is enabled (1)
company_id: ID of the company associated with the settings (e.g., 1)
reprint: Reprint functionality enabled (1)
moisture: Moisture functionality enabled (1)
foreign_meterial: Foreign material detection enabled (1)
Response: Returns the newly created settings entry details.
5. Get Single Setting (GET /api/settings/1)
Purpose: Retrieves the details of a specific setting by its ID.
Endpoint: /api/settings/1
Query Parameters:
token: The authentication token.
Response: Returns the details of the requested settings entry.
6. Update Setting (PUT /api/settings/1)
Purpose: Updates an existing setting’s details.
Endpoint: /api/settings/1
Query Parameters:
token: The authentication token.
public_weighing: Whether public weighing is enabled (1)
user_defined_data1: User-defined data (e.g., food)
Response: Returns the updated settings entry details.
7. List Weighing Headers (GET /api/weighingheaders)
Purpose: Retrieves a list of weighing headers for weighings recorded in the system.
Endpoint: /api/weighingheaders
Query Parameters:
token: The authentication token.
Response: Returns a list of weighing headers.
8. Create Weighing Header (POST /api/weighingheaders)
Purpose: Creates a new weighing header entry.
Endpoint: /api/weighingheaders
Query Parameters:
token: The authentication token.
Body (form-data):
site_type: The type of the site (e.g., DFGH)
site_name: The name of the site (e.g., Reddersburg)
site_active: Whether the site is active (true)
normal_weighing: Whether normal weighing is enabled (true)
axle_weighing: Whether axle weighing is enabled (true)
public_weighing: Whether public weighing is enabled (true)
company_id: The ID of the company associated with the weighing header (e.g., 1)
Response: Returns the details of the newly created weighing header.
List Contracts (GET /api/contract)
Purpose: Retrieves a list of all contracts in the system.
Endpoint: /api/contract
Query Parameters:
token: The authentication token.
Response: Returns a list of contracts associated with the authenticated user or company.
2. Get Single Contract (GET /api/contract/32)
Purpose: Retrieves the details of a specific contract by its ID.
Endpoint: /api/contract/32/
Query Parameters:
token: The authentication token.
Response: Returns the contract details for contract ID 32.
3. Get Image from IP String (POST /api/getImageFromIpString)
Purpose: Retrieves an image from a provided URL.
Endpoint: http://127.0.0.1:5000/api/getImageFromIpString
Query Parameters:
token: The authentication token.
Body (form-data):
imageUrl: The URL of the image to be retrieved.
Response: Returns the image fetched from the provided URL.
4. Weighing Load (POST /api/weighingLoad)
Purpose: Loads the details for a weighing operation, including associated company, site, and workstation information.
Endpoint: /api/weighingLoad
Query Parameters:
token: The authentication token.
company_id: The ID of the company associated with the weighing (15)
site_id: The ID of the site (23)
workstation_id: The ID of the workstation (34)
id: The specific ID of the weighing record (23)
Body (form-data):
imageUrl: A URL of an image related to the weighing load (e.g., https://t3.ftcdn.net/jpg/03/13/42/46/360_F_313424630_Uja1TnjdFhdz0bdbFnhMRuBTSIw25TWQ.jpg)
Response: Returns the loaded details of the weighing operation.
5. Get API Documentation (GET /api/documentation)
Purpose: Retrieves the documentation for the API.
Endpoint: http://127.0.0.1/backend/public/api/documentation
Response: Returns the API documentation.
6. Update Node-RED Scale (POST /weighsoft/scale)
Purpose: Updates the configuration of the Node-RED scale.
Endpoint: http://127.0.0.1:1880/weighsoft/scale
Body (raw - JSON):
json
Copy code
{
    "serialport": "COM3",
    "serialbaud": 9600,
    "databits": 8,
    "parity": "none",
    "stopbits": 1,
    "dtr": "none",
    "rts": "none",
    "cts": "none",
    "dsr": "none",
    "enabled": true
}
Response: Confirms the update of the scale's configuration.
7. Update Node-RED Display (POST /weighsoft/display)
Purpose: Updates the configuration of the Node-RED display.
Endpoint: http://127.0.0.1:1880/weighsoft/display
Body (raw - JSON):
json
Copy code
{
    "serialport": "COM6",
    "serialbaud": 9600,
    "databits": 8,
    "parity": "none",
    "stopbits": 1,
    "enabled": true
}
Response: Confirms the update of the display's configuration.
8. Get Node-RED Scale Configuration (GET /weighsoft/scale)
Purpose: Retrieves the current configuration of the Node-RED scale.
Endpoint: http://127.0.0.1:1880/weighsoft/scale
Response: Returns the current scale configuration.
9. Get Node-RED Display Configuration (GET /weighsoft/display)
Purpose: Retrieves the current configuration of the Node-RED display.
Endpoint: http://127.0.0.1:1880/weighsoft/display
Response: Returns the current display configuration.