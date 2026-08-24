import { HiOutlineSearch } from 'react-icons/hi';

export default function EmptyState({ title, description, action }) {
  return (
    <div className="surface px-6 py-14 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest-light text-forest">
        <HiOutlineSearch className="size-6" />
      </span>
      <h3 className="mt-5 font-display text-xl text-ink">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
