import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../context/CategoriesContext';
import { useToast } from '../context/ToastContext';
import { listingApi } from '../services/api';
import { DISTRICTS } from '../constants/locations';
import { getListing } from '../constants/listings';
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

export default function PostItem({ kind = 'found' }) {
  const { t } = useI18n();
  const listing = getListing(kind);
  const isLost = kind === 'lost';
  const dateField = listing.dateField;
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { showToast } = useToast();
  const navigate = useNavigate();

  usePageTitle(isLost ? t.meta.lostPost : t.meta.foundPost);

  const [form, setForm] = useState({
    title: '',
    category: '',
    district: '',
    village: '',
    [dateField]: '',
    contactPhone: user?.phone || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, value ?? '');
      });
      if (imageFile) {
        payload.append('image', imageFile);
      }

      const data = await listingApi(kind).create(payload);
      showToast(isLost ? t.item.postedLost : t.item.postedFound);
      navigate(`${listing.listPath}/${data.item._id}`);
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

  if (categoriesLoading) {
    return (
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <FormSkeleton />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title={isLost ? t.post.lostTitle : t.post.foundTitle}
          description={isLost ? t.post.lostBody : t.post.foundBody}
        />

        <Alert className="mb-6">{t.post.privacy}</Alert>

        <form
          onSubmit={handleSubmit}
          className="surface space-y-5 p-6 sm:p-8"
        >
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

          <ImageUpload file={imageFile} onFileChange={setImageFile} />

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
      </div>
    </Container>
  );
}
