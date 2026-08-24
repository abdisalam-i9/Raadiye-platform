import { Link } from 'react-router-dom';
import { so } from '../i18n/so';
import { usePageTitle } from '../hooks/usePageTitle';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';

export default function NotFound() {
  usePageTitle('Boggan lama helin — Baafiye');

  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="surface max-w-lg px-8 py-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">404</p>
        <h1 className="mt-3 text-ink">{so.page404.title}</h1>
        <p className="mt-4 text-ink-soft">{so.page404.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/">
            {so.actions.backHome}
          </Button>
          <Button as={Link} to="/items" variant="outline">
            {so.actions.browseItems}
          </Button>
        </div>
      </div>
    </Container>
  );
}
