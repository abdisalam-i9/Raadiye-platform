import { Link } from 'react-router-dom';
import { HiArrowUp } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/LanguageContext';
import Brand from './Brand';
import Container from './ui/Container';

export default function Footer() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  const links = [
    { to: '/', label: t.nav.home },
    { to: '/items', label: t.nav.items },
    { to: '/services', label: t.nav.how },
    { to: '/about', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
    ...(isAuthenticated
      ? [{ to: '/my-items', label: t.nav.myItems }]
      : [
          { to: '/login', label: t.nav.login },
          { to: '/register', label: t.nav.register },
        ]),
  ];

  return (
    <footer className="site-footer mt-auto text-white/70">
      <Container className="py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <Brand light compact />
            <p className="mt-2 text-sm leading-6 text-white/60">{t.footer.tagline}</p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label={t.footer.site}>
            {links.map(({ to, label }) => (
              <Link key={`${to}-${label}`} to={to} className="text-white/70 transition hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} {t.brand}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="grid size-8 place-items-center rounded-full border border-white/12 bg-white/8 text-white transition hover:bg-forest/20"
            aria-label={t.a11y.backToTop}
          >
            <HiArrowUp className="size-4" />
          </button>
        </div>
      </Container>
    </footer>
  );
}
