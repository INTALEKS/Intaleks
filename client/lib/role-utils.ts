/**
 * Client-side role hierarchy utilities
 * Mirrors server-side role hierarchy logic
 */

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

/**
 * Check if user has admin privileges (ADMIN or SUPER_ADMIN)
 */
export function isAdminOrHigher(role?: UserRole | string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(role?: UserRole | string): boolean {
  return role === "SUPER_ADMIN";
}

/**
 * Get role hierarchy level
 * USER = 1, ADMIN = 2, SUPER_ADMIN = 3
 */
export function getRoleLevel(role?: UserRole | string): number {
  switch (role) {
    case "SUPER_ADMIN":
      return 3;
    case "ADMIN":
      return 2;
    case "USER":
      return 1;
    default:
      return 0;
  }
}

/**
 * Check if one role has higher privileges than another
 */
export function hasHigherRole(role1?: UserRole | string, role2?: UserRole | string): boolean {
  return getRoleLevel(role1) > getRoleLevel(role2);
}
