import { useState } from 'react';
import { api } from '../services/api';
import { so } from '../i18n/so';
import { getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Alert from '../components/ui/Alert';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  usePageTitle('Nala soo xiriir — Baafiye');

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
      setSuccess(so.contact.success);
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
        <PageHeader title={so.contact.title} description={so.contact.body} />

        <form
          onSubmit={handleSubmit}
          className="space-y-5 surface p-6 sm:p-8"
        >
          <Input
            id="name"
            name="name"
            label={so.contact.name}
            required
            value={form.name}
            onChange={handleChange}
          />
          <Input
            id="email"
            name="email"
            type="email"
            label={so.contact.email}
            required
            value={form.email}
            onChange={handleChange}
          />
          <Input
            id="subject"
            name="subject"
            label={so.contact.subject}
            required
            value={form.subject}
            onChange={handleChange}
            placeholder={so.contact.subjectHint}
          />
          <Textarea
            id="message"
            name="message"
            label={so.contact.message}
            required
            rows={7}
            value={form.message}
            onChange={handleChange}
            placeholder={so.contact.messageHint}
          />

          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <Button type="submit" className="w-full" loading={loading} size="lg">
            {loading ? so.contact.sending : so.contact.send}
          </Button>
          <p className="text-center text-sm text-muted">{so.contact.note}</p>
        </form>
      </div>
    </Container>
  );
}
