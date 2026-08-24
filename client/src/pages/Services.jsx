import { Link } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineShieldCheck,
  HiOutlineUsers,
} from 'react-icons/hi';
import { so } from '../i18n/so';
import { usePageTitle } from '../hooks/usePageTitle';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';

const services = [
  {
    icon: HiOutlineSearch,
    title: so.services.foundBrowse,
    description: so.services.foundBrowseBody,
    link: '/items',
    linkLabel: so.actions.search,
  },
  {
    icon: HiOutlinePlus,
    title: so.services.foundPost,
    description: so.services.foundPostBody,
    link: '/post-item',
    linkLabel: so.actions.postFound,
  },
  {
    icon: HiOutlineSearch,
    title: so.services.lostBrowse,
    description: so.services.lostBrowseBody,
    link: '/lost-items',
    linkLabel: so.actions.searchLost,
  },
  {
    icon: HiOutlinePlus,
    title: so.services.lostPost,
    description: so.services.lostPostBody,
    link: '/post-lost',
    linkLabel: so.actions.postLost,
  },
  {
    icon: HiOutlineShieldCheck,
    title: so.services.privacy,
    description: so.services.privacyBody,
    link: '/about',
    linkLabel: so.nav.about,
  },
];

export default function Services() {
  usePageTitle('Sida uu u shaqeeyo — Baafiye');

  return (
    <div>
      <Container className="py-12 sm:py-16">
        <PageHeader eyebrow={so.services.eyebrow} title={so.services.title} description={so.services.body} />

        <div className="grid gap-6 md:grid-cols-2">
          {services.map(({ icon: Icon, title, description, link, linkLabel }) => (
            <article
              key={title}
              className="surface card-hover p-6"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-forest-light text-forest">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 text-xl font-semibold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p>
              <Link to={link} className="mt-4 inline-block text-sm font-semibold text-forest hover:underline">
                {linkLabel} →
              </Link>
            </article>
          ))}
        </div>
      </Container>

      <section className="relative overflow-hidden bg-forest text-white section-y">
        <Container className="max-w-3xl text-center">
          <HiOutlineUsers className="mx-auto size-8" />
          <h2 className="mt-4 text-white">{so.services.ctaTitle}</h2>
          <p className="mt-3 text-white/80">{so.services.ctaBody}</p>
          <Button as={Link} to="/register" variant="secondary" className="mt-6">
            {so.services.cta}
          </Button>
        </Container>
      </section>
    </div>
  );
}
