import { createContext, useContext, useState, useEffect } from 'react';
import type { DodatakKorpe, Proizvod, StavkaKorpe } from '../types/proizvod';
import { cenaStavke, potpisStavke } from '../utils/korpa';

interface CartContextTip {
    korpa: StavkaKorpe[];
    /** Dodaje proizvod (opciono sa dodacima). Ista kombinacija se spaja u jednu stavku. */
    dodaj: (p: Proizvod, kolicina?: number, dodaci?: DodatakKorpe[]) => void;
    /** Kontrole rade nad stavkom korpe (`stavka.id`), ne nad proizvodom. */
    povecaj: (stavkaId: string) => void;
    smanji: (stavkaId: string) => void;
    ukloni: (stavkaId: string) => void;
    isprazni: () => void;
    /** Ukupno komada tog proizvoda u korpi, kroz sve varijante dodataka (za meni). */
    kolicinaProizvoda: (proizvodId: number) => number;
    /** Skida jedan komad poslednje dodate varijante tog proizvoda (za "−" u meniju). */
    smanjiPoslednju: (proizvodId: number) => void;
    ukupnaCena: number;
    ukupnoStavki: number;
    drawerOtvoren: boolean;
    otvoriDrawer: () => void;
    zatvoriDrawer: () => void;
}

const CartContext = createContext<CartContextTip | null>(null);
const STORAGE_KEY = 'mojaKorpa';

/** Stavke iz storage-a mogu biti starog oblika (bez `id`/`dodaci`) — dopunimo ih. */
function normalizuj(sacuvano: unknown): StavkaKorpe[] {
    if (!Array.isArray(sacuvano)) return [];
    return sacuvano
        .filter((i): i is StavkaKorpe => !!i?.proizvod?.id)
        .map(i => {
            const dodaci = Array.isArray(i.dodaci) ? i.dodaci : [];
            return {
                proizvod: i.proizvod,
                kolicina: i.kolicina,
                dodaci,
                id: i.id ?? potpisStavke(i.proizvod.id, dodaci),
            };
        });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [korpa, setKorpa] = useState<StavkaKorpe[]>(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            return saved ? normalizuj(JSON.parse(saved)) : [];
        } catch { return []; }
    });

    const [drawerOtvoren, setDrawerOtvoren] = useState(false);

    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(korpa));
        } catch { }
    }, [korpa]);

    const dodaj = (noviProizvod: Proizvod, kolicina = 1, dodaci: DodatakKorpe[] = []) => {
        const id = potpisStavke(noviProizvod.id, dodaci);
        setKorpa(prev => {
            const postoji = prev.find(i => i.id === id);
            if (postoji) {
                return prev.map(i =>
                    i.id === id ? { ...i, kolicina: i.kolicina + kolicina } : i
                );
            }
            return [...prev, { id, proizvod: noviProizvod, kolicina, dodaci }];
        });
    };

    const povecaj = (stavkaId: string) =>
        setKorpa(prev => prev.map(i =>
            i.id === stavkaId ? { ...i, kolicina: i.kolicina + 1 } : i
        ));

    const smanji = (stavkaId: string) =>
        setKorpa(prev =>
            prev.map(i => i.id === stavkaId ? { ...i, kolicina: i.kolicina - 1 } : i)
                .filter(i => i.kolicina > 0)
        );

    const ukloni = (stavkaId: string) =>
        setKorpa(prev => prev.filter(i => i.id !== stavkaId));

    const isprazni = () => {
        setKorpa([]);
        sessionStorage.removeItem(STORAGE_KEY);
    };

    const kolicinaProizvoda = (proizvodId: number) =>
        korpa.reduce((suma, i) => i.proizvod.id === proizvodId ? suma + i.kolicina : suma, 0);

    // Meni prikazuje jedan brojač za sve varijante, pa "−" skida sa poslednje dodate.
    const smanjiPoslednju = (proizvodId: number) =>
        setKorpa(prev => {
            let indeks = -1;
            prev.forEach((i, n) => { if (i.proizvod.id === proizvodId) indeks = n; });
            if (indeks === -1) return prev;
            return prev
                .map((i, n) => n === indeks ? { ...i, kolicina: i.kolicina - 1 } : i)
                .filter(i => i.kolicina > 0);
        });

    const ukupnaCena = Math.round(korpa.reduce((sum, i) => sum + cenaStavke(i), 0));
    const ukupnoStavki = korpa.reduce((sum, i) => sum + i.kolicina, 0);

    return (
        <CartContext.Provider value={{
            korpa, dodaj, povecaj, smanji, ukloni, isprazni,
            kolicinaProizvoda, smanjiPoslednju,
            ukupnaCena, ukupnoStavki,
            drawerOtvoren,
            otvoriDrawer: () => setDrawerOtvoren(true),
            zatvoriDrawer: () => setDrawerOtvoren(false),
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart mora biti unutar CartProvider-a');
    return context;
}
