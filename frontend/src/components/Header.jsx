import { Link, NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }) =>
  isActive
    ? 'font-medium text-white underline underline-offset-4'
    : 'font-medium text-white/90 hover:text-white hover:underline hover:underline-offset-4 transition-colors';

function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-white">
          LostAndFound
        </Link>
        <nav className="flex gap-6">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/services" className={navLinkClass}>
            Services
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
