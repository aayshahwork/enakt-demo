import type { Metadata } from "next"
import localFont from "next/font/local"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const display = localFont({
  src: [
    { path: "./fonts/Archivo.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Archivo.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Archivo.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Archivo.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-display",
})

const body = localFont({
  src: [
    { path: "./fonts/HankenGrotesk.woff2", weight: "400", style: "normal" },
    { path: "./fonts/HankenGrotesk.woff2", weight: "500", style: "normal" },
    { path: "./fonts/HankenGrotesk.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-body",
})

const mono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Enakt — Kestrel Ridge Capital",
  description: "Your first agent on real deal data in 30 days. Enakt runs in the firm's own cloud, maps the firm, scopes each agent to exactly what it needs, and enforces it at the source.",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} antialiased`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
