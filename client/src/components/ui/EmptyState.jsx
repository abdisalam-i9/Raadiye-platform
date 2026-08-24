export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[1.15rem] border border-dashed border-line bg-paper px-6 py-12 text-center">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
