# Task 20: Add Role-Based UI Visibility for Admin-Only Actions

**File:** `Weighsoft.mobile.v1/src/rbac.tsx`  
**AI usage:** AI used to generate permission test cases.

---

## What I asked AI to help with

I asked AI to generate test cases for the permission system — specifically what each role should and should not be able to do, so I could verify the `ROLE_PERMISSIONS` map was correct before writing the components.

## What AI generated

AI produced a test matrix covering each role against each permission. The cases it identified that I hadn't thought of:

- **OPERATOR should NOT be able to finalize** — obvious in hindsight, but AI made this explicit and reminded me that submit-for-review and finalise are two different permissions
- **SUPER_ADMIN can run seed data** — AI flagged that dev/admin operations like seeding should be a named permission, not just assumed from role level
- **CANCELLED certs should block all transitions for all roles** — not a permission issue per se, but AI noted that the permission system should not be the only guard; the status state machine in the repository is the real enforcer
- **COMPANY_ADMIN cannot manage other companies** — AI noted that `companies:manage` for a COMPANY_ADMIN would be scoped to their own company in a real implementation, not across all companies

## What I changed after reviewing

I kept the permission matrix as AI suggested. I added `seed:run` as an explicit permission for SUPER_ADMIN only. I noted in a comment that `companies:manage` for COMPANY_ADMIN is currently unscoped and would need company_id filtering added in a future task when the auth context carries the user's company.

## Implementation

### Role hierarchy

| Role ID | Role | Description |
|---|---|---|
| 1 | SUPER_ADMIN | Full access to everything, all companies |
| 2 | COMPANY_ADMIN | Admin access scoped to their company |
| 3 | OPERATOR | Create drafts, submit for review, view reports |

Role IDs match `role_id` in the `UserSeeder` from Task 12.

### Permission matrix

| Permission | SUPER_ADMIN | COMPANY_ADMIN | OPERATOR |
|---|---|---|---|
| `certificates:create` | ✅ | ✅ | ✅ |
| `certificates:edit_draft` | ✅ | ✅ | ✅ |
| `certificates:submit_review` | ✅ | ✅ | ✅ |
| `certificates:finalize` | ✅ | ✅ | ❌ |
| `certificates:cancel` | ✅ | ✅ | ❌ |
| `certificates:delete` | ✅ | ❌ | ❌ |
| `users:manage` | ✅ | ✅ | ❌ |
| `companies:manage` | ✅ | ❌ | ❌ |
| `settings:edit` | ✅ | ✅ | ❌ |
| `reports:view` | ✅ | ✅ | ✅ |
| `seed:run` | ✅ | ❌ | ❌ |

### Components provided

**`AuthProvider`** — React context provider. Wrap the app root with this, passing the current `AuthUser` object from the JWT decode.

**`useAuth()`** — Returns `{ user, isLoading }` from context.

**`usePermissions()`** — Returns `{ can, canAny, canAll, isAdmin, isSuperAdmin, isOperator, user }`. Use `can('certificates:finalize')` in any component that needs to check a permission.

**`RoleGuard`** — Renders children only if the current user has the specified permission. Accepts an optional `fallback` prop for what to show instead.

```tsx
<RoleGuard permission="certificates:finalize">
  <FinalizeButton />
</RoleGuard>
```

**`AdminOnly`** — Shorthand guard for COMPANY_ADMIN or SUPER_ADMIN.

**`CertificateActionsBar`** — Example usage showing all four workflow buttons with appropriate guards. Operators see Submit; admins also see Finalize, Cancel, and Delete (super admin only).

---

## AI usage reflection

The test case generation was genuinely useful for building the permission matrix — it gave me a concrete checklist to verify against rather than reasoning about each role-permission combination from scratch. The most important catch was the distinction between `submit_review` and `finalize` as separate permissions, which ensures operators can push certs forward without being able to approve their own work.
