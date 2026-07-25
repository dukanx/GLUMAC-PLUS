// Dodaci se menjaju retko (samo kad ih osoblje skine sa menija), a otvaraju se
// pri svakom kliku na proizvod. Zato ih keširamo po ukusu za trajanje stranice
// i unapred dohvatamo dok kupac razgleda meni — otvaranje detalja je onda trenutno.
import { useEffect, useState } from 'react';
import * as proizvodiApi from '../api/proizvodi';
import type { Proizvod, Ukus } from '../types/proizvod';

const kes = new Map<Ukus, Proizvod[]>();
/** Zahtevi u letu — da dva istovremena otvaranja ne pokrenu dva ista poziva. */
const uToku = new Map<Ukus, Promise<Proizvod[]>>();

function dohvati(ukus: Ukus): Promise<Proizvod[]> {
    const izKesa = kes.get(ukus);
    if (izKesa) return Promise.resolve(izKesa);

    const vecIde = uToku.get(ukus);
    if (vecIde) return vecIde;

    const poziv = proizvodiApi.getDodaci(ukus)
        .then(lista => {
            kes.set(ukus, lista);
            uToku.delete(ukus);
            return lista;
        })
        .catch(greska => {
            uToku.delete(ukus);
            throw greska;
        });

    uToku.set(ukus, poziv);
    return poziv;
}

/** Unapred puni keš (poziva meni po učitavanju) — bez čekanja na rezultat. */
export function prefetchDodatke() {
    dohvati('SLATKO').catch(() => { });
    dohvati('SLANO').catch(() => { });
}

/**
 * Dodaci za zadati ukus. Kad su u kešu, vraćaju se odmah i bez treperenja
 * skeletona; inače se dohvataju uz `ucitava = true`.
 */
export function useDodaci(ukus: Ukus | null | undefined) {
    const [dodaci, setDodaci] = useState<Proizvod[]>(() => (ukus && kes.get(ukus)) || []);
    const [ucitava, setUcitava] = useState(false);

    useEffect(() => {
        if (!ukus) {
            setDodaci([]);
            setUcitava(false);
            return;
        }

        const izKesa = kes.get(ukus);
        if (izKesa) {
            setDodaci(izKesa);
            setUcitava(false);
            return;
        }

        let vazi = true;
        setDodaci([]);
        setUcitava(true);
        dohvati(ukus)
            .then(lista => { if (vazi) { setDodaci(lista); setUcitava(false); } })
            .catch(() => { if (vazi) { setDodaci([]); setUcitava(false); } });

        return () => { vazi = false; };
    }, [ukus]);

    return { dodaci, ucitava };
}
