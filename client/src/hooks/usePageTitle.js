import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title;
    return () => {
      document.title = 'Baafiye — Raadi Alaabta Kaa Lumay';
    };
  }, [title]);
}
