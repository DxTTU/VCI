import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, UserPlus, Lock, Mail, KeyRound, Sparkles, Check, RefreshCw, Key } from 'lucide-react';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';

/**
 * AuthPage Component
 * Full-screen clinical authentication gatekeeper adhering to "The Ordinary" design guidelines:
 * - Stark white background and crisp 1px borders (border-neutral-200)
 * - Sleek toggle between "Sign In" and "Create Account"
 * - Two-Stage OTP Verification protocol for Sign In (Antigravity auth specification)
 * - Monospaced uppercase labels and micro-telemetry
 * - Seamless integration with AuthContext and Multi-Step Onboarding Wizard
 */
export default function AuthPage() {
  const { isAuthenticated, initiateLogin, verifyOTP, resendOTP, directLogin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [preAuthToken, setPreAuthToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Timer effect for Resend OTP cooldown
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // If already authenticated, redirect immediately to /dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Phase 1: Credential Verification & OTP Dispatch
  const handleInitiateSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setError('Member ID or Email identifier is mandatory.');
      return;
    }

    if (!password) {
      setError('Security credential (password) is mandatory.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await initiateLogin(identifier.trim(), password);
      if (response?.status === 'OTP_REQUIRED') {
        setPreAuthToken(response.preAuthToken);
        setMaskedEmail(response.maskedEmail || identifier);
        if (response.devOtp) setDevOtp(response.devOtp);
        setStep('otp');
        setCooldown(60); // 60s rate limit countdown
        setSuccessMsg('Authentication paused: 6-digit OTP generated and dispatched.');
      } else if (response?.token) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 2: Verify OTP & Issue Full Session JWT
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length !== 6) {
      setError('Please input the complete 6-digit numerical OTP.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOTP(otpCode, preAuthToken, identifier);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Verification failed. Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP with rate limit cooldown
  const handleResendOtp = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError('');
    try {
      const res = await resendOTP(preAuthToken);
      setCooldown(60);
      if (res?.devOtp) setDevOtp(res.devOtp);
      setSuccessMsg('A fresh verification code has been dispatched.');
    } catch (err) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleFillDemo = (id, pass) => {
    setIdentifier(id);
    setPassword(pass);
    setError('');
  };

  const handleMemberInducted = (newMember) => {
    // When onboarding wizard completes, sign in directly without OTP (per spec)
    setIsOnboardingOpen(false);
    if (newMember) {
      directLogin({
        name: `${newMember.firstName} ${newMember.lastName}`,
        email: newMember.email,
        memberId: newMember.memberId,
        role: newMember.role || 'Regular Member',
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between items-center p-4 md:p-8 select-none font-sans">
      {/* Top Clinical Masthead */}
      <header className="w-full max-w-4xl flex items-center justify-between border-b border-neutral-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border border-neutral-900 flex items-center justify-center bg-white relative">
            <span className="font-mono text-xs font-bold text-neutral-900 tracking-tighter">VC</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-VASAVI-gold rounded-full ring-2 ring-white"></span>
          </div>
          <div>
            <h1 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              Vasavi Club International
            </h1>
            <p className="font-mono text-[9px] text-neutral-400 tracking-clinical uppercase">
              District V-324 // Central Authentication Gate
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 font-mono text-[10px] text-neutral-400">
          <span>SPEC: GATEWAY-AUTH</span>
          <span className="text-neutral-300">|</span>
          <span className="text-VASAVI-blue font-semibold">SECURE SSL // 27017</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md my-8">
        <div className="bg-white border border-neutral-300 p-6 md:p-8 space-y-6 relative">
          {/* Subtle Top Blue Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-VASAVI-blue"></div>

          {/* Header Description */}
          <div className="border-b border-neutral-200 pb-4">
            <span className="font-mono text-[9px] uppercase tracking-clinical text-neutral-400 block">
              PORTAL ACCESS // PROTOCOL 2.4
            </span>
            <h2 className="text-lg font-light tracking-tight text-neutral-900 mt-1">
              Chapter Governance <span className="font-semibold text-neutral-900">Sign In</span>
            </h2>
          </div>

          {/* Sleek Minimalist Tab Switcher */}
          <div className="grid grid-cols-2 border border-neutral-200 p-0.5 bg-neutral-50 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setError('');
              }}
              className={`py-2 text-center transition-all ${
                activeTab === 'signin'
                  ? 'bg-neutral-900 text-white font-medium'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              [ SIGN IN ]
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setError('');
              }}
              className={`py-2 text-center transition-all ${
                activeTab === 'signup'
                  ? 'bg-neutral-900 text-white font-medium'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              [ CREATE ACCOUNT ]
            </button>
          </div>

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && step === 'credentials' && (
            <form onSubmit={handleInitiateSignIn} className="space-y-4">
              {error && (
                <div className="p-3 border border-red-200 bg-red-50 text-red-700 font-mono text-[11px] leading-relaxed">
                  [ERR // AUTH_FAULT] {error}
                </div>
              )}

              <div>
                <label className="clinical-label">
                  Member ID / Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. V-100201 or president@vasaviclub.org"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="clinical-input pr-8"
                    autoFocus
                  />
                  <Mail className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <span className="font-mono text-[9px] text-neutral-400 block mt-1">
                  Format: V-XXXXXX or registered chapter electronic mail
                </span>
              </div>

              <div>
                <label className="clinical-label">
                  Security Credential (Password) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="clinical-input pr-8 font-mono"
                  />
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-3 bg-neutral-900 hover:bg-VASAVI-blue text-white text-xs font-medium tracking-wide uppercase transition-colors duration-200 disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Request OTP'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-VASAVI-gold" />
              </button>

              {/* Quick-Fill Demo Shortcuts for Testing */}
              <div className="pt-4 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>QUICK-FILL TEST PROFILES:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('president@vasaviclub.org', 'password123')}
                    className="p-2 border border-neutral-200 text-left font-mono text-[10px] text-neutral-600 hover:border-VASAVI-blue hover:text-neutral-900 transition-colors"
                  >
                    <span className="block font-semibold text-neutral-800">[P] President</span>
                    <span className="text-[9px] text-neutral-400">V-100201</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('secretary@vasaviclub.org', 'password123')}
                    className="p-2 border border-neutral-200 text-left font-mono text-[10px] text-neutral-600 hover:border-VASAVI-blue hover:text-neutral-900 transition-colors"
                  >
                    <span className="block font-semibold text-neutral-800">[S] Secretary</span>
                    <span className="text-[9px] text-neutral-400">V-100202</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 1 (STAGE 2): OTP VERIFICATION CHALLENGE */}
          {activeTab === 'signin' && step === 'otp' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="p-3 bg-neutral-50 border border-neutral-200 text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between text-neutral-500">
                  <span>STAGE: 2-STEP VERIFICATION</span>
                  <span className="text-VASAVI-blue font-semibold">PAUSED FOR OTP</span>
                </div>
                <p className="text-neutral-700 text-xs font-sans">
                  A 6-digit security challenge has been generated for{' '}
                  <strong className="font-mono text-neutral-900">{maskedEmail}</strong>.
                </p>
              </div>

              {error && (
                <div className="p-3 border border-red-200 bg-red-50 text-red-700 font-mono text-[11px] leading-relaxed">
                  [ERR // OTP_INVALID] {error}
                </div>
              )}

              {successMsg && !error && (
                <div className="p-2 border border-emerald-200 bg-emerald-50 text-emerald-800 font-mono text-[10px]">
                  [SYS // DISPATCH_OK] {successMsg}
                </div>
              )}

              <div>
                <label className="clinical-label text-center block">
                  Enter 6-Digit Verification OTP <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="••••••"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-2xl font-mono tracking-[0.4em] py-3 px-4 border border-neutral-300 focus:border-VASAVI-blue focus:ring-1 focus:ring-VASAVI-blue outline-none transition-all"
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 text-neutral-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
                <span className="font-mono text-[9px] text-neutral-400 block text-center mt-1">
                  Single-use cryptographic challenge • Valid for 5 minutes
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-3 bg-VASAVI-blue hover:bg-VASAVI-blueDark text-white text-xs font-medium tracking-wide uppercase transition-colors duration-200 disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying OTP...' : 'Verify Code & Launch Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-VASAVI-gold" />
              </button>

              {/* Resend and Cancel Actions */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between font-mono text-[11px]">
                <button
                  type="button"
                  disabled={cooldown > 0 || isResending}
                  onClick={handleResendOtp}
                  className="text-neutral-700 underline hover:text-VASAVI-blue disabled:opacity-40 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                >
                  {isResending
                    ? 'Dispatching...'
                    : cooldown > 0
                    ? `Resend Code in ${cooldown}s`
                    : 'Resend Verification Code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-neutral-400 hover:text-neutral-800 transition-colors"
                >
                  ← Back to Credentials
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CREATE ACCOUNT (SIGN UP) */}
          {activeTab === 'signup' && (
            <div className="space-y-4">
              <div className="border border-neutral-200 bg-neutral-50/60 p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-VASAVI-gold" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                    Candidate Onboarding Wizard
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  New member registration operates through our clinical multi-step onboarding protocol. You will provide your data sequentially across 4 verified stages:
                </p>

                <div className="space-y-1.5 font-mono text-[10px] text-neutral-600 pt-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-VASAVI-blue"></span>
                    <span>PHASE 01: Personal & Biometric Dossier</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-VASAVI-blue"></span>
                    <span>PHASE 02: Contact & Geospatial Coordinates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-VASAVI-blue"></span>
                    <span>PHASE 03: Chapter Placement & Role Assignment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-VASAVI-gold"></span>
                    <span>PHASE 04: Analytical Review & Code of Ethics</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-VASAVI-blue hover:bg-VASAVI-blueDark text-white text-xs font-medium tracking-wide uppercase transition-colors duration-200"
              >
                <UserPlus className="w-3.5 h-3.5 text-VASAVI-gold" />
                <span>Begin Multi-Step Induction Wizard</span>
              </button>

              <p className="text-center font-mono text-[9px] text-neutral-400">
                NO IMMEDIATE OTP REQUIRED FOR INITIAL CANDIDATE REGISTRATION
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Clinical Footer */}
      <footer className="w-full max-w-4xl border-t border-neutral-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-neutral-400 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>COMPASS LOCAL // 27017 ONLINE</span>
        </div>
        <div>
          <span>MOTTO: FELLOWSHIP AND SERVICE</span>
        </div>
      </footer>

      {/* Multi-Step Onboarding Modal for Sign Up */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onMemberCreated={handleMemberInducted}
      />
    </div>
  );
}
