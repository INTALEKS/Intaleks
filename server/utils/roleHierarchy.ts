import { UserRole } from "@prisma/client";

/**
 * Role hierarchy levels (higher number = more permissions)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

/**
 * Check if a user has a specific role or higher
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user can manage another user (must have higher role)
 */
export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Get all roles that are equal to or below a given role
 */
export function getRolesAtOrBelow(role: UserRole): UserRole[] {
  const roleLevel = ROLE_HIERARCHY[role];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level <= roleLevel)
    .map(([roleName]) => roleName as UserRole);
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.SUPER_ADMIN;
}

/**
 * Check if user is admin or higher
 */
export function isAdminOrHigher(userRole: UserRole): boolean {
  return hasRole(userRole, UserRole.ADMIN);
}
