import { cn } from '../utils/cn';
import { trackingStage } from '../constants/geo';
import { useI18n } from '../context/LanguageContext';

const STEPS = ['pending', 'matched', 'closed'];

export default function StatusTracker({ status }) {
  const { t } = useI18n();
  const stage = trackingStage(status);
  const currentIndex = STEPS.indexOf(stage);

  return (
    <ol className="grid grid-cols-3 gap-2">
      {STEPS.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <li
            key={step}
            className={cn(
              'rounded-2xl px-3 py-2 text-center text-xs font-semibold',
              done ? 'bg-forest-light text-forest' : 'bg-cream text-muted'
            )}
          >
            <span className="block text-[10px] uppercase tracking-wide opacity-80">{index + 1}</span>
            {t.track[step]}
          </li>
        );
      })}
    </ol>
  );
}
