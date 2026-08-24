import Brand from '../Brand';
import Container from './Container';

export default function AuthCard({ title, description, children }) {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -left-24 top-10 size-64 rounded-full bg-forest/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 size-56 rounded-full bg-clay/10 blur-3xl"
        aria-hidden="true"
      />
      <Container className="relative py-12 sm:py-16">
        <div className="surface mx-auto max-w-md p-6 sm:p-8">
          <div className="mb-6">
            <Brand compact />
          </div>
          <h1 className="text-ink">{title}</h1>
          {description && (
            <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      </Container>
    </div>
  );
}
