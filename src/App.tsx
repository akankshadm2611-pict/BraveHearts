import React, { useState } from 'react';
import {
  User,
  Case,
  Suspect,
  RegistrationRequest,
  PortalNotification,
  EvidenceFile,
  TimelineEntry,
} from './types';
import {
  initialUsers,
  initialCases,
  initialSuspects,
  initialRegistrationRequests,
  initialNotifications,
  crimeDistributionData,
  monthlyCrimeData,
} from './data/mockData';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { RegistrationModal } from './components/RegistrationModal';
import { DspDashboard } from './components/DspDashboard';
import { HostDashboard } from './components/HostDashboard';
import { OfficerDashboard } from './components/OfficerDashboard';
import { AdvocateDashboard } from './components/AdvocateDashboard';
import { CaseDetailModal } from './components/CaseDetailModal';
import { SuspectManagement } from './components/SuspectManagement';
import { PendingApprovalModal } from './components/PendingApprovalModal';

export default function App() {
  // Application Global States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [themeMode, setThemeMode] = useState<'dark' | 'bright'>('dark');
  const [currentView, setCurrentView] = useState<'dashboard' | 'suspects'>('dashboard');

  // Shared Data States
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [suspects, setSuspects] = useState<Suspect[]>(initialSuspects);
  const [pendingRequests, setPendingRequests] = useState<RegistrationRequest[]>(initialRegistrationRequests);
  const [notifications, setNotifications] = useState<PortalNotification[]>(initialNotifications);

  // Modals
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedCaseModal, setSelectedCaseModal] = useState<Case | null>(null);
  const [selectedPendingRequestModal, setSelectedPendingRequestModal] = useState<RegistrationRequest | null>(null);

  // Toggle Theme Mode (Persists across all pages!)
  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'bright' : 'dark'));
  };

  // Login Success Handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  // Submit New Registration Request
  const handleSubmitRegistration = (req: RegistrationRequest) => {
    setPendingRequests((prev) => [req, ...prev]);

    // Push notification to Host / DSP approvers
    const newNotif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Verification Request',
      message: `${req.fullName} (${req.role}) has submitted a registration request for approval.`,
      timestamp: 'Just now',
      type: 'Registration',
      targetRole: req.assignedToRole,
      relatedRequestId: req.id,
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Approve Pending User Request
  const handleApproveRequest = (reqId: string) => {
    const targetReq = pendingRequests.find((r) => r.id === reqId);
    if (!targetReq) return;

    // Update request status
    setPendingRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'Approved' } : r))
    );

    // Create new approved User
    const newUser: User = {
      id: `u-${targetReq.role.toLowerCase().replace(/\s+/g, '')}-${Date.now()}`,
      username: targetReq.username,
      fullName: targetReq.fullName,
      role: targetReq.role,
      email: targetReq.email,
      phone: targetReq.phone,
      department: targetReq.department,
      badgeId: targetReq.badgeId,
      status: 'Approved',
    };

    setUsers((prev) => [...prev, newUser]);
  };

  // Reject Pending Request
  const handleRejectRequest = (reqId: string) => {
    setPendingRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'Rejected' } : r))
    );
  };

  // Update Case Status (e.g. automatically set to Solved when progress reaches 100%)
  const handleUpdateCaseStatus = (caseId: string, status: Case['status']) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updated = { ...c, status };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updated);
          }
          return updated;
        }
        return c;
      })
    );
  };

  // DSP Reassigns or Removes Host from Case
  const handleUpdateCaseHost = (caseId: string, hostId: string, hostName: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              assignedHostId: hostId,
              assignedHostName: hostName || 'Unassigned',
            }
          : c
      )
    );

    if (hostId) {
      const notif: PortalNotification = {
        id: `notif-${Date.now()}`,
        title: 'Case Host Assigned by DSP',
        message: `DSP assigned Case ${caseId} to Host ${hostName}.`,
        timestamp: 'Just now',
        type: 'CaseAssigned',
        targetRole: 'Host',
        relatedCaseId: caseId,
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    if (selectedCaseModal && selectedCaseModal.id === caseId) {
      setSelectedCaseModal((prev) =>
        prev
          ? {
              ...prev,
              assignedHostId: hostId,
              assignedHostName: hostName || 'Unassigned',
            }
          : null
      );
    }
  };

  // DSP Creates New Case
  const handleCreateCase = (newCase: Case) => {
    setCases((prev) => [newCase, ...prev]);

    // Notify assigned Host
    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Case Assigned by DSP',
      message: `DSP assigned Case ${newCase.id} (${newCase.caseName}) to Host ${newCase.assignedHostName}.`,
      timestamp: 'Just now',
      type: 'CaseAssigned',
      targetRole: 'Host',
      relatedCaseId: newCase.id,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Host Adds Police Officers & Advocates to Case
  const handleAddMemberToCase = (caseId: string, officerIds: string[], advocateIds: string[]) => {
    const officerNames = users.filter((u) => officerIds.includes(u.id)).map((u) => u.fullName);
    const advocateNames = users.filter((u) => advocateIds.includes(u.id)).map((u) => u.fullName);

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              assignedOfficerIds: officerIds,
              assignedOfficerNames: officerNames,
              assignedAdvocateIds: advocateIds,
              assignedAdvocateNames: advocateNames,
            }
          : c
      )
    );
  };

  // Upload Evidence File to Case
  const handleUploadEvidence = (caseId: string, evidence: EvidenceFile) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedEvidence = [evidence, ...c.evidence];
          const updatedCase = { ...c, evidence: updatedEvidence };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updatedCase);
          }
          return updatedCase;
        }
        return c;
      })
    );

    // Push notification to all assigned members
    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Evidence Uploaded',
      message: `${evidence.uploadedBy} (${evidence.uploadedByRole}) uploaded file "${evidence.fileName}" to Case ${caseId}.`,
      timestamp: 'Just now',
      type: 'Evidence',
      relatedCaseId: caseId,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Delete Evidence File from Case
  const handleDeleteEvidence = (caseId: string, evidenceId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedEvidence = c.evidence.filter((ev) => ev.id !== evidenceId);
          return { ...c, evidence: updatedEvidence };
        }
        return c;
      })
    );
    setSelectedCaseModal((prevModal) => {
      if (prevModal && prevModal.id === caseId) {
        return {
          ...prevModal,
          evidence: prevModal.evidence.filter((ev) => ev.id !== evidenceId),
        };
      }
      return prevModal;
    });
    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'Evidence File Removed',
      message: `An evidence file was deleted from Case ${caseId}.`,
      timestamp: 'Just now',
      type: 'Evidence',
      relatedCaseId: caseId,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Add Timeline Entry to Case
  const handleAddTimelineEntry = (caseId: string, entry: Omit<TimelineEntry, 'id'>) => {
    const newEntry: TimelineEntry = {
      ...entry,
      id: `tl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedTimeline = [...(c.timeline || []), newEntry];
          const updatedCase = { ...c, timeline: updatedTimeline };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updatedCase);
          }
          return updatedCase;
        }
        return c;
      })
    );
  };

  // Update Timeline Entry in Case
  const handleUpdateTimelineEntry = (caseId: string, updatedEntry: TimelineEntry) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const currentTimeline = c.timeline && c.timeline.length > 0
            ? c.timeline
            : [
                {
                  id: `initial-${c.id}`,
                  timestamp: c.createdAt || `${c.dateAssigned}, 09:30 AM`,
                  title: 'Case Registered',
                  description: `Complaint received and case officially created. ${c.description}`,
                  performerName: c.assignedHostName || 'Inspector Sharma',
                  performerRole: 'Host Inspector',
                  statusTag: 'Completed' as const,
                },
              ];
          const updatedTimeline = currentTimeline.map((item, idx) => {
            const itemId = item.id || `tl-${c.id}-${idx}`;
            return (item.id === updatedEntry.id || itemId === updatedEntry.id) ? updatedEntry : item;
          });
          const updatedCase = { ...c, timeline: updatedTimeline };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updatedCase);
          }
          return updatedCase;
        }
        return c;
      })
    );
  };

  // Create New Suspect (DSP & Host)
  const handleCreateSuspect = (newSuspect: Suspect) => {
    setSuspects((prev) => [newSuspect, ...prev]);
  };

  // Update Suspects List (Node links addition/removal)
  const handleUpdateSuspects = (updatedSuspects: Suspect[]) => {
    setSuspects(updatedSuspects);
  };

  // Update Single Suspect
  const handleUpdateSuspect = (updatedSuspect: Suspect) => {
    setSuspects((prev) =>
      prev.map((s) => (s.id === updatedSuspect.id ? updatedSuspect : s))
    );
  };

  const handleManageCaseSuspects = (caseId: string, selectedSuspectIds: string[]) => {
    setSuspects((prevSuspects) =>
      prevSuspects.map((s) => {
        const isSelected = selectedSuspectIds.includes(s.id);
        const isCurrentlyLinked = s.linkedCaseIds.includes(caseId);

        if (isSelected && !isCurrentlyLinked) {
          return { ...s, linkedCaseIds: [...s.linkedCaseIds, caseId] };
        } else if (!isSelected && isCurrentlyLinked) {
          return { ...s, linkedCaseIds: s.linkedCaseIds.filter((id) => id !== caseId) };
        }
        return s;
      })
    );
  };

  // Render Login Page when user is not logged in
  if (!currentUser) {
    return (
      <div className={themeMode === 'bright' ? 'theme-bright' : 'theme-dark'}>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onOpenRegistration={() => setIsRegistrationOpen(true)}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          existingUsers={users}
          pendingRequests={pendingRequests}
        />

        {/* New Registration Modal */}
        <RegistrationModal
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onSubmitRegistration={handleSubmitRegistration}
          themeMode={themeMode}
        />
      </div>
    );
  }

  // Filter user lists for Host team assignment dropdowns
  const hostsList = users.filter((u) => u.role === 'Host');
  const officersList = users.filter((u) => u.role === 'Police Officer');
  const advocatesList = users.filter((u) => u.role === 'Advocate');

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        themeMode === 'bright'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-[#0a0b0d] text-slate-100'
      }`}
    >
      {/* Universal Header with Notifications Bell & Theme Toggle */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        notifications={notifications}
        pendingRequests={pendingRequests}
        cases={cases}
        onSelectCase={(c) => setSelectedCaseModal(c)}
        onOpenPendingModal={(req) => setSelectedPendingRequestModal(req)}
        onOpenSuspectManagement={() => setCurrentView('suspects')}
        currentView={currentView}
        onNavigateHome={() => setCurrentView('dashboard')}
      />

      {/* Main View Router */}
      <main className="pb-12">
        {currentView === 'suspects' ? (
          <SuspectManagement
            suspects={suspects}
            cases={cases}
            onCreateSuspect={handleCreateSuspect}
            onUpdateSuspects={handleUpdateSuspects}
            userRole={currentUser.role}
            themeMode={themeMode}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        ) : (
          <>
            {/* Role Specific Dashboard Rendering */}
            {currentUser.role === 'DSP' && (
              <DspDashboard
                cases={cases}
                suspects={suspects}
                onCreateCase={handleCreateCase}
                onUpdateCaseHost={handleUpdateCaseHost}
                hostsList={hostsList}
                onSelectCase={(c) => setSelectedCaseModal(c)}
                onOpenSuspectManagement={() => setCurrentView('suspects')}
                onManageCaseSuspects={handleManageCaseSuspects}
                onCreateSuspect={handleCreateSuspect}
                onUpdateSuspect={handleUpdateSuspect}
                currentUser={currentUser}
                distributionData={crimeDistributionData}
                monthlyData={monthlyCrimeData}
                themeMode={themeMode}
              />
            )}

            {currentUser.role === 'Host' && (
              <HostDashboard
                currentUser={currentUser}
                cases={cases}
                suspects={suspects}
                officersList={officersList}
                advocatesList={advocatesList}
                onAddMemberToCase={handleAddMemberToCase}
                onSelectCase={(c) => setSelectedCaseModal(c)}
                onOpenSuspectManagement={() => setCurrentView('suspects')}
                onManageCaseSuspects={handleManageCaseSuspects}
                onCreateSuspect={handleCreateSuspect}
                onUpdateSuspect={handleUpdateSuspect}
                distributionData={crimeDistributionData}
                monthlyData={monthlyCrimeData}
                themeMode={themeMode}
              />
            )}

            {currentUser.role === 'Police Officer' && (
              <OfficerDashboard
                currentUser={currentUser}
                cases={cases}
                suspects={suspects}
                onSelectCase={(c) => setSelectedCaseModal(c)}
                distributionData={crimeDistributionData}
                monthlyData={monthlyCrimeData}
                themeMode={themeMode}
              />
            )}

            {currentUser.role === 'Advocate' && (
              <AdvocateDashboard
                currentUser={currentUser}
                cases={cases}
                suspects={suspects}
                onSelectCase={(c) => setSelectedCaseModal(c)}
                distributionData={crimeDistributionData}
                monthlyData={monthlyCrimeData}
                themeMode={themeMode}
              />
            )}
          </>
        )}
      </main>

      {/* Case Details & Evidence Upload Modal */}
      <CaseDetailModal
        c={selectedCaseModal}
        isOpen={Boolean(selectedCaseModal)}
        onClose={() => setSelectedCaseModal(null)}
        currentUser={currentUser}
        suspects={suspects}
        onManageCaseSuspects={handleManageCaseSuspects}
        onCreateSuspect={handleCreateSuspect}
        onUpdateSuspect={handleUpdateSuspect}
        onUploadEvidence={handleUploadEvidence}
        onDeleteEvidence={handleDeleteEvidence}
        onAddTimelineEntry={handleAddTimelineEntry}
        onUpdateTimelineEntry={handleUpdateTimelineEntry}
        onUpdateCaseStatus={handleUpdateCaseStatus}
        themeMode={themeMode}
      />

      {/* Candidate Verification Review Modal (Host & DSP Approvals) */}
      <PendingApprovalModal
        request={selectedPendingRequestModal}
        isOpen={Boolean(selectedPendingRequestModal)}
        onClose={() => setSelectedPendingRequestModal(null)}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        themeMode={themeMode}
      />
    </div>
  );
}
