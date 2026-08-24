import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { so } from '../i18n/so';
import { getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import AuthCard from '../components/ui/AuthCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  usePageTitle('Isdiiwaangeli — Baafiye');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await register(form);
      navigate(`/verify-email?email=${encodeURIComponent(data.email || form.email)}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title={so.auth.registerTitle} description={so.auth.registerBody}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          name="name"
          label={so.auth.name}
          required
          value={form.name}
          onChange={handleChange}
        />
        <Input
          id="email"
          name="email"
          type="email"
          label={so.auth.email}
          required
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
        <Input
          id="phone"
          name="phone"
          type="tel"
          label={so.auth.phone}
          required
          value={form.phone}
          onChange={handleChange}
          placeholder="+252 61 000 0000"
        />
        <Input
          id="password"
          name="password"
          type="password"
          label={so.auth.password}
          required
          minLength={6}
          value={form.password}
          onChange={handleChange}
          hint={so.auth.tooShort}
        />

        {error && <Alert type="error">{error}</Alert>}

        <Button type="submit" className="w-full" loading={loading} size="lg">
          {loading ? so.auth.registering : so.auth.registerAction}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        {so.auth.hasAccount}{' '}
        <Link to="/login" className="font-semibold text-forest hover:underline">
          {so.nav.login}
        </Link>
      </p>
    </AuthCard>
  );
}
