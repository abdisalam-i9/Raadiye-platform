import { Link } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineUpload, HiOutlineShieldCheck, HiOutlineChat } from 'react-icons/hi';
import Hero from '../components/Home/Hero';
import RecentItems from '../components/Home/RecentItems';
import CategoryCard from '../components/ui/CategoryCard';
import { CategoryCardSkeleton } from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import { useCategories } from '../context/CategoriesContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useI18n } from '../context/LanguageContext';

export default function Home() {
  const { t } = useI18n();
  usePageTitle(t.meta.home);
  const { categories, loading } = useCategories();
  const activeCategories = categories.filter((category) => category.isActive !== false);

  return (
    <div>
      <Hero />
      <RecentItems kind="found" />
      <RecentItems kind="lost" />

      <section className="section-y">
        <Container>
          <h2 className="text-ink">{t.home.lookingFor}</h2>
          <p className="mt-2 text-ink-soft">{t.home.lookingForBody}</p>

          {loading ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <CategoryCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {activeCategories.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="section-y">
        <Container>
          <h2 className="text-center text-ink">{t.home.howTitle}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Step
              icon={HiOutlineSearch}
              number="1"
              title={t.home.step1Title}
              text={t.home.step1Body}
            />
            <Step
              icon={HiOutlineUpload}
              number="2"
              title={t.home.step2Title}
              text={t.home.step2Body}
            />
            <Step
              icon={HiOutlineShieldCheck}
              number="3"
              title={t.home.step3Title}
              text={t.home.step3Body}
            />
            <Step
              icon={HiOutlineChat}
              number="4"
              title={t.home.step4Title}
              text={t.home.step4Body}
            />
          </div>
        </Container>
      </section>

      <section className="section-y">
        <Container className="max-w-3xl text-center">
          <h2 className="text-ink">{t.home.ctaTitle}</h2>
          <p className="mx-auto mt-4 text-lg leading-8 text-ink-soft">{t.home.ctaBody}</p>
          <Button as={Link} to="/items" className="mt-6">
            {t.actions.search}
          </Button>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-forest text-white section-y">
        <div className="pointer-events-none absolute -right-16 top-0 size-64 rounded-full bg-white/10 blur-3xl" />
        <Container className="relative text-center">
          <h2 className="text-white">{t.home.ctaFoundTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">{t.home.ctaFoundBody}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/items" variant="secondary">
              {t.actions.browseItems}
            </Button>
            <Button as={Link} to="/items?add=1" variant="onDark">
              {t.browse.add}
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}

function Step({ icon: Icon, number, title, text }) {
  return (
    <div className="surface card-hover p-6">
      <span className="grid size-11 place-items-center rounded-2xl bg-forest text-white">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-forest">{number}</p>
      <h3 className="mt-1 text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p>
    </div>
  );
}
