import { useEffect } from 'react';
import { getT } from '../i18n';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title;
    return () => {
      document.title = getT().meta.default;
    };
  }, [title]);
}
