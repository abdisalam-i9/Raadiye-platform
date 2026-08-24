import Container from './Container';

export default function AuthCard({ title, description, children }) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-md rounded-[1.15rem] border border-line bg-paper p-6 shadow-card sm:p-8">
        <h1 className="text-ink">{title}</h1>
        {description && <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </Container>
  );
}
