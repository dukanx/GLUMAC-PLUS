import { useCallback, useMemo, useState } from 'react';
import Ucitavanje from '../Ucitavanje';
import * as api from '../../api/analitika';
import type { Dan } from '../../api/analitika';
import { useSekcija } from './kes';
import styles from './Admin.module.css';

/**
 * Admin → Pregled: kako je lokal radio u izabranom periodu.
 *
 * Sve stiže jednim pozivom (`/api/analitika/pregled`) jer je baza u Frankfurtu
 * i svako mrežno putovanje košta ~50 ms — četiri endpointa značila bi četiri
 * čekanja pre nego što se stranica sklopi.
 *
 * Grafikon je namerno HTML, a ne SVG: u SVG-u sa `viewBox`-om skalira se sve,
 * pa bi na širokom ekranu natpisi i linije bili krupniji nego na uskom.
 */

const PRAZNO: api.Pregled = {
    prihod: 0, brojPorudzbina: 0, prosecnaKorpa: 0, popust: 0,
    statusi: { nova: 0, uPripremi: 0, spremna: 0, realizovana: 0, otkazana: 0, ukupno: 0 },
    topProizvodi: [], poDanima: [],
};

/** `yyyy-MM-dd` iz lokalnog datuma (ne preko ISO, da vremenska zona ne pomeri dan). */
const uPolje = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** `2026-08-01` → `Date` u lokalnoj zoni; `new Date(string)` bi ga pročitao kao UTC. */
const izPolja = (s: string) => {
    const [g, m, d] = s.split('-').map(Number);
    return new Date(g, m - 1, d);
};

const dinara = (n: number) => Math.round(n).toLocaleString('sr-RS');

const kratakDatum = (s: string) =>
    izPolja(s).toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'numeric' });

// `sr-RS` bi ispisao ćirilicom („понедељак, 20. јул"), a ceo panel je latinicom.
const punDatum = (s: string) =>
    izPolja(s).toLocaleDateString('sr-Latn-RS', { weekday: 'long', day: 'numeric', month: 'long' });

/** Srpska množina uz broj porudžbina. */
function recPorudzbina(n: number): string {
    const j = n % 10, d = n % 100;
    if (j === 1 && d !== 11) return 'porudžbina';
    if (j >= 2 && j <= 4 && (d < 12 || d > 14)) return 'porudžbine';
    return 'porudžbina';
}

