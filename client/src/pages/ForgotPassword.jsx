import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useI18n } from '../context/LanguageContext';
import { getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import AuthCard from '../components/ui/AuthCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

export default function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  usePageTitle(t.meta.forgot);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.auth.forgotPassword({ email });
      setSuccess(t.auth.forgotSuccess);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title={t.auth.forgotTitle} description={t.auth.forgotBody}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          type="email"
          label={t.auth.email}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <Button type="submit" className="w-full" loading={loading} size="lg">
          {loading ? t.actions.submitting : t.auth.forgotAction}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="font-semibold text-forest hover:underline">
          {t.auth.backLogin}
        </Link>
      </p>
    </AuthCard>
  );
}
