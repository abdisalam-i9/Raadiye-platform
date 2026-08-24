import { Link } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineUpload, HiOutlinePhone } from 'react-icons/hi';
import Hero from '../components/Home/Hero';
import RecentItems from '../components/Home/RecentItems';
import CategoryCard from '../components/ui/CategoryCard';
import { CategoryCardSkeleton } from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import { useCategories } from '../context/CategoriesContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { so } from '../i18n/so';

export default function Home() {
  usePageTitle('Baafiye — Raadi Alaabta Kaa Lumay');
  const { categories, loading } = useCategories();
  const activeCategories = categories.filter((category) => category.isActive !== false);

  return (
    <div>
      <Hero />
      <RecentItems kind="found" />
      <RecentItems kind="lost" />

      <section className="section-y">
        <Container>
          <h2 className="text-ink">Maxaad raadineysaa?</h2>
          <p className="mt-2 text-ink-soft">Dooro qayb si aad si degdeg ah ugu raadsato.</p>

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
          <h2 className="text-center text-ink">Sida Baafiye u shaqeeyo</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Step
              icon={HiOutlineSearch}
              number="1"
              title="Shay baa lumay"
              text="Raadi alaabta la helay, ama soo gudbi kan kaa lumay."
            />
            <Step
              icon={HiOutlineUpload}
              number="2"
              title="Shay baa la helay"
              text="Qofkii helay wuxuu ku soo gudbiyaa xogta muhiimka ah."
            />
            <Step
              icon={HiOutlinePhone}
              number="3"
              title="Isku xir"
              text="Wac lambarka. Ha is dhaafin lacag ama xog sir ah."
            />
          </div>
        </Container>
      </section>

      <section className="section-y">
        <Container className="max-w-3xl text-center">
          <h2 className="text-ink">Shay kasta qof baa leh.</h2>
          <p className="mx-auto mt-4 text-lg leading-8 text-ink-soft">
            Mararka qaar waxa qof ka lumay waa wax yar, laakiin qofka iska leh waxay u
            noqon kartaa wax aad muhiim u ah. Baafiye wuxuu bulshada ka caawinayaa inay
            is caawiso.
          </p>
          <Button as={Link} to="/items" className="mt-6">
            {so.actions.search}
          </Button>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-forest text-paper section-y">
        <div className="pointer-events-none absolute -right-16 top-0 size-64 rounded-full bg-paper/10 blur-3xl" />
        <Container className="relative text-center">
          <h2 className="text-paper">Ma heshay shay, ama ma kaa lumay?</h2>
          <p className="mx-auto mt-3 max-w-xl text-forest-light">
            Soo gudbi si qofkii kale uu kuu soo waco.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/post-item" variant="secondary">
              {so.actions.postFound}
            </Button>
            <Button as={Link} to="/post-lost" variant="onDark">
              {so.actions.postLost}
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
      <span className="grid size-11 place-items-center rounded-2xl bg-forest text-paper">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-forest">{number}</p>
      <h3 className="mt-1 text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p>
    </div>
  );
}
