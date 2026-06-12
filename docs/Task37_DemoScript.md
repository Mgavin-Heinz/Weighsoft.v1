# Task 37: Demo Script — New Certificate Feature

**Feature:** New Certificate Wizard (Steps 1–4)  
**Duration:** 3 minutes  
**AI usage:** AI used to structure the walkthrough. Timing and talking points adjusted manually.

---

## Before the demo

- Have the app open on the Certificates list screen
- Make sure at least 2–3 existing certificates are visible in the list
- Have the Laravel backend running (`php artisan serve`)
- Close all other apps on the device

---

## Script

---

### [0:00 – 0:30] Introduction

*"I'm going to show you the New Certificate feature we built for the Weighsoft mobile app. This is what a weighbridge operator would use to record a weighing on their phone or tablet."*

*"You can see the certificate list here — it shows all certificates for this company with their status: Draft, In Review, Finalised. The orange dot means a certificate has unsynced local changes."*

**[Tap the + New button in the top right]**

---

### [0:30 – 1:15] Step 1 — Details

*"The wizard opens on Step 1 — the details screen. The progress indicator at the top shows where we are in the four-step process. You can tap a completed step to go back to it."*

*"The effective date defaults to today. I'll select a product — Iron Ore — and a haulier."*

**[Select Iron Ore from the Product dropdown]**
**[Select Limpopo Heavy Haulage from the Haulier dropdown]**
**[Select Standard from the Template dropdown]**

*"Notice the form validates as you go — if I try to move forward without filling the required fields, it tells me exactly what's missing."*

**[Tap Next without selecting Template to show validation error, then select it]**

*"I'll also show the auto-save — if I add a note here and then background the app, the draft is saved automatically and can be restored."*

**[Type a note in the Notes field]**
**[Tap Next: Readings →]**

---

### [1:15 – 1:50] Steps 2 & 3 — Readings and Summary

*"Step 2 is where the operator captures the weight readings from the scale — gross weight, tare weight, and a reference reading. The readings are used to calculate measurement uncertainty."*

*"Step 3 shows the uncertainty summary — the mean weight, the expanded uncertainty, and whether the result is within tolerance. The helper text explains what each number means without using technical jargon."*

**[Walk through the summary screen briefly]**

*"If the uncertainty is too high — maybe the load was unstable or the scale needs calibration — the operator sees a warning and can choose to go back and take more readings."*

---

### [1:50 – 2:30] Step 4 — Review and role-based actions

*"Step 4 is the final review. The operator sees everything before submitting."*

*"Here's something important — the actions available depend on the user's role. As an operator, I can Submit for Review. But I can't finalise the certificate myself — that requires a Company Admin."*

**[Show the Submit for Review button]**

*"Once submitted, the certificate moves to Under Review status and an admin can log in and finalise it. This two-step approval prevents operators from accidentally finalising incorrect weights."*

---

### [2:30 – 3:00] Save Draft and closing

*"At any point in the wizard, the operator can tap Save Draft. The form data is saved locally — if the app crashes or the phone dies, the draft is restored next time they open the form."*

**[Tap Save Draft]**
**[Navigate back to the list]**

*"The certificate appears in the list as a Draft with the orange sync dot — it's saved locally and will sync to the server when there's a connection."*

*"That's the end of the demo. The full wizard took about 90 seconds for a real operator who knows the data. The key features are the step-by-step guidance, real-time validation, offline auto-save, and role-based workflow."*

---

## Anticipated questions

**Q: Does it work offline?**  
A: Yes — everything is saved locally first. The sync dot shows which certs haven't been uploaded yet. When the device reconnects, they sync automatically.

**Q: What happens if two operators edit the same certificate?**  
A: The system detects the conflict and shows an error, asking the second operator to refresh and review the changes before saving.

**Q: Can the operator finalise their own certificates?**  
A: No — by design. Operators can submit for review but only admins can finalise. This is enforced both in the UI (the button isn't shown) and in the backend.
