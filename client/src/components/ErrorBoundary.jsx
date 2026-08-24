import { Component } from 'react';
import { so } from '../i18n/so';
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
    console.error('Baafiye UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
          <h1 className="font-display text-3xl text-ink">{so.errors.generic.split('.')[0]}.</h1>
          <p className="mt-3 text-ink-soft">{so.errors.generic}</p>
          <Button type="button" className="mt-6" onClick={() => window.location.reload()}>
            Isku day mar kale
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
