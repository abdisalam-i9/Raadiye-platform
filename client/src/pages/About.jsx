import { HiOutlineSearch, HiOutlineHeart, HiOutlineShieldCheck, HiOutlineUsers } from 'react-icons/hi';
import { so } from '../i18n/so';
import { usePageTitle } from '../hooks/usePageTitle';
import Container from '../components/ui/Container';

export default function About() {
  usePageTitle('Nagu saabsan — Baafiye');

  return (
    <div>
      <section className="border-b border-white/60">
        <Container className="py-14 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
            {so.about.eyebrow}
          </p>
          <h1 className="mt-3 max-w-2xl text-ink">{so.about.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">{so.about.intro}</p>
        </Container>
      </section>

      <section className="section-y">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
                {so.about.what}
              </p>
              <h2 className="mt-3 text-ink">{so.about.whatTitle}</h2>
              <p className="mt-4 leading-7 text-ink-soft">{so.about.whatP1}</p>
              <p className="mt-3 leading-7 text-ink-soft">{so.about.whatP2}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Fact icon={HiOutlineSearch} title={so.about.find} text={so.about.findBody} />
              <Fact icon={HiOutlineHeart} title={so.about.return} text={so.about.returnBody} />
              <Fact icon={HiOutlineUsers} title={so.about.community} text={so.about.communityBody} />
              <Fact icon={HiOutlineShieldCheck} title={so.about.trust} text={so.about.trustBody} />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-cream section-y">
        <Container>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-forest">
            {so.about.how}
          </p>
          <h2 className="mt-3 text-center text-ink">{so.about.howTitle}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Step number="1" title={so.about.step1} text={so.about.step1Body} />
            <Step number="2" title={so.about.step2} text={so.about.step2Body} />
            <Step number="3" title={so.about.step3} text={so.about.step3Body} />
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-forest text-paper section-y">
        <Container className="max-w-3xl text-center">
          <h2 className="text-paper">{so.about.mission}</h2>
          <p className="mt-4 text-lg leading-8 text-forest-light">{so.about.missionBody}</p>
        </Container>
      </section>

      <section className="section-y">
        <Container>
          <div className="surface p-6">
            <h3 className="text-ink">{so.about.closeTitle}</h3>
            <p className="mt-2 text-ink-soft">{so.about.closeBody}</p>
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
