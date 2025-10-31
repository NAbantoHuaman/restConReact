import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: any, _info: any) {
    
    
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <h2 className="text-xl font-bold mb-2">Ha ocurrido un error</h2>
          <p className="text-sm">Intenta recargar la página o vuelve más tarde.</p>
        </div>
      );
    }

    return this.props.children;
  }
}