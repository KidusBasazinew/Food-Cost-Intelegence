/**
 * usePermission hook
 * Provides easy access to permission checking throughout the application
 * Usage:
 *   const { can, hasAny, hasAll } = usePermission();
 *   if (can('inventory.create')) { ... }
 */

import { useAuthStore } from "@/features/auth/store/useAuthStore";

export function usePermission() {
  const user = useAuthStore((s) => s.user);
  const permissions = user?.permissions || [];

  /**
   * Check if user has a specific permission
   * @param {string} permission - The permission to check
   * @returns {boolean}
   */
  const can = (permission) => {
    if (!permission) return false;
    return permissions.includes(permission);
  };

  /**
   * Check if user has ANY of the provided permissions
   * @param {string[]} permissionList - Array of permissions
   * @returns {boolean}
   */
  const hasAny = (permissionList = []) => {
    if (!Array.isArray(permissionList)) return false;
    return permissionList.some((perm) => permissions.includes(perm));
  };

  /**
   * Check if user has ALL of the provided permissions
   * @param {string[]} permissionList - Array of permissions
   * @returns {boolean}
   */
  const hasAll = (permissionList = []) => {
    if (!Array.isArray(permissionList)) return false;
    return permissionList.every((perm) => permissions.includes(perm));
  };

  /**
   * Get the user's role
   * @returns {string} The user's role
   */
  const getRole = () => {
    return user?.role;
  };

  /**
   * Get all user permissions
   * @returns {string[]} Array of permission strings
   */
  const getPermissions = () => {
    return permissions;
  };

  return {
    can,
    hasAny,
    hasAll,
    getRole,
    getPermissions,
  };
}

export default usePermission;