export default function AdminPregled() {
    const danas = useMemo(() => new Date(), []);
    const preN = useCallback((dana: number) => {
        const d = new Date(danas);
        d.setDate(danas.getDate() - dana);
        return uPolje(d);
    }, [danas]);

    const [od, setOd] = useState(() => preN(6));
    const [doDatuma, setDoDatuma] = useState(() => uPolje(danas));

    const dohvati = useCallback(() => api.pregled(od, doDatuma), [od, doDatuma]);
    const { podaci, ucitava, greska } = useSekcija(`pregled:${od}:${doDatuma}`, dohvati, PRAZNO);

    const postaviOpseg = (dana: number) => {
        setOd(preN(dana));
        setDoDatuma(uPolje(danas));
    };
    const opsegAktivan = (dana: number) => od === preN(dana) && doDatuma === uPolje(danas);

    const s = podaci.statusi;

    return (
        <div>
            <header className={styles.glava}>
                <div>
                    <span className={styles.eyeb}>kako ide</span>
                    <h1 className={styles.naslov}>Pregled</h1>
                </div>
            </header>

            <div className={styles.filteri}>
                <label className={styles.filterPolje}>
                    <span className={styles.lab}>od</span>
                    <input type="date" className={styles.unosVreme} value={od}
                           onChange={e => setOd(e.target.value)} max={doDatuma} />
                </label>
                <label className={styles.filterPolje}>
                    <span className={styles.lab}>do</span>
                    <input type="date" className={styles.unosVreme} value={doDatuma}
                           onChange={e => setDoDatuma(e.target.value)} min={od} />
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
            </div>

            {greska && <p className={styles.greska}>{greska}</p>}

            {ucitava ? (
                <Ucitavanje tekst="računam" />
            ) : (
                <>
                    <div className={styles.kpiRed}>
                        <Kpi oznaka="prihod" vrednost={dinara(podaci.prihod)} jedinica="RSD" istaknuto />
                        <Kpi oznaka="porudžbina" vrednost={String(podaci.brojPorudzbina)}
                             jedinica={podaci.brojPorudzbina === 0 ? 'nijedna' : 'preuzeto'} />
                        <Kpi oznaka="prosečna korpa" vrednost={dinara(podaci.prosecnaKorpa)} jedinica="RSD" />
                        <Kpi oznaka="dato kroz popust" vrednost={dinara(podaci.popust)} jedinica="RSD" />
                    </div>

                    <Stubici dani={podaci.poDanima} />

                    <div className={styles.dvaStuba}>
                        <section>
                            <h2 className={styles.podnaslov}>Šta se najviše prodaje</h2>
                            {podaci.topProizvodi.length === 0 ? (
                                <p className={styles.prazno}>u ovom periodu ništa nije prodato</p>
                            ) : (
                                <div className={styles.kartica}>
                                    <table className={styles.tabela}>
                                        <thead>
                                            <tr>
                                                <th className={styles.th}>proizvod</th>
                                                <th className={`${styles.th} ${styles.desno}`}>kom.</th>
                                                <th className={`${styles.th} ${styles.desno}`}>promet</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {podaci.topProizvodi.map((p, i) => {
                                                const najbolji = podaci.topProizvodi[0].komada || 1;
                                                return (
                                                    <tr key={p.proizvodId}>
                                                        <td className={styles.td}>
                                                            <span className={styles.mesto}>{i + 1}.</span>
                                                            {p.naziv}
                                                            {/* Traka nosi isti podatak kao kolona „kom." — samo da se
                                                                odnos vidi bez čitanja brojeva. */}
                                                            <span className={styles.trakaOkvir} aria-hidden="true">
                                                                <span
                                                                    className={styles.traka}
                                                                    style={{ width: `${(p.komada / najbolji) * 100}%` }}
                                                                />
                                                            </span>
                                                        </td>
                                                        <td className={`${styles.td} ${styles.desno}`}>
                                                            <b>{p.komada % 1 === 0 ? p.komada : p.komada.toFixed(1)}</b>
                                                        </td>
                                                        <td className={`${styles.td} ${styles.desno}`}>
                                                            {dinara(p.promet)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <p className={styles.fusnota}>
                                Računa se i ono što je naručeno kao dodatak uz drugu stavku.
                            </p>
                        </section>

                        <section>
                            <h2 className={styles.podnaslov}>Kako su se završile</h2>
                            <div className={styles.statusi}>
                                <StatusRed naziv="preuzete" broj={s.realizovana} ukupno={s.ukupno} />
                                <StatusRed naziv="otkazane" broj={s.otkazana} ukupno={s.ukupno} upozorenje />
                                <StatusRed naziv="nove" broj={s.nova} ukupno={s.ukupno} />
                                <StatusRed naziv="u pripremi" broj={s.uPripremi} ukupno={s.ukupno} />
                                <StatusRed naziv="spremne" broj={s.spremna} ukupno={s.ukupno} />
                            </div>
                            <p className={styles.fusnota}>
                                Ukupno {s.ukupno} {recPorudzbina(s.ukupno)} u periodu. Prihod se računa samo
                                od preuzetih.
                            </p>
                        </section>
                    </div>
                </>
            )}
        </div>
    );
}

/** Jedan krupan broj sa oznakom — ono što se prvo gleda. */
function Kpi({ oznaka, vrednost, jedinica, istaknuto }: {
    oznaka: string; vrednost: string; jedinica: string; istaknuto?: boolean;
}) {
    return (
        <div className={istaknuto ? styles.kpiJak : styles.kpi}>
            <span className={styles.kpiOznaka}>{oznaka}</span>
            <span className={styles.kpiBroj}>{vrednost}</span>
            <span className={styles.kpiJedinica}>{jedinica}</span>
        </div>
    );
}

/**
 * Prihod po danima.
 *
 * Jedan niz podataka, pa nema legende — naslov kaže šta se gleda. Ne piše se
 * broj iznad svakog stubića (na 30 dana to je zid brojeva) nego samo iznad
 * najboljeg dana; ostalo se pročita prelaskom miša ili tabom.
 */
function Stubici({ dani }: { dani: Dan[] }) {
    const [aktivan, setAktivan] = useState<number | null>(null);
    const max = Math.max(...dani.map(d => d.prihod), 0);
    const najboljiIndeks = dani.findIndex(d => d.prihod === max && max > 0);

    // Na dugom periodu se ne može ispisati svaki datum — bira se svaki n-ti,
    // uvek uključujući prvi i poslednji dan.
    const korak = dani.length <= 10 ? 1 : dani.length <= 20 ? 3 : 5;
    const piseDatum = (i: number) => i === 0 || i === dani.length - 1 || i % korak === 0;

    if (dani.length === 0) return null;

    return (
        <section className={styles.grafSekcija}>
            <div className={styles.grafGlava}>
                <h2 className={styles.podnaslov}>Prihod po danima</h2>
                {/* Bez prometa nema ni „najviše" — „najviše 0 RSD" ne kaže ništa. */}
                {max > 0 && <span className={styles.grafMax}>najviše {dinara(max)} RSD</span>}
            </div>

            <div className={styles.graf}>
                {max === 0 ? (
                    <p className={styles.prazno}>u ovom periodu nije bilo prometa</p>
                ) : (
                    <div className={styles.stubici} role="group" aria-label="Prihod po danima">
                        {dani.map((d, i) => {
                            const visina = max === 0 ? 0 : (d.prihod / max) * 100;
                            return (
                                <div key={d.dan} className={styles.stubacOkvir}>
                                    {aktivan === i && (
                                        <span className={styles.oblacic} role="status">
                                            <b>{dinara(d.prihod)} RSD</b>
                                            <span className={styles.oblacicRed}>
                                                {punDatum(d.dan)} · {d.brojPorudzbina} {recPorudzbina(d.brojPorudzbina)}
                                            </span>
                                        </span>
                                    )}
                                    <div
                                        className={i === najboljiIndeks ? styles.stubacJak : styles.stubac}
                                        // Nulti dan i dalje mora da se može fokusirati — „nula" je podatak.
                                        style={{ height: `${Math.max(visina, d.prihod > 0 ? 2 : 0)}%` }}
                                        tabIndex={0}
                                        aria-label={`${punDatum(d.dan)}: ${dinara(d.prihod)} dinara, ${d.brojPorudzbina} ${recPorudzbina(d.brojPorudzbina)}`}
                                        onMouseEnter={() => setAktivan(i)}
                                        onMouseLeave={() => setAktivan(null)}
                                        onFocus={() => setAktivan(i)}
                                        onBlur={() => setAktivan(null)}
                                    />
                                    <span className={styles.stubacDatum}>
                                        {piseDatum(i) ? kratakDatum(d.dan) : ''}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

/** Jedan status sa udelom — traka je tu da se odnos vidi bez računanja. */
function StatusRed({ naziv, broj, ukupno, upozorenje }: {
    naziv: string; broj: number; ukupno: number; upozorenje?: boolean;
}) {
    const udeo = ukupno === 0 ? 0 : (broj / ukupno) * 100;
    return (
        <div className={styles.statusRed}>
            <span className={styles.statusNaziv}>{naziv}</span>
            <span className={styles.trakaOkvir} aria-hidden="true">
                <span
                    className={upozorenje ? styles.trakaNe : styles.traka}
                    style={{ width: `${udeo}%` }}
                />
            </span>
            <span className={styles.statusBroj}>
                <b>{broj}</b>
                <span className={styles.statusUdeo}>{ukupno === 0 ? '' : `${Math.round(udeo)}%`}</span>
            </span>
        </div>
    );
}
