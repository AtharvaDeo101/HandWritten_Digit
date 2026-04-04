import type React from "react"
import type { Metadata } from "next"
import { Syne, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Digit Vision",
  description: "Handwritten Digit prediction",
  icons: {
    icon: [
      {
        url: "/7.png",
        sizes: "32x32",                    // ← This helps browsers display it bigger
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/7.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/7.png",
        sizes: "48x48",                    
        type: "image/png",
      },
    ],
    apple: "/apple-icon.png",
  },
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${inter.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
