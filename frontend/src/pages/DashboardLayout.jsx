import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import DashboardPage from './DashboardPage';
import ClubMasterPage from './ClubMasterPage';
import MemberMasterPage from './MemberMasterPage';
import PSTMasterPage from './PSTMasterPage';

/**
 * DashboardLayout Component
 * Houses the protected Chapter Portal interface (Sidebar, Header, and Master Views).
 * Preserves the exact clinical "The Ordinary" aesthetic and existing components.
 */
export default function DashboardLayout() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [psts, setPsts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial Sample Seed Data for immediate visual presentation
  const defaultClubs = [
    {
      _id: '65e8a1f2b34a1c0012345678',
      clubNumber: 'VC-324A-01',
      clubName: 'Vasavi Club of Metropolitan Central',
      district: 'District V-324',
      multipleDistrict: 'VCI 324',
      charterDate: '1984-06-15',
      status: 'Active',
      meetingSchedule: {
        frequency: 'First and Third Thursdays',
        venue: 'Vasavi Seva Bhavan, Mount Road',
      },
      contactEmail: 'contact@vasaviclub.org',
      contactPhone: '+91 44 2851 4090',
      totalMembers: 42,
    },
    {
      _id: '65e8a1f2b34a1c0012345679',
      clubNumber: 'VC-324A-02',
      clubName: 'Vasavi Club of Marina Bay',
      district: 'District V-324',
      multipleDistrict: 'VCI 324',
      charterDate: '1996-03-21',
      status: 'Active',
      meetingSchedule: {
        frequency: 'Second and Fourth Saturdays',
        venue: 'Vasavi Cultural Hall, Marina',
      },
      contactEmail: 'secretariat@vasavimarinabay.org',
      contactPhone: '+91 44 2841 5522',
      totalMembers: 29,
    },
    {
      _id: '65e8a1f2b34a1c0012345680',
      clubNumber: 'VC-324B-03',
      clubName: 'Vasavi Club of Temple City',
      district: 'District V-324',
      multipleDistrict: 'VCI 324',
      charterDate: '2004-11-10',
      status: 'Active',
      meetingSchedule: {
        frequency: 'Bi-Weekly',
        venue: 'Heritage Vasavi Bhavan',
      },
      contactEmail: 'admin@vasavitemplecity.org',
      contactPhone: '+91 452 233 4455',
      totalMembers: 35,
    },
  ];

  const defaultMembers = [
    {
      _id: 'm-01',
      memberId: 'V-100201',
      firstName: 'Rajesh',
      lastName: 'Sundaram',
      bloodGroup: 'O+',
      occupation: 'Chartered Accountant & Senior Partner',
      email: 'president@vasaviclub.org',
      phone: '+91 98401 23456',
      role: 'Club President',
      status: 'Active',
      club: defaultClubs[0],
    },
    {
      _id: 'm-02',
      memberId: 'V-100202',
      firstName: 'Dr. Ananya',
      lastName: 'Venkatesh',
      bloodGroup: 'A+',
      occupation: 'Healthcare Director & Surgeon',
      email: 'secretary@vasaviclub.org',
      phone: '+91 98402 34567',
      role: 'Club Secretary',
      status: 'Active',
      club: defaultClubs[0],
    },
    {
      _id: 'm-03',
      memberId: 'V-100203',
      firstName: 'Karthik',
      lastName: 'Narayanan',
      bloodGroup: 'B+',
      occupation: 'Managing Director, Infrastructure Ltd',
      email: 'treasurer@vasaviclub.org',
      phone: '+91 98403 45678',
      role: 'Club Treasurer',
      status: 'Active',
      club: defaultClubs[0],
    },
    {
      _id: 'm-04',
      memberId: 'V-100204',
      firstName: 'Meenakshi',
      lastName: 'Ramaswamy',
      bloodGroup: 'AB+',
      occupation: 'Educational Trustee & Author',
      email: 'meenakshi.r@gmail.com',
      phone: '+91 98404 56789',
      role: 'First Vice President',
      status: 'Active',
      club: defaultClubs[1],
    },
    {
      _id: 'm-05',
      memberId: 'V-100205',
      firstName: 'Siddharth',
      lastName: 'Chandrasekar',
      bloodGroup: 'O-',
      occupation: 'Senior Corporate Counsel',
      email: 'sid.chandra@lawfirm.in',
      phone: '+91 98405 67890',
      role: 'Vasavi Member',
      status: 'Active',
      club: defaultClubs[0],
    },
  ];

  const defaultPST = [
    {
      _id: 'pst-01',
      lionYear: '2024-2025',
      club: defaultClubs[0],
      president: {
        member: defaultMembers[0],
        officialEmail: 'president@vasaviclub.org',
        directPhone: '+91 98401 23456',
        termBio: 'Spearheading regional educational scholarships and community healthcare.',
      },
      secretary: {
        member: defaultMembers[1],
        officialEmail: 'secretary@vasaviclub.org',
        directPhone: '+91 98402 34567',
        termBio: 'Digitizing member dossiers and automating reporting to Vasavi Club International HQ.',
      },
      treasurer: {
        member: defaultMembers[2],
        officialEmail: 'treasurer@vasaviclub.org',
        directPhone: '+91 98403 45678',
        termBio: 'Maintaining audited transparency and governance over chapter trust accounts.',
      },
      status: 'Incumbent',
      cabinetMotto: 'Fellowship and Service',
      installedDate: '2024-07-01',
    },
  ];

  // Fetch real data from backend if available
  const fetchData = async () => {
    try {
      setLoading(true);
      const [clubRes, memRes, pstRes] = await Promise.all([
        fetch('/api/clubs').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/members').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/pst').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);

      if (clubRes?.success && clubRes.data?.length > 0) {
        setClubs(clubRes.data);
      } else {
        setClubs(defaultClubs);
      }

      if (memRes?.success && memRes.data?.length > 0) {
        setMembers(memRes.data);
      } else {
        setMembers(defaultMembers);
      }

      if (pstRes?.success && pstRes.data?.length > 0) {
        setPsts(pstRes.data);
      } else {
        setPsts(defaultPST);
      }
    } catch (e) {
      setClubs(defaultClubs);
      setMembers(defaultMembers);
      setPsts(defaultPST);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { isAdmin, role } = useAuth();

  const handleMemberCreated = (newMember) => {
    setMembers((prev) => [newMember, ...prev]);
  };

  const handleMemberDeleted = (deletedId) => {
    setMembers((prev) => prev.filter((m) => m._id !== deletedId && m.memberId !== deletedId));
  };

  const handleMemberRoleUpdated = (memberId, newRole) => {
    setMembers((prev) =>
      prev.map((m) =>
        m._id === memberId || m.memberId === memberId ? { ...m, role: newRole } : m
      )
    );
  };

  // Check if current view is a master module requiring admin privilege
  const isMasterView = ['club-master', 'member-master', 'pst-master'].includes(currentView);
  const isAccessDenied = isMasterView && !isAdmin;

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openOnboardingModal={() => setIsOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 md:ml-72 flex flex-col min-h-screen">
        <Header
          currentView={currentView}
          openOnboardingModal={() => setIsOnboardingOpen(true)}
          refreshData={fetchData}
        />

        {/* View Content */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {isAccessDenied ? (
            <div className="border border-neutral-200 bg-white p-8 md:p-12 max-w-2xl mx-auto my-12 text-left">
              <div className="flex items-center space-x-2 text-red-600 font-mono text-[10px] tracking-widest uppercase mb-4">
                <ShieldAlert className="w-4 h-4" />
                <span>SEC.AUTH.403 // RESTRICTED CHAPTER DOSSIER</span>
              </div>
              <h2 className="text-xl font-bold uppercase tracking-wide text-neutral-900 mb-2">
                Administrator Privilege Required
              </h2>
              <p className="text-xs text-neutral-600 font-sans leading-relaxed mb-6">
                Access to this Master module ({currentView.toUpperCase().replace('-', ' ')}) is restricted to authenticated Chapter Administrators. Your current session is authenticated under role: <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 uppercase">{role}</span>.
              </p>
              <div className="border-t border-neutral-100 pt-6 flex items-center justify-between">
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-clinical">
                  PROTOCOL: PRIVILEGE_INSUFFICIENT
                </span>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center space-x-2 px-4 py-2 bg-neutral-900 hover:bg-VASAVI-blue text-white text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Dashboard</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardPage
                  members={members}
                  clubs={clubs}
                  psts={psts}
                  openOnboardingModal={() => setIsOnboardingOpen(true)}
                />
              )}

              {currentView === 'club-master' && (
                <ClubMasterPage clubs={clubs} />
              )}

              {currentView === 'member-master' && (
                <MemberMasterPage
                  members={members}
                  openOnboardingModal={() => setIsOnboardingOpen(true)}
                  onMemberDeleted={handleMemberDeleted}
                  onMemberRoleUpdated={handleMemberRoleUpdated}
                  refreshData={fetchData}
                />
              )}

              {currentView === 'pst-master' && (
                <PSTMasterPage psts={psts} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Dynamic Multi-Step Member Onboarding Modal Wizard */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onMemberCreated={handleMemberCreated}
      />
    </div>
  );
}
