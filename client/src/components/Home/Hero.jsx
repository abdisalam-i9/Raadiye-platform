import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineHeart } from 'react-icons/hi';
import Button from '../ui/Button';
import Container from '../ui/Container';
import { so } from '../../i18n/so';

export default function Hero() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    const search = query.trim();
    navigate(search ? `/items?search=${encodeURIComponent(search)}` : '/items');
  };

  return (
    <section className="border-b border-line bg-paper">
      <Container className="grid items-center gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:py-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
            Bulshada Muqdisho
          </p>
          <h1 className="mt-3 max-w-xl text-ink">
            Shay kaa lumay? Aan kaa caawinno inaad hesho.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
            Baafiye wuxuu isku xiraa dadka shayada hela iyo dadka iska leh. Raadi
            shaygaaga, soo gudbi shay aad heshay, ama sheeg shay kaa lumay.
          </p>

          <form onSubmit={handleSearch} className="mt-7 max-w-xl">
            <label htmlFor="home-search" className="sr-only">
              {so.a11y.search}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
                <input
                  id="home-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Maxaad raadineysaa?"
                  className="h-12 w-full rounded-xl border border-line bg-cream pl-11 pr-4 text-sm outline-none transition focus:border-forest focus:ring-4 focus:ring-forest/10"
                />
              </div>
              <Button type="submit" size="lg">
                {so.nav.search}
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button as={Link} to="/items">
              {so.actions.search}
            </Button>
            <Button as={Link} to="/lost-items" variant="outline">
              {so.actions.searchLost}
            </Button>
            <Button as={Link} to="/post-item" variant="ghost">
              {so.actions.postFound}
            </Button>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-line bg-cream p-8 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-forest text-paper">
            <HiOutlineHeart className="size-8" />
          </span>
          <p className="mt-5 font-display text-2xl text-ink">Shay kasta qof baa leh.</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink-soft">
            Waxaa laga yaabaa in waxa aad raadineyso uu halkan yaallo. Hal tallaabo
            yar ayaa qof kale wax badan uga dhigan karta.
          </p>
        </div>
      </Container>
    </section>
  );
}
