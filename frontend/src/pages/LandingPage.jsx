import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Building2,
  Newspaper,
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  HeartHandshake,
  Eye,
  GraduationCap,
  Users,
  Menu,
  X,
} from 'lucide-react';

/**
 * Public Landing Page Component
 * Blends a traditional community portal layout with "The Ordinary" clinical/minimalist aesthetic:
 * - Extensive white space, ultra-thin borders (border-gray-200), zero bulky drop-shadows
 * - Top Utility Bar with contact coordinates and monochrome social links
 * - Main Header/Nav with "Unified Digital Community Portal", nav links, [ MEMBER LOGIN ] and [ JOIN US ]
 * - Full-width Hero section with high-contrast typography and subtle dark overlay
 * - 4 Floating Action Cards overlapping the hero with Framer Motion hover lifts (no bulky colored circles)
 * - Pillars of Service, Community Telemetry, Events, Gallery & Clinical Footer
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  // Executive Leadership Profile Cards (5 official portrait photographs)
  const leadershipTeam = [
    {
      code: 'PST.01',
      name: 'VN. SOWBHAGYA SEVASANKALP KCGF SIDDA VENKATA SURYA PRAKASA RAO',
      role: 'PRESIDENT',
      image: '/leadership/leader_president.png',
      spec: 'DISTRICT GOVERNANCE',
    },
    {
      code: 'PST.02',
      name: 'VN. PRATHIBHA SANKALP KCGF GARLAPATI SRINIVASULU',
      role: 'EXECUTIVE VICE PRESIDENT',
      image: '/leadership/leader_evp.png',
      spec: 'OPERATIONAL OVERSIGHT',
    },
    {
      code: 'PST.03',
      name: 'VN. VIDYASANKALPKCGF DARISI SRINIVAS RAOGUPTA',
      role: 'SECRETARY (ADMINISTRATION)',
      image: '/leadership/leader_sec_admin.png',
      spec: 'CENTRAL SECRETARIAT',
    },
    {
      code: 'PST.04',
      name: 'VN.SEVASANKALAP *KCGF JULURI RAMESH BABU',
      role: 'SECRETARY (SERVICE ACTIVITIES)',
      image: '/leadership/leader_sec_service.png',
      spec: 'SERVICE & ENDOWMENTS',
    },
    {
      code: 'PST.05',
      name: 'VN. SOWBHAGYA SEVASANKALP KCGF V.SENTHIL KUMAR',
      role: 'TREASURER',
      image: '/leadership/leader_treasurer.png',
      spec: 'FINANCIAL AUDIT & TRUST',
    },
  ];

  // Movement Historical Milestones
  const movementMilestones = [
    {
      tag: '1961',
      title: 'FOUNDATION IN HYDERABAD',
      description:
        'First chartered Vasavi Club assembly established in Hyderabad, unifying regional merchant and civic leaders into an organized fellowship dedicated to social upliftment.',
    },
    {
      tag: 'SERVICE',
      title: 'HUMANITARIAN MOBILIZATION',
      description:
        'Pioneered nationwide pulse polio immunizations, free cataract surgeries, rural diagnostic camps, and permanent educational scholarships.',
    },
    {
      tag: '2008',
      title: 'INTERNATIONAL REGISTRATION',
      description:
        'Formally registered as Vasavi Clubs International, expanding institutional governance, charter entities, and philanthropic missions across the global diaspora.',
    },
  ];

  // Latest Dispatches / News
  const dashboardNews = [
    {
      day: '28',
      month: 'SEPT',
      title: 'Member Welfare Fund Allocation & Medical Grant Extension',
      category: 'GOVERNANCE',
      summary:
        'Central Executive Board authorizes quarterly corpus disbursement for emergency healthcare assistance and member bereavement endowments.',
    },
    {
      day: '23',
      month: 'SEPT',
      title: 'Ganesh Nimajjanam Community Service Holiday Notice',
      category: 'PUBLIC NOTICE',
      summary:
        'Special community volunteer stations and Annadanam camps active along coastal procession zones; administrative secretariat observed holiday.',
    },
    {
      day: '20',
      month: 'SEPT',
      title: 'Central Chapter Secretariat Administrative Assembly',
      category: 'CABINET',
      summary:
        'Cabinet review completed regarding club charter certifications, DRZ Master hierarchical alignments, and lion-year convention plans.',
    },
  ];

  // Latest Events & Conclaves
  const dashboardEvents = [
    {
      day: '16',
      month: 'SEPT',
      title: 'Annual Public Meeting & Community Service Awards',
      venue: 'Vasavi Seva Bhavan, Mount Road, Chennai',
      time: '10:00 AM IST',
      badge: 'PUBLIC CONCLAVE',
    },
    {
      day: '25',
      month: 'SEPT',
      title: 'VCI District V-324 Leadership & PST Cabinet Assembly',
      venue: 'Metropolitan Convention Hall, Adyar',
      time: '06:30 PM IST',
      badge: 'PST CABINET ONLY',
    },
  ];

  // Floating Action Cards specification
  const actionCards = [
    {
      id: 'join-us',
      code: 'FAC.01 // ENROLLMENT',
      icon: UserPlus,
      title: 'Join Us',
      description:
        'Apply for chapter induction, join philanthropic drives, and become part of our active civic leadership roster.',
      actionText: '[ INDUCT NOW ]',
      actionLink: '/login?tab=register',
    },
    {
      id: 'new-clubs',
      code: 'FAC.02 // CHARTERS',
      icon: Building2,
      title: 'New Clubs',
      description:
        'Explore newly chartered chapter registries, regional jurisdiction extensions, and upcoming institutional charters.',
      actionText: '[ VIEW REGISTRY ]',
      actionLink: '/login',
    },
    {
      id: 'latest-news',
      code: 'FAC.03 // DISPATCHES',
      icon: Newspaper,
      title: 'Latest News',
      description:
        'Read quarterly chapter gazettes, district governor communiqués, service milestone dispatches, and public notices.',
      actionText: '[ READ BULLETINS ]',
      actionLink: '#news',
    },
    {
      id: 'member-portal',
      code: 'FAC.04 // GOVERNANCE',
      icon: ShieldCheck,
      title: 'Member Portal',
      description:
        'Direct gateway for authenticated members to manage club records, PST leadership cabinets, and telemetry logs.',
      actionText: '[ SECURE LOGIN ]',
      actionLink: '/login',
    },
  ];

  // Core Service Pillars
  const servicePillars = [
    {
      code: 'PIL.01',
      title: 'Vision Care & Sight Restoration',
      icon: Eye,
      description:
        'Free cataract screening camps, intraocular lens surgeries, and corrective spectacles distribution across underprivileged rural sectors.',
    },
    {
      code: 'PIL.02',
      title: 'Hunger & Nutrition Relief',
      icon: HeartHandshake,
      description:
        'Annadanam feeding initiatives, community grain banks, and daily nutritional sustenance programs for hospital wards and shelters.',
    },
    {
      code: 'PIL.03',
      title: 'Educational Trusts & Scholarships',
      icon: GraduationCap,
      description:
        'Merit-cum-means financial assistance, textbook distribution, and vocational skill training for deserving students.',
    },
    {
      code: 'PIL.04',
      title: 'Civic Leadership & Fellowship',
      icon: Users,
      description:
        'Nurturing professional governance, ethical commerce, and philanthropic camaraderie through structured chapter assemblies.',
    },
  ];

  // Upcoming Events
  const upcomingEvents = [
    {
      code: 'EVT.2026.01',
      date: 'MAR 28, 2026',
      title: 'District V-324 Annual Leadership Conclave',
      venue: 'Vasavi Cultural Auditorium, Mount Road, Chennai',
      category: 'GOVERNANCE',
    },
    {
      code: 'EVT.2026.02',
      date: 'APR 12, 2026',
      title: 'Mega Diagnostic & Preventive Health Camp',
      venue: 'Community Health Centre, Kanchipuram Chapter',
      category: 'HUMANITARIAN',
    },
    {
      code: 'EVT.2026.03',
      date: 'MAY 05, 2026',
      title: 'Charter Induction Ceremony: Cyber City Chapter',
      venue: 'Grand Ball Room, Hitec City, Hyderabad',
      category: 'CHARTERING',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans font-normal selection:bg-VASAVI-blue selection:text-white">
      {/* 1. TOP UTILITY BAR (Very thin full-width bar) */}
      <div className="w-full bg-neutral-50 border-b border-gray-200 py-1.5 px-4 sm:px-8 text-xs font-sans text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          {/* Contact Coordinates */}
          <div className="flex items-center space-x-4 flex-wrap justify-center sm:justify-start">
            <div className="flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <span>secretariat@vasaviclub.org</span>
            </div>
            <span className="text-neutral-300 hidden sm:inline">|</span>
            <div className="flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <span>+91 44 2851 4090</span>
            </div>
            <span className="text-neutral-300 hidden md:inline">|</span>
            <div className="hidden md:flex items-center space-x-1.5 text-neutral-400">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <span>DISTRICT V-324 JURISDICTION</span>
            </div>
          </div>

          {/* Monochrome Social & Institutional Media */}
          <div className="flex items-center space-x-3 text-neutral-400">
            <span className="text-[10px] tracking-wider uppercase hidden lg:inline font-medium">CONNECT //</span>
            <a
              href="https://vasaviclubs.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-900 transition-colors"
              title="Official Portal"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
            <a
              href="#contact"
              className="hover:text-neutral-900 transition-colors"
              title="Public Inquiries"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
            <span className="text-[10px] text-neutral-500 border border-neutral-200 px-1.5 py-0.5 font-medium">
              PORTAL V2.4
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Official Logo & Portal Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/logo.png"
              alt="Vasavi Clubs International Emblem"
              className="w-12 h-12 object-contain flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            <div className="text-left">
              <h1 className="text-sm sm:text-base font-sans font-bold tracking-tight text-neutral-900 leading-tight">
                Unified Digital Community Portal
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 block mt-0.5 font-medium">
                VASAVI CLUBS INTERNATIONAL // DISTRICT V-324
              </span>
            </div>
          </Link>

          {/* Center: Minimalist Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-xs font-sans font-medium uppercase tracking-wider text-neutral-600">
            <a href="#hero" className="hover:text-VASAVI-blue transition-colors">
              Home
            </a>
            <a href="#about" className="hover:text-VASAVI-blue transition-colors">
              About Us
            </a>
            <a href="#pillars" className="hover:text-VASAVI-blue transition-colors">
              Pillars
            </a>
            <a href="#events" className="hover:text-VASAVI-blue transition-colors">
              Events
            </a>
            <a href="#gallery" className="hover:text-VASAVI-blue transition-colors">
              Gallery
            </a>
            <a href="#contact" className="hover:text-VASAVI-blue transition-colors">
              Contact
            </a>
          </nav>

          {/* Right: Two Clear Call-to-Action Text Buttons */}
          <div className="hidden sm:flex items-center space-x-3 font-sans text-xs font-semibold">
            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-2 border border-neutral-300 hover:border-neutral-900 text-neutral-800 uppercase tracking-wider transition-colors cursor-pointer bg-white"
            >
              [ MEMBER LOGIN ]
            </button>
            <button
              onClick={() => navigate('/login?tab=register')}
              className="px-3.5 py-2 border border-neutral-900 bg-neutral-900 hover:bg-VASAVI-blue hover:border-VASAVI-blue text-white uppercase tracking-wider transition-colors cursor-pointer"
            >
              [ JOIN US ]
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-700 hover:text-neutral-900 border border-neutral-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 px-6 py-4 space-y-3 font-sans text-xs uppercase tracking-wider font-medium">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-neutral-700 hover:text-neutral-900"
            >
              Home
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-neutral-700 hover:text-neutral-900"
            >
              About Us
            </a>
            <a
              href="#pillars"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-neutral-700 hover:text-neutral-900"
            >
              Pillars
            </a>
            <a
              href="#events"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-neutral-700 hover:text-neutral-900"
            >
              Events
            </a>
            <a
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-neutral-700 hover:text-neutral-900"
            >
              Gallery
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-neutral-700 hover:text-neutral-900"
            >
              Contact
            </a>
            <div className="pt-3 border-t border-gray-200 flex flex-col space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-2 border border-neutral-300 text-center uppercase tracking-wider font-semibold"
              >
                [ MEMBER LOGIN ]
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login?tab=register');
                }}
                className="w-full py-2 bg-neutral-900 text-white text-center uppercase tracking-wider font-semibold"
              >
                [ JOIN US ]
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION (Full-width with high-contrast overlay & cover background) */}
      <section
        id="hero"
        className="relative min-h-[520px] md:min-h-[580px] flex items-center justify-center text-center overflow-hidden bg-neutral-950"
      >
        {/* Cover Photo Background with Subtle Dark Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop")',
          }}
        ></div>

        {/* Subtle Gradient Overlays to preserve ultra-crisp reading contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/60 to-neutral-950/90"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-VASAVI-blue"></div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-white">
          <div className="inline-flex items-center space-x-2 px-3 py-1 border border-neutral-700 bg-neutral-900/80 text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-300 mb-6">
            <span className="w-1.5 h-1.5 bg-VASAVI-gold rounded-full"></span>
            <span>INSTITUTIONAL REGISTRY // DISTRICT V-324 JURISDICTION</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-6xl font-sans font-bold tracking-tight text-white leading-tight md:leading-tight max-w-4xl mx-auto">
            Fellowship, Leadership & Humanitarian Service
          </h2>

          <div className="mt-4 flex items-center justify-center space-x-3">
            <span className="h-[1px] w-8 bg-VASAVI-gold"></span>
            <span className="font-sans text-base sm:text-xl font-medium italic text-VASAVI-gold tracking-wide">
              "Live to Serve"
            </span>
            <span className="h-[1px] w-8 bg-VASAVI-gold"></span>
          </div>

          <p className="mt-5 text-sm sm:text-base font-sans font-normal text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Coordinating chartered chapters, philanthropic endowments, and community initiatives across
            District V-324. Empowering civic leadership and sustainable community welfare.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-sans font-semibold">
            <button
              onClick={() => navigate('/login?tab=register')}
              className="w-full sm:w-auto px-6 py-3 border border-VASAVI-gold bg-VASAVI-gold hover:bg-VASAVI-goldDark text-neutral-950 font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              [ JOIN CHAPTER AS A MEMBER ]
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 py-3 border border-white/80 hover:bg-white hover:text-neutral-950 text-white uppercase tracking-wider transition-colors cursor-pointer"
            >
              [ ACCESS GOVERNANCE PORTAL ]
            </button>
          </div>
        </div>
      </section>

      {/* 4. FLOATING ACTION CARDS (Overlapping bottom of hero with Framer Motion hover lift) */}
      <section className="-mt-14 sm:-mt-20 z-20 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {actionCards.map((card) => {
            const Icon = card.icon;
            const isExternalHash = card.actionLink.startsWith('#');

            const handleCardAction = () => {
              if (isExternalHash) {
                const target = document.querySelector(card.actionLink);
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              } else {
                navigate(card.actionLink);
              }
            };

            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className="border border-gray-200 bg-white p-6 space-y-4 shadow-none hover:border-neutral-400 transition-colors text-left flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Micro Specification Code & Thin-Line Icon */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400">
                      {card.code}
                    </span>
                    <Icon className="w-4 h-4 text-neutral-700 stroke-[1.5]" />
                  </div>

                  {/* Title & Body */}
                  <div className="mt-3">
                    <h3 className="text-base font-sans font-bold text-neutral-900 tracking-tight">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs font-sans font-normal text-neutral-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Card CTA Text Action Button */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={handleCardAction}
                    className="text-xs font-sans font-semibold uppercase tracking-wider text-neutral-900 hover:text-VASAVI-blue transition-colors inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4.5 COMPREHENSIVE INFORMATION DASHBOARD (Leadership, Movement Notes, News, Events & Support) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 space-y-6">
        {/* ROW 1: [ OUR LEADERSHIP ] (2/3 width) + [ MOVEMENT NOTES ] (1/3 width) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* OUR LEADERSHIP (lg:col-span-8) */}
          <div className="lg:col-span-8 border border-gray-200 bg-white p-6 sm:p-7 flex flex-col justify-between rounded-none shadow-none text-left">
            <div>
              {/* Module Header */}
              <div className="border-b border-gray-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block">
                    VCI-CABINET // CENTRAL GOVERNANCE COUNCIL
                  </span>
                  <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-neutral-900 mt-0.5">
                    [ OUR LEADERSHIP ]
                  </h3>
                </div>
                <span className="text-[10px] font-sans font-medium text-neutral-500 uppercase border border-neutral-200 px-2.5 py-0.5 self-start sm:self-auto bg-neutral-50 rounded-none">
                  INCUMBENT CABINET 2024-2025
                </span>
              </div>

              {/* 5-Card Horizontal Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {leadershipTeam.map((leader) => (
                  <div
                    key={leader.code}
                    className="border border-gray-200 bg-white p-2.5 flex flex-col justify-between group hover:border-neutral-900 transition-colors rounded-none"
                  >
                    <div>
                      {/* Portrait Image Container */}
                      <div className="w-full aspect-[4/5] overflow-hidden bg-neutral-100 border border-neutral-200 mb-2.5 relative rounded-none">
                        <img
                          src={leader.image}
                          alt={leader.name}
                          className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                        <div className="absolute top-1 left-1 bg-neutral-900/80 text-white text-[9px] font-sans font-medium px-1.5 py-0.5 tracking-wider">
                          {leader.code}
                        </div>
                      </div>

                      {/* Name */}
                      <h4 className="font-sans font-bold text-[10px] sm:text-[11px] uppercase tracking-tight text-neutral-900 leading-tight line-clamp-3">
                        {leader.name}
                      </h4>
                    </div>

                    {/* Role */}
                    <div className="mt-2.5 pt-2 border-t border-neutral-100">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-VASAVI-blue block leading-tight">
                        {leader.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] font-sans font-medium text-neutral-400 uppercase tracking-wider">
              <span>VASAVI CLUBS INTERNATIONAL CABINET</span>
              <span>CONSTITUTIONAL MANDATE</span>
            </div>
          </div>

          {/* MOVEMENT NOTES (lg:col-span-4) */}
          <div className="lg:col-span-4 border border-gray-200 bg-white p-6 sm:p-7 flex flex-col justify-between rounded-none shadow-none text-left">
            <div>
              {/* Module Header */}
              <div className="border-b border-gray-200 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block">
                    VCI-CHRONOLOGY // HISTORICAL MILESTONES
                  </span>
                  <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-neutral-900 mt-0.5">
                    [ MOVEMENT NOTES ]
                  </h3>
                </div>
                <span className="text-[10px] font-sans font-medium text-neutral-400 uppercase">
                  MILESTONES
                </span>
              </div>

              {/* Milestone Stack */}
              <div className="space-y-4">
                {movementMilestones.map((milestone) => (
                  <div
                    key={milestone.tag}
                    className="border border-neutral-200 p-3.5 bg-neutral-50/40 hover:bg-white transition-colors text-left space-y-1.5 rounded-none"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="border border-neutral-900 bg-neutral-900 text-white text-[10px] font-sans font-bold px-2 py-0.5 tracking-wider rounded-none">
                        {milestone.tag}
                      </span>
                      <span className="text-[11px] font-sans font-bold uppercase text-neutral-900 tracking-wider">
                        {milestone.title}
                      </span>
                    </div>
                    <p className="font-sans font-normal text-xs text-neutral-600 leading-relaxed pt-0.5">
                      {milestone.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] font-sans font-medium text-neutral-400 uppercase tracking-wider">
              <span>CHRONICLE STATUS: VERIFIED</span>
              <span>EST. 1961</span>
            </div>
          </div>
        </div>

        {/* ROW 2: [ LATEST NEWS ] (1/3 width) + [ LATEST EVENTS ] (1/3 width) + [ SUPPORT VCI SERVICE ] (1/3 width) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LATEST NEWS (lg:col-span-4) */}
          <div className="lg:col-span-4 border border-gray-200 bg-white p-6 sm:p-7 flex flex-col justify-between rounded-none shadow-none text-left">
            <div>
              {/* Module Header */}
              <div className="border-b border-gray-200 pb-4 mb-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block">
                    VCI-GAZETTE // CHAPTER DISPATCHES
                  </span>
                  <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-neutral-900 mt-0.5">
                    [ LATEST NEWS ]
                  </h3>
                </div>
                <span className="text-[10px] font-sans font-medium text-neutral-400 uppercase">
                  OCTET.2024
                </span>
              </div>

              {/* News List */}
              <div className="divide-y divide-gray-100 space-y-3.5">
                {dashboardNews.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-start space-x-3 text-left">
                    {/* Tabular Block Date Badge */}
                    <div className="flex-shrink-0 border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-center w-14 font-sans rounded-none">
                      <div className="text-xs font-bold text-neutral-900 leading-none">
                        {item.day}
                      </div>
                      <div className="text-[9px] text-neutral-500 tracking-wider mt-0.5 leading-none">
                        // {item.month}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="text-[10px] font-sans uppercase tracking-wider text-VASAVI-blue font-bold">
                        {item.category}
                      </div>
                      <h4 className="font-sans font-bold text-xs text-neutral-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="font-sans font-normal text-[11px] text-neutral-600 leading-relaxed line-clamp-2">
                        {item.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-sans font-semibold">
              <a
                href="#news"
                className="text-neutral-900 hover:text-VASAVI-blue uppercase tracking-wider transition-colors inline-flex items-center space-x-1"
              >
                <span>[ VIEW FULL GAZETTE ]</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* LATEST EVENTS (lg:col-span-4) */}
          <div className="lg:col-span-4 border border-gray-200 bg-white p-6 sm:p-7 flex flex-col justify-between rounded-none shadow-none text-left">
            <div>
              {/* Module Header */}
              <div className="border-b border-gray-200 pb-4 mb-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block">
                    VCI-CALENDAR // DISTRICT SUMMITS
                  </span>
                  <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-neutral-900 mt-0.5">
                    [ LATEST EVENTS ]
                  </h3>
                </div>
                <span className="text-[10px] font-sans font-medium text-neutral-400 uppercase">
                  UPCOMING
                </span>
              </div>

              {/* Events List */}
              <div className="divide-y divide-gray-100 space-y-4">
                {dashboardEvents.map((evt, idx) => (
                  <div key={idx} className="pt-3.5 first:pt-0 flex items-start space-x-3 text-left">
                    {/* Tabular Block Date Badge */}
                    <div className="flex-shrink-0 border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-center w-14 font-sans rounded-none">
                      <div className="text-xs font-bold text-neutral-900 leading-none">
                        {evt.day}
                      </div>
                      <div className="text-[9px] text-neutral-500 tracking-wider mt-0.5 leading-none">
                        // {evt.month}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-sans font-medium border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 uppercase text-neutral-700 rounded-none">
                          {evt.badge}
                        </span>
                        <span className="text-[10px] font-sans font-medium text-neutral-400">
                          {evt.time}
                        </span>
                      </div>
                      <h4 className="font-sans font-bold text-xs text-neutral-900 leading-snug">
                        {evt.title}
                      </h4>
                      <div className="text-xs font-sans text-neutral-500 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-sans font-semibold">
              <a
                href="#events"
                className="text-neutral-900 hover:text-VASAVI-blue uppercase tracking-wider transition-colors inline-flex items-center space-x-1"
              >
                <span>[ COMPLETE CALENDAR ]</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* SUPPORT VCI SERVICE (lg:col-span-4) */}
          <div className="lg:col-span-4 border border-gray-200 bg-white p-6 sm:p-7 flex flex-col justify-between rounded-none shadow-none text-left">
            <div>
              {/* Module Header */}
              <div className="border-b border-gray-200 pb-4 mb-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block">
                    VCI-ENDOWMENT // PHILANTHROPIC TRUST
                  </span>
                  <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-neutral-900 mt-0.5">
                    [ SUPPORT VCI SERVICE ]
                  </h3>
                </div>
                <HeartHandshake className="w-4 h-4 text-VASAVI-blue" />
              </div>

              {/* Explanatory Narrative */}
              <div className="space-y-4 text-left">
                <p className="font-sans font-normal text-xs text-neutral-600 leading-relaxed">
                  Vasavi Clubs International District V-324 administers non-profit humanitarian endowments for sight restoration, food sustenance, and educational sponsorship.
                </p>

                {/* Direct Contact Coordinates */}
                <div className="border border-neutral-200 bg-neutral-50/70 p-3.5 space-y-2 text-xs font-sans rounded-none">
                  <div className="flex items-center space-x-2 text-neutral-700">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">secretariat@vasaviclubs.org</span>
                  </div>
                  <div className="flex items-center space-x-2 text-neutral-700">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <span>+91 44 2851 4090</span>
                  </div>
                  <div className="pt-1.5 border-t border-neutral-200 text-[10px] text-neutral-500 flex items-center justify-between">
                    <span>TAX EXEMPTION:</span>
                    <span className="font-bold text-neutral-800">80G CERTIFIED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flat Solid High-Contrast Donate Button */}
            <div className="mt-6 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDonateModalOpen(true)}
                className="w-full py-3 px-4 bg-neutral-900 hover:bg-VASAVI-blue text-white text-xs font-sans font-semibold uppercase tracking-wider transition-colors cursor-pointer border-none rounded-none text-center block shadow-none"
              >
                [ DONATE TO SERVICE FUND ]
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ABOUT DISTRICT V-324 SECTION */}
      <section id="about" className="py-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block">
                INSTITUTIONAL FOUNDATION // ARCHIVE 1984
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-neutral-900">
                A Unified Cadre for Social Transformation & Humane Service
              </h2>
              <p className="text-sm font-sans font-normal text-neutral-600 leading-relaxed">
                Vasavi Clubs International was chartered with a resolute commitment to elevate society through
                uncompromising integrity, structured volunteerism, and targeted philanthropic investments. Operating
                under the constitutional framework of Multiple District 324, District V-324 unifies chartered
                chapters across cities, districts, and municipalities.
              </p>
              <p className="text-sm font-sans font-normal text-neutral-600 leading-relaxed">
                Guided by the venerated precept <em className="text-neutral-900 font-semibold">"Live to Serve"</em>,
                our chartered clubs execute institutional welfare projects spanning preventive ophthalmic care,
                nutritional security, educational bursaries, and civic disaster relief.
              </p>

              <div className="pt-4 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div className="p-3 border border-gray-200 bg-neutral-50/50">
                  <span className="text-[10px] font-medium text-neutral-400 block uppercase">CHARTER YEAR</span>
                  <span className="text-base font-sans font-bold text-neutral-900">1984</span>
                </div>
                <div className="p-3 border border-gray-200 bg-neutral-50/50">
                  <span className="text-[10px] font-medium text-neutral-400 block uppercase">DISTRICT</span>
                  <span className="text-base font-sans font-bold text-neutral-900">V-324</span>
                </div>
                <div className="p-3 border border-gray-200 bg-neutral-50/50 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-medium text-neutral-400 block uppercase">MOTTO</span>
                  <span className="text-sm font-sans font-bold text-VASAVI-blue">Live to Serve</span>
                </div>
              </div>
            </div>

            {/* Right Clinical Dossier Card */}
            <div className="lg:col-span-5 border border-gray-200 bg-neutral-50/50 p-6 sm:p-8 space-y-6 text-left">
              <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400">
                  DISTRICT V-324 SECRETARIAT
                </span>
                <span className="text-[10px] font-sans font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 uppercase">
                  ACTIVE REGISTRY
                </span>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <span className="text-[10px] font-medium text-neutral-400 uppercase block">ADMINISTRATIVE HEADQUARTERS</span>
                  <span className="text-sm font-sans font-bold text-neutral-900">
                    Vasavi Seva Bhavan // District V-324
                  </span>
                  <p className="font-sans font-normal text-neutral-600 mt-0.5">
                    No. 42, Anna Salai, Thousand Lights, Chennai, Tamil Nadu 600006
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <span className="text-[10px] font-medium text-neutral-400 uppercase block">INCUMBENT CABINET YEAR</span>
                  <span className="text-sm font-sans font-bold text-neutral-900">2024 - 2025</span>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-neutral-400 uppercase">OFFICIAL EMAIL</span>
                  <span className="text-VASAVI-blue font-bold">secretariat@vasaviclub.org</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 border border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-900 text-xs font-sans font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  [ ACCESS CHAPTER DIRECTORY ]
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOUR PILLARS OF COMMUNITY SERVICE */}
      <section id="pillars" className="py-16 border-t border-gray-200 bg-neutral-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block">
              SYSTEMIC IMPACT // CORE DOMAINS
            </span>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-neutral-900">
              Institutional Pillars of Humanitarian Service
            </h2>
            <p className="text-xs font-sans font-normal text-neutral-500">
              Structured community programs executed systematically across all District V-324 chartered clubs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {servicePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.code}
                  className="border border-gray-200 bg-white p-6 space-y-4 hover:border-neutral-400 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <span className="text-[10px] font-sans font-medium text-neutral-400">{pillar.code}</span>
                      <Icon className="w-4 h-4 text-neutral-700 stroke-[1.5]" />
                    </div>
                    <h3 className="text-sm font-sans font-bold text-neutral-900 leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-sans font-normal text-neutral-600 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400">
                      STATUS: PERPETUAL
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. UPCOMING DISTRICT EVENTS & CONCLAVES */}
      <section id="events" className="py-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 text-left">
            <div>
              <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block">
                COMMUNITY CALENDAR // 2026
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-neutral-900 mt-1">
                Upcoming District Events & Assemblies
              </h2>
            </div>
            <span className="text-xs font-sans font-medium text-neutral-400 uppercase">
              DISTRICT CALENDAR // V-324
            </span>
          </div>

          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.code}
                className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left hover:bg-neutral-50/60 transition-colors px-2"
              >
                <div className="flex items-start sm:items-center space-x-6">
                  <div className="font-sans text-center border border-gray-200 bg-neutral-50 px-3 py-2 min-w-[90px]">
                    <span className="text-xs font-bold text-neutral-900 block">{evt.date.split(',')[0]}</span>
                    <span className="text-[10px] text-neutral-500 font-medium">{evt.date.split(',')[1]}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-sans font-medium border border-neutral-300 px-1.5 py-0.5 uppercase text-neutral-600">
                        {evt.category}
                      </span>
                      <span className="text-[10px] font-sans font-medium text-neutral-400">{evt.code}</span>
                    </div>
                    <h3 className="text-sm font-sans font-bold text-neutral-900">
                      {evt.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs font-sans font-normal text-neutral-500">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{evt.venue}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/login')}
                  className="self-start md:self-auto px-4 py-2 border border-gray-200 hover:border-neutral-900 text-neutral-800 text-xs font-sans font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  [ EVENT DETAILS ]
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. GALLERY & MEDIA ARCHIVE */}
      <section id="gallery" className="py-16 border-t border-gray-200 bg-neutral-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 text-left">
            <div>
              <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block">
                FIELD TELEMETRY // PHOTOGRAPHIC ARCHIVE
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-neutral-900 mt-1">
                Visual Chronicles of Humanitarian Service
              </h2>
            </div>
            <span className="text-xs font-sans font-medium text-neutral-400 uppercase">
              FIELD ARCHIVE // 2025-2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <div className="border border-gray-200 bg-white overflow-hidden space-y-3 group">
              <div className="h-48 overflow-hidden bg-neutral-200 relative">
                <img
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop"
                  alt="Food Distribution Drive"
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                />
                <span className="absolute top-2 left-2 text-[10px] font-sans font-medium bg-neutral-900 text-white px-2 py-0.5 uppercase">
                  NUTRITION RELIEF
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="text-xs font-sans font-bold text-neutral-900 uppercase tracking-wide">
                  Community Grain Distribution Drive
                </h4>
                <p className="text-[11px] font-sans font-normal text-neutral-500">
                  Supporting over 400 vulnerable families during seasonal flood recovery operations.
                </p>
              </div>
            </div>

            <div className="border border-gray-200 bg-white overflow-hidden space-y-3 group">
              <div className="h-48 overflow-hidden bg-neutral-200 relative">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop"
                  alt="Medical Health Camp"
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                />
                <span className="absolute top-2 left-2 text-[10px] font-sans font-medium bg-neutral-900 text-white px-2 py-0.5 uppercase">
                  EYE & HEALTH
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="text-xs font-sans font-bold text-neutral-900 uppercase tracking-wide">
                  Comprehensive Eye & Glaucoma Camp
                </h4>
                <p className="text-[11px] font-sans font-normal text-neutral-500">
                  Screening 1,200 rural elders and executing 84 sponsored cataract surgeries.
                </p>
              </div>
            </div>

            <div className="border border-gray-200 bg-white overflow-hidden space-y-3 group">
              <div className="h-48 overflow-hidden bg-neutral-200 relative">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop"
                  alt="Educational Scholarship Ceremony"
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                />
                <span className="absolute top-2 left-2 text-[10px] font-sans font-medium bg-neutral-900 text-white px-2 py-0.5 uppercase">
                  EDUCATION AID
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="text-xs font-sans font-bold text-neutral-900 uppercase tracking-wide">
                  Higher Education Bursary Awards
                </h4>
                <p className="text-[11px] font-sans font-normal text-neutral-500">
                  Bestowing academic grants and mentoring to 120 collegiate candidates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. DISTRICT SECRETARIAT & CONTACT SECTION */}
      <section id="contact" className="py-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
            {/* Contact Details */}
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block">
                  PUBLIC INQUIRIES & CHAPTER REGISTRATION
                </span>
                <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-neutral-900 mt-1">
                  Connect With District V-324 Secretariat
                </h2>
                <p className="text-xs font-sans font-normal text-neutral-600 mt-2 leading-relaxed">
                  For membership enrollment, new chapter charters, or trust contributions, submit an inquiry
                  directly to the Secretariat Office.
                </p>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="flex items-start space-x-3 p-3.5 border border-gray-200 bg-neutral-50/50">
                  <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block font-sans">Secretariat Headquarters</span>
                    <span className="text-neutral-500 text-[11px]">
                      Vasavi Seva Bhavan, No. 42 Anna Salai, Thousand Lights, Chennai, TN 600006
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 border border-gray-200 bg-neutral-50/50">
                  <Mail className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block font-sans">Official Inquiries</span>
                    <span className="text-neutral-700 text-[11px]">secretariat@vasaviclub.org</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 border border-gray-200 bg-neutral-50/50">
                  <Phone className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block font-sans">Direct Telephone</span>
                    <span className="text-neutral-700 text-[11px]">+91 44 2851 4090 / +91 98401 23456</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Public Contact / Inquiry Form */}
            <div className="border border-gray-200 bg-neutral-50/40 p-6 sm:p-8 space-y-4">
              <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block border-b border-gray-200 pb-2">
                COMMUNICATION DISPATCH // PROTOCOL 1.0
              </span>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you. Your dispatch has been transmitted to District V-324 Secretariat.');
                  e.target.reset();
                }}
                className="space-y-4 text-xs font-sans"
              >
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1 font-medium">
                    FULL NAME // APPLICANT
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full p-2.5 border border-gray-200 focus:border-neutral-900 bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1 font-medium">
                      EMAIL COORDINATE
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="user@example.org"
                      className="w-full p-2.5 border border-gray-200 focus:border-neutral-900 bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1 font-medium">
                      PHONE CONTACT
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98400 00000"
                      className="w-full p-2.5 border border-gray-200 focus:border-neutral-900 bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1 font-medium">
                    INQUIRY / CHAPTER SPECIFICATION
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Specify inquiry details or requested chapter affiliation..."
                    className="w-full p-2.5 border border-gray-200 focus:border-neutral-900 bg-white outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-sans font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  [ TRANSMIT DISPATCH ]
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 10. MINIMALIST CLINICAL FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-12 px-4 sm:px-8 text-xs font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3 text-left">
            <img
              src="/logo.png"
              alt="Vasavi Clubs International Emblem"
              className="w-9 h-9 object-contain flex-shrink-0"
            />
            <div>
              <span className="font-sans font-bold text-neutral-900 block text-xs tracking-wider uppercase">
                Vasavi Clubs International // District V-324
              </span>
              <span className="text-[10px] text-neutral-400 block font-medium">
                Official Unified Digital Community Portal & Governance Platform
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-neutral-500 text-xs font-medium uppercase">
            <Link to="/login" className="hover:text-neutral-900 transition-colors">
              Member Login
            </Link>
            <Link to="/login?tab=register" className="hover:text-neutral-900 transition-colors">
              Induct Member
            </Link>
            <a href="#hero" className="hover:text-neutral-900 transition-colors">
              Top
            </a>
          </div>

          <div className="text-neutral-400 text-[10px] font-medium text-center md:text-right">
            <span>© {new Date().getFullYear()} VASAVI CLUBS INTERNATIONAL. ALL RIGHTS RESERVED.</span>
            <span className="block mt-0.5">SPEC: CLINICAL V2.4 // PLUS JAKARTA SANS ARCHITECTURE</span>
          </div>
        </div>
      </footer>

      {/* Clinical Donation Information Modal */}
      {donateModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 max-w-lg w-full p-6 sm:p-8 space-y-5 text-left shadow-none rounded-none">
            <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block">
                  VCI-ENDOWMENT // DIRECT DISBURSEMENT
                </span>
                <h3 className="text-base font-sans font-bold uppercase tracking-wide text-neutral-900">
                  Support Humanitarian Service Fund
                </h3>
              </div>
              <button
                onClick={() => setDonateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1 border border-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-sans text-neutral-600 leading-relaxed">
              Donations directly fund cataract surgeries, daily Annadanam feeding drives, and student scholarship trusts across District V-324. All donations are certified under Section 80G of the Income Tax Act.
            </p>

            <div className="border border-neutral-200 bg-neutral-50 p-4 font-sans text-xs space-y-2">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-400">BENEFICIARY:</span>
                <span className="font-bold text-neutral-900 text-right">VASAVI CLUBS INTL. DISTRICT V-324 TRUST</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-400">BANK / BRANCH:</span>
                <span className="text-neutral-800 text-right">STATE BANK OF INDIA // MOUNT ROAD</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-400">ACCOUNT NUMBER:</span>
                <span className="font-bold text-VASAVI-blue text-right">389201049281</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">IFSC CODE:</span>
                <span className="font-bold text-neutral-900 text-right">SBIN0001234</span>
              </div>
            </div>

            <div className="text-xs font-sans text-neutral-500 leading-relaxed border-l-2 border-VASAVI-gold pl-3">
              After transfer, please dispatch transaction receipt to <span className="font-bold text-neutral-800">secretariat@vasaviclubs.org</span> along with PAN number to receive formal Section 80G tax exemption certification.
            </div>

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setDonateModalOpen(false)}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-sans font-semibold uppercase tracking-wider rounded-none"
              >
                [ CLOSE DISPATCH ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
