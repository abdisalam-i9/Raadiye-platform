import { HiOutlineSearch, HiOutlineHeart, HiOutlineShieldCheck, HiOutlineUsers } from 'react-icons/hi';
import { useI18n } from '../context/LanguageContext';
import { usePageTitle } from '../hooks/usePageTitle';
import Container from '../components/ui/Container';

export default function About() {
  const { t } = useI18n();
  usePageTitle(t.meta.about);

  return (
    <div>
      <section className="border-b border-white/60 dark:border-white/10">
        <Container className="py-14 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
            {t.about.eyebrow}
          </p>
          <h1 className="mt-3 max-w-2xl text-ink">{t.about.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">{t.about.intro}</p>
        </Container>
      </section>

      <section className="section-y">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
                {t.about.what}
              </p>
              <h2 className="mt-3 text-ink">{t.about.whatTitle}</h2>
              <p className="mt-4 leading-7 text-ink-soft">{t.about.whatP1}</p>
              <p className="mt-3 leading-7 text-ink-soft">{t.about.whatP2}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Fact icon={HiOutlineSearch} title={t.about.find} text={t.about.findBody} />
              <Fact icon={HiOutlineHeart} title={t.about.return} text={t.about.returnBody} />
              <Fact icon={HiOutlineUsers} title={t.about.community} text={t.about.communityBody} />
              <Fact icon={HiOutlineShieldCheck} title={t.about.trust} text={t.about.trustBody} />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-paper/40 section-y">
        <Container>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-forest">
            {t.about.how}
          </p>
          <h2 className="mt-3 text-center text-ink">{t.about.howTitle}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Step number="1" title={t.about.step1} text={t.about.step1Body} />
            <Step number="2" title={t.about.step2} text={t.about.step2Body} />
            <Step number="3" title={t.about.step3} text={t.about.step3Body} />
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-forest text-white section-y">
        <Container className="max-w-3xl text-center">
          <h2 className="text-white">{t.about.mission}</h2>
          <p className="mt-4 text-lg leading-8 text-white/80">{t.about.missionBody}</p>
        </Container>
      </section>

      <section className="section-y">
        <Container>
          <div className="surface p-6">
            <h3 className="text-ink">{t.about.closeTitle}</h3>
            <p className="mt-2 text-ink-soft">{t.about.closeBody}</p>
          </div>
        </Container>
      </section>
    </div>
  );
}

function Fact({ icon: Icon, title, text }) {
  return (
    <div className="surface p-5">
      <span className="grid size-10 place-items-center rounded-xl bg-forest-light text-forest">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="surface p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-forest">{number}</p>
      <h3 className="mt-2 text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p>
    </div>
  );
}
