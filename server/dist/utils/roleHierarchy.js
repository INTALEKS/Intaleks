"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = hasRole;
exports.canManageUser = canManageUser;
exports.getRolesAtOrBelow = getRolesAtOrBelow;
exports.isSuperAdmin = isSuperAdmin;
exports.isAdminOrHigher = isAdminOrHigher;
const client_1 = require("@prisma/client");
/**
 * Role hierarchy levels (higher number = more permissions)
 */
const ROLE_HIERARCHY = {
    USER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
};
/**
 * Check if a user has a specific role or higher
 */
function hasRole(userRole, requiredRole) {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
/**
 * Check if a user can manage another user (must have higher role)
 */
function canManageUser(managerRole, targetRole) {
    return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}
/**
 * Get all roles that are equal to or below a given role
 */
function getRolesAtOrBelow(role) {
    const roleLevel = ROLE_HIERARCHY[role];
    return Object.entries(ROLE_HIERARCHY)
        .filter(([_, level]) => level <= roleLevel)
        .map(([roleName]) => roleName);
}
/**
 * Check if user is super admin
 */
function isSuperAdmin(userRole) {
    return userRole === client_1.UserRole.SUPER_ADMIN;
}
/**
 * Check if user is admin or higher
 */
function isAdminOrHigher(userRole) {
    return hasRole(userRole, client_1.UserRole.ADMIN);
}
