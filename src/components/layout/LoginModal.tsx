import type { FormEvent } from 'react';
import { LayoutDashboard } from 'lucide-react';

export function LoginModal({
  error,
  onClose,
  onLogin,
}: {
  error: string;
  onClose: () => void;
  onLogin: (email: string, password: string) => void | Promise<void>;
}) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onLogin(String(formData.get('email')), String(formData.get('password')));
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="login-modal" onSubmit={handleSubmit} aria-label="Login form">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close login modal">
          ×
        </button>
        <LayoutDashboard size={34} />
        <p>Login</p>
        <h2>Welcome back</h2>
        <label>
          Email
          <input name="email" defaultValue="admin@kbeautysalon.com" type="email" />
        </label>
        <label>
          Password
          <input name="password" defaultValue="preview123" type="password" />
        </label>
        {error ? <span className="login-error">{error}</span> : null}
        <button className="primary-button full-width" type="submit">
          Login
        </button>
        <span>Admin demo: admin@kbeautysalon.com / preview123. Client demo: use any other email.</span>
      </form>
    </div>
  );
}
