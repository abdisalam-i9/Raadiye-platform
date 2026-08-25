import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useI18n } from '../context/LanguageContext';
import { cn } from '../utils/cn';

function Layout({ children }) {
  const { t } = useI18n();
  const location = useLocation();
  const isChat = location.pathname.startsWith('/chats');

  return (
    <div className="flex min-h-screen flex-col text-ink">
      <a href="#main-content" className="skip-link">
        {t.a11y.skip}
      </a>
      <Header />
      <main id="main-content" className={cn('flex-1', isChat && 'flex min-h-0 flex-col')}>
        {children}
      </main>
      {!isChat && <Footer />}
    </div>
  );
}

export default Layout;
