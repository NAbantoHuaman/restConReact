import { Link, useLocation } from 'react-router-dom';

const LABELS: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  menu: 'Menú',
  reservations: 'Reservas',
  settings: 'Configuración',
  logs: 'Logs',
  login: 'Acceso',
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = parts.map((p, i) => {
    const to = '/' + parts.slice(0, i + 1).join('/');
    const label = LABELS[p] || p;
    return { to, label };
  });
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-neutral-500 dark:text-neutral-400">
      <ol className="flex items-center gap-2">
        {crumbs.map((c, idx) => (
          <li key={c.to} className="inline-flex items-center gap-2">
            {idx < crumbs.length - 1 ? (
              <Link to={c.to} className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">{c.label}</Link>
            ) : (
              <span aria-current="page" className="text-neutral-900 dark:text-neutral-200">{c.label}</span>
            )}
            {idx < crumbs.length - 1 && <span className="text-neutral-400">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}