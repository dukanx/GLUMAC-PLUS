import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Porudzbina } from '../types/porudzbina';
import * as porudzbineApi from '../api/porudzbine';
import { ApiError } from '../api/client';

// Aktivnu porudžbinu dele floating dugme, popover praćenja i strana Porudžbine:
// kontekst drži id, poslednje stanje sa servera i preostale minute do procene.
interface AktivnaPorudzbinaCtx {
    aktivnaId: number | null;
    porudzbina: Porudzbina | null;
    /** Preostali minuti do procene (null dok kuhinja ne prihvati). */
    preostaloMin: number | null;
    pracenjeOtvoreno: boolean;
    otvoriPracenje: () => void;
    zatvoriPracenje: () => void;
    /** Poziva se posle kreiranja porudžbine — pamti id i odmah otvara praćenje. */
    postaviAktivnu: (id: number) => void;
    resetuj: () => void;
}

const AktivnaPorudzbinaContext = createContext<AktivnaPorudzbinaCtx>(null!);

const LS_KLJUC = 'aktivna_porudzbina_id';
const LS_START = 'aktivna_porudzbina_start';

export function AktivnaPorudzbinaProvider({ children }: { children: ReactNode }) {
    const [aktivnaId, setAktivnaId] = useState<number | null>(() => {
        const stored = localStorage.getItem(LS_KLJUC);
        const n = stored ? Number(stored) : NaN;
        return Number.isInteger(n) ? n : null;
    });
    const [porudzbina, setPorudzbina] = useState<Porudzbina | null>(null);
    const [preostaloMin, setPreostaloMin] = useState<number | null>(null);
    const [pracenjeOtvoreno, setPracenjeOtvoreno] = useState(false);
    const prethodniStatus = useRef<string | null>(null);
    const autoZatvaranje = useRef<number | null>(null);

    const zavrsena = porudzbina?.status === 'REALIZOVANA' || porudzbina?.status === 'OTKAZANA';

    // Polling statusa dok postoji aktivna porudžbina
    useEffect(() => {
        if (aktivnaId === null) return;

        const osvezi = async () => {
            try {
                const data = await porudzbineApi.getJedan(aktivnaId);
                setPorudzbina(data);

                // Momenat prihvatanja (pojava procenjenog vremena) — od njega teče odbrojavanje
                if (data.procenjenoVreme != null && !localStorage.getItem(LS_START)) {
                    localStorage.setItem(LS_START, String(Date.now()));
                }

                // Kad postane spremna — popover se sam otvori na 5s
                if (data.status === 'REALIZOVANA' && prethodniStatus.current === 'SPREMNA') {
                    setPracenjeOtvoreno(true);
                    autoZatvaranje.current = window.setTimeout(
                        () => setPracenjeOtvoreno(false), 5000
                    );
                }
                prethodniStatus.current = data.status;
            } catch (e) {
                // HTTP greške tokom polling-a ignorišemo; porudžbina koje nema resetujemo.
                if (e instanceof ApiError && e.status === 404) resetuj();
            }
        };

        osvezi();
        const interval = setInterval(osvezi, 8000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aktivnaId]);

    // Preostali minuti — osvežavaju se sami (na svaki tick i na novu procenu)
    useEffect(() => {
        if (porudzbina?.procenjenoVreme == null || zavrsena) {
            setPreostaloMin(null);
            return;
        }
        const izracunaj = () => {
            const start = Number(localStorage.getItem(LS_START)) || Date.now();
            const protekloMin = (Date.now() - start) / 60000;
            setPreostaloMin(Math.ceil(porudzbina.procenjenoVreme! - protekloMin));
        };
        izracunaj();
        const tick = setInterval(izracunaj, 20000);
        return () => clearInterval(tick);
    }, [porudzbina?.procenjenoVreme, zavrsena]);

    useEffect(() => () => {
        if (autoZatvaranje.current) clearTimeout(autoZatvaranje.current);
    }, []);

    const resetuj = () => {
        localStorage.removeItem(LS_KLJUC);
        localStorage.removeItem(LS_START);
        setAktivnaId(null);
        setPorudzbina(null);
        setPreostaloMin(null);
        setPracenjeOtvoreno(false);
        prethodniStatus.current = null;
    };

    return (
        <AktivnaPorudzbinaContext.Provider value={{
            aktivnaId,
            porudzbina,
            preostaloMin,
            pracenjeOtvoreno,
            otvoriPracenje: () => setPracenjeOtvoreno(true),
            zatvoriPracenje: () => {
                setPracenjeOtvoreno(false);
                // Završenu porudžbinu zatvaranje praćenja ujedno i briše
                if (zavrsena) resetuj();
            },
            postaviAktivnu: (id) => {
                localStorage.removeItem(LS_START);
                localStorage.setItem(LS_KLJUC, String(id));
                setAktivnaId(id);
                setPorudzbina(null);
                prethodniStatus.current = null;
                setPracenjeOtvoreno(true);
            },
            resetuj,
        }}>
            {children}
        </AktivnaPorudzbinaContext.Provider>
    );
}

export const useAktivnaPorudzbina = () => useContext(AktivnaPorudzbinaContext);
