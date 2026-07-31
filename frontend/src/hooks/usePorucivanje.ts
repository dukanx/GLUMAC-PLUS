import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAktivnaPorudzbina } from '../context/AktivnaPorudzbinaContext';
import type { TipPorudzbine } from '../types/porudzbina';
import { cenaSaPopustom, iznosPopusta } from '../utils/korpa';
import * as porudzbineApi from '../api/porudzbine';
import { ApiError } from '../api/client';

/** Koliko stoji poruka „Porudžbina poslata!" pre nego što se otvori praćenje. */
const TRAJANJE_POTVRDE_MS = 2000;

interface Opcije {
    /**
     * Poziva se pre odlaska na prijavu i pre otvaranja praćenja porudžbine.
     * Drawer time zatvara sam sebe; MiniKorpa nema šta da zatvori, pa ne šalje ništa.
     */
    zatvori?: () => void;
}

/**
 * Naručivanje iz korpe — isti tok koriste i bočni drawer (mobilni) i
 * MiniKorpa uz meni (desktop). Ovde stoji sve što im je zajedničko: izbor tipa,
 * napomena, računica sa popustom, poziv ka backendu i stanje slanja; svaka
 * komponenta zadržava svoj izgled.
 */
export function usePorucivanje({ zatvori }: Opcije = {}) {
    const navigate = useNavigate();
    const { korisnik, token, osvezi, popust } = useAuth();
    const { postaviAktivnu } = useAktivnaPorudzbina();
    const { korpa, isprazni, ukupnaCena } = useCart();

    const [tipPorudzbine, setTipPorudzbine] = useState<TipPorudzbine>('U_LOKALU');
    const [napomena, setNapomena] = useState('');
    const [porucivanjeUToku, setPorucivanjeUToku] = useState(false);
    const [uspesno, setUspesno] = useState(false);
    const [greska, setGreska] = useState('');

    // Popust ide jednom na ukupan iznos, isto kao na kasi.
    const zaPlacanje = cenaSaPopustom(ukupnaCena, popust);
    const popustIznos = iznosPopusta(ukupnaCena, popust);

    const naruci = async () => {
        if (!korisnik || !token) {
            zatvori?.();
            navigate('/login');
            return;
        }

        setGreska('');
        setPorucivanjeUToku(true);
        try {
            const nova = await porudzbineApi.kreiraj({
                tipPorudzbine,
                napomena: napomena.trim() || null,
                stavke: korpa.map(i => ({
                    proizvodId: i.proizvod.id,
                    kolicina: i.kolicina,
                    dodaci: i.dodaci.map(d => ({
                        proizvodId: d.proizvod.id,
                        kolicina: d.kolicina,
                    })),
                })),
            });
            const novaPorudzbinaId: number | null = nova?.porudzbinaId ?? null;
            isprazni();
            setNapomena('');
            setUspesno(true);
            await osvezi();
            setTimeout(() => {
                setUspesno(false);
                zatvori?.();
                if (novaPorudzbinaId) postaviAktivnu(novaPorudzbinaId);
            }, TRAJANJE_POTVRDE_MS);
        } catch (e) {
            setGreska(e instanceof ApiError
                ? (e.body?.message ?? 'Greška prilikom naručivanja.')
                : 'Server ne odgovara.');
        } finally {
            setPorucivanjeUToku(false);
        }
    };

    return {
        tipPorudzbine, setTipPorudzbine,
        napomena, setNapomena,
        porucivanjeUToku, uspesno, greska,
        popust, ukupnaCena, zaPlacanje, popustIznos,
        naruci,
    };
}
