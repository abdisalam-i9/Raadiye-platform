import { Link } from 'react-router-dom';
import { getCategoryName, getCategorySlug } from '../../utils/helpers';
import CategoryImage from './CategoryImage';

export default function CategoryCard({ category, to }) {
  const href = to || `/items?category=${category._id}`;

  return (
    <Link
      to={href}
      className="surface card-hover group flex flex-col items-center px-4 py-5 text-center"
    >
      <CategoryImage category={category} className="size-14 rounded-2xl" />
      <span className="mt-3 text-sm font-semibold text-ink group-hover:text-forest">
        {getCategoryName(category)}
      </span>
      <span className="sr-only">{getCategorySlug(category)}</span>
    </Link>
  );
}
