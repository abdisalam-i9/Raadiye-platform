import { Link } from 'react-router-dom';
import {
  HiArrowUp,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
  HiPlus,
  HiSearch,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/LanguageContext';
import Brand from './Brand';
import Button from './ui/Button';
import Container from './ui/Container';

export default function Footer() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  const siteLinks = [
    { to: '/', label: t.common.homePage },
    { to: '/items', label: t.nav.items },
    { to: '/lost-items', label: t.nav.lostItems },
    { to: '/about', label: t.nav.about },
  ];

  const helpLinks = [
    { to: '/services', label: t.nav.how },
    { to: '/contact', label: t.nav.contact },
    { to: '/items', label: t.actions.search },
  ];

  const accountLinks = isAuthenticated
    ? [
        { to: '/notifications', label: t.nav.notifications },
        { to: '/chats', label: t.nav.chats },
        { to: '/my-items', label: t.nav.myItems },
        { to: '/post-item', label: t.nav.postFound },
        { to: '/post-lost', label: t.nav.postLost },
      ]
    : [
        { to: '/login', label: t.nav.login },
        { to: '/register', label: t.nav.register },
        { to: '/post-item', label: t.nav.postFound },
        { to: '/post-lost', label: t.nav.postLost },
      ];

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer mt-auto text-white/75">
      <div
        className="h-px bg-gradient-to-r from-transparent via-forest/70 to-transparent"
        aria-hidden="true"
      />

      <Container className="pt-10">
        <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.04] px-5 py-6 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)] sm:px-7 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="font-display text-2xl text-white">{t.footer.tagline}</p>
              <p className="mt-2 text-sm leading-7 text-white/70">{t.footer.blurb}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button
                as={Link}
                to="/post-item"
                size="sm"
                className="!bg-white !text-forest shadow-[0_10px_24px_rgb(0_0_0_/_0.28)] hover:!bg-cream hover:!text-forest-dark"
              >
                <HiPlus className="size-4" />
                {t.nav.post}
              </Button>
              <Button as={Link} to="/items" variant="onDark" size="sm">
                <HiSearch className="size-4" />
                {t.actions.search}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Brand light />
            <div className="mt-5 grid gap-2.5">
              <a href="mailto:hello@baafiye.org" className="footer-chip">
                <span className="grid size-9 place-items-center rounded-xl bg-forest/20 text-forest">
                  <HiOutlineMail className="size-4" />
                </span>
                hello@baafiye.org
              </a>
              <a href="tel:+252610000000" className="footer-chip">
                <span className="grid size-9 place-items-center rounded-xl bg-clay/20 text-clay">
                  <HiOutlinePhone className="size-4" />
                </span>
                +252 61 000 0000
              </a>
              <span className="footer-chip">
                <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-white">
                  <HiOutlineLocationMarker className="size-4" />
                </span>
                {t.common.mogadishuSomalia}
              </span>
            </div>
          </div>

          <FooterColumn title={t.footer.site} links={siteLinks} />
          <FooterColumn title={t.footer.help} links={helpLinks} />
          <FooterColumn title={t.footer.account} links={accountLinks} />
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/55">
            &copy; {new Date().getFullYear()} {t.brand}. {t.footer.credit}
          </p>
          <div className="flex items-center gap-3">
            <p className="text-sm text-white/55">{t.footer.tagline}</p>
            <button
              type="button"
              onClick={scrollTop}
              className="grid size-10 place-items-center rounded-full border border-white/12 bg-white/8 text-white transition hover:border-forest/40 hover:bg-forest/20"
              aria-label={t.a11y.backToTop}
            >
              <HiArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(({ to, label }) => (
          <li key={`${to}-${label}`}>
            <Link to={to} className="footer-link">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
