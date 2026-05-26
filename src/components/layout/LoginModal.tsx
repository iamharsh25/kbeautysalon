import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowRight, CheckCircle2, KeyRound, LayoutDashboard, LockKeyhole, ScanLine, Smartphone } from 'lucide-react';
import type { MfaFlow } from '../../services/authService';

export function LoginModal({
  error,
  mfaFlow,
  onClose,
  onLogin,
  onMfaVerify,
}: {
  error: string;
  mfaFlow?: MfaFlow | null;
  onClose: () => void;
  onLogin: (email: string, password: string) => void | Promise<void>;
  onMfaVerify: (code: string) => void | Promise<void>;
}) {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [secondsRemaining, setSecondsRemaining] = useState(30 - (Math.floor(Date.now() / 1000) % 30));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!mfaFlow) return undefined;

    setOtpDigits(['', '', '', '', '', '']);
    window.setTimeout(() => otpRefs.current[0]?.focus(), 80);

    const timerId = window.setInterval(() => {
      setSecondsRemaining(30 - (Math.floor(Date.now() / 1000) % 30));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [mfaFlow]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onLogin(String(formData.get('username')), String(formData.get('password')));
  }

  async function handleMfaSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onMfaVerify(otpDigits.join(''));
  }

  function updateOtpDigit(index: number, value: string) {
    const nextValue = value.replace(/\D/g, '').slice(-1);
    setOtpDigits((currentDigits) => currentDigits.map((digit, digitIndex) => digitIndex === index ? nextValue : digit));
    if (nextValue && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      setOtpDigits((currentDigits) => currentDigits.map((digit, digitIndex) => digitIndex === index - 1 ? '' : digit));
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (!pastedDigits.length) return;

    const nextDigits = ['', '', '', '', '', ''].map((_, index) => pastedDigits[index] ?? '');
    setOtpDigits(nextDigits);
    otpRefs.current[Math.min(pastedDigits.length, 6) - 1]?.focus();
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form
        className={mfaFlow ? 'login-modal mfa-modal mfa-code-modal' : 'login-modal'}
        name="login"
        onSubmit={mfaFlow ? handleMfaSubmit : handleSubmit}
        aria-label="Login form"
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close login modal">
          ×
        </button>
        {!mfaFlow ? (
          <>
            <LayoutDashboard size={34} />
            <p>Login</p>
            <h2>Welcome back</h2>
            <label htmlFor="login-email">
              Email
              <input autoComplete="username" autoFocus id="login-email" name="username" type="email" />
            </label>
            <label htmlFor="login-password">
              Password
              <input autoComplete="current-password" id="login-password" name="password" type="password" />
            </label>
            {error ? <span className="login-error">{error}</span> : null}
            <button className="primary-button full-width" type="submit">
              Login
            </button>
          </>
        ) : (
          <>
            <span className="mfa-shield-icon"><LockKeyhole size={44} /><CheckCircle2 size={22} /></span>
            <p>Two-Factor Security</p>
            <h2>{mfaFlow.mode === 'setup' ? 'Set up 2FA' : 'Enter your code'}</h2>
            <span className="mfa-code-intro">For your security, please enter the 6-digit code from your authenticator app.</span>
            {mfaFlow.mode === 'setup' ? (
              <>
                <div className="mfa-setup-animation" aria-hidden="true">
                  <span><Smartphone size={24} /></span>
                  <i />
                  <span><ScanLine size={24} /></span>
                  <i />
                  <span><KeyRound size={24} /></span>
                </div>
                <div className="mfa-setup-card">
                  <strong>How to set it up</strong>
                  <ol>
                    <li>Open Google Authenticator, Microsoft Authenticator, or 1Password.</li>
                    <li>Scan the QR code, or add the setup key manually.</li>
                    <li>Enter the 6-digit code shown in the app.</li>
                  </ol>
                </div>
                {mfaFlow.qrCode ? <img className="mfa-qr" src={mfaFlow.qrCode} alt="Two-factor QR code" /> : null}
                {mfaFlow.secret ? (
                  <div className="mfa-secret">
                    <span>Setup key</span>
                    <code>{mfaFlow.secret}</code>
                  </div>
                ) : null}
                {!mfaFlow.qrCode && !mfaFlow.secret ? (
                  <div className="mfa-secret">
                    <span>Local preview code</span>
                    <code>123456</code>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mfa-setup-card compact mfa-instruction-card">
                <Smartphone size={22} />
                <span><strong>Open your authenticator app</strong> and enter the latest 6-digit code.</span>
              </div>
            )}
            <div className="mfa-code-entry">
              <span>Authenticator Code</span>
              <div className="mfa-code-grid" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    aria-label={`Authenticator digit ${index + 1}`}
                    autoComplete="off"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    data-lpignore="true"
                    inputMode="numeric"
                    maxLength={1}
                    name={`otp-${index + 1}`}
                    pattern="[0-9]*"
                    type="text"
                    value={digit}
                    onChange={(event) => updateOtpDigit(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  />
                ))}
              </div>
            </div>
            <div className="mfa-code-refresh">
              <span aria-hidden="true" />
              Code refreshes in <strong>{secondsRemaining} seconds</strong>
            </div>
            {error ? <span className="login-error">{error}</span> : null}
            <button className="primary-button full-width mfa-verify-button" disabled={otpDigits.join('').length !== 6} type="submit">
              {mfaFlow.mode === 'setup' ? 'Finish Setup' : 'Verify Code'}
              <ArrowRight size={22} />
            </button>
          </>
        )}
      </form>
    </div>
  );
}
