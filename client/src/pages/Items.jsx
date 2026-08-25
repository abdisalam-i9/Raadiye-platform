import BrowseSection from '../components/Home/BrowseSection';
import { usePageTitle } from '../hooks/usePageTitle';
import { useI18n } from '../context/LanguageContext';

export default function Items() {
  const { t } = useI18n();
  usePageTitle(t.browse.title);

  return (
    <div>
      <BrowseSection />
    </div>
  );
}
