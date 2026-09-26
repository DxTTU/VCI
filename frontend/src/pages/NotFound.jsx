import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react';
import usePageSEO from '../utils/usePageSEO';

/**
 * NotFound Component (404 Page)
 * Minimalist, clinical 404 screen adhering to "The Ordinary" design guidelines:
 * - High-contrast monochromatic layout with thin 1px borders
 * - Plus Jakarta Sans geometric typography
 * - Direct navigation pathways back to Landing Page or Chapter Portal
 */
export default function NotFound() {
  usePageSEO({
    title: '404 // Dossier Not Found | Vasavi Clubs International',
    description: 'The requested chapter route or dossier does not exist in the Vasavi Clubs International District V-324 registry.',
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 flex flex-col justify-between items-center p-4 md:p-8 font-sans select-none">
      {/* Top Clinical Masthead */}
      <header className="w-full max-w-4xl flex items-center justify-between border-b border-neutral-200 pb-4">
        <Link to="/" className="flex items-center space-x-3 group">
          <img
            src="/logo.png"
            alt="Vasavi Clubs International Emblem"
            className="w-9 h-9 object-contain flex-shrink-0 transition-transform group-hover:scale-105"
          />
          <div className="text-left">
            <h1 className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-900">
              Vasavi Clubs International
            </h1>
            <p className="text-[10px] font-sans font-medium text-neutral-400 tracking-wider uppercase">
              District V-324 // Registry Gateway
            </p>
          </div>
        </Link>

        <div className="hidden sm:flex items-center space-x-2 text-[10px] font-sans font-medium text-neutral-400">
          <span>SPEC: HTTP-404</span>
          <span className="text-neutral-300">|</span>
          <span className="text-red-600 font-semibold uppercase tracking-wider">ERROR // NOT_FOUND</span>
        </div>
      </header>

      {/* Main 404 Card */}
      <main className="w-full max-w-lg my-12">
        <div className="bg-white border border-neutral-300 p-8 sm:p-10 space-y-6 text-left relative shadow-none">
          {/* Subtle Top Red Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-600"></div>

          <div className="border-b border-neutral-200 pb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-600 text-xs font-sans font-semibold tracking-wider uppercase">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>SEC.NAV.404 // INVALID ROUTE</span>
            </div>
            <span className="text-[10px] font-sans font-medium text-neutral-400 border border-neutral-200 px-2 py-0.5 uppercase bg-neutral-50">
              STATUS: UNRESOLVED
            </span>
          </div>

          <div>
            <span className="text-4xl sm:text-5xl font-sans font-extrabold text-neutral-900 tracking-tight block">
              404
            </span>
            <h2 className="text-base sm:text-lg font-sans font-bold uppercase tracking-wider text-neutral-900 mt-2">
              Dossier or Route Not Found
            </h2>
            <p className="text-xs font-sans font-normal text-neutral-600 mt-3 leading-relaxed">
              The requested resource URL does not correspond to an authenticated chapter dossier, registry module, or public page within the Vasavi Clubs International District V-324 portal.
            </p>
          </div>

          <div className="border border-neutral-100 bg-neutral-50/70 p-3.5 space-y-1.5 font-sans text-xs">
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">
              DIAGNOSTIC TELEMETRY:
            </span>
            <div className="text-neutral-600 font-mono text-[11px] break-all">
              ROUTE_PATH: {typeof window !== 'undefined' ? window.location.pathname : 'UNKNOWN'}
            </div>
            <div className="text-neutral-500 text-[10px]">
              ACTION: Please verify your URL or navigate using the designated registry pathways below.
            </div>
          </div>

          {/* Action Pathways */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/"
              className="w-full sm:flex-1 py-3 px-4 bg-neutral-900 hover:bg-VASAVI-blue text-white text-xs font-sans font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-2"
            >
              <Home className="w-3.5 h-3.5" />
              <span>[ RETURN TO HOME ]</span>
            </Link>
            <Link
              to="/login"
              className="w-full sm:flex-1 py-3 px-4 border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-sans font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-2 bg-white"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>[ CHAPTER LOGIN ]</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Clinical Footer */}
      <footer className="w-full max-w-4xl border-t border-neutral-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs font-sans font-medium text-neutral-400 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>COMPASS LOCAL // 27017 ONLINE</span>
        </div>
        <div>
          <span>© {new Date().getFullYear()} VASAVI CLUBS INTERNATIONAL. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  );
}
