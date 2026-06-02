# Smart Hauliers System - Business Proposal

## Executive Summary

The Smart Hauliers system is a new feature that will automatically identify and select the correct haulier and billing partner when a vehicle's registration number (numberplate) is captured during weighing operations. This automation will reduce manual data entry, minimize errors, and speed up the weighing process.

---

## Current Process vs. Proposed Process

### **Current Process (Manual)**

1. Weighbridge operator captures or enters the vehicle's registration number
2. Operator manually searches for and selects the haulier from a dropdown list
3. Operator manually searches for and selects the business partner (for invoicing)
4. Operator completes the rest of the weighing transaction
5. Transaction is saved

**Pain Points:**
- Time-consuming manual lookups during busy periods
- Risk of selecting the wrong haulier or business partner
- Inconsistent data entry across different operators
- Slows down the weighing process, especially during peak hours

### **Proposed Process (Automated)**

1. Weighbridge operator captures or enters the vehicle's registration number
2. **System automatically selects the correct haulier** (based on pre-configured vehicle records)
3. **System automatically selects the correct business partner** (based on haulier linkage)
4. Operator verifies the auto-selected information (can override if needed)
5. Operator completes the rest of the weighing transaction
6. Transaction is saved

**Benefits:**
- Faster weighing process - reduced time per transaction
- Reduced human error - correct haulier and business partner selected automatically
- Consistent data entry across all operators
- Improved invoice accuracy - correct business partner automatically assigned
- Better operator experience - less searching, more focus on weighing

---

## How It Works (User Perspective)

### **Step 1: Initial Setup (Admin/Back Office)**

**Enable Smart Hauliers for Your Company:**
- Navigate to Company Settings
- Check the box: "Enable Smart Hauliers"
- Save settings

