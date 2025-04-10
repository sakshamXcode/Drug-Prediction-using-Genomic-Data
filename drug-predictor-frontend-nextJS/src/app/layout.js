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

export const metadata = {
  title: "Drug Prediction App",
  description: "A beautiful dynamic Next.js UI",
  icons: {
    icon: [
      {
        url: "https://i0.wp.com/www.sciencenews.org/wp-content/uploads/2024/08/082424_til_cover.jpg",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-[#1c1c1e] via-[#2c2c2e] to-[#1c1c1e] text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
