# Task 4: Requirement Interview & User Stories

### Context & Raw Interview Notes
* **Interviewee:** Senior Weighbridge Operations Mentor  
* **Feature Discussed:** Quick Scale Calibration Verification (Mobile App)  
* **Raw Notes:** *“Operators out at the platforms need an easy way to run a quick test on the physical scale balance before a shift starts. They place a known reference weight on the platform, type in what the scale reads, and the app should instantly tell them if it's within a safe tolerance error limit. If it's way off, it needs to flag it immediately so they don't weigh trucks illegally. We also need to capture which scale/platform they are checking because some yards have multiple bridges.”*

---

### User Stories & Acceptance Criteria

#### User Story 1: Record Calibration Reading
**As a** Weighbridge Operator  
**I want to** enter a standard reference weight and the actual scale reading into the mobile app  
**So that** I can instantly check if the scale is performing within authorized legal parameters.

* **Acceptance Criteria:**
  * **Scenario: Successful variance calculation within tolerance**
    * **Given** the operator is logged into the mobile application and has selected an active weighbridge scale.
    * **When** they input a reference weight of `10,000 kg` and an actual reading of `10,005 kg`.
    * **Then** the app must compute the variance (`+5 kg` / `0.05%`) and display a green "Within Tolerance" success status.
  * **Scenario: Variance exceeds acceptable threshold**
    * **Given** the operator is on the calibration entry screen.
    * **When** they input a reference weight of `10,000 kg` and an actual reading of `10,120 kg` (exceeding the standard `0.1%` legal operational limit).
    * **Then** the system must display a high-visibility red warning banner stating "Scale Out of Tolerance - Maintenance Required" and log an urgent flag.

#### User Story 2: Scale Selection Context
**As a** Multi-Yard Operator  
**I want to** select the specific weighbridge scale asset I am currently testing  
**So that** calibration logs are never assigned to the incorrect physical equipment.

* **Acceptance Criteria:**
  * **Given** the user is initializing a calibration check.
  * **When** accessing the setup screen, the app must present a searchable dropdown list containing only the active scale platforms linked to that user's assigned yard location.
  * **Then** the operator must explicitly confirm the selection before the numerical input fields are unlocked for editing.