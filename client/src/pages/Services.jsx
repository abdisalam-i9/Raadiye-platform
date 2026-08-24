import { Link } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineShieldCheck,
  HiOutlineUsers,
} from 'react-icons/hi';
import { useI18n } from '../context/LanguageContext';
import { usePageTitle } from '../hooks/usePageTitle';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';

export default function Services() {
  const { t } = useI18n();
  usePageTitle(t.meta.services);

  const services = [
    {
      icon: HiOutlineSearch,
      title: t.services.foundBrowse,
      description: t.services.foundBrowseBody,
      link: '/items',
      linkLabel: t.actions.search,
    },
    {
      icon: HiOutlinePlus,
      title: t.services.foundPost,
      description: t.services.foundPostBody,
      link: '/post-item',
      linkLabel: t.actions.postFound,
    },
    {
      icon: HiOutlineSearch,
      title: t.services.lostBrowse,
      description: t.services.lostBrowseBody,
      link: '/lost-items',
      linkLabel: t.actions.searchLost,
    },
    {
      icon: HiOutlinePlus,
      title: t.services.lostPost,
      description: t.services.lostPostBody,
      link: '/post-lost',
      linkLabel: t.actions.postLost,
    },
    {
      icon: HiOutlineShieldCheck,
      title: t.services.privacy,
      description: t.services.privacyBody,
      link: '/about',
      linkLabel: t.nav.about,
    },
  ];

  return (
    <div>
      <Container className="py-12 sm:py-16">
        <PageHeader eyebrow={t.services.eyebrow} title={t.services.title} description={t.services.body} />

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
          <h2 className="mt-4 text-white">{t.services.ctaTitle}</h2>
          <p className="mt-3 text-white/80">{t.services.ctaBody}</p>
          <Button as={Link} to="/register" variant="secondary" className="mt-6">
            {t.services.cta}
          </Button>
        </Container>
      </section>
    </div>
  );
}
