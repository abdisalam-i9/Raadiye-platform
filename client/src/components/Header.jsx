import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiChevronDown, HiLogout, HiMenu, HiPlus, HiSearch, HiX } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { so } from '../i18n/so';
import Brand from './Brand';
import Button from './ui/Button';
import Container from './ui/Container';
import { cn } from '../utils/cn';

const navItems = [
  { name: so.nav.home, path: '/' },
  { name: so.nav.items, path: '/items' },
  { name: so.nav.lostItems, path: '/lost-items' },
  { name: so.nav.how, path: '/services' },
  { name: so.nav.about, path: '/about' },
];

const mobileNavItems = [...navItems, { name: so.nav.contact, path: '/contact' }];

function navClass({ isActive }) {
  return cn('nav-link', isActive && 'nav-link-active');
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
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
    document.body.classList.toggle('menu-open', menuOpen);
    if (menuOpen) {
      closeButtonRef.current?.focus();
    } else {
      document.body.classList.remove('menu-open');
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

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/95 backdrop-blur-md">
      <Container>
        <div className="flex h-[4.25rem] items-center justify-between gap-3">
          <Brand onClick={closeMenu} />

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Hagaajinta ugu weyn">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'} className={navClass}>
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button as={Link} to="/items" variant="ghost" size="sm">
              {so.actions.search}
            </Button>
            <Button as={Link} to="/post-item" size="sm">
              <HiPlus className="size-4" />
              {so.nav.post}
            </Button>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  className="inline-flex max-w-[180px] items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-cream"
                  aria-expanded={userOpen}
                  aria-haspopup="menu"
                  aria-label={so.a11y.openAccount}
                  onClick={() => setUserOpen((open) => !open)}
                >
                  <span className="truncate">{user?.name || user?.email}</span>
                  <HiChevronDown className="size-4 shrink-0" />
                </button>

                {userOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-52 rounded-2xl border border-line bg-paper p-1.5 shadow-lift"
                  >
                    <Link
                      to="/my-items"
                      role="menuitem"
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream"
                      onClick={() => setUserOpen(false)}
                    >
                      {so.nav.myItems}
                    </Link>
                    <Link
                      to="/post-item"
                      role="menuitem"
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream"
                      onClick={() => setUserOpen(false)}
                    >
                      {so.nav.postFound}
                    </Link>
                    <Link
                      to="/post-lost"
                      role="menuitem"
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream"
                      onClick={() => setUserOpen(false)}
                    >
                      {so.nav.postLost}
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/categories"
                        role="menuitem"
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream"
                        onClick={() => setUserOpen(false)}
                      >
                        {so.nav.admin}
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger-light"
                      onClick={handleLogout}
                    >
                      <HiLogout className="size-4" />
                      {so.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" size="sm">
                  {so.nav.login}
                </Button>
                <Button as={Link} to="/register" variant="outline" size="sm">
                  {so.nav.register}
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <Link
              to="/items"
              className="rounded-xl p-2 text-ink hover:bg-cream"
              aria-label={so.a11y.search}
            >
              <HiSearch className="size-5" />
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              className="rounded-xl p-2 text-ink hover:bg-cream"
              aria-label={so.a11y.openMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <HiMenu className="size-6" />
            </button>
          </div>
        </div>
      </Container>

      {menuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-ink/40"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <aside
            id="mobile-menu"
            className="fixed inset-y-0 left-0 z-50 flex h-screen w-[min(20rem,88%)] flex-col bg-paper shadow-lift"
          >
            <div className="flex h-[4.25rem] items-center justify-between border-b border-line px-4">
              <Brand compact onClick={closeMenu} />
              <button
                ref={closeButtonRef}
                type="button"
                className="rounded-xl p-2 text-ink hover:bg-cream"
                aria-label={so.a11y.closeMenu}
                onClick={() => {
                  closeMenu();
                  menuButtonRef.current?.focus();
                }}
              >
                <HiX className="size-6" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="Menu-ga mobile">
              {mobileNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-sm font-semibold',
                      isActive ? 'bg-forest-light text-forest' : 'text-ink hover:bg-cream'
                    )
                  }
                >
                  {item.name}
                </NavLink>
              ))}

              <div className="my-3 border-t border-line" />

              <Button as={Link} to="/post-item" className="w-full" onClick={closeMenu}>
                <HiPlus className="size-4" />
                {so.nav.postFound}
              </Button>
              <Button as={Link} to="/post-lost" variant="outline" className="w-full" onClick={closeMenu}>
                <HiPlus className="size-4" />
                {so.nav.postLost}
              </Button>

              {isAuthenticated ? (
                <>
                  <p className="mt-4 px-1 text-sm text-muted">{user?.name || user?.email}</p>
                  <Link
                    to="/my-items"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-cream"
                  >
                    {so.nav.myItems}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/categories"
                      onClick={closeMenu}
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-cream"
                    >
                      {so.nav.admin}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-danger hover:bg-danger-light"
                  >
                    {so.nav.logout}
                  </button>
                </>
              ) : (
                <div className="mt-3 grid gap-2">
                  <Button as={Link} to="/login" variant="outline" className="w-full" onClick={closeMenu}>
                    {so.nav.login}
                  </Button>
                  <Button as={Link} to="/register" variant="ghost" className="w-full" onClick={closeMenu}>
                    {so.nav.register}
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
