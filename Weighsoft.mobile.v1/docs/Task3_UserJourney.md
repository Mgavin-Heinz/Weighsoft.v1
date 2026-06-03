Feature: Create Weighing Transaction
User Persona: Weighbridge Operator
Goal: Successfully capture a vehicle's weight, link it to a contract, and generate a transaction/invoice.

User Journey Steps:

Initiation:

The operator navigates to the "Create Weighing" screen in the UI.

Background process: The system initializes the WeighingCreateCtrl and establishes a secure connection to the backend using the operator's JWT token.

Hardware Synchronization (Scale & Camera):

The system automatically connects to the physical scale via WebSockets (/ws/emso) to stream live weight data to the operator's screen.

The system polls the connected camera system.

Automation: If Automatic Number Plate Recognition (ANPR) is enabled, the system reads the vehicle's registration plate and pre-fills the vehicle details on the screen.

Data Entry & Validation:

The operator confirms the vehicle registration.

The operator selects the appropriate client and linked contract.

The system automatically performs deductions for tare weight (the empty weight of the vehicle) and any pallets being used.

Capture & Hardware Trigger:

The operator verifies the live weight reading is stable and clicks "Capture Weight".

Background process: An ESP32 relay is triggered via a backend proxy endpoint (likely to open a boom gate or switch a traffic light to green, allowing the truck to proceed).

Finalization & Integration:

The operator clicks "Save & Print".

The frontend sends a payload to the backend API (WeighingHeadersController).

Backend process: The API saves the header, creates the transaction records, links the camera capture images, and automatically queues a job to sync the billing data to Xero.

A physical ticket is printed for the driver, and the screen resets for the next vehicle.