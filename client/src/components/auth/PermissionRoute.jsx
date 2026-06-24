/**
 * PermissionRoute component
 * Wraps routes that require specific permissions
 * If user doesn't have permission, redirects to dashboard or forbidden page
 *
 * Usage:
 *   <PermissionRoute
 *     permission="inventory.view"
 *     element={<InventoryPage />}
 *     fallback={<ForbiddenPage />}
 *   />
 */

import { usePermission } from "@/hooks/usePermission";
import { Navigate } from "react-router-dom";

export function PermissionRoute({
  permission,
  permissions: permissionArray,
  requireAll = false,
  element,
  fallback = null,
}) {
  const { can, hasAny, hasAll } = usePermission();

  // Determine if user has required permission(s)
  let hasPermission = true;

  if (permission) {
    // Single permission check
    hasPermission = can(permission);
  } else if (permissionArray) {
    // Multiple permissions check
    hasPermission = requireAll
      ? hasAll(permissionArray)
      : hasAny(permissionArray);
  }

  // If user doesn't have permission, show fallback or redirect to dashboard
  if (!hasPermission) {
    if (fallback) {
      return fallback;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return element;
}

export default PermissionRoute;
