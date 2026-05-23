import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AktivnaPorudzbinaCtx {
    aktivnaId: number | null;
    statusOtvoren: boolean;
    otvoriStatus: (id: number) => void;
    zatvoriStatus: () => void;
    resetuj: () => void;
}

const AktivnaPorudzbinaContext = createContext<AktivnaPorudzbinaCtx>(null!);

const LS_KLJUC = 'aktivna_porudzbina_id';

export function AktivnaPorudzbinaProvider({ children }: { children: ReactNode }) {
    const [aktivnaId, setAktivnaId] = useState<number | null>(() => {
        const stored = localStorage.getItem(LS_KLJUC);
        return stored ? Number(stored) : null;
    });
    const [statusOtvoren, setStatusOtvoren] = useState(false);

    return (
        <AktivnaPorudzbinaContext.Provider value={{
            aktivnaId,
            statusOtvoren,
            otvoriStatus: (id) => {
                localStorage.setItem(LS_KLJUC, String(id));
                setAktivnaId(id);
                setStatusOtvoren(true);
            },
            zatvoriStatus: () => setStatusOtvoren(false),
            resetuj: () => {
                localStorage.removeItem(LS_KLJUC);
                setAktivnaId(null);
            },
        }}>
            {children}
        </AktivnaPorudzbinaContext.Provider>
    );
}

export const useAktivnaPorudzbina = () => useContext(AktivnaPorudzbinaContext);
