export const ROLES = {
    ADMIN: "admin",
    VIEWER: "viewer",
    STAFF: "staff",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES = Object.values(ROLES);

export const PERMISSIONS = {
    DOCUMENTS_EDIT: [ROLES.ADMIN],
    DOCUMENTS_VIEW: [ROLES.ADMIN, ROLES.VIEWER, ROLES.STAFF],
    SETTINGS_ACCESS: [ROLES.ADMIN],
} as const;
