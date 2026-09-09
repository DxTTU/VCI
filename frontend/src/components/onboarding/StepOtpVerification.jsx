import React, { useState, useRef, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { getApiUrl } from '../../config/api';

/**
 * StepOtpVerification Component
 * Adheres strictly to "The Ordinary" clinical aesthetic:
 * - 6 individual square input boxes centered horizontally
 * - Ultra-thin borders (border-gray-300) and white background
 * - Clinical monospace typography (font-mono text-xl sm:text-2xl)
 * - VASAVI Blue (#00338D) border highlighting for the active box
 * - Auto-advancing cursor as each digit is typed
 * - Auto-triggering /verify-otp upon entering the 6th digit
 * - Minimalist error in muted red ("INVALID CRYPTOGRAPHIC CODE. PLEASE TRY AGAIN.")
 * - Functional Resend OTP button when 5-minute TTL countdown expires
 */
export default function StepOtpVerification({ email, onVerified }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(300); // 5-minute TTL (300 seconds)

  const inputRefs = useRef([]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // API Integration: Automatically send POST request to /send-otp upon reaching Phase 03
  useEffect(() => {
    let isMounted = true;

    const dispatchInitialOtp = async () => {
      setIsSending(true);
      setError('');
      try {
        const response = await fetch(getApiUrl('/api/send-otp'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ email: email.toLowerCase().trim() }),
        });
        const text = await response.text();
        let data = {};
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = { message: text.startsWith('<') ? `Server error (${response.status})` : text };
          }
        }
        if (!response.ok) {
          throw new Error(data.message || `Server error: ${response.status}`);
        }
        if (isMounted) {
          setCooldown(300); // 5-minute TTL
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'FAILED TO DISPATCH VERIFICATION CODE. PLEASE TRY AGAIN.');
        }
      } finally {
        if (isMounted) {
          setIsSending(false);
        }
      }
    };

    dispatchInitialOtp();

    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    return () => {
      isMounted = false;
    };
  }, [email]);

  // 5-minute countdown timer effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Trigger /verify-otp once the 6th digit is entered
  const triggerVerification = async (otpCode) => {
    if (isVerifying || success) return;
    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otpCode.trim(),
        }),
      });

      const text = await response.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text.startsWith('<') ? `Server error (${response.status})` : text };
        }
      }

      if (response.ok && data.success) {
        setSuccess(true);
        // Smooth pause before advancing
        setTimeout(() => {
          if (onVerified) onVerified();
        }, 400);
      } else {
        // Minimalist error message in muted red
        setError(data.message || 'INVALID CRYPTOGRAPHIC CODE. PLEASE TRY AGAIN.');
        // Clear digits on failure so user can re-type immediately
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setActiveIndex(0);
      }
    } catch (err) {
      setError(err.message || 'INVALID CRYPTOGRAPHIC CODE. PLEASE TRY AGAIN.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (index, e) => {
    const rawVal = e.target.value;
    const cleaned = rawVal.replace(/\D/g, '');

    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    const char = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError('');

    // Auto-advance focus to the next input box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }

    // Automatically trigger /verify-otp once the 6th digit is entered
    const fullOtp = newDigits.join('');
    if (fullOtp.length === 6 && !newDigits.includes('')) {
      triggerVerification(fullOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
        e.preventDefault();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    setError('');

    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
      setActiveIndex(5);
      triggerVerification(pasted);
    } else {
      const nextIdx = Math.min(pasted.length, 5);
      inputRefs.current[nextIdx]?.focus();
      setActiveIndex(nextIdx);
    }
  };

  // Functional Resend OTP triggered when countdown expires
  const handleResendOtp = async () => {
    if (cooldown > 0 || isSending) return;
    setIsSending(true);
    setError('');
    try {
      const response = await fetch(getApiUrl('/api/send-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const text = await response.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text.startsWith('<') ? `Server error (${response.status})` : text };
        }
      }
      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }
      setCooldown(300); // Reset 5-minute TTL
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setActiveIndex(0);
    } catch (err) {
      setError(err.message || 'FAILED TO RE-DISPATCH VERIFICATION CODE.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 py-2 select-none">
      {/* Header telemetry */}
      <div className="border-b border-neutral-200 pb-3">
        <span className="font-mono text-[9px] uppercase tracking-clinical text-neutral-400 block">
          PHASE 03 // EMAIL ONE-TIME PASSWORD VERIFICATION
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mt-0.5">
          Email Security Challenge
        </h3>
        <p className="text-xs text-neutral-500 mt-1">
          A single-use 6-digit cryptographic verification code was dispatched to{' '}
          <strong className="font-mono text-neutral-900 font-semibold">{email}</strong>.
          Please check your inbox.
        </p>
      </div>

      {/* 6 Individual Square Input Boxes Centered */}
      <div className="py-4">
        <div className="flex items-center justify-center space-x-2.5 sm:space-x-3.5">
          {digits.map((digit, idx) => {
            const isActive = activeIndex === idx;
            return (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onFocus={() => setActiveIndex(idx)}
                onChange={(e) => handleChange(idx, e)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={isVerifying || success || isSending}
                className={`w-11 h-12 sm:w-13 sm:h-14 text-center font-mono text-xl sm:text-2xl font-medium bg-white border transition-all duration-150 outline-none ${
                  isActive
                    ? 'border-VASAVI-blue ring-1 ring-VASAVI-blue text-neutral-900'
                    : 'border-gray-300 text-neutral-900 hover:border-neutral-400'
                } ${
                  success
                    ? 'border-emerald-600 bg-emerald-50/30 text-emerald-900'
                    : ''
                }`}
                aria-label={`Digit ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Minimalist Error Message in Muted Red */}
        {error && (
          <p className="text-center font-mono text-[11px] text-red-600 mt-3.5 tracking-wider uppercase">
            {error}
          </p>
        )}

        {/* Success Confirmation */}
        {success && (
          <div className="flex items-center justify-center space-x-1.5 font-mono text-[11px] text-emerald-600 mt-3.5 uppercase tracking-wider">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>CRYPTOGRAPHIC CODE VERIFIED • ADVANCING DOSSIER</span>
          </div>
        )}

        {isVerifying && !success && (
          <p className="text-center font-mono text-[11px] text-VASAVI-blue mt-3.5 uppercase tracking-wider">
            VALIDATING CRYPTOGRAPHIC INPUT...
          </p>
        )}

        {isSending && !error && (
          <p className="text-center font-mono text-[11px] text-neutral-500 mt-3.5 uppercase tracking-wider flex items-center justify-center space-x-1.5">
            <Loader2 className="w-3 h-3 animate-spin text-neutral-400" />
            <span>DISPATCHING VERIFICATION CODE TO EMAIL...</span>
          </p>
        )}
      </div>

      {/* Resend Action & 5-minute TTL countdown */}
      <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-400 gap-2">
        <span className="text-[10px] tracking-wider uppercase">
          TTL DURATION: 5 MINUTES
        </span>
        <button
          type="button"
          disabled={cooldown > 0 || isSending || success}
          onClick={handleResendOtp}
          className={`uppercase tracking-wider transition-colors ${
            cooldown > 0 || isSending || success
              ? 'text-neutral-400 cursor-not-allowed'
              : 'text-neutral-900 underline hover:text-VASAVI-blue cursor-pointer font-medium'
          }`}
        >
          {isSending
            ? 'DISPATCHING...'
            : cooldown > 0
            ? `RESEND OTP (${formatTime(cooldown)})`
            : 'RESEND OTP'}
        </button>
      </div>
    </div>
  );
}
