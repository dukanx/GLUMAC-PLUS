import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Lupa } from '../Doodle';
import Ucitavanje, { NatpisDugmeta } from '../Ucitavanje';
import { sadrzi } from '../../utils/tekst';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/korisnici';
import { ApiError } from '../../api/client';
import { useSekcija } from './kes';
import styles from './Admin.module.css';

/**
 * Admin → Korisnici: svi nalozi, ispravka bodova i blokiranje.
 *
 * Blokiranje je jedini način da se gostu oduzme pristup — spuštanje uloge tu ne
 * pomaže jer gost nema ulogu koju bi izgubio. Blokada važi odmah, i za već
 * izdate tokene, jer je provera i u `JwtAuthenticationFilter`.
 */
export default function AdminKorisnici() {
    const { korisnik: ja } = useAuth();
    const { podaci: svi, zapamti: setSvi, ucitava, greska, setGreska } =
        useSekcija<api.Korisnik[]>('korisnici', api.getSvi, []);
    const [pretraga, setPretraga] = useState('');
    const [samoGosti, setSamoGosti] = useState(false);
    const [uToku, setUToku] = useState<number | null>(null);
    const [bodoviZa, setBodoviZa] = useState<api.Korisnik | null>(null);

    const prikazani = useMemo(() => svi
        .filter(k => !samoGosti || k.uloga === 'KORISNIK')
        .filter(k => sadrzi(k.ime, pretraga) || sadrzi(k.email, pretraga))
        .sort((a, b) => a.ime.localeCompare(b.ime, 'sr')),
        [svi, pretraga, samoGosti]);

    const zameni = (nov: api.Korisnik) =>
        setSvi(prev => prev.map(k => k.id === nov.id ? nov : k));


    const prebaciBlokadu = async (k: api.Korisnik) => {
        setUToku(k.id);
        setGreska('');
        try {
            zameni(await api.postaviBlokiran(k.id, !k.blokiran));
        } catch (e) {
            setGreska(e instanceof ApiError ? (e.body?.message ?? 'Nije uspelo.') : 'Server ne odgovara.');
        } finally {
            setUToku(null);
        }
    };

    return (
        <div>
            <header className={styles.glava}>
                <div>
                    <span className={styles.eyeb}>ko naručuje</span>
                    <h1 className={styles.naslov}>Korisnici</h1>
                </div>
                <div className={styles.alatke}>
                    <button
                        type="button"
                        className={samoGosti ? styles.pilulaOn : styles.pilula}
                        onClick={() => setSamoGosti(v => !v)}
                        aria-pressed={samoGosti}
                    >
                        samo gosti
                    </button>
                    <span className={styles.pretragaOkvir}>
                        <Lupa size={15} />
                        <input
                            className={styles.pretragaInput}
                            value={pretraga}
                            onChange={e => setPretraga(e.target.value)}
                            placeholder="ime ili e-mail…"
                        />
                    </span>
                </div>
            </header>

            {greska && <p className={styles.greska}>{greska}</p>}

            {ucitava ? (
                <Ucitavanje tekst="učitavam korisnike" />
            ) : prikazani.length === 0 ? (
                <p className={styles.prazno}>
                    {pretraga ? `nismo pronašli nikoga za „${pretraga}"` : 'nema korisnika'}
                </p>
            ) : (
                <>
                    <div className={styles.kartica} style={{ marginTop: 20 }}>
                        <table className={styles.tabela}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>korisnik</th>
                                    <th className={`${styles.th} ${styles.desno}`}>bodovi</th>
                                    <th className={`${styles.th} ${styles.desno}`}>nivo</th>
                                    <th className={`${styles.th} ${styles.desno}`}>status</th>
                                    <th className={`${styles.th} ${styles.desno}`}>akcije</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prikazani.map(k => {
                                    const jaSam = k.id === ja?.id;
                                    const radi = uToku === k.id;
                                    return (
                                        <tr key={k.id}>
                                            <td className={styles.td}>
                                                <b className={styles.naziv}>
                                                    {k.ime}
                                                    {jaSam && <span className={styles.ti}>to si ti</span>}
                                                    {k.uloga !== 'KORISNIK' && (
                                                        <span className={styles.ti}>{k.uloga.toLowerCase()}</span>
                                                    )}
                                                </b>
                                                <span className={styles.mail}>{k.email}</span>
                                            </td>
                                            <td className={`${styles.td} ${styles.desno}`}>
                                                <b>{Math.round(k.brojBodova)}</b>
                                            </td>
                                            <td className={`${styles.td} ${styles.desno}`}>
                                                <span className={styles.alergeni}>{k.loyaltyNivo ?? '—'}</span>
                                            </td>
                                            <td className={`${styles.td} ${styles.desno}`}>
                                                <span className={k.blokiran ? styles.tagNe : styles.tagDa}>
                                                    {k.blokiran ? 'blokiran' : 'aktivan'}
                                                </span>
                                            </td>
                                            <td className={`${styles.td} ${styles.desno}`}>
                                                <button
                                                    type="button"
                                                    className={styles.akcija}
                                                    onClick={() => setBodoviZa(k)}
                                                    disabled={radi}
                                                >
                                                    bodovi
                                                </button>
                                                <span className={styles.akcijaSep}>·</span>
                                                <button
                                                    type="button"
                                                    className={styles.akcijaTiha}
                                                    onClick={() => prebaciBlokadu(k)}
                                                    disabled={radi || (jaSam && !k.blokiran)}
                                                    title={jaSam && !k.blokiran
                                                        ? 'Sebe ne možeš blokirati — ostao bi zaključan van panela.'
                                                        : undefined}
                                                >
                                                    <NatpisDugmeta
                                                        uToku={radi}
                                                        opis={k.blokiran ? 'Odblokiravam' : 'Blokiram'}
                                                    >
                                                        {k.blokiran ? 'odblokiraj' : 'blokiraj'}
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
                        Blokiran nalog ne može ni da se prijavi ni da naruči, i to važi odmah — i za nekoga ko
                        je već prijavljen. Nalog ostaje u bazi sa svim porudžbinama.
                    </p>
                </>
            )}

            {bodoviZa && (
                <BodoviModal
                    korisnik={bodoviZa}
                    onZatvori={() => setBodoviZa(null)}
                    onSacuvano={nov => { zameni(nov); setBodoviZa(null); }}
                />
            )}
        </div>
    );
}

/** Ispravka bodova. Šalje se promena, pa polje prima i negativan broj. */
function BodoviModal({ korisnik, onZatvori, onSacuvano }: {
    korisnik: api.Korisnik;
    onZatvori: () => void;
    onSacuvano: (k: api.Korisnik) => void;
}) {
    const [unos, setUnos] = useState('');
    const [salje, setSalje] = useState(false);
    const [greska, setGreska] = useState('');

    useEffect(() => {
        const naEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onZatvori(); };
        document.addEventListener('keydown', naEsc);
        return () => document.removeEventListener('keydown', naEsc);
    }, [onZatvori]);

    const promena = Number(unos);
    const ispravan = unos !== '' && unos !== '-' && Number.isFinite(promena) && promena !== 0;
    const trenutno = Math.round(korisnik.brojBodova);
    const novoStanje = trenutno + (ispravan ? promena : 0);

    const sacuvaj = async () => {
        if (!ispravan) return setGreska('Unesi koliko bodova dodaješ ili oduzimaš.');
        if (novoStanje < 0) return setGreska(`Korisnik ima ${trenutno} bodova, ne može se oduzeti ${Math.abs(promena)}.`);
        setSalje(true);
        setGreska('');
        try {
            onSacuvano(await api.promeniBodove(korisnik.id, promena));
        } catch (e) {
            setGreska(e instanceof ApiError ? (e.body?.message ?? 'Nije uspelo.') : 'Server ne odgovara.');
            setSalje(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onZatvori}>
            <motion.div
                className={styles.modal}
                style={{ maxWidth: 460 }}
                initial={{ opacity: 0, y: 24, scale: .98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: .3, ease: [0.22, 1, 0.36, 1] }}
                onClick={e => e.stopPropagation()}
            >
                <span className={styles.modalTape} />
                <button type="button" className={styles.modalZatvori} onClick={onZatvori} aria-label="Zatvori">✕</button>

                <span className={styles.eyeb}>ispravka bodova</span>
                <h2 className={styles.modalNaslov}>{korisnik.ime}</h2>

                <div className={styles.polja}>
                    <p className={styles.stanje}>
                        <b>{trenutno}</b> <span className={styles.stanjeTiho}>
                            {trenutno === 1 ? 'bod' : 'bodova'}
                        </span>
                        <span className={styles.stanjeTiho}> · </span>
                        <b>{korisnik.loyaltyNivo ?? 'bez nivoa'}</b>
                    </p>

                    <label className={styles.polje}>
                        <span className={styles.lab}>koliko dodaješ ili oduzimaš (npr. 50 ili −20)</span>
                        <input
                            className={styles.unos}
                            value={unos}
                            onChange={e => setUnos(e.target.value.replace(/[^\d-]/g, ''))}
                            onKeyDown={e => { if (e.key === 'Enter') sacuvaj(); }}
                            inputMode="numeric"
                            placeholder="0"
                            autoFocus
                        />
                    </label>

                    {ispravan && (
                        <p className={styles.info} style={{ marginTop: 0 }}>
                            posle ispravke: <b>{novoStanje}</b> bodova
                            {novoStanje < 0 && ' — ne može ispod nule'}
                        </p>
                    )}

                    <p className={styles.napomena}>
                        Nivo se preračunava po istom pravilu kao pri poručivanju, pa može i da padne ako se
                        bodovi smanje.
                    </p>
                </div>

                {greska && <p className={styles.modalGreska}>{greska}</p>}

                <div className={styles.modalDugmad}>
                    <button type="button" className={styles.dugmeTiho} onClick={onZatvori} disabled={salje}>
                        odustani
                    </button>
                    <button type="button" className={styles.dugme} onClick={sacuvaj} disabled={salje || !ispravan}>
                        <NatpisDugmeta uToku={salje} opis="Čuvam">SAČUVAJ</NatpisDugmeta>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
