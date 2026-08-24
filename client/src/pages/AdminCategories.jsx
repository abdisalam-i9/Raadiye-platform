import { useState } from 'react';
import { api } from '../services/api';
import { so } from '../i18n/so';
import { useCategories } from '../context/CategoriesContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import { ConfirmModal } from '../components/ui/Modal';

export default function AdminCategories() {
  const { categories, loading, refreshCategories } = useCategories();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', slug: '', image: '' });
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deactivateId, setDeactivateId] = useState('');

  usePageTitle('Maamul qaybaha — Baafiye');

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
        showToast(so.admin.updated);
      } else {
        await api.categories.create(form);
        showToast(so.admin.created);
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
      showToast(so.admin.deactivated);
      await refreshCategories();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setDeactivateId('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label="Qaybaha ayaa soo dhacaya..." />
      </div>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader title={so.admin.title} description={so.admin.body} />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-[1.15rem] border border-line bg-paper p-6 shadow-card"
        >
          <h2 className="text-lg font-semibold text-ink">
            {editingId ? so.admin.edit : so.admin.create}
          </h2>

          <Input
            label={so.admin.name}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label={so.admin.slug}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
          <Input
            label={so.admin.image}
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          {error && <Alert type="error">{error}</Alert>}

          <div className="flex gap-3">
            <Button type="submit" loading={submitting}>
              {editingId ? so.admin.update : so.admin.save}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={resetForm}>
                {so.actions.cancel}
              </Button>
            )}
          </div>
        </form>

        <div className="rounded-[1.15rem] border border-line bg-paper p-6 shadow-card">
          <h2 className="text-lg font-semibold text-ink">{so.admin.existing}</h2>
          <ul className="mt-5 divide-y divide-line">
            {categories.map((category) => (
              <li key={category._id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-ink">{category.name}</p>
                  <p className="text-sm text-muted">{category.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(category)}>
                    {so.actions.edit}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setDeactivateId(category._id)}
                  >
                    {so.admin.deactivate}
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
        title={so.admin.confirmDeactivate}
        confirmLabel={so.admin.deactivate}
        cancelLabel="Ka noqo"
      />
    </Container>
  );
}
