import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "GOLDEN EVENT",
  description: "Beautiful gifts and decor for your special moments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    try {
      const cachedTheme = localStorage.getItem('golden_event_theme');
      if (cachedTheme && cachedTheme !== 'none') {
        document.documentElement.className += ' theme-' + cachedTheme;
      }
    } catch (e) {}
  `;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const cachedTheme = localStorage.getItem('golden_event_theme');
                if (cachedTheme && cachedTheme !== 'none') {
                  document.documentElement.className += ' theme-' + cachedTheme;
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <main className="flex-grow w-full">
          {children}
        </main>
      </body>
    </html>
  );
}