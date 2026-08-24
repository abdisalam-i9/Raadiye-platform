import { cn } from '../../utils/cn';
import { getCategoryName, getItemImage } from '../../utils/helpers';

const fallbackColors = {
  money: 'bg-ok-light text-ok',
  phone: 'bg-info-light text-info',
  passport: 'bg-warn-light text-warn',
  documents: 'bg-forest-light text-forest',
  keys: 'bg-clay-light text-clay',
  wallet: 'bg-clay-light text-clay-dark',
  electronics: 'bg-info-light text-info',
  bags: 'bg-forest-light text-forest',
  other: 'bg-cream text-muted',
};

export default function CategoryImage({ item, category, alt, className }) {
  const source = item || { category };
  const image = getItemImage(source);
  const name = getCategoryName(source.category || category);
  const slug = (source.category?.slug || category?.slug || 'other').toLowerCase();
  const letter = name.charAt(0).toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={alt || name}
        className={cn('object-cover', className)}
      />
    );
  }

  return (
    <div
      aria-hidden={!alt}
      className={cn(
        'grid place-items-center font-display text-2xl font-semibold',
        fallbackColors[slug] || fallbackColors.other,
        className
      )}
    >
      {letter}
    </div>
  );
}
