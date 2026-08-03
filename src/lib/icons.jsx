// Shared inline SVG icons. All accept props spread onto the <svg> element,
// defaulting to stroke-based (feather-style) icons.
export function Svg({ children, fill = 'none', stroke = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            {children}
        </svg>
    );
}

export const IconPlay = (p) => (
    <Svg fill="currentColor" stroke="none" {...p}>
        <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.9l11.2-6.86a1.05 1.05 0 0 0 0-1.8L9.56 4.24A1.05 1.05 0 0 0 8 5.14z" />
    </Svg>
);

export const IconGithub = (p) => (
    <Svg fill="currentColor" stroke="none" {...p}>
        <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.34 9.34 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.25 10.25 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
    </Svg>
);

export const IconLink = (p) => (
    <Svg {...p}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
);

export const IconSearch = (p) => (
    <Svg {...p}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </Svg>
);

export const IconInfo = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </Svg>
);

export const IconFilm = (p) => (
    <Svg {...p}>
        <rect x="2" y="4" width="20" height="16" rx="2.5" />
        <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
    </Svg>
);

export const IconMusic = (p) => (
    <Svg {...p}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </Svg>
);

export const IconDownload = (p) => (
    <Svg {...p}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </Svg>
);

export const IconEye = (p) => (
    <Svg {...p}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </Svg>
);

export const IconBolt = (p) => (
    <Svg fill="currentColor" stroke="none" {...p}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Svg>
);

export const IconShield = (p) => (
    <Svg {...p}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
);

export const IconStar = (p) => (
    <Svg {...p}>
        <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />
    </Svg>
);

export const IconChevron = (p) => (
    <Svg {...p}>
        <polyline points="6 9 12 15 18 9" />
    </Svg>
);

export const IconCheck = (p) => (
    <Svg {...p}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </Svg>
);

export const IconX = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6" />
        <path d="M9 9l6 6" />
    </Svg>
);
