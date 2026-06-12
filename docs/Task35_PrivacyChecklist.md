# Task 35: Privacy and Confidentiality Checklist for Student Work

**AI usage:** AI used to summarise POPIA/confidentiality obligations relevant to this placement.

---

## Overview

As a WIL student working on the Weighsoft codebase I have had access to real company infrastructure, database structures, and potentially real client data. This checklist documents my understanding of the confidentiality and privacy obligations that apply to this placement.

---

## POPIA Obligations (Protection of Personal Information Act, South Africa)

The Weighsoft system stores personal information including user names, email addresses, contact numbers, and company registration details. Under POPIA, the following obligations apply:

- [ ] **I have not copied or retained any real customer data** from the production database onto my personal device or personal accounts
- [ ] **I have not shared any client company names, registration numbers, or personal details** with anyone outside the placement
- [ ] **All seed/test data I created uses fictional names and `.demo` email addresses** — no real personal information was used in development
- [ ] **I have not taken screenshots of real customer data** and included them in my logbook, portfolio, or task documentation
- [ ] **I understand that the database schema and API structure are confidential** business assets of the host company
- [ ] **I will delete any local copies of the production database** at the end of my placement

---

## Code Confidentiality

The Weighsoft source code is proprietary. The following apply:

- [ ] **My GitHub repository (`Mgavin-Heinz/Weighsoft.v1`) is set to private** — the codebase has not been published publicly
- [ ] **I have not shared the source code with any third party** including other students, friends, or future employers without permission
- [ ] **I understand that code I wrote during this placement belongs to the host company** unless otherwise agreed in writing
- [ ] **AI tools used during this placement (Claude) were used via Anthropic's API** — I did not paste large sections of confidential code into publicly accessible AI tools without understanding the data handling implications
- [ ] **I have not included proprietary business logic in any public portfolio** without written permission from my supervisor

---

## Logbook and Documentation Confidentiality

- [ ] **My logbook and task documentation contain only fictional demo data** — no real client names, weights, or transaction data
- [ ] **I have not documented specific client contracts, pricing, or business arrangements** discovered while reviewing the codebase
- [ ] **If my logbook is submitted to CTU, I understand it may be reviewed** by assessors and have ensured no confidential information is included

---

## Data Security During Development

- [ ] **I used a `.env` file for database credentials** — this file is in `.gitignore` and has never been committed to GitHub
- [ ] **The demo password `Password1!` was used only for local development** — I did not use it on any production system
- [ ] **I locked my development machine when not in use** to prevent unauthorised access to the development environment
- [ ] **I reported any security concerns I found in the codebase to my supervisor** rather than leaving them undocumented (documented in Task 25 and Task 39)

---

## End of Placement

At the end of my placement I will:
- [ ] Return or delete any copies of the codebase on personal devices
- [ ] Remove any database credentials from my local environment
- [ ] Confirm with my supervisor what I am permitted to include in my portfolio
- [ ] Ensure my GitHub repository access is revoked or transferred as requested

---

## Declaration

I confirm that I have read and understood the above obligations and have complied with them throughout my placement.

**Student:** ___________________________  
**Date:** ___________________________  
**Supervisor:** ___________________________
