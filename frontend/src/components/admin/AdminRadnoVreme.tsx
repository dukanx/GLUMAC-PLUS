import { useEffect, useMemo, useState } from 'react';
import Ucitavanje, { NatpisDugmeta } from '../Ucitavanje';
import * as api from '../../api/radnoVreme';
import { ApiError } from '../../api/client';
import type { DanKljuc } from '../../hooks/useRadnoVreme';
import styles from './Admin.module.css';

/**
 * Admin → Radno vreme: stalni nedeljni raspored.
 *
 * Ovde se menja ono što važi svake nedelje. Jednokratno „danas ne radimo" NIJE
 * ovde — to je zatvaranje smene u panelu zaposlenog, jer je odluka koja se
 * donosi u toku dana i ne sme da pokvari raspored.
 */

const DANI: { kljuc: DanKljuc; naziv: string }[] = [
    { kljuc: 'PONEDELJAK', naziv: 'Ponedeljak' },
    { kljuc: 'UTORAK', naziv: 'Utorak' },
    { kljuc: 'SREDA', naziv: 'Sreda' },
    { kljuc: 'CETVRTAK', naziv: 'Četvrtak' },
    { kljuc: 'PETAK', naziv: 'Petak' },
    { kljuc: 'SUBOTA', naziv: 'Subota' },
    { kljuc: 'NEDELJA', naziv: 'Nedelja' },
];

const DANAS: Record<number, DanKljuc> = {
    0: 'NEDELJA', 1: 'PONEDELJAK', 2: 'UTORAK', 3: 'SREDA',
    4: 'CETVRTAK', 5: 'PETAK', 6: 'SUBOTA',
};

/** Backend šalje `HH:mm:ss`, `<input type="time">` hoće `HH:mm`. */
const uPolje = (v: string) => v.slice(0, 5);
const uBackend = (v: string) => (v.length === 5 ? `${v}:00` : v);

interface Red {
    /** `null` = taj dan nema red u bazi, pa se pravi novi. */
    id: number | null;
    dan: DanKljuc;
    naziv: string;
    od: string;
    do_: string;
    aktivno: boolean;
}

