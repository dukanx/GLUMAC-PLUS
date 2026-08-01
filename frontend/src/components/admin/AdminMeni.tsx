import { useMemo, useState } from 'react';
import { Lupa } from '../Doodle';
import Ucitavanje, { NatpisDugmeta } from '../Ucitavanje';
import { sadrzi } from '../../utils/tekst';
import type { Proizvod } from '../../types/proizvod';
import * as proizvodiApi from '../../api/proizvodi';
import * as alergeniApi from '../../api/alergeni';
import { ApiError } from '../../api/client';
import ProizvodModal from './ProizvodModal';
import { useSekcija } from './kes';
import styles from './Admin.module.css';

/**
 * Admin → Meni: ceo katalog grupisan po kategorijama, sa izmenom kroz modal.
 *
 * „Sakrij" nije brisanje — postavlja `DO_DALJNJEG`, pa stavka nestane iz menija
 * kupca a ostane u bazi. Brisanje bi palo na stranom ključu čim je proizvod
 * jednom naručen, i pokidalo bi istoriju.
 */
export default function AdminMeni() {
    const { podaci: proizvodi, zapamti: setProizvodi, ucitava, greska, setGreska, osvezi: ucitaj } =
        useSekcija<Proizvod[]>('proizvodi', proizvodiApi.getSvi, []);
    const { podaci: alergeni, zapamti: setAlergeni } =
        useSekcija<alergeniApi.Alergen[]>('alergeni', alergeniApi.getSvi, []);
    const [pretraga, setPretraga] = useState('');
    // null = zatvoreno, 'novi' = prazna forma, Proizvod = izmena postojećeg.
    const [uredjivanje, setUredjivanje] = useState<Proizvod | 'novi' | null>(null);
    const [uToku, setUToku] = useState<number | null>(null);

    // Grupisano po kategoriji, redosled kategorija po prvom pojavljivanju.
    const grupe = useMemo(() => {
        const filtrirani = proizvodi.filter(p => sadrzi(p.naziv, pretraga) || sadrzi(p.opis ?? '', pretraga));
        const m = new Map<string, Proizvod[]>();
        for (const p of filtrirani) {
            const k = p.tip || 'ostalo';
            if (!m.has(k)) m.set(k, []);
            m.get(k)!.push(p);
        }
        for (const lista of m.values()) lista.sort((a, b) => a.naziv.localeCompare(b.naziv, 'sr'));
        return [...m.entries()];
    }, [proizvodi, pretraga]);

    const promeniDostupnost = async (p: Proizvod, dostupan: boolean) => {
        setUToku(p.id);
        setGreska('');
        try {
            const nov = await proizvodiApi.setDostupnost(p.id, dostupan, dostupan ? undefined : 'DO_DALJNJEG');
            setProizvodi(prev => prev.map(x => x.id === p.id ? nov : x));
        } catch (e) {
            setGreska(e instanceof ApiError ? (e.body?.message ?? 'Nije uspelo.') : 'Server ne odgovara.');
        } finally {
            setUToku(null);
        }
    };

    const ukupno = proizvodi.length;
    const prikazano = grupe.reduce((z, [, lista]) => z + lista.length, 0);

    return (
        <div>
            <header className={styles.glava}>
                <div>
                    <span className={styles.eyeb}>šta se prodaje</span>
                    <h1 className={styles.naslov}>Meni</h1>
                </div>
                <div className={styles.alatke}>
                    <span className={styles.pretragaOkvir}>
                        <Lupa size={15} />
                        <input
                            className={styles.pretragaInput}
                            value={pretraga}
                            onChange={e => setPretraga(e.target.value)}
                            placeholder="traži proizvod…"
                        />
                    </span>
                    <button type="button" className={styles.dugme} onClick={() => setUredjivanje('novi')}>
                        + NOVI PROIZVOD
                    </button>
                </div>
            </header>

            {greska && <p className={styles.greska}>{greska}</p>}

            {ucitava ? (
                <Ucitavanje tekst="učitavam katalog" />
            ) : grupe.length === 0 ? (
                <p className={styles.prazno}>
                    {pretraga ? `nismo pronašli ništa za „${pretraga}"` : 'katalog je prazan'}
                </p>
            ) : (
                <>
                    {pretraga && (
                        <p className={styles.brojac}>{prikazano} od {ukupno} proizvoda</p>
                    )}
                    {grupe.map(([tip, lista]) => (
                        <section key={tip}>
                            <p className={styles.sekcija}>
                                — {tip.toLowerCase()} <span className={styles.sekcijaBroj}>· {lista.length}</span>
                            </p>
                            <div className={styles.kartica}>
                                <table className={styles.tabelaFiksna}>
                                    <colgroup>
                                        <col />
                                        <col className={styles.kolAlergeni} />
                                        <col className={styles.kolCena} />
                                        <col className={styles.kolStatus} />
                                        <col className={styles.kolAkcije} />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th className={styles.th}>proizvod</th>
                                            <th className={`${styles.th} ${styles.desno}`}>alergeni</th>
                                            <th className={`${styles.th} ${styles.desno}`}>cena</th>
                                            <th className={`${styles.th} ${styles.desno}`}>status</th>
                                            <th className={`${styles.th} ${styles.desno}`}>akcije</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lista.map(p => {
                                            const dostupan = p.dostupan !== false;
                                            const skriven = p.nedostupanRazlog === 'DO_DALJNJEG';
                                            return (
                                                <tr key={p.id}>
                                                    <td className={styles.td}>
                                                        <b className={styles.naziv}>{p.naziv}</b>
                                                        {p.opis && <span className={styles.opis}>{p.opis}</span>}
                                                    </td>
                                                    <td className={`${styles.td} ${styles.desno}`}>
                                                        <span className={styles.alergeni}>
                                                            {p.alergeniNazivi?.length
                                                                ? p.alergeniNazivi.join(', ')
                                                                : '—'}
                                                        </span>
                                                    </td>
                                                    <td className={`${styles.td} ${styles.desno}`}>
                                                        <b>{Math.round(p.cena)}</b>
                                                    </td>
                                                    <td className={`${styles.td} ${styles.desno}`}>
                                                        {dostupan ? (
                                                            <span className={styles.tagDa}>u ponudi</span>
                                                        ) : skriven ? (
                                                            <span className={styles.tagNe}>van ponude</span>
                                                        ) : (
                                                            <span className={styles.tagNe}>nema danas</span>
                                                        )}
                                                    </td>
                                                    <td className={`${styles.td} ${styles.desno}`}>
                                                        <button
                                                            type="button"
                                                            className={styles.akcija}
                                                            onClick={() => setUredjivanje(p)}
                                                        >
                                                            izmeni
                                                        </button>
                                                        <span className={styles.akcijaSep}>·</span>
                                                        <button
                                                            type="button"
                                                            className={styles.akcijaTiha}
                                                            onClick={() => promeniDostupnost(p, !dostupan)}
                                                            disabled={uToku === p.id}
                                                        >
                                                            <NatpisDugmeta
                                                                uToku={uToku === p.id}
                                                                opis={dostupan ? 'Sklanjam sa menija' : 'Vraćam u ponudu'}
                                                            >
                                                                {dostupan ? 'sakrij' : 'vrati'}
                                                            </NatpisDugmeta>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ))}
                </>
            )}

            {uredjivanje && (
                <ProizvodModal
                    proizvod={uredjivanje === 'novi' ? null : uredjivanje}
                    alergeni={alergeni}
                    kategorije={[...new Set(proizvodi.map(p => p.tip))].sort((a, b) => a.localeCompare(b, 'sr'))}
                    onAlergenDodat={a => setAlergeni(prev => [...prev, a])}
                    onZatvori={() => setUredjivanje(null)}
                    onSacuvano={() => { setUredjivanje(null); ucitaj(); }}
                />
            )}
        </div>
    );
}
