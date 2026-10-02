/**
 * Site Configuration & Customization
 * Edit this file to change the site name, logo, favicon, SEO meta, or URLs.
 * Static assets are located in the /public directory.
 */
export const siteConfig = {
    // ── Brand Identity ────────────────────────────────────────────────────────
    name: 'YTSaver',
    shortName: 'YTSaver',
    tagline: 'High Quality YouTube Video & MP3 Downloader',
    url: 'https://viedown.com',
    domain: 'viedown.com',

    // ── Brand Assets (located in /public directory) ───────────────────────────
    logo: '/logo.svg',           // Full logo with icon + text
    icon: '/icon.svg',           // App / PWA square icon
    favicon: '/favicon.svg',     // Browser tab favicon
    ogImage: '/og-image.svg',     // 1200x630 Social sharing image

    // ── SEO & Agent Crawling Meta ─────────────────────────────────────────────
    title: 'YTSaver — Free YouTube Video Downloader (MP4 & MP3)',
    description:
        'Fast, free, and secure YouTube video downloader. Save high-definition MP4 videos (720p/1080p) or extract crystal-clear MP3 audio directly. No sign-up, zero server storage.',
    keywords: [
        'youtube video downloader',
        'download youtube video',
        'youtube to mp4',
        'youtube to mp3',
        'youtube audio downloader',
        'free video downloader',
        'online video converter',
        'youtube shorts downloader',
        'high quality video download',
        'fast youtube downloader',
        'ytsaver',
        'viedown'
    ],
    author: 'YTSaver',
    themeColor: '#0F1117',
    accentColor: '#FF0033',

    // ── Social & Repository Links ─────────────────────────────────────────────
    links: {
        github: 'https://github.com',
        twitter: 'https://twitter.com',
    },

    // ── Nav items ─────────────────────────────────────────────────────────────
    nav: [
        { label: 'How it works', href: '#how' },
        { label: 'Features', href: '#features' },
        { label: 'FAQ', href: '#faq' },
    ],
};
