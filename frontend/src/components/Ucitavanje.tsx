import styles from './Ucitavanje.module.css';

/**
 * Tri tačke koje poskakuju — ide uz tekst u dugmetu ili u redu teksta
 * („Šaljem•••"). Nasleđuje boju od roditelja, pa radi i na tamnom dugmetu.
 */
export function Tackice({ className = '' }: { className?: string }) {
    return (
        <span className={`${styles.tackice} ${className}`} aria-hidden="true">
            <span className={styles.tacka} />
            <span className={styles.tacka} />
            <span className={styles.tacka} />
        </span>
    );
}

/** Pero koje kruži — rukom povučen luk, za blokove koji se učitavaju. */
export function Spinner({ size = 28 }: { size?: number }) {
    return (
        <svg
            className={styles.spinner}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9.3" stroke="currentColor" strokeWidth="2.2" opacity=".18" />
            <path
                d="M12 2.7 C 17.1 2.8, 21.2 6.9, 21.3 12"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
            />
        </svg>
    );
}

/**
 * Natpis dugmeta koje nešto šalje — dok traje, vide se samo tačkice.
 *
 * `children` (normalan natpis) ostaje u toku, providan, da dugme ne bi
 * poskočilo na širinu tri tačke; `opis` čuje samo čitač ekrana.
 */
export function NatpisDugmeta({ uToku, opis, children }: {
    uToku: boolean;
    opis: string;
    children: React.ReactNode;
}) {
    if (!uToku) return <>{children}</>;
    return (
        <span className={styles.natpisOmot} role="status" aria-live="polite">
            <span className={styles.natpisSkriven} aria-hidden="true">{children}</span>
            <Tackice className={styles.natpisPreko} />
            <span className={styles.samoZaCitac}>{opis}</span>
        </span>
    );
}

/**
 * Blok „radi se na tome" — samo spinner, za prazne stranice i sekcije koje još
 * nemaju podatke. Za sitna mesta u redu teksta koristiti `Tackice`.
 */
export default function Ucitavanje({ tekst = 'učitavam', size = 28 }: { tekst?: string; size?: number }) {
    return (
        <div className={styles.blok} role="status" aria-live="polite">
            <Spinner size={size} />
            <span className={styles.samoZaCitac}>{tekst}</span>
        </div>
    );
}
