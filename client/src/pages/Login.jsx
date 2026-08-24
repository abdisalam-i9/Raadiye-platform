import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/LanguageContext';
import { getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import AuthCard from '../components/ui/AuthCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

export default function Login() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  usePageTitle(t.meta.login);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNeedsVerification(false);
    setLoading(true);

    try {
      await login({ email, password });
      showToast(t.auth.loginSuccess);
      navigate(redirect);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      if (err.status === 403) {
        setNeedsVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title={t.auth.loginTitle} description={t.auth.loginBody}>
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
        <Input
          id="password"
          type="password"
          label={t.auth.password}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <Alert type="error">{error}</Alert>}

        {needsVerification && (
          <p className="text-sm text-ink-soft">
            {t.auth.needsVerify}{' '}
            <Link
              to={`/verify-email?email=${encodeURIComponent(email)}`}
              className="font-semibold text-forest hover:underline"
            >
              {t.auth.verifyNow}
            </Link>
          </p>
        )}

        <Button type="submit" className="w-full" loading={loading} size="lg">
          {loading ? t.auth.loggingIn : t.auth.loginAction}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link to="/forgot-password" className="font-semibold text-forest hover:underline">
          {t.auth.forgot}
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-muted">
        {t.auth.noAccount}{' '}
        <Link to="/register" className="font-semibold text-forest hover:underline">
          {t.nav.register}
        </Link>
      </p>
    </AuthCard>
  );
}
