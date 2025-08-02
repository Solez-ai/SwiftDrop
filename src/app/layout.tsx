import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwiftDrop",
  description: "Fast, secure file sharing without internet",
  manifest: "/manifest.json",
  themeColor: "#0F172A",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0F172A" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-inter antialiased">
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  );
}
