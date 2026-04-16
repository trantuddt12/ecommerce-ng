export interface BackendPermission {
  id?: number | string;
  name?: string;
  description?: string;
}

export interface BackendRole {
  id?: number | string;
  name?: string;
  roleName?: string;
  authorities?: Array<string | BackendPermission>;
  permissions?: Array<string | BackendPermission>;
}

export interface BackendUser {
  id?: number | string;
  username?: string;
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  roles?: BackendRole[] | string[];
  authorities?: Array<string | BackendPermission>;
  permissions?: Array<string | BackendPermission>;
}

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
  permissions: string[];
}
