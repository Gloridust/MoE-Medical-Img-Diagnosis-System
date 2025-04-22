import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Head from 'next/head';
import { useEffect } from 'react';

// 创建MUI主题 - 更精致的扁平化设计
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
      light: '#757de8',
      dark: '#002984',
    },
    secondary: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
    },
    background: {
      default: '#f9fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
    },
    error: {
      main: '#e53935',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.07)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minWidth: 100,
          fontWeight: 500,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 1.5,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  // 处理iOS WebApp相关逻辑
  useEffect(() => {
    // 检测是否为iOS设备
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !((window as unknown) as { MSStream: unknown }).MSStream;
    
    // 检测是否为WebApp模式（添加到主屏幕）
    const navigatorWithStandalone = (window.navigator as unknown) as { standalone?: boolean };
    const isInStandaloneMode = 'standalone' in window.navigator && navigatorWithStandalone.standalone;
    
    if (isIOS) {
      // iOS特定的样式调整
      document.body.classList.add('ios-device');
      
      // 如果是WebApp模式，添加相应的类
      if (isInStandaloneMode) {
        document.body.classList.add('ios-standalone');
        
        // 修复iOS 15及以上版本中的滚动问题
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';
        document.body.style.position = 'relative';
        document.body.style.overflowY = 'auto';
        
        // 添加WebKit特定样式通过CSS类而不是直接操作style
        const style = document.createElement('style');
        style.innerHTML = `
          body.ios-standalone {
            -webkit-overflow-scrolling: touch;
          }
        `;
        document.head.appendChild(style);
        
        // 阻止页面上的链接打开Safari
        document.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          const linkElement = target.closest('a');
          
          if (linkElement && linkElement.getAttribute('target') === '_blank') {
            e.preventDefault();
            window.location.href = linkElement.getAttribute('href') || '';
          }
        });
      } else {
        // 如果不是WebApp模式，可以提示用户添加到主屏幕
        // 这里可以添加一个引导组件
      }
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <title>医学影像诊断平台</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app-container">
          <Component {...pageProps} />
        </div>
      </ThemeProvider>
    </>
  );
}
