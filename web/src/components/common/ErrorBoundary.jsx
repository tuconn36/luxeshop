import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-red-600 mb-2">Đã có lỗi xảy ra</h2>
            <p className="text-sm text-gray-600 mb-3">
              Một component trong trang này bị lỗi. Vui lòng mở DevTools → Console
              để xem chi tiết hoặc thử refresh.
            </p>
            <pre className="text-xs bg-red-50 text-red-800 p-3 rounded-lg overflow-auto max-h-48">
              {String(this.state.error?.stack || this.state.error || 'Unknown error')}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null, info: null })}
              className="mt-4 px-4 py-2 text-sm font-semibold bg-black text-white rounded-full hover:bg-gray-800"
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}