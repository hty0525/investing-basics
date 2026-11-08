import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import { SITE_NAME, SITE_ORIGIN, DESCRIPTION, abs, BASE_PATH } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: SITE_NAME, template: `%s | 투자 기초` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: 'hty0525', url: 'https://github.com/hty0525' }],
  alternates: { canonical: abs('/') },
  openGraph: { type: 'website', locale: 'ko_KR', siteName: SITE_NAME, url: abs('/'), title: SITE_NAME, description: DESCRIPTION, images: [{ url: abs('/og.png'), width: 1200, height: 630, alt: SITE_NAME }] },
  twitter: { card: 'summary_large_image', title: SITE_NAME, description: DESCRIPTION, images: [abs('/og.png')] },
  verification: { google: 'VZJWcFwlGj60N-rx-pR-oKuz_Mf6X_u41o7Q6F_Ec0o' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  icons: { icon: `${BASE_PATH}/icon.svg` },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0f1420', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-mode="visual" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: "try{var m=localStorage.getItem('ib-mode');document.documentElement.dataset.mode=(m==='easy'||m==='detail'||m==='visual')?m:'visual'}catch(e){}" }} /></head>
      <body>
        <a href="#main" className="sr">본문으로 건너뛰기</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
