import { useState } from 'react';
import { HiPhone } from 'react-icons/hi';
import Button from './Button';
import { so } from '../../i18n/so';
import { useToast } from '../../context/ToastContext';

export default function ContactFounder({ phone, kind = 'found' }) {
  const [revealed, setRevealed] = useState(false);
  const { showToast } = useToast();
  const isLost = kind === 'lost';

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      showToast(so.detail.copied);
    } catch {
      showToast(so.errors.generic, 'error');
    }
  };

  if (!phone) return null;

  if (!revealed) {
    return (
      <div className="rounded-[1.15rem] border border-forest/20 bg-forest-light p-5">
        <h2 className="text-lg font-semibold text-ink">
          {isLost ? so.actions.contactOwner : so.actions.contactFinder}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          {isLost ? so.detail.contactHintLost : so.detail.contactHint}
        </p>
        <Button type="button" className="mt-4" onClick={() => setRevealed(true)}>
          <HiPhone className="size-4" />
          {isLost ? so.detail.revealOwner : so.detail.reveal}
        </Button>
        <p className="mt-3 text-xs leading-5 text-muted">{so.detail.contactSafety}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.15rem] border border-forest/20 bg-forest-light p-5">
      <p className="text-sm font-semibold text-forest">
        {isLost ? so.detail.ownerPhone : so.detail.finderPhone}
      </p>
      <p className="mt-2 font-display text-2xl text-ink">{phone}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button as="a" href={`tel:${phone.replace(/\s/g, '')}`}>
          <HiPhone className="size-4" />
          {isLost ? so.detail.callOwner : so.detail.call}
        </Button>
        <Button type="button" variant="outline" onClick={copyNumber}>
          {so.detail.copy}
        </Button>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">{so.detail.contactSafety}</p>
    </div>
  );
}
