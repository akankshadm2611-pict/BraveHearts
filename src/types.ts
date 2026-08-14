export type UserRole = 'DSP' | 'Host' | 'Police Officer' | 'Advocate';

export type UserStatus = 'Approved' | 'Pending' | 'Rejected';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  phone: string;
  department: string;
  badgeId: string;
  status: UserStatus;
  avatarUrl?: string;
}

export interface RegistrationRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  bloodGroup?: string;
  role: UserRole;
  department: string;
  badgeId: string;
  experience: string;
  designation: string;
  username: string;
  idProofName: string;
  idProofUrl?: string;
  serviceIdName: string;
  serviceIdUrl?: string;
  submittedAt: string;
  status: UserStatus;
  assignedToRole: 'DSP' | 'Host'; // DSP gets Host & DSP requests; Host gets Police & Advocate requests
}

export type CrimeType = 'Cyber Crime' | 'Homicide' | 'Armed Robbery' | 'Narcotics' | 'Fraud' | 'Kidnapping' | 'Human Trafficking' | 'Burglary' | 'Other' | (string & {});

export type CaseStatus = 'Active' | 'Solved' | 'Pending' | 'Under Investigation';

export interface EvidenceFile {
  id: string;
  caseId: string;
  fileName: string;
  fileType: 'Document' | 'Image' | 'Audio' | 'Video' | 'Forensic';
  description: string;
  uploadedBy: string;
  uploadedByRole: UserRole;
  uploadedAt: string;
  fileSize: string;
  url?: string;
  notes?: string;
}

export interface TimelineEntry {
  id: string;
  timestamp: string; // e.g. "10 Aug 2026, 09:30 AM"
  title: string; // e.g. "Case Registered", "Crime Scene Visited"
  description: string; // e.g. "Complaint received and case officially created."
  performerName: string; // e.g. "Inspector Sharma"
  performerRole?: string; // e.g. "Police Officer", "Host Inspector", "DSP"
  statusTag?: 'Completed' | 'In Progress' | 'Pending';
}

export interface Case {
  id: string; // Unique Case ID e.g. CR-2026-8942
  crimeType: CrimeType;
  dateAssigned: string;
  caseName: string;
  victimName: string; // Compulsory Victim Name
  witnessName?: string; // Optional Witness Name
  location: string; // Incident location / address e.g. "Downtown Central Financial Sector, Metro City"
  coordinates?: [number, number]; // Lat, Lng e.g. [18.922, 72.8346]
  description: string;
  status: CaseStatus;
  assignedHostId: string; // DSP assigns Host
  assignedHostName: string;
  assignedOfficerIds: string[]; // Host adds officers
  assignedOfficerNames: string[];
  assignedAdvocateIds: string[]; // Host adds advocates
  assignedAdvocateNames: string[];
  evidence: EvidenceFile[];
  createdAt: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  timeline?: TimelineEntry[];
}

export type SuspectStatus = 'Wanted' | 'Under Arrest' | 'Missing' | 'On Bail' | 'Sentenced' | 'Under Investigation';

export interface SuspectNodeConnection {
  targetSuspectId: string;
  targetSuspectName: string;
  relationship: string; // e.g. "Co-accused in Cyber Syndicate", "Known Associate", "Gang Leader"
  caseId: string;
}

export interface Suspect {
  id: string; // Unique Suspect ID e.g. SUS-9012
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  crime: string;
  address: string;
  status: SuspectStatus;
  photoUrl: string;
  linkedCaseIds: string[];
  connectedSuspects: SuspectNodeConnection[];
  notes?: string;
}

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'Registration' | 'Evidence' | 'CaseAssigned' | 'General';
  targetRole?: UserRole;
  relatedRequestId?: string;
  relatedCaseId?: string;
  read: boolean;
}

export interface CrimeDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyCrimeData {
  month: string;
  reported: number;
  resolved: number;
}

export type CrimeSeverity = 'High' | 'Medium' | 'Low';

export interface CrimeHotspot {
  id: string;
  areaName: string;
  severity: CrimeSeverity;
  crimeIndex: number;
  totalCases: number;
  mostCommonCrime: string;
  lastUpdated: string;
  center: [number, number];
  polygonCoords?: [number, number][];
  radiusMeters?: number;
}
