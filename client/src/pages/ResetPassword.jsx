import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useI18n } from '../context/LanguageContext';
import { getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import AuthCard from '../components/ui/AuthCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

export default function ResetPassword() {
  const { t } = useI18n();
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  usePageTitle(t.meta.reset);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError(t.auth.tooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.mismatch);
      return;
    }

    setLoading(true);

    try {
      await api.auth.resetPassword({
        token,
        newPassword: password,
      });
      setSuccess(t.auth.resetSuccess);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title={t.auth.resetTitle} description={t.auth.resetBody}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="password"
          type="password"
          label={t.auth.newPassword}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          id="confirmPassword"
          type="password"
          label={t.auth.confirmPassword}
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <Button type="submit" className="w-full" loading={loading} size="lg">
          {loading ? t.auth.resetting : t.auth.resetAction}
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
