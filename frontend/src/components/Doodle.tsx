// Doodle ikonice — ručno crtani SVG stroke path-ovi iz dizajn paketa (rukopisni stil).
// Ne koristiti ikonice iz biblioteka; path-ovi su namerno neravni.
import type { SVGProps } from 'react';

interface IkonaProps extends SVGProps<SVGSVGElement> {
    size?: number;
}

function svgProps({ size = 20, ...rest }: IkonaProps, strokeWidth = 2.2) {
    return {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        ...rest,
    };
}

export function Srce(props: IkonaProps) {
    return (
        <svg {...svgProps(props)}>
            <path d="M12 20 C 8 16, 3 13, 3 8.5 C 3 5.5, 5.5 3.5, 8 4 C 9.8 4.4, 11 5.8, 12 7 C 13 5.8, 14.2 4.4, 16 4 C 18.5 3.5, 21 5.5, 21 8.5 C 21 13, 16 16, 12 20 Z" />
        </svg>
    );
}

export function Korpa(props: IkonaProps) {
    return (
        <svg {...svgProps(props, 2)}>
            <path d="M4 7 C 9 6, 15 8, 20 6.5 L 18.5 18 C 13.5 19.5, 9.5 18, 5.5 18.5 Z" />
            <path d="M9 7 C 9 4.5, 10 3, 12 3 C 14 3, 15 4.5, 15 7" />
        </svg>
    );
}

export function Klose(props: IkonaProps) {
    return (
        <svg {...svgProps(props)}>
            <path d="M4 15 C 4 10, 8 6.5, 12 6.5 C 16 6.5, 20 10, 20 15" />
            <path d="M2.5 15 L 21.5 15" />
            <path d="M12 6.5 L 12 4.5" />
        </svg>
    );
}

export function Profil(props: IkonaProps) {
    return (
        <svg {...svgProps(props)}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20 C 5 15.5, 8.5 14, 12 14 C 15.5 14, 19 15.5, 20 20" />
        </svg>
    );
}

export function Odjava(props: IkonaProps) {
    return (
        <svg {...svgProps(props)}>
            <path d="M9 4 L 15.5 4 M 9 20 L 15.5 20 M 9 4 C 6 4, 4 6, 4 12 C 4 18, 6 20, 9 20 M 14 12 L 21 12 M 18 8.5 L 21.5 12 L 18 15.5" />
        </svg>
    );
}

export function Zvezda(props: IkonaProps) {
    return (
        <svg {...svgProps(props)}>
            <path d="M12 3 L 14.5 8.5 L 20.5 9 L 16 13 L 17.5 19 L 12 15.8 L 6.5 19 L 8 13 L 3.5 9 L 9.5 8.5 Z" />
        </svg>
    );
}

export function ZvezdaPuna({ size = 20, ...rest }: IkonaProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" {...rest}>
            <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
        </svg>
    );
}

export function Zvono(props: IkonaProps) {
    return (
        <svg {...svgProps(props)}>
            <path d="M18 8 A 6 6 0 0 0 6 8 c 0 7 -3 9 -3 9 h 18 s -3 -2 -3 -9" />
            <path d="M13.7 21 a 2 2 0 0 1 -3.4 0" />
        </svg>
    );
}

export function Sat(props: IkonaProps) {
    return (
        <svg {...svgProps(props)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7 L 12 12 L 15.5 14" />
        </svg>
    );
}

export function Lupa(props: IkonaProps) {
    return (
        <svg {...svgProps(props)}>
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M16 16 L 21 21" />
        </svg>
    );
}

export function Refresh(props: IkonaProps) {
    return (
        <svg {...svgProps(props)}>
            <path d="M21 12 a 9 9 0 1 1 -3 -6.7" />
            <path d="M21 3 v 5 h -5" />
        </svg>
    );
}

export function Kanta(props: IkonaProps) {
    return (
        <svg {...svgProps(props, 2)}>
            <path d="M5 7 C 10 6.5, 14 6.5, 19 7 M 9 7 L 9.4 4.6 L 14.6 4.5 L 15 7 M 7 7 C 6.8 12, 7 16, 7.5 20 C 11.5 20.6, 12.5 20.6, 16.5 20 C 17 16, 17.2 12, 17 7" />
            <path d="M10.5 11 L 10.7 16.5 M 13.5 11 L 13.3 16.5" />
        </svg>
    );
}

export function Katanac(props: IkonaProps) {
    return (
        <svg {...svgProps(props)}>
            <path d="M7 11 C 6 11.2, 5.6 11.8, 5.7 12.8 L 5.9 18.8 C 6 19.8, 6.6 20.4, 7.6 20.3 L 16.4 20.5 C 17.4 20.4, 18.1 19.8, 18.1 18.8 L 18.3 12.6 C 18.3 11.6, 17.6 11, 16.6 11.1 Z" />
            <path d="M8.6 11 C 8.4 8.2, 9.2 5.6, 12 5.5 C 14.9 5.4, 15.6 7.9, 15.4 10.9" />
        </svg>
    );
}

export function ChevronDole({ size = 14, ...rest }: IkonaProps) {
    return (
        <svg width={size} height={size * 10 / 14} viewBox="0 0 14 10" fill="none"
            stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" {...rest}>
            <path d="M2 2.5 C 4 5, 6 7.5, 7 7.5 C 8 7.5, 10 5, 12 2.5" />
        </svg>
    );
}

/** Tri talasaste linije — mobilni hamburger. */
export function Hamburger({ size = 30, ...rest }: IkonaProps) {
    return (
        <svg width={size} height={size * 24 / 30} viewBox="0 0 30 24" fill="none" {...rest}>
            <path d="M2 4 C 10 3, 20 5, 28 3.5 M3 12 C 11 11, 19 13, 27 11.5 M2 20 C 10 19, 20 21, 28 19.5"
                stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
    );
}

// Ključ — "prijavi se" (uđi na nalog)
export function Kljuc(props: IkonaProps) {
    return (
        <svg {...svgProps(props)}>
            <circle cx="8" cy="8" r="4.2" />
            <path d="M11 11 L 20 20 M 17 17 L 15 19 M 20 20 L 18 22" />
        </svg>
    );
}

// Osoba sa plusom — "napravi / kreiraj nalog"
export function NalogPlus(props: IkonaProps) {
    return (
        <svg {...svgProps(props)}>
            <circle cx="10" cy="8" r="3.8" />
            <path d="M3 20 C 4 15.5, 7 14, 10 14 C 12 14, 13.5 14.5, 14.5 15.5" />
            <path d="M18 15 L 18 22 M 14.5 18.5 L 21.5 18.5" />
        </svg>
    );
}

// Tanjir sa priborom — "poruči" (jelo)
export function Tanjir(props: IkonaProps) {
    return (
        <svg {...svgProps(props, 2)}>
            <circle cx="13" cy="12" r="7.5" />
            <circle cx="13" cy="12" r="3.6" />
            <path d="M3.5 4.5 L 3.5 11 M 6 4.5 L 6 11 M 4.75 4.5 L 4.75 20" />
        </svg>
    );
}

// Kesa za poneti — "poruči odmah"
export function Kesa(props: IkonaProps) {
    return (
        <svg {...svgProps(props, 2)}>
            <path d="M6 9 L 18 9 L 16.8 21 C 12 21.8, 8.5 21.5, 7.2 21 Z" />
            <path d="M6 9 L 7.6 4.6 C 11 3.9, 14 4, 16.4 4.6 L 18 9" />
            <path d="M10 9 C 10 6.3, 14 6.3, 14 9" />
        </svg>
    );
}
