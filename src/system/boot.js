import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      percentage: 0,
      reloading: false,
      width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    };
    this.percentageInterval = null;
    this.reloadTimeout = null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    if (this.percentageInterval) clearTimeout(this.percentageInterval);
    if (this.reloadTimeout) clearTimeout(this.reloadTimeout);
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidUpdate(_, prevState) {
    if (this.state.hasError && !prevState.hasError) {
      this.startPercentage();
    }
    if (this.state.percentage === 100 && !this.state.reloading) {
      this.setState({ reloading: true });
      this.reloadTimeout = setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }

  handleResize = () => {
    this.setState({ width: window.innerWidth });
  };

  startPercentage = () => {
    const update = () => {
      this.setState(prev => {
        let next = prev.percentage + Math.floor(Math.random() * 10);
        if (next > 100) next = 100;
        return { percentage: next };
      }, () => {
        if (this.state.percentage < 100) {
          this.percentageInterval = setTimeout(update, Math.random() * (1000 - 500) + 500);
        }
      });
    };
    update();
  };

  render() {
    if (this.state.hasError) {
      const isMobile = this.state.width < 600;
      return (
        <div style={{
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          background: 'linear-gradient(135deg, #000000ff 0%, rgb(51, 0, 255) 100%)',
          color: '#fff',
          minHeight: '100vh',
          minWidth: '100vw',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>

          <div style={{
            fontSize: isMobile ? 22 : 36,
            fontWeight: 600,
            marginBottom: isMobile ? 16 : 32,
            textAlign: 'center',
            letterSpacing: 1,
          }}>
            Так, что-то пошло не так
          </div>
          <div style={{
            fontSize: isMobile ? 15 : 22,
            fontWeight: 400,
            marginBottom: isMobile ? 12 : 24,
            textAlign: 'center',
            color: '#b3c6ff',
          }}>
            Ты столкнулся с критической ошибкой и перезагрузим страницу.<br/>
            <span style={{ color: '#fff', fontWeight: 700 }}>{this.state.percentage}% complete</span>
          </div>
          {this.state.percentage === 100 && (
            <div style={{ fontSize: isMobile ? 15 : 22, color: '#b3c6ff', marginBottom: 24 }}>
              Перезагрузка страницы...
            </div>
          )}
          <div style={{
            fontSize: isMobile ? 12 : 16,
            color: '#b3c6ff',
            margin: isMobile ? '10px 0' : '20px 0',
            maxWidth: 600,
            wordBreak: 'break-word',
            background: 'rgba(0,0,0,0.13)',
            borderRadius: 8,
            padding: isMobile ? 8 : 16,
          }}>
            {this.state.error && (
              <div style={{ marginBottom: 8 }}>
                <b>Ошибка:</b> {this.state.error.toString()}
              </div>
            )}
            {this.state.errorInfo && (
              <details style={{ whiteSpace: 'pre-wrap', color: '#b3c6ff', fontSize: isMobile ? 11 : 14 }}>
                {this.state.errorInfo.componentStack}
              </details>
            )}
          </div>
          <div style={{ fontSize: isMobile ? 12 : 16, color: '#b3c6ff', marginTop: isMobile ? 10 : 32 }}>
            Если ошибка повторяется, обратитесь в поддержку в тг @jpegweb 
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00
