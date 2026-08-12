import { User, Case } from '../types';

/**
 * Checks if a given user is assigned or connected to a specific case.
 * - DSP: Supervises all cases in the portal.
 * - Host: Assigned as the host for the case.
 * - Police Officer: Included in assignedOfficerIds or assignedOfficerNames.
 * - Advocate: Included in assignedAdvocateIds or assignedAdvocateNames.
 */
export function isUserAssignedToCase(user: User | null | undefined, c: Case | null | undefined): boolean {
  if (!user || !c) return false;

  // DSP role oversees all cases in the portal/precinct
  if (user.role === 'DSP') return true;

  // Host role assignment
  if (user.role === 'Host') {
    if (c.assignedHostId && c.assignedHostId === user.id) return true;
    if (
      c.assignedHostName &&
      c.assignedHostName !== 'Unassigned' &&
      c.assignedHostName.toLowerCase().includes(user.fullName.toLowerCase())
    ) {
      return true;
    }
    return false;
  }

  // Police Officer role assignment
  if (user.role === 'Police Officer') {
    if (Array.isArray(c.assignedOfficerIds) && c.assignedOfficerIds.includes(user.id)) return true;
    if (
      Array.isArray(c.assignedOfficerNames) &&
      c.assignedOfficerNames.some(
        (name) => name && name.toLowerCase().includes(user.fullName.toLowerCase())
      )
    ) {
      return true;
    }
    return false;
  }

  // Advocate role assignment
  if (user.role === 'Advocate') {
    if (Array.isArray(c.assignedAdvocateIds) && c.assignedAdvocateIds.includes(user.id)) return true;
    if (
      Array.isArray(c.assignedAdvocateNames) &&
      c.assignedAdvocateNames.some(
        (name) => name && name.toLowerCase().includes(user.fullName.toLowerCase())
      )
    ) {
      return true;
    }
    return false;
  }

  return false;
}
