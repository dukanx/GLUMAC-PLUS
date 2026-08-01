import { useEffect, useMemo, useState } from 'react';
import Ucitavanje, { NatpisDugmeta } from '../Ucitavanje';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/korisnici';
import { ApiError } from '../../api/client';
import styles from './Admin.module.css';

/**
 * Admin → Zaposleni: ko sme u panel.
 *
 * Pristup se ne dodeljuje kroz novi nalog nego kroz ulogu — čovek se prvo
 * registruje kao svaki gost, pa mu se ovde podigne uloga. Zato „dodaj" traži
 * e-mail postojećeg naloga, a ne ime i lozinku.
 */

const OPIS_ULOGE: Record<api.Uloga, string> = {
    ADMIN: 'vidi ovaj panel i menja katalog',
    ZAPOSLENI: 'vodi porudžbine u panelu smene',
    KORISNIK: 'običan gost, bez pristupa panelu',
};

export default function AdminZaposleni() {
    const { korisnik: ja } = useAuth();
    const [svi, setSvi] = useState<api.Korisnik[]>([]);
    const [ucitava, setUcitava] = useState(true);
    const [greska, setGreska] = useState('');
    // Pamti se i koja uloga se upisuje, da tačkice iskoče na tačnoj piluli.
    const [uToku, setUToku] = useState<{ id: number; uloga: api.Uloga } | null>(null);

    const [email, setEmail] = useState('');
    const [dodaje, setDodaje] = useState(false);
    const [porukaDodavanja, setPorukaDodavanja] = useState('');

    useEffect(() => {
        api.getSvi()
            .then(d => { setSvi(d); setUcitava(false); })
            .catch(() => { setGreska('Ne mogu da učitam korisnike.'); setUcitava(false); });
    }, []);

    const osoblje = useMemo(
        () => svi.filter(k => k.uloga === 'ADMIN' || k.uloga === 'ZAPOSLENI')
                 .sort((a, b) => a.ime.localeCompare(b.ime, 'sr')),
        [svi]
    );

    const brojAdmina = osoblje.filter(k => k.uloga === 'ADMIN').length;

    const postavi = async (k: api.Korisnik, uloga: api.Uloga) => {
        if (k.uloga === uloga) return;
        setUToku({ id: k.id, uloga });
        setGreska('');
        try {
            const nov = await api.promeniUlogu(k.id, uloga);
            setSvi(prev => prev.map(x => x.id === k.id ? nov : x));
        } catch (e) {
            setGreska(e instanceof ApiError ? (e.body?.message ?? 'Nije uspelo.') : 'Server ne odgovara.');
        } finally {
            setUToku(null);
        }
    };

    const dodaj = async () => {
        const trazeni = email.trim();
        if (!trazeni) return;
        setDodaje(true);
        setPorukaDodavanja('');
        try {
            const k = await api.nadjiPoEmailu(trazeni);
            if (k.uloga !== 'KORISNIK') {
                setPorukaDodavanja(`${k.ime} već ima pristup panelu.`);
                return;
            }
            const nov = await api.promeniUlogu(k.id, 'ZAPOSLENI');
            setSvi(prev => prev.some(x => x.id === nov.id)
                ? prev.map(x => x.id === nov.id ? nov : x)
                : [...prev, nov]);
            setEmail('');
            setPorukaDodavanja(`${nov.ime} sad ima pristup panelu smene.`);
        } catch (e) {
            setPorukaDodavanja(e instanceof ApiError && e.status === 404
                ? 'Nema naloga sa tim e-mailom. Neka se osoba prvo registruje u aplikaciji.'
                : 'Ne mogu da pronađem nalog.');
        } finally {
            setDodaje(false);
        }
    };

    return (
        <div>
            <header className={styles.glava}>
                <div>
                    <span className={styles.eyeb}>ko sme u panel</span>
                    <h1 className={styles.naslov}>Zaposleni</h1>
                </div>
            </header>

            {greska && <p className={styles.greska}>{greska}</p>}

            {ucitava ? (
                <Ucitavanje tekst="učitavam zaposlene" />
            ) : (
                <>
                    <div className={styles.kartica} style={{ marginTop: 20 }}>
                        <table className={styles.tabela}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>ime</th>
                                    <th className={styles.th}>uloga</th>
                                    <th className={`${styles.th} ${styles.desno}`}>pristup</th>
                                </tr>
                            </thead>
                            <tbody>
                                {osoblje.length === 0 && (
                                    <tr>
                                        <td className={styles.td} colSpan={3}>
                                            <span className={styles.info}>niko osim tebe nema pristup panelu</span>
                                        </td>
                                    </tr>
                                )}
                                {osoblje.map(k => {
                                    const jaSam = k.id === ja?.id;
                                    // Poslednji admin ne sme da ostane bez uloge — panel bi ostao bez vlasnika.
                                    const poslednjiAdmin = k.uloga === 'ADMIN' && brojAdmina === 1;
                                    const zakljucan = jaSam || poslednjiAdmin;
                                    const radi = uToku?.id === k.id;
                                    const razlog = jaSam
                                        ? 'Sebi ne možeš menjati ulogu — ostao bi zaključan van panela.'
                                        : poslednjiAdmin
                                            ? 'Poslednji vlasnik mora da ostane vlasnik.'
                                            : undefined;
                                    return (
                                        <tr key={k.id}>
                                            <td className={styles.td}>
                                                <b className={styles.naziv}>
                                                    {k.ime}
                                                    {jaSam && <span className={styles.ti}>to si ti</span>}
                                                </b>
                                                <span className={styles.mail}>{k.email}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.pilule}>
                                                    {(['ZAPOSLENI', 'ADMIN'] as const).map(u => (
                                                        <button
                                                            key={u}
                                                            type="button"
                                                            className={k.uloga === u ? styles.pilulaOn : styles.pilula}
                                                            onClick={() => postavi(k, u)}
                                                            disabled={zakljucan || radi}
                                                            aria-pressed={k.uloga === u}
                                                            title={razlog ?? OPIS_ULOGE[u]}
                                                        >
                                                            {/* `visibility: hidden` sklanja natpis i iz pristupačnog
                                                                stabla, pa opis mora sam da kaže na šta se odnosi. */}
                                                            <NatpisDugmeta
                                                                uToku={radi && uToku!.uloga === u}
                                                                opis={`Postavljam ulogu ${u.toLowerCase()}`}
                                                            >
                                                                {u.toLowerCase()}
                                                            </NatpisDugmeta>
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className={`${styles.td} ${styles.desno}`}>
                                                <button
                                                    type="button"
                                                    className={styles.akcijaTiha}
                                                    onClick={() => postavi(k, 'KORISNIK')}
                                                    disabled={zakljucan || radi}
                                                    title={razlog}
                                                >
                                                    <NatpisDugmeta
                                                        uToku={radi && uToku!.uloga === 'KORISNIK'}
                                                        opis="Uklanjam pristup"
                                                    >
                                                        ukloni pristup
                                                    </NatpisDugmeta>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <p className={styles.sekcija}>— dodaj zaposlenog</p>
                    <div className={styles.dodavanje}>
                        <div className={styles.polje} style={{ maxWidth: 320 }}>
                            <span className={styles.lab}>e-mail postojećeg naloga</span>
                            <input
                                className={styles.unos}
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') dodaj(); }}
                                placeholder="ime@primer.rs"
                            />
                        </div>
                        <button
                            type="button"
                            className={styles.dugme}
                            onClick={dodaj}
                            disabled={dodaje || !email.trim()}
                        >
                            <NatpisDugmeta uToku={dodaje} opis="Tražim nalog">DAJ PRISTUP</NatpisDugmeta>
                        </button>
                    </div>
                    {porukaDodavanja && <p className={styles.info}>{porukaDodavanja}</p>}

                    <p className={styles.info}>
                        Uklanjanje pristupa vraća nalog na običnog gosta — porudžbine i bodovi ostaju.
                        Nalog se ne briše.
                    </p>
                </>
            )}
        </div>
    );
}
