import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../context/CategoriesContext';
import { useToast } from '../context/ToastContext';
import { listingApi } from '../services/api';
import { DISTRICTS } from '../constants/locations';
import { getListing } from '../constants/listings';
import { so } from '../i18n/so';
import { getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import { FormSkeleton } from '../components/ui/Skeleton';

export default function PostItem({ kind = 'found' }) {
  const listing = getListing(kind);
  const isLost = kind === 'lost';
  const dateField = listing.dateField;
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { showToast } = useToast();
  const navigate = useNavigate();

  usePageTitle(listing.postTitle);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await listingApi(kind).create(form);
      showToast(isLost ? 'Shayga lumay waa la soo gudbiyay' : 'Shayga waa la soo gudbiyay');
      navigate(`${listing.listPath}/${data.item._id}`);
    } catch (err) {
      if (err.status === 401) {
        setError('Fadlan mar kale gal akoonkaaga.');
      } else {
        setError(getErrorMessage(err, so.errors.generic));
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
          title={isLost ? so.post.lostTitle : so.post.foundTitle}
          description={isLost ? so.post.lostBody : so.post.foundBody}
        />

        <Alert className="mb-6">{so.post.privacy}</Alert>

        <form
          onSubmit={handleSubmit}
          className="surface space-y-5 p-6 sm:p-8"
        >
          <Input
            id="title"
            name="title"
            label={so.post.title}
            required
            value={form.title}
            onChange={handleChange}
            placeholder={isLost ? so.post.titleHintLost : so.post.titleHintFound}
          />

          <Select
            id="category"
            name="category"
            label={so.detail.category}
            required
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Dooro qaybta</option>
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
              label={so.detail.district}
              required
              value={form.district}
              onChange={handleChange}
            >
              <option value="">Dooro degmada</option>
              {DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </Select>

            <Input
              id="village"
              name="village"
              label={so.detail.village}
              required
              value={form.village}
              onChange={handleChange}
              placeholder="Tusaale: KM4"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              id={dateField}
              name={dateField}
              type="date"
              label={isLost ? so.detail.lostDate : so.detail.foundDate}
              required
              value={form[dateField] || ''}
              onChange={handleChange}
            />

            <Input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              label={so.post.phone}
              required
              value={form.contactPhone}
              onChange={handleChange}
              placeholder="+252 61 000 0000"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">{error}</p>
          )}

          <Button type="submit" className="w-full" loading={loading} size="lg">
            {loading
              ? so.post.submitting
              : isLost
                ? so.post.submitLost
                : so.post.submitFound}
          </Button>
        </form>
      </div>
    </Container>
  );
}
