export function hasPermission(permissions: Set<string>, permission: string): boolean {
  return permissions.has(permission);
}

export function hasAnyPermission(permissions: Set<string>, requiredPermissions: string[]): boolean {
  return requiredPermissions.some((permission) => permissions.has(permission));
}

export function hasAllPermissions(permissions: Set<string>, requiredPermissions: string[]): boolean {
  return requiredPermissions.every((permission) => permissions.has(permission));
}
