// Single source of truth for how each role is displayed across the app.
export const roleLabels = {
  ADMIN: 'Admin',
  VOLUNTEER: 'Volunteer',
  RO: 'Regional Organizer',
  SO: 'State Organizer'
};

export function getRoleLabel(role) {
  return roleLabels[role] || role;
}