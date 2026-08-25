import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  HiBell,
  HiChat,
  HiChevronDown,
  HiClipboardList,
  HiCollection,
  HiExclamationCircle,
  HiHome,
  HiInformationCircle,
  HiLogout,
  HiMail,
  HiMenu,
  HiPlus,
  HiPlusCircle,
  HiQuestionMarkCircle,
  HiSearch,
  HiShieldCheck,
  HiX,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/LanguageContext';
import Brand from './Brand';
import Button from './ui/Button';
import ThemeToggle from './ui/ThemeToggle';
import LanguageToggle from './ui/LanguageToggle';
import Container from './ui/Container';
import NotificationBell from './NotificationBell';
import { cn } from '../utils/cn';

function navClass({ isActive }) {
  return cn('nav-link', isActive && 'nav-link-active');
}

function getInitials(name) {
  if (!name) return 'B';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

const NAV_ICONS = {
  '/': HiHome,
  '/items': HiCollection,
  '/lost-items': HiExclamationCircle,
  '/services': HiQuestionMarkCircle,
  '/about': HiInformationCircle,
  '/contact': HiMail,
};

export default function Header() {
  const { t } = useI18n();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, isAdmin, logout } = useAuth();

  const navItems = [
    { name: t.nav.home, path: '/' },
    { name: t.nav.items, path: '/items' },
    { name: t.nav.lostItems, path: '/lost-items' },
    { name: t.nav.how, path: '/services' },
    { name: t.nav.about, path: '/about' },
  ];
  const mobileNavItems = [...navItems, { name: t.nav.contact, path: '/contact' }];
  const navigate = useNavigate();
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const userMenuRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    setUserOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setUserOpen(false);
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    if (menuOpen) {
      closeButtonRef.current?.focus();
    }
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKey = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!userOpen) return undefined;

    const onClick = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        setUserOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setUserOpen(false);
    };

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [userOpen]);

  const tools = (
    <div className="header-tools">
      <LanguageToggle />
      <span className="mx-0.5 h-4 w-px bg-line/80" aria-hidden="true" />
      <ThemeToggle />
    </div>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300',
        scrolled
          ? 'border-b border-line/60 bg-paper/88 shadow-[0_12px_32px_rgb(16_35_27_/_0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-paper/92 dark:shadow-[0_12px_32px_rgb(0_0_0_/_0.38)]'
          : 'border-b border-white/40 bg-paper/62 backdrop-blur-xl dark:border-white/8 dark:bg-paper/72'
      )}
    >
      <Container>
        <div
          className={cn(
            'flex items-center justify-between gap-3 transition-[height] duration-300',
            scrolled ? 'h-[3.85rem]' : 'h-[4.5rem]'
          )}
        >
          <Brand onClick={closeMenu} />

          <nav className="nav-track" aria-label={t.a11y.mainNav}>
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'} className={navClass}>
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="hidden min-w-0 items-center gap-2.5 lg:flex">
            {tools}
            {isAuthenticated && <NotificationBell />}

            <Button as={Link} to="/post-item" size="sm" className="shadow-[0_8px_18px_rgb(15_122_98_/_0.22)]">
              <HiPlus className="size-4" />
              {t.nav.post}
            </Button>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  className={cn(
                    'inline-flex max-w-[13.5rem] items-center gap-2 rounded-full border border-line/70 bg-paper/80 py-1 pl-1 pr-2.5 text-sm font-semibold text-ink shadow-sm transition',
                    'hover:border-forest/30 hover:bg-forest-light/50 dark:border-white/10 dark:hover:bg-forest-light',
                    userOpen && 'border-forest/35 bg-forest-light/60'
                  )}
                  aria-expanded={userOpen}
                  aria-haspopup="menu"
                  aria-label={t.a11y.openAccount}
                  onClick={() => setUserOpen((open) => !open)}
                >
                  <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-forest to-forest-dark text-[11px] font-bold text-white shadow-sm">
                    {getInitials(user?.name || user?.email)}
                  </span>
                  <span className="hidden truncate xl:inline">{user?.name || user?.email}</span>
                  <HiChevronDown className={cn('size-4 shrink-0 text-muted transition', userOpen && 'rotate-180')} />
                </button>

                {userOpen && (
                  <div role="menu" className="surface absolute right-0 mt-2 w-60 origin-top-right p-1.5 animate-fade-up">
                    <div className="mb-1 rounded-2xl bg-cream/80 px-3 py-2.5 dark:bg-forest-light/50">
                      <p className="truncate text-sm font-semibold text-ink">{user?.name || user?.email}</p>
                      {user?.email && user?.name && (
                        <p className="truncate text-xs text-muted">{user.email}</p>
                      )}
                    </div>
                    <Link
                      to="/notifications"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-forest-light/70 dark:hover:bg-forest-light"
                      onClick={() => setUserOpen(false)}
                    >
                      <HiBell className="size-4 text-forest" />
                      {t.nav.notifications}
                    </Link>
                    <Link
                      to="/chats"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-forest-light/70 dark:hover:bg-forest-light"
                      onClick={() => setUserOpen(false)}
                    >
                      <HiChat className="size-4 text-forest" />
                      {t.nav.chats}
                    </Link>
                    <Link
                      to="/my-items"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-forest-light/70 dark:hover:bg-forest-light"
                      onClick={() => setUserOpen(false)}
                    >
                      <HiClipboardList className="size-4 text-forest" />
                      {t.nav.myItems}
                    </Link>
                    <Link
                      to="/post-item"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-forest-light/70 dark:hover:bg-forest-light"
                      onClick={() => setUserOpen(false)}
                    >
                      <HiPlusCircle className="size-4 text-forest" />
                      {t.nav.postFound}
                    </Link>
                    <Link
                      to="/post-lost"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-forest-light/70 dark:hover:bg-forest-light"
                      onClick={() => setUserOpen(false)}
                    >
                      <HiExclamationCircle className="size-4 text-clay" />
                      {t.nav.postLost}
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/categories"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-forest-light/70 dark:hover:bg-forest-light"
                        onClick={() => setUserOpen(false)}
                      >
                        <HiShieldCheck className="size-4 text-forest" />
                        {t.nav.admin}
                      </Link>
                    )}
                    <div className="my-1 border-t border-line/70" />
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger transition hover:bg-danger-light"
                      onClick={handleLogout}
                    >
                      <HiLogout className="size-4" />
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button as={Link} to="/login" variant="ghost" size="sm">
                  {t.nav.login}
                </Button>
                <Button as={Link} to="/register" variant="outline" size="sm">
                  {t.nav.register}
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 lg:hidden">
            {tools}
            {isAuthenticated && <NotificationBell />}
            <Link
              to="/items"
              className="grid size-9 place-items-center rounded-full text-ink-soft transition hover:bg-forest-light hover:text-forest"
              aria-label={t.a11y.search}
            >
              <HiSearch className="size-5" />
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              className="grid size-10 place-items-center rounded-full border border-line/80 bg-paper/80 text-ink shadow-sm transition hover:border-forest/30 hover:bg-forest-light dark:border-white/10"
              aria-label={t.a11y.openMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <HiMenu className="size-5" />
            </button>
          </div>
        </div>
      </Container>

      <div
        className="pointer-events-none h-px bg-gradient-to-r from-transparent via-forest/35 to-transparent dark:via-forest/45"
        aria-hidden="true"
      />

      {menuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <aside
            id="mobile-menu"
            className="animate-drawer-right fixed inset-y-0 right-0 z-50 flex h-screen w-[min(20.5rem,88%)] flex-col bg-paper shadow-lift"
          >
            <div className="flex h-[4.35rem] items-center justify-between border-b border-line/70 px-4">
              <Brand compact onClick={closeMenu} />
              <button
                ref={closeButtonRef}
                type="button"
                className="grid size-10 place-items-center rounded-full text-ink hover:bg-forest-light"
                aria-label={t.a11y.closeMenu}
                onClick={() => {
                  closeMenu();
                  menuButtonRef.current?.focus();
                }}
              >
                <HiX className="size-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto p-4" aria-label={t.a11y.mobileNav}>
              <div className="grid gap-1">
                {mobileNavItems.map((item) => {
                  const Icon = NAV_ICONS[item.path] || HiCollection;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition',
                          isActive
                            ? 'bg-forest-light text-forest shadow-sm'
                            : 'text-ink hover:bg-cream dark:hover:bg-forest-light/60'
                        )
                      }
                    >
                      <Icon className="size-5 shrink-0 opacity-80" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>

              <div className="my-4 h-px bg-line/80" />

              <div className="grid gap-2">
                <Button as={Link} to="/post-item" className="w-full" onClick={closeMenu}>
                  <HiPlus className="size-4" />
                  {t.nav.postFound}
                </Button>
                <Button as={Link} to="/post-lost" variant="outline" className="w-full" onClick={closeMenu}>
                  <HiPlus className="size-4" />
                  {t.nav.postLost}
                </Button>
              </div>

              {isAuthenticated ? (
                <div className="mt-5 rounded-2xl border border-line/70 bg-cream/60 p-3 dark:bg-forest-light/40">
                  <p className="truncate px-1 text-sm font-semibold text-ink">{user?.name || user?.email}</p>
                  <Link
                    to="/notifications"
                    onClick={closeMenu}
                    className="mt-2 flex items-center gap-2 rounded-xl px-2 py-2.5 text-sm font-semibold text-ink hover:bg-paper"
                  >
                    <HiBell className="size-4 text-forest" />
                    {t.nav.notifications}
                  </Link>
                  <Link
                    to="/chats"
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-xl px-2 py-2.5 text-sm font-semibold text-ink hover:bg-paper"
                  >
                    <HiChat className="size-4 text-forest" />
                    {t.nav.chats}
                  </Link>
                  <Link
                    to="/my-items"
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-xl px-2 py-2.5 text-sm font-semibold text-ink hover:bg-paper"
                  >
                    <HiClipboardList className="size-4 text-forest" />
                    {t.nav.myItems}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/categories"
                      onClick={closeMenu}
                      className="flex items-center gap-2 rounded-xl px-2 py-2.5 text-sm font-semibold text-ink hover:bg-paper"
                    >
                      <HiShieldCheck className="size-4 text-forest" />
                      {t.nav.admin}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left text-sm font-semibold text-danger hover:bg-danger-light"
                  >
                    <HiLogout className="size-4" />
                    {t.nav.logout}
                  </button>
                </div>
              ) : (
                <div className="mt-4 grid gap-2">
                  <Button as={Link} to="/login" variant="outline" className="w-full" onClick={closeMenu}>
                    {t.nav.login}
                  </Button>
                  <Button as={Link} to="/register" variant="ghost" className="w-full" onClick={closeMenu}>
                    {t.nav.register}
                  </Button>
                </div>
              )}
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