export default function AdminRadnoVreme() {
    const [redovi, setRedovi] = useState<Red[]>([]);
    const [polazno, setPolazno] = useState<Red[]>([]);
    const [ucitava, setUcitava] = useState(true);
    const [greska, setGreska] = useState('');
    const [cuvaDan, setCuvaDan] = useState<DanKljuc | null>(null);

    useEffect(() => {
        api.getSvi()
            .then(data => {
                const spojeno: Red[] = DANI.map(({ kljuc, naziv }) => {
                    const r = data.find(x => x.dan === kljuc);
                    return {
                        id: r?.id ?? null,
                        dan: kljuc,
                        naziv,
                        od: r ? uPolje(r.odVremena) : '08:00',
                        do_: r ? uPolje(r.doVremena) : '23:00',
                        // Dan bez reda u bazi nije radni dok se ne sačuva.
                        aktivno: r ? r.aktivno : false,
                    };
                });
                setRedovi(spojeno);
                setPolazno(spojeno);
                setUcitava(false);
            })
            .catch(() => { setGreska('Ne mogu da učitam radno vreme.'); setUcitava(false); });
    }, []);

    const danasKljuc = DANAS[new Date().getDay()];
    const nijedanAktivan = !ucitava && redovi.every(r => !r.aktivno);

    const izmenjeni = useMemo(() => {
        const m = new Map(polazno.map(p => [p.dan, p]));
        return new Set(redovi
            .filter(r => {
                const p = m.get(r.dan)!;
                return p.od !== r.od || p.do_ !== r.do_ || p.aktivno !== r.aktivno;
            })
            .map(r => r.dan));
    }, [redovi, polazno]);

    const promeni = (dan: DanKljuc, deo: Partial<Red>) =>
        setRedovi(prev => prev.map(r => r.dan === dan ? { ...r, ...deo } : r));

    const sacuvaj = async (red: Red) => {
        if (red.aktivno && red.od === red.do_) {
            setGreska(`${red.naziv}: početak i kraj ne smeju biti isti — lokal tad ne bi bio otvoren nijedan minut.`);
            return;
        }
        setCuvaDan(red.dan);
        setGreska('');
        try {
            const unos = {
                dan: red.dan,
                odVremena: uBackend(red.od),
                doVremena: uBackend(red.do_),
                aktivno: red.aktivno,
            };
            const sacuvan = red.id === null
                ? await api.kreiraj(unos)
                : await api.izmeni(red.id, unos);
            const nov = { ...red, id: sacuvan.id };
            setRedovi(prev => prev.map(r => r.dan === red.dan ? nov : r));
            setPolazno(prev => prev.map(r => r.dan === red.dan ? nov : r));
        } catch (e) {
            setGreska(e instanceof ApiError ? (e.body?.message ?? 'Nije uspelo čuvanje.') : 'Server ne odgovara.');
        } finally {
            setCuvaDan(null);
        }
    };

    return (
        <div>
            <header className={styles.glava}>
                <div>
                    <span className={styles.eyeb}>kad je lokal otvoren</span>
                    <h1 className={styles.naslov}>Radno vreme</h1>
                </div>
            </header>

            {greska && <p className={styles.greska}>{greska}</p>}

            {ucitava ? (
                <Ucitavanje tekst="učitavam radno vreme" />
            ) : (
                <>
                    {nijedanAktivan && (
                        <p className={styles.upozorenje}>
                            Nijedan dan nije označen kao radni. Aplikacija tada <b>ne zna kad je zatvoreno</b> i
                            prima porudžbine 0–24. Označi bar jedan dan, pa isključi ostale.
                        </p>
                    )}

                    <div className={styles.kartica} style={{ marginTop: 20 }}>
                        <table className={styles.tabela}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>dan</th>
                                    <th className={styles.th}>radni dan</th>
                                    <th className={styles.th}>otvoreno</th>
                                    <th className={`${styles.th} ${styles.desno}`}>akcija</th>
                                </tr>
                            </thead>
                            <tbody>
                                {redovi.map(r => {
                                    const danas = r.dan === danasKljuc;
                                    const menjan = izmenjeni.has(r.dan);
                                    // Kraj pre početka nije greška — lokal radi preko ponoći.
                                    const prekoPonoci = r.aktivno && r.od > r.do_;
                                    return (
                                        <tr key={r.dan}>
                                            <td className={styles.td}>
                                                <span className={danas ? styles.danDanas : styles.dan}>
                                                    {r.naziv}
                                                </span>
                                                {danas && <span className={styles.danasZnak}>danas</span>}
                                            </td>
                                            <td className={styles.td}>
                                                <button
                                                    type="button"
                                                    className={r.aktivno ? styles.pilulaOn : styles.pilula}
                                                    onClick={() => promeni(r.dan, { aktivno: !r.aktivno })}
                                                    aria-pressed={r.aktivno}
                                                >
                                                    {r.aktivno ? 'radimo' : 'ne radimo'}
                                                </button>
                                            </td>
                                            <td className={styles.td}>
                                                <input
                                                    type="time"
                                                    className={styles.unosVreme}
                                                    value={r.od}
                                                    disabled={!r.aktivno}
                                                    onChange={e => promeni(r.dan, { od: e.target.value })}
                                                    aria-label={`${r.naziv} — od`}
                                                />
                                                <span className={styles.crtica}>–</span>
                                                <input
                                                    type="time"
                                                    className={styles.unosVreme}
                                                    value={r.do_}
                                                    disabled={!r.aktivno}
                                                    onChange={e => promeni(r.dan, { do_: e.target.value })}
                                                    aria-label={`${r.naziv} — do`}
                                                />
                                                {prekoPonoci && (
                                                    <span className={styles.danasZnak}>preko ponoći</span>
                                                )}
                                            </td>
                                            <td className={`${styles.td} ${styles.desno}`}>
                                                <button
                                                    type="button"
                                                    className={styles.dugme}
                                                    onClick={() => sacuvaj(r)}
                                                    disabled={!menjan || cuvaDan !== null}
                                                >
                                                    <NatpisDugmeta uToku={cuvaDan === r.dan} opis="Čuvam">
                                                        SAČUVAJ
                                                    </NatpisDugmeta>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <p className={styles.info}>
                        Ovo je stalni raspored. Ako lokal <b>danas</b> ne radi ili se zatvara ranije, to se ne
                        menja ovde nego u panelu zaposlenog, dugmetom za zatvaranje smene — raspored ostaje
                        netaknut za sutra.
                    </p>
                </>
            )}
        </div>
    );
}
