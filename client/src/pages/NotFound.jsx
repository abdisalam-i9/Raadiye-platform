import { Link } from 'react-router-dom';
import { useI18n } from '../context/LanguageContext';
import { usePageTitle } from '../hooks/usePageTitle';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';

export default function NotFound() {
  const { t } = useI18n();
  usePageTitle(t.meta.notFound);

  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="surface max-w-lg px-8 py-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">404</p>
        <h1 className="mt-3 text-ink">{t.page404.title}</h1>
        <p className="mt-4 text-ink-soft">{t.page404.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/">
            {t.actions.backHome}
          </Button>
          <Button as={Link} to="/items" variant="outline">
            {t.actions.browseItems}
          </Button>
        </div>
      </div>
    </Container>
  );
}
