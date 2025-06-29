import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('📍 Error details:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  public override render() {
    if (this.state.hasError) {
      // 自定义降级 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              游戏遇到错误
            </h2>
            <p className="text-gray-600 mb-6">
              抱歉，游戏遇到了一个意外错误。请刷新页面重试。
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🔄 刷新页面
              </button>
              
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  🔍 查看技术详情
                </summary>
                <div className="mt-2 p-4 bg-gray-100 rounded text-xs font-mono text-gray-700 max-h-40 overflow-auto">
                  <div className="mb-2">
                    <strong>错误信息:</strong>
                    <br />
                    {this.state.error?.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>组件堆栈:</strong>
                      <br />
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 简化的错误显示组件，用于内联错误处理
export const SimpleErrorDisplay: React.FC<{ error: Error | string }> = ({ error }) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <div className="flex items-center">
        <div className="text-red-500 mr-3">⚠️</div>
        <div>
          <h3 className="text-red-800 font-semibold">出现错误</h3>
          <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
        </div>
      </div>
    </div>
  );
}; 