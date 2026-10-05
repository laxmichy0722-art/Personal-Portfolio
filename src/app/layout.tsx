import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig, socialLinks } from "@/data/site";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

/** `/` should render exactly the configured title, not "Site | Home". */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.seo.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.seo.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  /**
   * Supplied by the brief and kept in `site.ts` rather than inlined here, so the
   * admin SEO panel and the `keywords` meta tag cannot drift apart.
   */
  keywords: [...siteConfig.seo.keywords],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "portfolio",
};

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Person + WebSite structured data.
 *
 * Emitted once for the whole site. Page-level JSON-LD (BreadcrumbList,
 * CreativeWork on case studies) is added by the individual pages.
 */
const personJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.name,
      url: siteConfig.url,
      email: `mailto:${siteConfig.email}`,
      telephone: `+${siteConfig.phoneHref.replace(/^\+/, "")}`,
      jobTitle: siteConfig.role,
      description: siteConfig.seo.description,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.location.city,
        addressRegion: siteConfig.location.area,
        addressCountry: "NP",
      },
      knowsAbout: [
        "Graphic Design",
        "Brand Identity",
        "UI/UX Design",
        "Web Design",
        "Front-End Development",
        "Back-End Development",
        "E-Commerce Development",
        "Admin Dashboards",
        "Database Design",
      ],
      sameAs: socialLinks.map((social) => social.href),
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.seo.description,
      inLanguage: "en",
      publisher: { "@id": `${siteConfig.url}/#person` },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Required for Next 16 to keep restoring `scroll-behavior: smooth` across
      // client-side navigations — without it the CSS smooth scroll is dropped.
      data-scroll-behavior="smooth"
      // The site is dark-only by design; setting the class (rather than relying
      // on prefers-color-scheme) activates the shadcn `dark:` refinements for
      // every visitor. See the `@custom-variant` note in globals.css.
      className={`dark ${inter.variable} ${instrumentSerif.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-fg">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xs focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-foreground"
        >
          Skip to content
        </a>

        <Navbar />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <Footer />

        <Toaster />

        <script
          type="application/ld+json"
          // Static, author-controlled object — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}