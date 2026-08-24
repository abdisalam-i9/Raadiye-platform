import BrowseSection from '../components/Home/BrowseSection';
import { usePageTitle } from '../hooks/usePageTitle';
import { getListing } from '../constants/listings';

export default function Items({ kind = 'found' }) {
  const listing = getListing(kind);
  usePageTitle(listing.pageTitle);

  return (
    <div>
      <BrowseSection kind={kind} />
    </div>
  );
}
