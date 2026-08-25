import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useI18n } from '../context/LanguageContext';
import { useCategories } from '../context/CategoriesContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import { FormSkeleton } from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import { ConfirmModal } from '../components/ui/Modal';

export default function AdminCategories() {
  const { t } = useI18n();
  const { categories, loading, refreshCategories } = useCategories();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', slug: '', image: '' });
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deactivateId, setDeactivateId] = useState('');

  usePageTitle(t.meta.admin);

  const resetForm = () => {
    setForm({ name: '', slug: '', image: '' });
    setEditingId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingId) {
        await api.categories.update(editingId, form);
        showToast(t.admin.updated);
      } else {
        await api.categories.create(form);
        showToast(t.admin.created);
      }

      resetForm();
      await refreshCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name,
      slug: category.slug,
      image: category.image || '',
    });
  };

  const handleDelete = async () => {
    if (!deactivateId) return;

    try {
      await api.categories.delete(deactivateId);
      showToast(t.admin.deactivated);
      await refreshCategories();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setDeactivateId('');
    }
  };

  if (loading) {
    return (
      <Container className="py-10 sm:py-14">
        <FormSkeleton />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        title={t.admin.title}
        description={t.admin.body}
        action={
          <Button as={Link} to="/admin" variant="outline">
            {t.dashboard.title}
          </Button>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <form
          onSubmit={handleSubmit}
          className="surface space-y-4 p-6"
        >
          <h2 className="text-lg font-semibold text-ink">
            {editingId ? t.admin.edit : t.admin.create}
          </h2>

          <Input
            label={t.admin.name}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label={t.admin.slug}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
          <Input
            label={t.admin.image}
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          {error && <Alert type="error">{error}</Alert>}

          <div className="flex gap-3">
            <Button type="submit" loading={submitting}>
              {editingId ? t.admin.update : t.admin.save}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={resetForm}>
                {t.actions.cancel}
              </Button>
            )}
          </div>
        </form>

        <div className="surface p-6">
          <h2 className="text-lg font-semibold text-ink">{t.admin.existing}</h2>
          <ul className="mt-5 divide-y divide-line">
            {categories.map((category) => (
              <li key={category._id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-ink">{category.name}</p>
                  <p className="text-sm text-muted">{category.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(category)}>
                    {t.actions.edit}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setDeactivateId(category._id)}
                  >
                    {t.admin.deactivate}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deactivateId)}
        onClose={() => setDeactivateId('')}
        onConfirm={handleDelete}
        danger
        title={t.admin.confirmDeactivate}
        confirmLabel={t.admin.deactivate}
        cancelLabel={t.common.dismiss}
      />
    </Container>
  );
}
