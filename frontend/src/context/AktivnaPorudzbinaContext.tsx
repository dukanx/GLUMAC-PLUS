import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Porudzbina } from '../types/porudzbina';
import { useAuth } from './AuthContext';
import * as porudzbineApi from '../api/porudzbine';
import { ApiError } from '../api/client';

// Aktivnu porudžbinu dele floating dugme, popover praćenja i strana Porudžbine.
// Autoritativan izvor je backend (/api/porudzbine/aktivna) — vezan za ULOGOVANOG KUPCA.
// Gost i zaposleni/admin NEMAJU aktivnu porudžbinu (bugfix: ranije je localStorage
// prikazivao tuđu/staru porudžbinu svima na istom browseru).
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

const LS_START = 'aktivna_porudzbina_start';

export function AktivnaPorudzbinaProvider({ children }: { children: ReactNode }) {
    const { korisnik, token } = useAuth();
    // Samo običan kupac prati aktivnu porudžbinu.
    const jeKupac = !!korisnik && korisnik.uloga !== 'ADMIN' && korisnik.uloga !== 'ZAPOSLENI';

    const [aktivnaId, setAktivnaId] = useState<number | null>(null);
    const [porudzbina, setPorudzbina] = useState<Porudzbina | null>(null);
    const [preostaloMin, setPreostaloMin] = useState<number | null>(null);
    const [pracenjeOtvoreno, setPracenjeOtvoreno] = useState(false);
    const prethodniStatus = useRef<string | null>(null);
    const autoZatvaranje = useRef<number | null>(null);

    const zavrsena = porudzbina?.status === 'REALIZOVANA' || porudzbina?.status === 'OTKAZANA';

    const resetuj = () => {
        localStorage.removeItem(LS_START);
        setAktivnaId(null);
        setPorudzbina(null);
        setPreostaloMin(null);
        setPracenjeOtvoreno(false);
        prethodniStatus.current = null;
    };

    // Na promenu korisnika: gost/zaposleni → nema aktivne; kupac → pitaj server.
    useEffect(() => {
        if (!jeKupac) {
            resetuj();
            return;
        }
        let otkazano = false;
        porudzbineApi.getAktivna()
            .then(data => {
                if (otkazano) return;
                if (data && (data.status === 'NOVA' || data.status === 'U_PRIPREMI' || data.status === 'SPREMNA')) {
                    setAktivnaId(data.porudzbinaId);
                    setPorudzbina(data);
                    prethodniStatus.current = data.status;
                } else {
                    resetuj();
                }
            })
            .catch(() => { if (!otkazano) resetuj(); });
        return () => { otkazano = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jeKupac, korisnik?.id, token]);

    // Polling statusa dok postoji aktivna porudžbina (samo kupac).
    useEffect(() => {
        if (aktivnaId === null || !jeKupac) return;

        const osvezi = async () => {
            try {
                const data = await porudzbineApi.getJedan(aktivnaId);
                setPorudzbina(data);

                if (data.procenjenoVreme != null && !localStorage.getItem(LS_START)) {
                    localStorage.setItem(LS_START, String(Date.now()));
                }

                // Porudžbina je spremna — otvori praćenje da kupac vidi poziv na preuzimanje.
                if (data.status === 'SPREMNA' && prethodniStatus.current !== 'SPREMNA' && prethodniStatus.current !== null) {
                    setPracenjeOtvoreno(true);
                }
                // Preuzeta — kratko prikaži potvrdu pa zatvori.
                if (data.status === 'REALIZOVANA' && prethodniStatus.current === 'SPREMNA') {
                    setPracenjeOtvoreno(true);
                    autoZatvaranje.current = window.setTimeout(
                        () => setPracenjeOtvoreno(false), 5000
                    );
                }
                prethodniStatus.current = data.status;
            } catch (e) {
                if (e instanceof ApiError && e.status === 404) resetuj();
            }
        };

        osvezi();
        const interval = setInterval(osvezi, 8000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aktivnaId, jeKupac]);

    // Preostali minuti — osvežavaju se sami.
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

    return (
        <AktivnaPorudzbinaContext.Provider value={{
            aktivnaId,
            porudzbina,
            preostaloMin,
            pracenjeOtvoreno,
            otvoriPracenje: () => setPracenjeOtvoreno(true),
            zatvoriPracenje: () => {
                setPracenjeOtvoreno(false);
                if (zavrsena) resetuj();
            },
            postaviAktivnu: (id) => {
                localStorage.removeItem(LS_START);
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
