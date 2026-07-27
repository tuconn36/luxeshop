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
    console.error('[ErrorBoundary]', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      // Nếu có fallback component được truyền vào, hiển thị nó thay vì error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || this.state.error?.toString() || 'Unknown error';
      const errorStack = this.state.error?.stack || '';

      // Trích xuất thông tin quan trọng từ error
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch');
      const isDbError = errorMessage.includes('client') || errorMessage.includes('database') || errorMessage.includes('connection');

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-600">Đã có lỗi xảy ra</h2>
                <p className="text-sm text-gray-500">Vui lòng thử tải lại trang</p>
              </div>
            </div>

            {isNetworkError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Lỗi kết nối mạng:</strong> Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet của bạn.
                </p>
              </div>
            )}

            {isDbError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Lỗi database:</strong> Server đang gặp sự cố. Vui lòng thử lại sau vài phút.
                </p>
              </div>
            )}

            <details className="group">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Chi tiết lỗi (click để xem)
              </summary>
              <pre className="mt-2 text-xs bg-red-50 text-red-800 p-3 rounded-lg overflow-auto max-h-48">
                {errorMessage}
                {errorStack && `\n\n${errorStack}`}
              </pre>
            </details>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 text-sm font-semibold bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
              >
                Tải lại trang
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, info: null })}
                className="px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}