import { useState } from 'react';
import { HiPhone } from 'react-icons/hi';
import Button from './Button';
import { useI18n } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function ContactFounder({ phone, kind = 'found' }) {
  const { t } = useI18n();
  const [revealed, setRevealed] = useState(false);
  const { showToast } = useToast();
  const isLost = kind === 'lost';

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      showToast(t.detail.copied);
    } catch {
      showToast(t.errors.generic, 'error');
    }
  };

  if (!phone) return null;

  if (!revealed) {
    return (
      <div className="rounded-[1.35rem] border border-forest/15 bg-forest-light/80 p-5">
        <h2 className="text-lg font-semibold text-ink">
          {isLost ? t.actions.contactOwner : t.actions.contactFinder}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          {isLost ? t.detail.contactHintLost : t.detail.contactHint}
        </p>
        <Button type="button" className="mt-4" onClick={() => setRevealed(true)}>
          <HiPhone className="size-4" />
          {isLost ? t.detail.revealOwner : t.detail.reveal}
        </Button>
        <p className="mt-3 text-xs leading-5 text-muted">{t.detail.contactSafety}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.35rem] border border-forest/15 bg-forest-light/80 p-5">
      <p className="text-sm font-semibold text-forest">
        {isLost ? t.detail.ownerPhone : t.detail.finderPhone}
      </p>
      <p className="mt-2 font-display text-2xl text-ink">{phone}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button as="a" href={`tel:${phone.replace(/\s/g, '')}`}>
          <HiPhone className="size-4" />
          {isLost ? t.detail.callOwner : t.detail.call}
        </Button>
        <Button type="button" variant="outline" onClick={copyNumber}>
          {t.detail.copy}
        </Button>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">{t.detail.contactSafety}</p>
    </div>
  );
}
