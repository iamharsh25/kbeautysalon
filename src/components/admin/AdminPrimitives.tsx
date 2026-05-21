import type { ReactNode } from 'react';

export function AdminPanel({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <article className="admin-panel">
      <h3>{icon}{title}</h3>
      {children}
    </article>
  );
}

export function AdminField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="admin-field">
      {label}
      {children}
    </label>
  );
}
