import Header from './Header';
import Footer from './Footer';
import { so } from '../i18n/so';

function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col text-ink">
      <a href="#main-content" className="skip-link">
        {so.a11y.skip}
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