**Set User Permissions (Admin Only):**
- Navigate to "User Types" menu
- Edit each user type (e.g., "Manager", "Operator", "Admin")
- Set "Vehicles" permission to "Yes" for users who should manage vehicle registry
- Set "Vehicles" permission to "No" for users who should not access vehicle management
- Note: Only users with "Vehicles" permission can see and access the Vehicles menu
- Weighbridge operators typically do NOT need Vehicles permission (they benefit from auto-selection but don't manage the registry)

**Register Vehicles:**
- Navigate to the new "Vehicles" menu (requires "Vehicles" permission)
- Select Company and Site from dropdown filters
- Click "Add New"
- Enter vehicle details:
  - Registration Number (e.g., "ABC123GP")
  - Assigned Haulier (e.g., "Fast Transport")
- Save vehicle record

**Link Hauliers to Business Partners (Optional):**
- Navigate to "Hauliers" menu
- Edit each haulier
- Select the Business Partner to invoice (e.g., "Transport Logistics Ltd")
- Save haulier record

This setup is done **once per vehicle** and can be updated anytime.

### **Step 2: Daily Weighing Operations**

**Scenario: Vehicle arrives at weighbridge**

1. **Operator captures numberplate** (via camera or manual entry)
   - Example: "ABC123GP"

2. **System automatically responds:**
   - ✅ Haulier field auto-fills: "Fast Transport"
   - ✅ Business Partner field auto-fills: "Transport Logistics Ltd"
   - 🚗 Badge appears: "Auto-selected from vehicle ABC123GP"

3. **Operator reviews and proceeds:**
   - If information is correct → Continue with weighing
   - If information is incorrect → Manually change the selection
   - Complete weighing transaction as normal

4. **Transaction saved with correct information**
   - Invoice will be generated for "Transport Logistics Ltd"
   - Haulier recorded as "Fast Transport"
   - No manual searching required

---

## Real-World Example

### **Before Smart Hauliers:**

**Monday morning, 20 vehicles waiting:**
- Truck arrives, numberplate "XYZ789"
- Operator enters numberplate manually
- Operator scrolls through 50+ hauliers to find "Speedy Logistics"
- Operator scrolls through 30+ business partners to find "Logistics Holdings Pty"
- **Time per vehicle: 2-3 minutes for data entry alone**
- Risk of selecting "Speedy Transport" instead of "Speedy Logistics" by mistake

**Result:** Queue builds up, errors occur, invoices go to wrong business partners

### **After Smart Hauliers:**

**Monday morning, 20 vehicles waiting:**
- Truck arrives, numberplate "XYZ789"
- Operator enters numberplate (or camera captures it automatically)
- System instantly fills in: "Speedy Logistics" + "Logistics Holdings Pty"
- Operator glances to confirm (both already correct)
- **Time per vehicle: 15 seconds for data entry**
- No searching required, no selection errors

**Result:** Queue processes quickly, accurate data, correct invoicing

---

## Key Features & Benefits

### **1. Automatic Selection**
- **What it does:** Instantly populates haulier and business partner based on vehicle registration
- **Benefit:** Saves time and reduces errors during busy periods

### **2. Manual Override Capability**
- **What it does:** Operator can change any auto-selected field if needed
- **Benefit:** Flexibility for exceptions (e.g., vehicle being driven by different haulier temporarily)

### **3. Visual Indicators**
- **What it does:** Shows operators when information was auto-selected vs. manually entered
- **Benefit:** Operators know the system has helped them vs. when they need to make selections

### **4. Company-Level Control**
- **What it does:** Feature can be enabled or disabled per company
- **Benefit:** Only companies who want this feature need to use it

### **5. Centralized Vehicle Management**
- **What it does:** New "Vehicles" screen to manage all registered vehicles in one place
- **Benefit:** Easy to add, update, or remove vehicle-to-haulier assignments

### **6. User Access Control**
- **What it does:** Admin can control which user types can access vehicle management
- **Benefit:** 
  - Back office staff can manage vehicle registry
  - Weighbridge operators can benefit from auto-selection without needing access to vehicle management
  - Prevents unauthorized changes to vehicle-to-haulier assignments
  - Maintains security and data integrity

### **7. Improved Invoice Accuracy**
- **What it does:** Automatically links to correct business partner for invoicing
- **Benefit:** Invoices go to the right customer the first time, reducing follow-up work

---

## Business Value

### **Operational Efficiency**
- **Faster weighing process:** Reduce data entry time by up to 80%
- **Higher throughput:** Process more vehicles during peak periods
- **Reduced queue times:** Vehicles spend less time waiting

### **Data Accuracy**
- **Fewer manual errors:** System selects correct records automatically
- **Consistent data:** Same vehicle always linked to same haulier
- **Accurate invoicing:** Business partners correctly assigned every time

### **Cost Savings**
- **Reduced rework:** Fewer incorrect invoices to chase and correct
- **Less operator training:** System does the lookups, not the operator
- **Better resource utilization:** Operators can focus on weighing, not data entry

### **Customer Experience**
- **Faster service:** Vehicles processed more quickly
- **Consistent experience:** Same process regardless of which operator is on duty
- **Professional appearance:** Modern, automated system

---

## Who Benefits?

### **Weighbridge Operators**
- Less manual searching and data entry
- Faster transaction completion
- Fewer errors to correct
- Less stress during busy periods

### **Back Office / Admin Staff**
- More accurate data for reporting
- Fewer invoice corrections to handle
- Better visibility of vehicle-to-haulier relationships
- Easy to maintain vehicle registry

### **Finance / Invoicing**
- Correct business partners assigned automatically
- Fewer invoice disputes
- Faster payment cycles
- Cleaner financial records

### **Management**
- Improved operational efficiency
- Better data quality for decision making
- Reduced operational costs
- Enhanced customer service

---

## Typical Use Cases

### **Use Case 1: High-Volume Operation**
**Scenario:** Quarry with 100+ vehicles per day, 15 different hauliers

**Problem:** Operators struggle to remember which vehicles belong to which hauliers. Frequent selection errors lead to invoice corrections.

**Solution:** All vehicles pre-registered in system. Numberplate capture automatically identifies haulier. Errors eliminated, throughput increased by 30%.

---

### **Use Case 2: Multiple Business Partners**
**Scenario:** Logistics company invoicing 20 different business partners

**Problem:** Operators sometimes select wrong business partner, causing invoice delays and customer confusion.

**Solution:** Hauliers linked to business partners in system. When vehicle arrives, both haulier and business partner auto-selected. Invoice accuracy improves to 99%+.

---

### **Use Case 3: Temporary Drivers**
**Scenario:** Regular vehicle driven by different haulier temporarily

**Problem:** System auto-selects usual haulier, but vehicle is temporarily contracted elsewhere.

**Solution:** Operator sees auto-selection, recognizes it's incorrect for this trip, manually overrides to correct haulier. Override capability maintains flexibility.

---

## Frequently Asked Questions

### **Q: What if a vehicle isn't registered in the system?**
**A:** The system continues to work as it does today - operator manually selects haulier and business partner. No disruption to existing workflow.

### **Q: Can we register the same vehicle for multiple hauliers?**
**A:** Each vehicle is registered to one primary haulier. If a vehicle is used by multiple hauliers, operators can manually override the selection when needed.

### **Q: What if a vehicle registration number changes?**
**A:** Admin staff can update the vehicle record in the system at any time. The change takes effect immediately.

### **Q: Do we have to register all our vehicles at once?**
**A:** No. You can register vehicles gradually. Start with your most frequent vehicles and add others over time. Unregistered vehicles continue to work with manual selection.

### **Q: What if we don't want to use this feature?**
**A:** The feature can be disabled at the company level. If disabled, everything works exactly as it does today with manual selection.

### **Q: Can operators still manually select if the auto-selection is wrong?**
**A:** Yes, absolutely. Operators can always override any auto-selected field. The system provides suggestions, not restrictions.

### **Q: What happens during camera recognition failures?**
**A:** If the camera doesn't recognize the numberplate, the operator enters it manually. Once entered, the auto-selection still works. If the operator enters an unregistered numberplate, they proceed with manual selection as they do today.

### **Q: Will this work with our existing numberplate recognition cameras?**
**A:** Yes. The system works with both camera-captured and manually-entered numberplates. No camera changes required.

### **Q: Who can access the Vehicles management screen?**
**A:** Access is controlled by user permissions. Typically:
- **Admin/Back Office Staff**: Full access to add, edit, and delete vehicle records
- **Managers**: Full access to maintain vehicle registry
- **Weighbridge Operators**: No access to vehicle management (they benefit from auto-selection but don't need to manage the registry)

The system administrator controls these permissions via "User Types" settings.

### **Q: Can operators see if a vehicle is registered or not?**
**A:** Yes. If a vehicle is registered, the haulier and business partner fields auto-fill. If not registered, the fields remain empty and operators select manually. The system provides visual feedback (badges) when auto-selection occurs.

---

## Success Criteria

This feature will be considered successful when:

1. ✅ **Weighing time reduced:** Average time per weighing transaction decreases by at least 30%
2. ✅ **Error rate decreased:** Haulier/business partner selection errors reduced to near-zero
3. ✅ **User adoption:** Operators prefer using auto-selection over manual selection
4. ✅ **Invoice accuracy:** Business partner assignment accuracy reaches 99%+
5. ✅ **Positive feedback:** Operators and admin staff report improved efficiency

---

## Implementation Approach

### **Phase 1: System Build**
- Add vehicle management functionality
- Implement automatic selection logic
- Add company-level enable/disable setting

### **Phase 2: Data Preparation**
- Admin staff register vehicles with their assigned hauliers
- Link hauliers to business partners for invoicing
- Review and verify data accuracy

### **Phase 3: User Training**
- Brief training session for weighbridge operators (10-15 minutes)
- Quick reference guide provided
- Admin staff training on vehicle management

### **Phase 4: Go-Live**
- Enable feature for pilot company
- Monitor performance and gather feedback
- Refine as needed
- Roll out to additional companies

### **Phase 5: Continuous Improvement**
- Regular review of vehicle registry accuracy
- Update linkages as haulier relationships change
- Add new vehicles as fleet grows

---

## Recommendation

**We recommend approving this Smart Hauliers concept because:**

1. **Immediate operational benefit:** Faster weighing process starting from day one
2. **Measurable improvement:** Clear reduction in data entry time and errors
3. **Low risk:** Feature can be enabled/disabled per company, manual override always available
4. **Scalable:** Start small, expand as confidence grows
5. **Future-ready:** Foundation for additional automation features
6. **Quick ROI:** Time savings and error reduction deliver value immediately

The system maintains all existing flexibility while adding intelligent automation where it matters most - reducing repetitive manual lookups during high-pressure weighing operations.

---

## Approval

**Business Stakeholders:**

- [ ] Operations Manager: _________________ Date: _______
- [ ] Finance Manager: _________________ Date: _______
- [ ] IT Manager: _________________ Date: _______
- [ ] General Manager: _________________ Date: _______

**Comments / Conditions:**

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

---

**Document Version:** 1.0  
**Date:** December 4, 2025  
**Status:** Awaiting Approval

