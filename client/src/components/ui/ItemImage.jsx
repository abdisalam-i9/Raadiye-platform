import { HiOutlineUpload } from 'react-icons/hi';
import { useI18n } from '../../context/LanguageContext';
import { getItemImage, resolveImageUrl } from '../../utils/helpers';
import { cn } from '../../utils/cn';

export default function ItemImage({ item, alt, className }) {
  const { t } = useI18n();
  const src = resolveImageUrl(getItemImage(item));

  if (src) {
    return (
      <img
        src={src}
        alt={alt || item?.title || ''}
        className={cn('object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'grid place-items-center bg-cream text-muted',
        className
      )}
    >
      <div className="flex flex-col items-center gap-1 px-3 text-center">
        <HiOutlineUpload className="size-10 opacity-50" />
        <span className="text-xs font-medium">{t.post.noImage}</span>
      </div>
    </div>
  );
}
