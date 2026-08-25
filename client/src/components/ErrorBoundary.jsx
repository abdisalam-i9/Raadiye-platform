import { Component } from 'react';
import { getT } from '../i18n';
import Button from './ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Raadiye UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const t = getT();
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
          <h1 className="font-display text-3xl text-ink">{t.errorBoundary.title}</h1>
          <p className="mt-3 text-ink-soft">{t.errors.generic}</p>
          <Button type="button" className="mt-6" onClick={() => window.location.reload()}>
            {t.errorBoundary.retry}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
