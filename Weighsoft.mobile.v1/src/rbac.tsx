/**
 * Task 20 — Role-based UI visibility for admin-only actions
 *
 * Provides:
 *  - useAuth()         current user + role
 *  - usePermissions()  boolean helpers per action
 *  - <RoleGuard>       conditionally renders children based on role
 *  - <AdminOnly>       shorthand guard for admin-only UI
 *
 * AI usage: AI generated permission test cases — see Task 24 tests.
 *
 * Role hierarchy (matches role_id in UserSeeder):
 *   1 = SUPER_ADMIN   (all permissions)
 *   2 = COMPANY_ADMIN (company-scoped admin)
 *   3 = OPERATOR      (read + create drafts only)
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'OPERATOR';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  siteId: string | null;
}

// ─── Permission definitions ───────────────────────────────────────────────────
// Single source of truth for what each role can do.
// Changing a permission here propagates everywhere automatically.

export type Permission =
  | 'certificates:create'
  | 'certificates:edit_draft'
  | 'certificates:submit_review'
  | 'certificates:finalize'
  | 'certificates:cancel'
  | 'certificates:delete'
  | 'users:manage'
  | 'companies:manage'
  | 'settings:edit'
  | 'reports:view'
  | 'seed:run';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'certificates:create',
    'certificates:edit_draft',
    'certificates:submit_review',
    'certificates:finalize',
    'certificates:cancel',
    'certificates:delete',
    'users:manage',
    'companies:manage',
    'settings:edit',
    'reports:view',
    'seed:run',
  ],
  COMPANY_ADMIN: [
    'certificates:create',
    'certificates:edit_draft',
    'certificates:submit_review',
    'certificates:finalize',
    'certificates:cancel',
    'users:manage',
    'settings:edit',
    'reports:view',
  ],
  OPERATOR: [
    'certificates:create',
    'certificates:edit_draft',
    'certificates:submit_review',
    'reports:view',
  ],
};

// ─── Auth context ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, isLoading: true });

interface AuthProviderProps {
  children: ReactNode;
  user: AuthUser | null;
  isLoading?: boolean;
}

export function AuthProvider({ children, user, isLoading = false }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// ─── Permission hook ──────────────────────────────────────────────────────────

export function usePermissions() {
  const { user } = useAuth();

  function can(permission: Permission): boolean {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role].includes(permission);
  }

  function canAny(...permissions: Permission[]): boolean {
    return permissions.some(can);
  }

  function canAll(...permissions: Permission[]): boolean {
    return permissions.every(can);
  }

  return {
    can,
    canAny,
    canAll,
    isAdmin: user?.role === 'SUPER_ADMIN' || user?.role === 'COMPANY_ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
    isOperator: user?.role === 'OPERATOR',
    user,
  };
}

// ─── RoleGuard component ──────────────────────────────────────────────────────

interface RoleGuardProps {
  /** The permission required to see the children */
  permission: Permission;
  /** Optional fallback if the user lacks permission */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * RoleGuard — renders children only if the current user has the permission.
 *
 * Usage:
 *   <RoleGuard permission="certificates:finalize">
 *     <FinalizeButton />
 *   </RoleGuard>
 */
export function RoleGuard({ permission, fallback = null, children }: RoleGuardProps) {
  const { can } = usePermissions();
  return <>{can(permission) ? children : fallback}</>;
}

/** Shorthand for admin-only UI */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAdmin } = usePermissions();
  return <>{isAdmin ? children : (fallback ?? null)}</>;
}

// ─── Example usage in CertificateDetailScreen ────────────────────────────────

interface CertificateActionsBarProps {
  status: 'DRAFT' | 'UNDER_REVIEW' | 'FINALIZED' | 'CANCELLED';
  onSubmitReview: () => void;
  onFinalize: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

/**
 * Shows only the actions the current user is allowed to perform.
 * Operators see Submit; admins also see Finalize, Cancel, Delete.
 */
export function CertificateActionsBar({
  status,
  onSubmitReview,
  onFinalize,
  onCancel,
  onDelete,
}: CertificateActionsBarProps) {
  const { can } = usePermissions();

  return (
    <View style={styles.actionsBar}>

      {/* Any role with submit permission, only when DRAFT */}
      {status === 'DRAFT' && can('certificates:submit_review') && (
        <ActionButton label="Submit for Review" onPress={onSubmitReview} variant="primary" />
      )}

      {/* Admin-only: finalize, only when UNDER_REVIEW */}
      {status === 'UNDER_REVIEW' && (
        <RoleGuard permission="certificates:finalize">
          <ActionButton label="Finalise" onPress={onFinalize} variant="success" />
        </RoleGuard>
      )}

      {/* Admin-only: cancel */}
      {(status === 'DRAFT' || status === 'UNDER_REVIEW') && (
        <RoleGuard permission="certificates:cancel">
          <ActionButton label="Cancel" onPress={onCancel} variant="danger" />
        </RoleGuard>
      )}

      {/* Super admin only: hard delete */}
      <RoleGuard permission="certificates:delete">
        <ActionButton label="Delete" onPress={onDelete} variant="ghost" />
      </RoleGuard>

    </View>
  );
}

// ─── Small button helper ──────────────────────────────────────────────────────

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant: 'primary' | 'success' | 'danger' | 'ghost';
}

function ActionButton({ label, onPress, variant }: ActionButtonProps) {
  const variantStyle = {
    primary: { bg: '#1F3864', text: '#FFFFFF' },
    success: { bg: '#065F46', text: '#FFFFFF' },
    danger:  { bg: '#991B1B', text: '#FFFFFF' },
    ghost:   { bg: 'transparent', text: '#6B7280' },
  }[variant];

  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: variantStyle.bg }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.actionBtnText, { color: variantStyle.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  actionsBar: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  actionBtn: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 8, minWidth: 80, alignItems: 'center',
  },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
});
