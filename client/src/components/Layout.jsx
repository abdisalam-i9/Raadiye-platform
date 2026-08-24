import Header from './Header';
import Footer from './Footer';
import { useI18n } from '../context/LanguageContext';

function Layout({ children }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col text-ink">
      <a href="#main-content" className="skip-link">
        {t.a11y.skip}
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
