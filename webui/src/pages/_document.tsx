import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="zh">
      <Head>
        {/* iOS WebApp 所需的 meta 标签 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="医学影像诊断" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3f51b5" />
        
        {/* iOS滚动相关 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        
        {/* 添加iOS图标 */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/public/icons/icon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/public/icons/icon.svg" />
        <link rel="apple-touch-icon" sizes="167x167" href="/public/icons/icon.svg" />
        
        {/* 启动屏幕 */}
        <link rel="apple-touch-startup-image" href="/icons/splash.png" />
        
        {/* manifest文件 */}
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
