import { useEffect, useId, useState } from 'react';
import { HiOutlineUpload, HiX } from 'react-icons/hi';
import { useI18n } from '../../context/LanguageContext';
import { resolveImageUrl } from '../../utils/helpers';
import { cn } from '../../utils/cn';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_SIZE = 5 * 1024 * 1024;

export default function ImageUpload({
  id,
  file,
  existingUrl = '',
  onFileChange,
  error: externalError,
}) {
  const { t } = useI18n();
  const generatedId = useId();
  const inputId = id || generatedId;
  const [localError, setLocalError] = useState('');
  const [blobUrl, setBlobUrl] = useState('');

  useEffect(() => {
    if (!file) {
      setBlobUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const preview = blobUrl || resolveImageUrl(existingUrl);
  const error = localError || externalError;

  const handleChange = (event) => {
    const next = event.target.files?.[0];
    event.target.value = '';
    if (!next) return;

    if (!ALLOWED_TYPES.has(next.type)) {
      setLocalError(t.post.imageTypeError);
      onFileChange(null);
      return;
    }
    if (next.size > MAX_SIZE) {
      setLocalError(t.post.imageSizeError);
      onFileChange(null);
      return;
    }

    setLocalError('');
    onFileChange(next);
  };

  const handleClear = () => {
    setLocalError('');
    onFileChange(null);
  };

  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-semibold text-ink">{t.post.image}</span>
      <div
        className={cn(
          'overflow-hidden rounded-2xl border border-dashed border-line/90 bg-paper/70',
          error && 'border-danger'
        )}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="" className="h-52 w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent p-3">
              <label
                htmlFor={inputId}
                className="cursor-pointer rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink"
              >
                {t.post.imageChange}
              </label>
              {file && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-danger"
                >
                  <HiX className="size-4" />
                  {t.post.imageRemove}
                </button>
              )}
            </div>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 px-4 py-10 text-center"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-forest-light text-forest">
              <HiOutlineUpload className="size-6" />
            </span>
            <span className="text-sm font-semibold text-ink">{t.post.imageChoose}</span>
            <span className="text-xs text-muted">{t.post.imageHint}</span>
          </label>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleChange}
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {!error && preview && <p className="text-xs text-muted">{t.post.imageHint}</p>}
    </div>
  );
}
