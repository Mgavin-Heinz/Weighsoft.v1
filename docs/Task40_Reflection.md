# Task 40: End-of-Placement Reflection

**AI usage:** AI used to structure the reflection. All personal content written by me — the structure was a starting point, not the content.

---

## Overview

This reflection covers my WIL placement working on the Weighsoft weighbridge management system. Over the placement period I worked through 40 structured tasks covering the full software development lifecycle — from reading and understanding an existing codebase through to building new features, testing, and documentation.

---

## Skills developed

### Technical skills

**Laravel and PHP backend development** — Before this placement I had theoretical knowledge of Laravel but had never worked on a real production codebase. Debugging the migration ordering bugs and fixing the controller inconsistencies gave me hands-on experience with how real Laravel apps are structured and where things can go wrong.

**React Native and TypeScript** — I built a complete set of mobile app components including forms, list screens, navigation, and role-based access control. Working with TypeScript's type system — particularly for the navigation param types and the Zod schema validation — gave me a much stronger understanding of why typed code matters in larger projects.

**Test-driven thinking** — Writing 80+ unit tests across the project changed how I think about code. Before this placement I would have considered testing an optional extra. Now I understand that the tests are what give you confidence to make changes without breaking things, especially in a codebase you didn't write yourself.

**Database design** — Fixing broken migrations and working with foreign key relationships gave me practical experience with database design decisions and how they affect the entire application.

### Professional skills

**[ADD YOUR OWN: What professional skills did you develop? Communication, working with a codebase you didn't write, asking for help, managing your time across 40 tasks, etc.]**

---

## Challenges and how I overcame them

### Setting up the development environment

Getting PHP 8.3, Composer, XAMPP, and all the dependencies working on Windows took significantly longer than expected. Multiple extensions were missing, the PATH environment variable needed to be configured, and there were PHP version mismatches. I overcame this by working through each error message systematically and not moving to the next step until the current one was fully resolved.

### Understanding an unfamiliar codebase

Walking into a Laravel + AngularJS codebase without documentation was difficult at first. The approach that worked best was reading the code out loud (mentally) and asking "what does this variable actually contain at this point" — the same rubber duck technique that helped with debugging. Tasks 1–3 forced me to understand the architecture before writing any code, which made everything else easier.

### **[ADD YOUR OWN challenge — something specific that was hard for you personally]**

---

## What I learned about software development

**Software is never finished.** Even a production system that real companies use every day had six broken database migrations that had never been run against a fresh database. Real codebases accumulate technical debt over time, and part of a developer's job is managing and reducing that debt.

**Documentation is as important as code.** Writing the 40 task documents forced me to articulate why each decision was made, not just what was built. I now understand why senior developers insist on documentation — six months from now, the "why" is impossible to reconstruct from the code alone.

**AI tools are genuinely useful but require judgment.** Using Claude throughout this project showed me exactly where AI adds value (generating boilerplate, explaining concepts, listing edge cases) and where it needs human oversight (verifying correctness, understanding context, making design decisions). The mutation testing exercise was a good example — AI generated test cases but I needed to verify the expected values manually before using them.

### **[ADD YOUR OWN: What surprised you? What did you learn that you didn't expect?]**

---

## What I would do differently

If I were starting this placement again, I would:

1. **Set up the development environment on day one** before doing anything else, so that environment issues don't interrupt the flow of actual development work later.

2. **Commit to GitHub more frequently** — there were sessions where we built a lot before committing, which made it harder to track what changed when.

3. **[ADD YOUR OWN: Something specific to your experience]**

---

## Looking ahead

**[THIS SECTION MUST BE WRITTEN BY YOU — it should be personal and specific to your career goals]**

Examples of what to write about:
- What area of development did you enjoy most and want to pursue?
- Has this placement changed what you want to do after graduating?
- What skills do you want to develop further?
- What would you do differently in a future placement or job?

---

*Note: This reflection was structured with AI assistance. All personal content, specific experiences, and opinions are my own.*
