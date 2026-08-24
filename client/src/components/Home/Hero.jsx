import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineHeart, HiOutlineLocationMarker, HiOutlineShieldCheck } from 'react-icons/hi';
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
    <section className="relative overflow-hidden border-b border-white/60">
      <div
        className="pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-forest/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-10 size-80 rounded-full bg-clay/10 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative grid items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div className="animate-fade-up">
          <p className="inline-flex items-center rounded-full bg-forest-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-forest">
            Bulshada Muqdisho
          </p>
          <h1 className="mt-4 max-w-xl text-ink">
            Shay kaa lumay? Aan kaa caawinno inaad hesho.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
            Baafiye wuxuu isku xiraa dadka shayada hela iyo dadka iska leh. Raadi
            shaygaaga, soo gudbi shay aad heshay, ama sheeg shay kaa lumay.
          </p>

          <form onSubmit={handleSearch} className="mt-8 max-w-xl">
            <label htmlFor="home-search" className="sr-only">
              {so.a11y.search}
            </label>
            <div className="glass flex flex-col gap-2 rounded-[1.4rem] p-2 shadow-card sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
                <input
                  id="home-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Maxaad raadineysaa?"
                  className="h-12 w-full rounded-2xl bg-transparent pl-11 pr-4 text-sm outline-none"
                />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="surface p-6 sm:col-span-2 xl:col-span-2">
            <span className="grid size-14 place-items-center rounded-2xl bg-forest text-paper shadow-[0_10px_24px_rgb(15_122_98_/_0.28)]">
              <HiOutlineHeart className="size-7" />
            </span>
            <p className="mt-5 font-display text-2xl text-ink">Shay kasta qof baa leh.</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-ink-soft">
              Waxaa laga yaabaa in waxa aad raadineyso uu halkan yaallo. Hal tallaabo
              yar ayaa qof kale wax badan uga dhigan karta.
            </p>
          </div>
          <div className="surface flex items-start gap-3 p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-forest-light text-forest">
              <HiOutlineLocationMarker className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">20+ degmo</p>
              <p className="mt-1 text-sm text-ink-soft">Raadi si degmo iyo xaafad ah.</p>
            </div>
          </div>
          <div className="surface flex items-start gap-3 p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-clay-light text-clay-dark">
              <HiOutlineShieldCheck className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">Xiriir toos ah</p>
              <p className="mt-1 text-sm text-ink-soft">Wac, ha is dhaafin lacag.</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
