import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { DISTRICTS } from '../constants/locations';
import { getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import ImageUpload from '../components/ui/ImageUpload';
import ItemCard from '../components/Home/ItemCard';

export default function Profile() {
  const { t } = useI18n();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  usePageTitle(t.meta.profile);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    district: user?.district || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [listings, setListings] = useState({ found: [], lost: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.users
      .me()
      .then((data) => {
        if (cancelled) return;
        updateUser({ ...user, ...data.user, id: data.user.id });
        setForm({
          name: data.user.name || '',
          phone: data.user.phone || '',
          bio: data.user.bio || '',
          district: data.user.district || '',
        });
        setListings({
          found: data.listings?.found || [],
          lost: data.listings?.lost || [],
        });
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value ?? ''));
      if (avatarFile) payload.append('image', avatarFile);
      const data = await api.users.updateMe(payload);
      updateUser({ ...user, ...data.user, id: data.user.id });
      setAvatarFile(null);
      showToast(t.profile.saved);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="py-8 sm:py-12">
      <PageHeader title={t.profile.title} description={t.profile.body} />

      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="surface mt-6 space-y-5 p-6 sm:p-8">
        <ImageUpload file={avatarFile} existingUrl={user?.avatar} onFileChange={setAvatarFile} />
        <Input
          label={t.auth.name}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label={t.auth.phone}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <Select
          label={t.detail.district}
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
        >
          <option value="">{t.common.allDistricts}</option>
          {DISTRICTS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <Textarea
          label={t.profile.bio}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={4}
        />
        <Button type="submit" loading={saving}>
          {t.common.save}
        </Button>
      </form>

      {!loading && (
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="font-display text-xl text-ink">{t.nav.items}</h2>
            <div className="mt-4 grid gap-4">
              {listings.found.length ? (
                listings.found.map((item) => <ItemCard key={item._id} item={item} kind="found" />)
              ) : (
                <p className="text-sm text-muted">{t.empty.myItemsTitle}</p>
              )}
            </div>
          </section>
          <section>
            <h2 className="font-display text-xl text-ink">{t.nav.lostItems}</h2>
            <div className="mt-4 grid gap-4">
              {listings.lost.length ? (
                listings.lost.map((item) => <ItemCard key={item._id} item={item} kind="lost" />)
              ) : (
                <p className="text-sm text-muted">{t.empty.myLostTitle}</p>
              )}
            </div>
          </section>
        </div>
      )}

      <p className="mt-8 text-sm">
        <Link to="/my-items" className="font-semibold text-forest hover:underline">
          {t.nav.myItems}
        </Link>
      </p>
    </Container>
  );
}
