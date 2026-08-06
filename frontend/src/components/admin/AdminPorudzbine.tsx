import { useCallback, useEffect, useState } from 'react';
import { Lupa } from '../Doodle';
import Ucitavanje, { NatpisDugmeta } from '../Ucitavanje';
import * as api from '../../api/porudzbine';
import type { Porudzbina, StatusPorudzbine } from '../../types/porudzbina';
import { tipLabela } from '../../types/porudzbina';
import { ApiError } from '../../api/client';
import styles from './Admin.module.css';

/**
 * Admin → Porudžbine: pogled unazad.
 *
 * Panel zaposlenog (`/panel`) vodi porudžbine uživo; ovde se traži šta je bilo.
 * Zato se ništa ne menja — status je posle preuzimanja završno stanje, a
 * pogrešno dodeljeni bodovi se ispravljaju u sekciji Korisnici.
 *
 * Filtriranje ide na backendu jer je rezultat straničen: sečenje u pregledaču
 * dalo bi pogrešan broj strana.
 */

const STATUSI: { kljuc: StatusPorudzbine | ''; naziv: string }[] = [
    { kljuc: '', naziv: 'sve' },
    { kljuc: 'NOVA', naziv: 'nove' },
    { kljuc: 'U_PRIPREMI', naziv: 'u pripremi' },
    { kljuc: 'SPREMNA', naziv: 'spremne' },
    { kljuc: 'REALIZOVANA', naziv: 'preuzete' },
    { kljuc: 'OTKAZANA', naziv: 'otkazane' },
];

const STATUS_LABELA: Record<StatusPorudzbine, string> = {
    NOVA: 'nova',
    U_PRIPREMI: 'u pripremi',
    SPREMNA: 'spremna',
    REALIZOVANA: 'preuzeta',
    OTKAZANA: 'otkazana',
};

const VELICINA_STRANE = 20;

/** `yyyy-MM-dd` za polja tipa date. */
const uPolje = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Srpska množina uz broj: 1 porudžbina, 2–4 porudžbine, 5+ porudžbina —
 * s tim da 11–14 idu kao 5+ („11 porudžbina", ne „11 porudžbine").
 */
function rec(n: number): string {
    const j = n % 10;
    const d = n % 100;
    if (j === 1 && d !== 11) return 'porudžbina';
    if (j >= 2 && j <= 4 && (d < 12 || d > 14)) return 'porudžbine';
    return 'porudžbina';
}

