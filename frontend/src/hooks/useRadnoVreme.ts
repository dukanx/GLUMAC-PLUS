import { useState, useEffect, useMemo } from 'react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export type DanKljuc =
    | 'PONEDELJAK' | 'UTORAK' | 'SREDA' | 'CETVRTAK' | 'PETAK' | 'SUBOTA' | 'NEDELJA';

interface RadnoVremeInterval {
    dan: DanKljuc;
    odVremena: string;
    doVremena: string;
}

export interface RadniDan {
    dan: DanKljuc;
    skracenica: string;
    vreme: string | null;
}

const DAN_SKRACENICA: Record<DanKljuc, string> = {
    PONEDELJAK: 'Pon', UTORAK: 'Uto', SREDA: 'Sre',
    CETVRTAK: 'Čet', PETAK: 'Pet', SUBOTA: 'Sub', NEDELJA: 'Ned',
};

const REDOSLED_DANA: DanKljuc[] = [
    'PONEDELJAK', 'UTORAK', 'SREDA', 'CETVRTAK', 'PETAK', 'SUBOTA', 'NEDELJA',
];

const DANASNJI_DAN: Record<number, DanKljuc> = {
    0: 'NEDELJA', 1: 'PONEDELJAK', 2: 'UTORAK', 3: 'SREDA',
    4: 'CETVRTAK', 5: 'PETAK', 6: 'SUBOTA',
};

/**
 * Dohvata aktivno radno vreme sa backenda i vraća uredan 7-dnevni raspored,
 * današnji dan i loading stanje. Deljeno između MeniPage i HomePage.
 */
export function useRadnoVreme() {
    const [data, setData] = useState<RadnoVremeInterval[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/api/radno-vreme?aktivno=true`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then((d: RadnoVremeInterval[]) => { setData(d); setLoading(false); })
            .catch(() => { setData([]); setLoading(false); });
    }, []);

    const raspored = useMemo<RadniDan[]>(() =>
        REDOSLED_DANA.map(dan => {
            const intervali = data.filter(i => i.dan === dan);
            return {
                dan,
                skracenica: DAN_SKRACENICA[dan],
                vreme: intervali.length
                    ? intervali.map(i => `${i.odVremena.slice(0, 5)}–${i.doVremena.slice(0, 5)}`).join(', ')
                    : null,
            };
        }),
        [data]
    );

    const danasKljuc = DANASNJI_DAN[new Date().getDay()];
    const danas = raspored.find(r => r.dan === danasKljuc);

    return { raspored, danas, danasKljuc, loading, imaPodataka: data.length > 0 };
}
