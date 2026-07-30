import { useState, useEffect, useMemo, useCallback } from 'react';
import * as proizvodiApi from '../api/proizvodi';
import type { Proizvod, RazlogNedostupnosti } from '../types/proizvod';
import { Lupa } from './Doodle';
import { sadrzi } from '../utils/tekst';
import styles from '../pages/PanelPorudzbina.module.css';

/* ─── PROIZVODI stranica ("86 lista") ──────────────────────── */
export default function PanelProizvodi() {
    const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
    const [pretraga, setPretraga] = useState('');
    const [filterTip, setFilterTip] = useState<string | null>(null);
    const [biram, setBiram] = useState<number | null>(null);

    const ucitaj = useCallback(() => {
        proizvodiApi.getSvi().then(setProizvodi).catch(() => { });
    }, []);
    useEffect(() => { ucitaj(); }, [ucitaj]);

    const skini = async (p: Proizvod, razlog: RazlogNedostupnosti) => {
        setBiram(null);
        setProizvodi(prev => prev.map(x => x.id === p.id ? { ...x, dostupan: false, nedostupanRazlog: razlog } : x));
        try { await proizvodiApi.setDostupnost(p.id, false, razlog); } catch { ucitaj(); }
    };
    const vrati = async (p: Proizvod) => {
        setProizvodi(prev => prev.map(x => x.id === p.id ? { ...x, dostupan: true, nedostupanRazlog: null } : x));
        try { await proizvodiApi.setDostupnost(p.id, true); } catch { ucitaj(); }
    };

    // Vrste (tip) za filter — redosled pojavljivanja, bez praznih.
    const tipovi = useMemo(
        () => [...new Set(proizvodi.map(p => p.tip || 'ostalo'))],
        [proizvodi]
    );

    const grupe = useMemo(() => {
        // Bez kvačica — u smeni se kuca brzo, "sunka" mora da nađe "Šunka".
        const filtrirani = proizvodi.filter(p =>
            sadrzi(p.naziv, pretraga) &&
            (!filterTip || (p.tip || 'ostalo') === filterTip)
        );
        const m = new Map<string, Proizvod[]>();
        filtrirani.forEach(p => {
            const k = p.tip || 'ostalo';
            if (!m.has(k)) m.set(k, []);
            m.get(k)!.push(p);
        });
        return [...m.entries()];
    }, [proizvodi, pretraga, filterTip]);

    const brojNedostupnih = proizvodi.filter(p => p.dostupan === false).length;

    return (
        <div className={styles.stranica}>
            <header className={styles.header}>
                <div className={styles.headerLevo}>
                    <h1 className={styles.naslov}>Proizvodi</h1>
                </div>
            </header>

            <div className={styles.proizvodiEkran}>
            <div className={styles.proizvodiHead}>
                <span className={styles.proizvodiNap}>
                    isključen proizvod odmah nestaje iz menija kupaca — vraća se jednim tapom
                </span>
                <span className={styles.proizvodiBroj}>{brojNedostupnih} nedostupna danas</span>
            </div>

            <div className={styles.pretragaBox}>
                <Lupa size={20} strokeWidth={2.2} />
                <input
                    className={styles.pretragaInput}
                    value={pretraga}
                    onChange={e => setPretraga(e.target.value)}
                    placeholder='traži proizvod… npr. "plazma"'
                />
            </div>

            <div className={styles.tipFilteri}>
                <button
                    className={`${styles.tipChip} ${filterTip === null ? styles.tipChipOn : ''}`}
                    onClick={() => setFilterTip(null)}
                >
                    sve
                </button>
                {tipovi.map(t => (
                    <button
                        key={t}
                        className={`${styles.tipChip} ${filterTip === t ? styles.tipChipOn : ''}`}
                        onClick={() => setFilterTip(f => f === t ? null : t)}
                    >
                        {t.toLowerCase()}
                    </button>
                ))}
            </div>

            {grupe.map(([tip, lista]) => (
                <div key={tip} className={styles.proizvodiGrupa}>
                    <p className={styles.grupaNaslov}>— {tip.toLowerCase()}</p>
                    <div className={styles.p86lista}>
                        {lista.map(p => {
                            const dostupan = p.dostupan !== false;
                            const otvoren = biram === p.id;
                            return (
                                <div
                                    key={p.id}
                                    className={`${styles.p86} ${!dostupan ? styles.p86nema : ''} ${otvoren ? styles.p86biram : ''}`}
                                >
                                    <span className={styles.p86naziv}>{p.naziv}</span>

                                    {dostupan ? (otvoren ? (
                                        <>
                                            <span className={styles.p86skini}>skini sa menija:</span>
                                            <div className={styles.p86izbor}>
                                                <button className={`${styles.tgl} ${styles.tglNema}`} onClick={() => skini(p, 'DO_KRAJA_SMENE')}>DO KRAJA SMENE</button>
                                                <button className={`${styles.tgl} ${styles.tglDalje}`} onClick={() => skini(p, 'DO_DALJNJEG')}>DO DALJNJEG</button>
                                                <button className={`${styles.tgl} ${styles.tglNazad}`} onClick={() => setBiram(null)}>NAZAD</button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {p.opis && <span className={styles.p86opis}>{p.opis}</span>}
                                            <button className={`${styles.tgl} ${styles.tglIma}`} onClick={() => setBiram(p.id)}>✓ IMA</button>
                                        </>
                                    )) : (
                                        <>
                                            <span className={styles.p86razlog}>
                                                nema — {p.nedostupanRazlog === 'DO_KRAJA_SMENE' ? 'do kraja smene' : 'do daljnjeg'}
                                            </span>
                                            <button className={`${styles.tgl} ${styles.tglNema}`} onClick={() => vrati(p)}>✗ NEMA</button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
}