function formatirajDatum(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('sr-RS', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function AdminPorudzbine() {
    const [q, setQ] = useState('');
    const [od, setOd] = useState('');
    const [doDatuma, setDoDatuma] = useState('');
    const [status, setStatus] = useState<StatusPorudzbine | ''>('');
    const [strana, setStrana] = useState(0);

    const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);
    const [ukupno, setUkupno] = useState(0);
    const [ukupnoStrana, setUkupnoStrana] = useState(0);
    const [ucitava, setUcitava] = useState(true);
    const [greska, setGreska] = useState('');
    const [otvorena, setOtvorena] = useState<number | null>(null);
    const [izvozi, setIzvozi] = useState(false);

    const trazi = useCallback((naStranu: number) => {
        setUcitava(true);
        api.pretrazi({ q, od, doDatuma, status: status || undefined }, naStranu, VELICINA_STRANE)
            .then(s => {
                setPorudzbine(s.content);
                setUkupno(s.totalElements);
                setUkupnoStrana(s.totalPages);
                setStrana(naStranu);
                setUcitava(false);
                setGreska('');
            })
            .catch(e => {
                setGreska(e instanceof ApiError ? (e.body?.message ?? 'Nije uspelo.') : 'Server ne odgovara.');
                setUcitava(false);
            });
    }, [q, od, doDatuma, status]);

    // Kucanje u polje za pretragu ne sme da šalje zahtev na svako slovo.
    useEffect(() => {
        const t = setTimeout(() => trazi(0), 350);
        return () => clearTimeout(t);
    }, [trazi]);

    /** Opseg za prečicu „poslednjih N dana", zaključno sa danas. */
    const opsegZa = (dana: number) => {
        const danas = new Date();
        const pocetak = new Date();
        pocetak.setDate(danas.getDate() - dana);
        return { od: uPolje(pocetak), do: uPolje(danas) };
    };

    const postaviOpseg = (dana: number) => {
        const o = opsegZa(dana);
        setOd(o.od);
        setDoDatuma(o.do);
    };

    // Prečica je „upaljena" kad polja tačno odgovaraju njenom opsegu — bez ovoga
    // pilula posle klika izgleda isto kao pre, pa deluje da dugme ne radi.
    const opsegAktivan = (dana: number) => {
        const o = opsegZa(dana);
        return od === o.od && doDatuma === o.do;
    };

    const imaFilter = q !== '' || od !== '' || doDatuma !== '' || status !== '';

    /**
     * Izvoz u CSV. Ne izvozi se ono što je na ekranu nego SVE što odgovara
     * filterima — strana od 20 redova nikome ne treba u tabeli.
     *
     * Razdvajač je `;`, a ne zarez: Excel na srpskom podešavanju očekuje `;`, a
     * sa zarezom bi ceo red upao u jednu ćeliju. BOM na početku je da Excel
     * prepozna UTF-8, inače su kvačice krš.
     */
    const izvezi = async () => {
        setIzvozi(true);
        setGreska('');
        try {
            const sve = await api.pretrazi({ q, od, doDatuma, status: status || undefined }, 0, 5000);

            const polje = (v: unknown) => {
                const t = String(v ?? '');
                return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
            };
            const zaglavlje = ['broj', 'datum', 'kupac', 'status', 'nacin', 'stavke', 'osnovica', 'popust', 'naplaceno', 'napomena'];
            const redovi = sve.content.map(p => {
                const osnovica = p.originalnaCena ?? p.ukupanIznos;
                return [
                    p.porudzbinaId,
                    formatirajDatum(p.datum),
                    p.korisnikIme ?? '',
                    STATUS_LABELA[p.status],
                    tipLabela(p.tipPorudzbine),
                    p.stavke.map(s => `${s.kolicina}x ${s.nazivProizvoda}`).join(' | '),
                    Math.round(osnovica),
                    Math.round(osnovica - p.ukupanIznos),
                    Math.round(p.ukupanIznos),
                    p.napomena ?? '',
                ].map(polje).join(';');
            });

            const csv = '\uFEFF' + [zaglavlje.join(';'), ...redovi].join('\r\n');
            const veza = document.createElement('a');
            veza.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
            veza.download = `porudzbine-${new Date().toISOString().slice(0, 10)}.csv`;
            veza.click();
            URL.revokeObjectURL(veza.href);
        } catch (e) {
            setGreska(e instanceof ApiError ? (e.body?.message ?? 'Izvoz nije uspeo.') : 'Server ne odgovara.');
        } finally {
            setIzvozi(false);
        }
    };

    return (
        <div>
            <header className={styles.glava}>
                <div>
                    <span className={styles.eyeb}>šta je bilo</span>
                    <h1 className={styles.naslov}>Porudžbine</h1>
                </div>
                <div className={styles.alatke}>
                    <span className={styles.pretragaOkvir}>
                        <Lupa size={15} />
                        <input
                            className={styles.pretragaInput}
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="broj, kupac ili proizvod…"
                        />
                    </span>
                </div>
            </header>

            <div className={styles.filteri}>
                <label className={styles.filterPolje}>
                    <span className={styles.lab}>od</span>
                    <input type="date" className={styles.unosVreme} value={od}
                           onChange={e => setOd(e.target.value)} max={doDatuma || undefined} />
                </label>
                <label className={styles.filterPolje}>
                    <span className={styles.lab}>do</span>
                    <input type="date" className={styles.unosVreme} value={doDatuma}
                           onChange={e => setDoDatuma(e.target.value)} min={od || undefined} />
                </label>

                <div className={styles.filterPolje}>
                    <span className={styles.lab}>brzo</span>
                    <div className={styles.pilule}>
                        {([[0, 'danas'], [6, '7 dana'], [29, '30 dana']] as const).map(([dana, naziv]) => (
                            <button
                                key={naziv}
                                type="button"
                                className={opsegAktivan(dana) ? styles.pilulaOn : styles.pilula}
                                onClick={() => postaviOpseg(dana)}
                                aria-pressed={opsegAktivan(dana)}
                            >
                                {naziv}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.filterPolje}>
                    <span className={styles.lab}>status</span>
                    <div className={styles.pilule}>
                        {STATUSI.map(s => (
                            <button
                                key={s.kljuc || 'sve'}
                                type="button"
                                className={status === s.kljuc ? styles.pilulaOn : styles.pilula}
                                onClick={() => setStatus(s.kljuc)}
                                aria-pressed={status === s.kljuc}
                            >
                                {s.naziv}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {greska && <p className={styles.greska}>{greska}</p>}

            {ucitava ? (
                <Ucitavanje tekst="tražim porudžbine" />
            ) : (
                <>
                    {/* Traka se crta i kad nema nijednog reda: u njoj je jedini
                        način da se filteri ponište jednim klikom, a to je baš
                        tada i najpotrebnije. Ranije je stajala uz tabelu, pa je
                        prazan rezultat vodio u ćorsokak. */}
                    {(porudzbine.length > 0 || imaFilter) && (
                        <div className={styles.trakaIznad}>
                            <p className={styles.brojac}>
                                {ukupno === 0 ? 'ništa ne odgovara filterima' : (
                                    <>
                                        {ukupno} {rec(ukupno)}
                                        {ukupnoStrana > 1 && ` · strana ${strana + 1} od ${ukupnoStrana}`}
                                    </>
                                )}
                            </p>
                            <div className={styles.alatke}>
                                {imaFilter && (
                                    <button
                                        type="button"
                                        className={styles.dugmeTiho}
                                        onClick={() => { setQ(''); setOd(''); setDoDatuma(''); setStatus(''); }}
                                    >
                                        PONIŠTI FILTERE
                                    </button>
                                )}
                                {ukupno > 0 && (
                                    <button
                                        type="button"
                                        className={styles.dugme}
                                        onClick={izvezi}
                                        disabled={izvozi}
                                        title="Preuzima SVE porudžbine koje odgovaraju filterima, ne samo ovu stranu"
                                    >
                                        <NatpisDugmeta uToku={izvozi} opis="Pripremam izvoz">↓ CSV</NatpisDugmeta>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {!ucitava && (porudzbine.length === 0 ? (
                <p className={styles.prazno}>
                    {imaFilter ? 'probaj širi opseg ili drugi pojam' : 'još nema porudžbina'}
                </p>
            ) : (
                <>
                    <div className={styles.kartica}>
                        <table className={styles.tabela}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>broj</th>
                                    <th className={styles.th}>kada</th>
                                    <th className={styles.th}>kupac</th>
                                    <th className={`${styles.th} ${styles.desno}`}>stavki</th>
                                    <th className={`${styles.th} ${styles.desno}`}>iznos</th>
                                    <th className={`${styles.th} ${styles.desno}`}>status</th>
                                    <th className={`${styles.th} ${styles.desno}`}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {porudzbine.map(p => {
                                    const otvoreno = otvorena === p.porudzbinaId;
                                    const popust = p.originalnaCena != null && p.originalnaCena > p.ukupanIznos
                                        ? p.originalnaCena - p.ukupanIznos
                                        : 0;
                                    const prebaci = () => setOtvorena(otvoreno ? null : p.porudzbinaId);
                                    return [
                                        <tr
                                            key={p.porudzbinaId}
                                            className={otvoreno ? styles.redTabeleOtvoren : styles.redTabele}
                                            onClick={prebaci}
                                            // Red je interaktivan, pa mora i sa tastature.
                                            tabIndex={0}
                                            role="button"
                                            aria-expanded={otvoreno}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); prebaci(); }
                                            }}
                                        >
                                            <td className={styles.td}><b>#{p.porudzbinaId}</b></td>
                                            <td className={styles.td}>
                                                <span className={styles.mail}>{formatirajDatum(p.datum)}</span>
                                            </td>
                                            <td className={styles.td}>{p.korisnikIme ?? '—'}</td>
                                            <td className={`${styles.td} ${styles.desno}`}>{p.stavke.length}</td>
                                            <td className={`${styles.td} ${styles.desno}`}>
                                                <b>{Math.round(p.ukupanIznos)}</b>
                                            </td>
                                            <td className={`${styles.td} ${styles.desno}`}>
                                                <span className={p.status === 'OTKAZANA' ? styles.tagNe : styles.tagDa}>
                                                    {STATUS_LABELA[p.status]}
                                                </span>
                                            </td>
                                            <td className={`${styles.td} ${styles.desno}`}>
                                                <span className={styles.akcija} aria-hidden="true">
                                                    {otvoreno ? 'sakrij' : 'detalji'}
                                                </span>
                                            </td>
                                        </tr>,
                                        otvoreno && (
                                            <tr key={`${p.porudzbinaId}-detalji`}>
                                                <td className={styles.tdDetalji} colSpan={7}>
                                                    <div className={styles.detalji}>
                                                        <ul className={styles.stavke}>
                                                            {p.stavke.map((s, i) => (
                                                                <li key={i} className={styles.stavka}>
                                                                    <span className={styles.stavkaKol}>{s.kolicina}×</span>
                                                                    <span>
                                                                        {s.nazivProizvoda}
                                                                        {s.dodaci && s.dodaci.length > 0 && (
                                                                            <span className={styles.dodaci}>
                                                                                {' + '}
                                                                                {s.dodaci.map(d => d.nazivProizvoda).join(', ')}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                    <span className={styles.stavkaCena}>
                                                                        {Math.round(s.iznosStavke)}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>

                                                        <div className={styles.detaljiDesno}>
                                                            {p.tipPorudzbine && (
                                                                <p className={styles.detaljRed}>
                                                                    <span>način</span> <b>{tipLabela(p.tipPorudzbine)}</b>
                                                                </p>
                                                            )}
                                                            {popust > 0 && (
                                                                <p className={styles.detaljRed}>
                                                                    <span>popust</span> <b>−{Math.round(popust)}</b>
                                                                </p>
                                                            )}
                                                            <p className={styles.detaljRed}>
                                                                <span>ukupno</span> <b>{Math.round(p.ukupanIznos)} RSD</b>
                                                            </p>
                                                            {p.napomena && (
                                                                <p className={styles.napomenaGosta}>
                                                                    „{p.napomena}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    ];
                                })}
                            </tbody>
                        </table>
                    </div>

                    {ukupnoStrana > 1 && (
                        <div className={styles.pager}>
                            <button
                                type="button"
                                className={styles.dugmeTiho}
                                onClick={() => trazi(strana - 1)}
                                disabled={strana === 0}
                            >
                                prethodna
                            </button>
                            <span className={styles.pagerBroj}>{strana + 1} / {ukupnoStrana}</span>
                            <button
                                type="button"
                                className={styles.dugmeTiho}
                                onClick={() => trazi(strana + 1)}
                                disabled={strana + 1 >= ukupnoStrana}
                            >
                                sledeća
                            </button>
                        </div>
                    )}
                </>
            ))}
        </div>
    );
}
