import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { NatpisDugmeta } from '../Ucitavanje';
import type { Proizvod, Ukus } from '../../types/proizvod';
import type { Alergen } from '../../api/alergeni';
import * as proizvodiApi from '../../api/proizvodi';
import * as alergeniApi from '../../api/alergeni';
import { ApiError } from '../../api/client';
import styles from './AdminMeni.module.css';

/** Sentinel u <select>-u — ne sme da se poklopi ni sa jednim nazivom kategorije. */
const NOVA = '__nova__';

interface Props {
    /** `null` = novi proizvod. */
    proizvod: Proizvod | null;
    alergeni: Alergen[];
    kategorije: string[];
    /** Novi alergen mora da stigne i do roditelja — lista je tamo. */
    onAlergenDodat: (a: Alergen) => void;
    onZatvori: () => void;
    onSacuvano: () => void;
}

/**
 * Forma za novi proizvod i izmenu postojećeg.
 *
 * Alergeni se čuvaju posebnim pozivom jer ih backend drži van osnovnog DTO-a;
 * kod novog proizvoda zato prvo mora da nastane proizvod pa tek onda alergeni.
 */
export default function ProizvodModal({ proizvod, alergeni, kategorije, onAlergenDodat, onZatvori, onSacuvano }: Props) {
    const [naziv, setNaziv] = useState(proizvod?.naziv ?? '');
    const [tip, setTip] = useState(proizvod?.tip ?? kategorije[0] ?? '');
    // Kategorija nije šifarnik nego običan tekst na proizvodu — select čuva od
    // greške u kucanju, a ovo je izlaz kad zaista treba nova.
    const [novaKat, setNovaKat] = useState(kategorije.length === 0);
    const [opis, setOpis] = useState(proizvod?.opis ?? '');
    const [cena, setCena] = useState(proizvod ? String(Math.round(proizvod.cena)) : '');
    const [ukus, setUkus] = useState<Ukus | ''>(proizvod?.ukus ?? '');
    const [izabrani, setIzabrani] = useState<number[]>(proizvod?.alergeniIds ?? []);
    const [dodajeAlergen, setDodajeAlergen] = useState(false);
    const [noviNaziv, setNoviNaziv] = useState('');
    const [salje, setSalje] = useState(false);
    const [greska, setGreska] = useState('');

    useEffect(() => {
        const naEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onZatvori(); };
        document.addEventListener('keydown', naEsc);
        return () => document.removeEventListener('keydown', naEsc);
    }, [onZatvori]);

    const toggleAlergen = (id: number) =>
        setIzabrani(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    /** Novi alergen se snima odmah (zaseban resurs) i ostaje čekiran na ovoj stavci. */
    const napraviAlergen = async () => {
        const naziv = noviNaziv.trim();
        if (!naziv) return setDodajeAlergen(false);
        const postoji = alergeni.find(a => a.naziv.toLowerCase() === naziv.toLowerCase());
        if (postoji) {
            setIzabrani(prev => prev.includes(postoji.id) ? prev : [...prev, postoji.id]);
            setDodajeAlergen(false);
            return;
        }
        try {
            const nov = await alergeniApi.kreiraj(naziv);
            onAlergenDodat(nov);
            setIzabrani(prev => prev.includes(nov.id) ? prev : [...prev, nov.id]);
            setDodajeAlergen(false);
        } catch (e) {
            setGreska(e instanceof ApiError ? (e.body?.message ?? 'Alergen nije sačuvan.') : 'Server ne odgovara.');
        }
    };

    const sacuvaj = async () => {
        const cenaBroj = Number(cena);
        if (!naziv.trim()) return setGreska('Naziv je obavezan.');
        if (!tip.trim()) return setGreska('Kategorija je obavezna.');
        if (!Number.isFinite(cenaBroj) || cenaBroj <= 0) return setGreska('Cena mora biti veća od nule.');

        setSalje(true);
        setGreska('');
        try {
            const unos = {
                naziv: naziv.trim(),
                tip: tip.trim(),
                opis: opis.trim() || null,
                cena: Math.round(cenaBroj),
                ukus: ukus || null,
                dostupan: proizvod ? proizvod.dostupan !== false : true,
            };
            const sacuvan = proizvod
                ? await proizvodiApi.izmeni(proizvod.id, unos)
                : await proizvodiApi.kreiraj(unos);

            // Alergeni se šalju samo ako su se promenili — poziv je zaseban.
            const staro = [...(proizvod?.alergeniIds ?? [])].sort().join(',');
            if (staro !== [...izabrani].sort().join(',')) {
                await proizvodiApi.postaviAlergene(sacuvan.id, izabrani);
            }
            onSacuvano();
        } catch (e) {
            setGreska(e instanceof ApiError
                ? (e.body?.message ?? 'Nije uspelo čuvanje.')
                : 'Server ne odgovara.');
            setSalje(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onZatvori}>
            <motion.div
                className={styles.modal}
                initial={{ opacity: 0, y: 24, scale: .98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: .3, ease: [0.22, 1, 0.36, 1] }}
                onClick={e => e.stopPropagation()}
            >
                <span className={styles.modalTape} />
                <button type="button" className={styles.modalZatvori} onClick={onZatvori} aria-label="Zatvori">✕</button>

                <span className={styles.eyeb}>{proizvod ? 'izmena' : 'nova stavka'}</span>
                <h2 className={styles.modalNaslov}>{proizvod ? proizvod.naziv : 'Novi proizvod'}</h2>

                <div className={styles.polja}>
                    <label className={styles.polje}>
                        <span className={styles.lab}>naziv</span>
                        <input className={styles.unos} value={naziv} onChange={e => setNaziv(e.target.value)} />
                    </label>

                    <div className={styles.red}>
                        <div className={styles.polje}>
                            <span className={styles.lab}>kategorija</span>
                            {novaKat ? (
                                <input
                                    className={styles.unos}
                                    value={tip}
                                    onChange={e => setTip(e.target.value)}
                                    placeholder="naziv nove kategorije"
                                    autoFocus
                                />
                            ) : (
                                <select
                                    className={styles.unos}
                                    value={tip}
                                    onChange={e => {
                                        if (e.target.value === NOVA) { setNovaKat(true); setTip(''); }
                                        else setTip(e.target.value);
                                    }}
                                >
                                    {kategorije.map(k => <option key={k} value={k}>{k}</option>)}
                                    <option value={NOVA}>+ nova kategorija…</option>
                                </select>
                            )}
                            {novaKat && (
                                <button
                                    type="button"
                                    className={styles.podLink}
                                    onClick={() => { setNovaKat(false); setTip(proizvod?.tip ?? kategorije[0] ?? ''); }}
                                >
                                    nazad na postojeće
                                </button>
                            )}
                        </div>

                        <label className={styles.poljeUsko}>
                            <span className={styles.lab}>cena (RSD)</span>
                            <input
                                className={styles.unos}
                                value={cena}
                                onChange={e => setCena(e.target.value.replace(/[^\d]/g, ''))}
                                inputMode="numeric"
                            />
                        </label>
                    </div>

                    <label className={styles.polje}>
                        <span className={styles.lab}>opis — samo ako naziv ne kaže sastav</span>
                        <input
                            className={styles.unos}
                            value={opis}
                            onChange={e => setOpis(e.target.value)}
                            placeholder="npr. pečenica, šunka, kulen, kačkavalj"
                            maxLength={500}
                        />
                    </label>

                    <div className={styles.polje}>
                        <span className={styles.lab}>ukus — određuje koji dodaci smeju uz stavku</span>
                        <div className={styles.pilule}>
                            {([['', 'nije primenljivo'], ['SLATKO', 'slatko'], ['SLANO', 'slano']] as const).map(([v, tekst]) => (
                                <button
                                    key={v || 'nema'}
                                    type="button"
                                    className={ukus === v ? styles.pilulaOn : styles.pilula}
                                    onClick={() => setUkus(v as Ukus | '')}
                                >
                                    {tekst}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Blok stoji i kad je lista prazna — inače izgleda kao da opcije nema.
                        Baza trenutno nema nijedan alergen, pa se prvi pravi ovde. */}
                    <div className={styles.polje}>
                        <span className={styles.lab}>alergeni</span>
                        {alergeni.length === 0 && !dodajeAlergen && (
                            <span className={styles.napomena}>još nijedan alergen nije upisan</span>
                        )}
                        <div className={styles.pilule}>
                            {alergeni.map(a => (
                                <button
                                    key={a.id}
                                    type="button"
                                    className={izabrani.includes(a.id) ? styles.pilulaOn : styles.pilula}
                                    onClick={() => toggleAlergen(a.id)}
                                    aria-pressed={izabrani.includes(a.id)}
                                >
                                    {a.naziv}
                                </button>
                            ))}
                            {dodajeAlergen ? (
                                <span className={styles.noviAlergen}>
                                    <input
                                        className={styles.unosMali}
                                        value={noviNaziv}
                                        onChange={e => setNoviNaziv(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') { e.preventDefault(); napraviAlergen(); }
                                            if (e.key === 'Escape') { e.stopPropagation(); setDodajeAlergen(false); }
                                        }}
                                        placeholder="npr. gluten"
                                        autoFocus
                                    />
                                    <button type="button" className={styles.pilula} onClick={napraviAlergen}>
                                        dodaj
                                    </button>
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.pilula}
                                    onClick={() => { setNoviNaziv(''); setDodajeAlergen(true); }}
                                >
                                    + novi
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {greska && <p className={styles.modalGreska}>{greska}</p>}

                <div className={styles.modalDugmad}>
                    <button type="button" className={styles.dugmeTiho} onClick={onZatvori} disabled={salje}>
                        odustani
                    </button>
                    <button type="button" className={styles.dugme} onClick={sacuvaj} disabled={salje}>
                        <NatpisDugmeta uToku={salje} opis="Čuvam">SAČUVAJ</NatpisDugmeta>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
