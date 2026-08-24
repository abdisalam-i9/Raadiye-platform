import BrowseSection from '../components/Home/BrowseSection';
import { usePageTitle } from '../hooks/usePageTitle';
import { useI18n } from '../context/LanguageContext';

export default function Items({ kind = 'found' }) {
  const { t } = useI18n();
  usePageTitle(kind === 'lost' ? t.meta.lostList : t.meta.foundList);

  return (
    <div>
      <BrowseSection kind={kind} />
    </div>
  );
}
