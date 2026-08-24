import { useState } from 'react';
import { api } from '../services/api';
import { useI18n } from '../context/LanguageContext';
import { getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Alert from '../components/ui/Alert';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';

export default function Contact() {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  usePageTitle(t.meta.contact);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.contact.send(form);
      setSuccess(t.contact.success);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <PageHeader title={t.contact.title} description={t.contact.body} />

        <form
          onSubmit={handleSubmit}
          className="space-y-5 surface p-6 sm:p-8"
        >
          <Input
            id="name"
            name="name"
            label={t.contact.name}
            required
            value={form.name}
            onChange={handleChange}
          />
          <Input
            id="email"
            name="email"
            type="email"
            label={t.contact.email}
            required
            value={form.email}
            onChange={handleChange}
          />
          <Input
            id="subject"
            name="subject"
            label={t.contact.subject}
            required
            value={form.subject}
            onChange={handleChange}
            placeholder={t.contact.subjectHint}
          />
          <Textarea
            id="message"
            name="message"
            label={t.contact.message}
            required
            rows={7}
            value={form.message}
            onChange={handleChange}
            placeholder={t.contact.messageHint}
          />

          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <Button type="submit" className="w-full" loading={loading} size="lg">
            {loading ? t.contact.sending : t.contact.send}
          </Button>
          <p className="text-center text-sm text-muted">{t.contact.note}</p>
        </form>
      </div>
    </Container>
  );
}
