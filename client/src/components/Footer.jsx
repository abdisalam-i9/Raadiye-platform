import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { so } from '../i18n/so';
import Brand from './Brand';
import Container from './ui/Container';

export default function Footer() {
  const { isAuthenticated } = useAuth();

  const siteLinks = [
    { to: '/', label: 'Bogga hore' },
    { to: '/items', label: so.nav.items },
    { to: '/lost-items', label: so.nav.lostItems },
    { to: '/about', label: so.nav.about },
  ];

  const helpLinks = [
    { to: '/services', label: so.nav.how },
    { to: '/contact', label: so.nav.contact },
    { to: '/items', label: so.actions.search },
  ];

  const accountLinks = isAuthenticated
    ? [
        { to: '/my-items', label: so.nav.myItems },
        { to: '/post-item', label: so.nav.postFound },
        { to: '/post-lost', label: so.nav.postLost },
      ]
    : [
        { to: '/login', label: so.nav.login },
        { to: '/register', label: so.nav.register },
        { to: '/post-item', label: so.nav.postFound },
        { to: '/post-lost', label: so.nav.postLost },
      ];

  return (
    <footer className="mt-auto border-t border-line bg-paper">
      <Container>
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Brand />
            <p className="mt-4 max-w-xs text-sm leading-7 text-ink-soft">{so.footer.blurb}</p>
          </div>

          <FooterColumn title={so.footer.site} links={siteLinks} />
          <FooterColumn title={so.footer.help} links={helpLinks} />
          <FooterColumn title={so.footer.account} links={accountLinks} />
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="mailto:hello@baafiye.org" className="inline-flex items-center gap-1.5 hover:text-forest">
              <HiOutlineMail />
              hello@baafiye.org
            </a>
            <a href="tel:+252610000000" className="inline-flex items-center gap-1.5 hover:text-forest">
              <HiOutlinePhone />
              +252 61 000 0000
            </a>
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineLocationMarker />
              Muqdisho, Soomaaliya
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-line py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {so.brand}. {so.footer.credit}
          </p>
          <p>{so.footer.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-ink">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(({ to, label }) => (
          <li key={`${to}-${label}`}>
            <Link to={to} className="text-ink-soft transition hover:text-forest">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
