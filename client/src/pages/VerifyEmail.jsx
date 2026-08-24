import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { so } from '../i18n/so';
import { getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import AuthCard from '../components/ui/AuthCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  usePageTitle('Xaqiiji email-ka — Baafiye');

  const handleVerify = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.auth.verify({ email, code });
      setSuccess(so.auth.verifySuccess);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);

    try {
      await api.auth.resendVerification({ email });
      setSuccess(so.auth.resendSuccess);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard title={so.auth.verifyTitle} description={so.auth.verifyBody}>
      <form onSubmit={handleVerify} className="space-y-4">
        <Input
          id="email"
          type="email"
          label={so.auth.email}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          label={so.auth.code}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={so.auth.codeHint}
        />

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <Button type="submit" className="w-full" loading={loading} size="lg">
          {loading ? so.auth.verifying : so.auth.verifyAction}
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || !email}
          className="font-semibold text-forest disabled:opacity-60"
        >
          {resending ? so.auth.resending : so.auth.resend}
        </button>
        <Link to="/login" className="text-muted hover:text-forest">
          {so.auth.backLogin}
        </Link>
      </div>
    </AuthCard>
  );
}
