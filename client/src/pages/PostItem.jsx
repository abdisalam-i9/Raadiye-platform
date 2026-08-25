import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../context/CategoriesContext';
import { useToast } from '../context/ToastContext';
import { api, listingApi } from '../services/api';
import { DISTRICTS } from '../constants/locations';
import { coordsForDistrict } from '../constants/geo';
import { getListing, itemPath } from '../constants/listings';
import { useI18n } from '../context/LanguageContext';
import { getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import { FormSkeleton } from '../components/ui/Skeleton';
import ImageUpload from '../components/ui/ImageUpload';
import LocationMap from '../components/LocationMap';
import Textarea from '../components/ui/Textarea';
import { cn } from '../utils/cn';

export default function PostItem({ kind: kindProp, compact = false, onPosted }) {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const initialKind = kindProp || (params.get('kind') === 'lost' ? 'lost' : 'found');
  const [kind, setKind] = useState(initialKind);
  const listing = getListing(kind);
  const isLost = kind === 'lost';
  const dateField = listing.dateField;
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { showToast } = useToast();
  const navigate = useNavigate();

  usePageTitle(compact ? t.browse.title : isLost ? t.meta.lostPost : t.meta.foundPost);

  useEffect(() => {
    if (kindProp === 'found' || kindProp === 'lost') setKind(kindProp);
  }, [kindProp]);

  const [form, setForm] = useState({
    title: '',
    category: '',
    district: '',
    village: '',
    foundDate: '',
    lostDate: '',
    contactPhone: user?.phone || '',
    identifyingMarks: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [pin, setPin] = useState(null);
  const [suggesting, setSuggesting] = useState(false);

  const handleKind = (nextKind) => {
    if (nextKind === kind) return;
    const from = getListing(kind).dateField;
    const to = getListing(nextKind).dateField;
    setForm((current) => ({ ...current, [to]: current[to] || current[from] }));
    setKind(nextKind);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === 'district' && value) {
      setPin(coordsForDistrict(value));
    }
  };

  const handleImage = async (file) => {
    setImageFile(file);
    if (!file) return;
    setSuggesting(true);
    try {
      const payload = new FormData();
      payload.append('image', file);
      payload.append('title', form.title);
      const data = await api.vision.suggest(payload);
      const suggestion = data.suggestion;
      if (!suggestion) return;
      setForm((current) => ({
        ...current,
        title: current.title || suggestion.title || current.title,
        category: current.category || (suggestion.categoryId ? String(suggestion.categoryId) : current.category),
      }));
      if (suggestion.categoryName || suggestion.title) {
        showToast(t.vision.applied, 'info');
      }
    } catch {
      /* optional */
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('category', form.category);
      payload.append('district', form.district);
      payload.append('village', form.village);
      payload.append('contactPhone', form.contactPhone);
      payload.append('identifyingMarks', form.identifyingMarks);
      payload.append(dateField, form[dateField] || '');
      const coords = pin || coordsForDistrict(form.district);
      if (coords) {
        payload.append('lat', String(coords.lat));
        payload.append('lng', String(coords.lng));
      }
      if (imageFile) {
        payload.append('image', imageFile);
      }

      const data = await listingApi(kind).create(payload);
      showToast(isLost ? t.item.postedLost : t.item.postedFound);
      if (onPosted) onPosted(data.item, kind);
      else navigate(itemPath(kind, data.item._id));
    } catch (err) {
      if (err.status === 401) {
        setError(t.item.loginAgain);
      } else {
        setError(getErrorMessage(err, t.errors.generic));
      }
    } finally {
      setLoading(false);
    }
  };

  const formBody = (
    <>
      {!compact && <Alert className="mb-6">{t.post.privacy}</Alert>}

      <form onSubmit={handleSubmit} className={cn(!compact && 'surface space-y-5 p-6 sm:p-8', compact && 'surface space-y-5 p-5 sm:p-6')}>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">{t.post.kindLabel}</p>
          <div className="flex gap-1 rounded-full border border-line bg-cream/80 p-1 dark:bg-forest-light/40">
            <button
              type="button"
              onClick={() => handleKind('found')}
              className={cn(
                'flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition',
                !isLost ? 'bg-paper text-forest shadow-sm' : 'text-ink-soft hover:text-ink'
              )}
            >
              {t.post.kindFound}
            </button>
            <button
              type="button"
              onClick={() => handleKind('lost')}
              className={cn(
                'flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition',
                isLost ? 'bg-paper text-forest shadow-sm' : 'text-ink-soft hover:text-ink'
              )}
            >
              {t.post.kindLost}
            </button>
          </div>
        </div>

        <Input
          id="title"
          name="title"
          label={t.post.title}
          required
          value={form.title}
          onChange={handleChange}
          placeholder={isLost ? t.post.titleHintLost : t.post.titleHintFound}
        />

        <Select
          id="category"
          name="category"
          label={t.detail.category}
          required
          value={form.category}
          onChange={handleChange}
        >
          <option value="">{t.common.selectCategory}</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </Select>

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            id="district"
            name="district"
            label={t.detail.district}
            required
            value={form.district}
            onChange={handleChange}
          >
            <option value="">{t.common.selectDistrict}</option>
            {DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </Select>

          <Input
            id="village"
            name="village"
            label={t.detail.village}
            required
            value={form.village}
            onChange={handleChange}
            placeholder={t.common.villagePlaceholder}
          />
        </div>

        {form.district && (
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">{t.map.pick}</p>
            <p className="mb-3 text-xs text-muted">{t.map.pickHint}</p>
            <LocationMap
              lat={(pin || coordsForDistrict(form.district)).lat}
              lng={(pin || coordsForDistrict(form.district)).lng}
              interactive
              onChange={setPin}
            />
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            id={dateField}
            name={dateField}
            type="date"
            label={isLost ? t.detail.lostDate : t.detail.foundDate}
            required
            value={form[dateField] || ''}
            onChange={handleChange}
          />

          <Input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            label={t.post.phone}
            required
            value={form.contactPhone}
            onChange={handleChange}
            placeholder="+252 61 000 0000"
          />
        </div>

        <Textarea
          id="identifyingMarks"
          name="identifyingMarks"
          label={t.post.marks}
          hint={t.post.marksHint}
          rows={4}
          maxLength={400}
          value={form.identifyingMarks}
          onChange={handleChange}
        />

        <ImageUpload file={imageFile} onFileChange={handleImage} />
        {suggesting && <p className="text-sm text-muted">{t.vision.working}</p>}

        {error && (
          <p className="rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">{error}</p>
        )}

        <Button type="submit" className="w-full" loading={loading} size="lg">
          {loading
            ? t.post.submitting
            : isLost
              ? t.post.submitLost
              : t.post.submitFound}
        </Button>
      </form>
    </>
  );

  if (categoriesLoading) {
    if (compact) return <FormSkeleton />;
    return (
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <FormSkeleton />
        </div>
      </Container>
    );
  }

  if (compact) return formBody;

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title={isLost ? t.post.lostTitle : t.post.foundTitle}
          description={isLost ? t.post.lostBody : t.post.foundBody}
        />
        {formBody}
      </div>
    </Container>
  );
}
