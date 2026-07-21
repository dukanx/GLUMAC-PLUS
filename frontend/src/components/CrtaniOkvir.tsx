import { motion } from 'motion/react';

interface Props {
    /** Boja okvira (CSS vrednost). */
    boja?: string;
    /** Debljina poteza u px (ne skalira se sa karticom). */
    debljina?: number;
    /** Trajanje crtanja u sekundama. */
    trajanje?: number;
    /** Kašnjenje pre crtanja. */
    kasnjenje?: number;
}

/**
 * Rukom crtan okvir koji se "iscrtava" kad kartica uđe u vidno polje.
 * Apsolutno prekriva roditelja (roditelj mora biti position:relative) i
 * koristi non-scaling-stroke da potez ostane ravnomeran na bilo kojoj veličini.
 */
export default function CrtaniOkvir({
    boja = 'var(--ink)',
    debljina = 2,
    trajanje = 0.9,
    kasnjenje = 0,
}: Props) {
    return (
        <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
        >
            <motion.path
                // Blago "neravan" pravougaonik — deluje kao rukom povučen okvir.
                d="M3 9 C 3 5, 6 3, 10 3 C 37 2, 63 4, 90 3 C 94 3, 97 5, 97 9 C 98 37, 96 63, 97 91 C 97 95, 94 97, 90 97 C 63 98, 37 96, 10 97 C 6 97, 3 95, 3 91 C 2 63, 4 37, 3 9 Z"
                fill="none"
                stroke={boja}
                strokeWidth={debljina}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                    pathLength: { duration: trajanje, delay: kasnjenje, ease: [0.4, 0, 0.2, 1] },
                    opacity: { duration: 0.2, delay: kasnjenje },
                }}
            />
        </svg>
    );
}
