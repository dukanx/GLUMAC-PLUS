import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../api/client';

/**
 * Podaci sekcija admin panela, keširani dok je kartica otvorena.
 *
 * Sekcije se prebacuju stanjem, pa se komponenta pri svakom povratku montira
 * iznova i sve dohvata ponovo. Mereno na pravom backendu: povratak na već
 * viđenu sekciju je koštao ~800 ms čekanja u prazno, iako su isti podaci
 * maločas bili tu.
 *
 * Zato: keširano se prikazuje **odmah**, ali se u pozadini svejedno dohvata.
 * Ne samo osvežavanje radi — dve sekcije (Korisnici i Zaposleni) gledaju istu
 * listu, pa bi bez toga izmena u jednoj ostala nevidljiva u drugoj.
 *
 * Keš namerno živi u modulu, ne u `localStorage`: gubi se na osvežavanje
 * stranice, što je poželjno — ne želimo da vlasnik posle reload-a gleda cene
 * od juče.
 */
const kes = new Map<string, unknown>();

/** Briše keširano, npr. pri odjavi. */
export function isprazniKes() {
    kes.clear();
}

interface Rezultat<T> {
    podaci: T;
    /** Upis koji ide i u keš — inače bi izmena nestala pri povratku na sekciju. */
    zapamti: (v: T | ((prethodno: T) => T)) => void;
    /** `true` samo kad nema šta da se pokaže; osvežavanje u pozadini ne broji. */
    ucitava: boolean;
    greska: string;
    setGreska: (v: string) => void;
    osvezi: () => void;
}

export function useSekcija<T>(kljuc: string, dohvati: () => Promise<T>, prazno: T): Rezultat<T> {
    const [podaci, postavi] = useState<T>(() => (kes.get(kljuc) as T) ?? prazno);
    const [ucitava, setUcitava] = useState(() => !kes.has(kljuc));
    const [greska, setGreska] = useState('');

    const osvezi = useCallback(() => {
        dohvati()
            .then(d => {
                kes.set(kljuc, d);
                postavi(d);
                setUcitava(false);
                setGreska('');
            })
            .catch((e: unknown) => {
                setUcitava(false);
                // Ako nešto već stoji na ekranu, ne rušimo ga porukom o grešci.
                // Kad backend kaže šta ne valja (npr. „period ne može biti duži
                // od 366 dana"), prenosi se njegova poruka — opšte „ne mogu da
                // učitam" ostavlja vlasnika da nagađa šta je pogrešio.
                if (!kes.has(kljuc)) {
                    const poruka = e instanceof ApiError ? e.body?.message : undefined;
                    setGreska(poruka ?? 'Ne mogu da učitam podatke.');
                }
            });
    }, [kljuc, dohvati]);

    useEffect(() => { osvezi(); }, [osvezi]);

    const zapamti = useCallback((v: T | ((prethodno: T) => T)) => {
        postavi(prethodno => {
            const novo = typeof v === 'function' ? (v as (p: T) => T)(prethodno) : v;
            kes.set(kljuc, novo);
            return novo;
        });
    }, [kljuc]);

    return { podaci, zapamti, ucitava, greska, setGreska, osvezi };
}
