import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAktivnaPorudzbina } from '../context/AktivnaPorudzbinaContext';
import { TIP_LABELE, type TipPorudzbine } from '../types/porudzbina';
import * as porudzbineApi from '../api/porudzbine';
import { ApiError } from '../api/client';
import styles from './MiniKorpa.module.css';

export default function MiniKorpa() {
    const navigate = useNavigate();
    const { korisnik, token, osvezi, popust } = useAuth();
    const { postaviAktivnu } = useAktivnaPorudzbina();
    const { korpa, povecaj, smanji, ukloni, isprazni, ukupnaCena, ukupnoStavki } = useCart();

    const [tipPorudzbine, setTipPorudzbine] = useState<TipPorudzbine>('U_LOKALU');
    const [napomena, setNapomena] = useState('');
    const [porucivanjeUToku, setPorucivanjeUToku] = useState(false);
    const [uspesno, setUspesno] = useState(false);
    const [greska, setGreska] = useState('');

    // Zaokruživanje finalne cene, isto kao na meniju
    const zaPlacanje = popust > 0 ? Math.round(ukupnaCena * (1 - popust / 100)) : ukupnaCena;
    const popustIznos = ukupnaCena - zaPlacanje;

    const handleNaruci = async () => {
        if (!korisnik || !token) {
            navigate('/login');
            return;
        }

        setPorucivanjeUToku(true);
        setGreska('');
        try {
            const nova = await porudzbineApi.kreiraj({
                tipPorudzbine,
                napomena: napomena.trim() || null,
                stavke: korpa.map(i => ({
                    proizvodId: i.proizvod.id,
                    kolicina: i.kolicina,
                })),
            });
            const novaPorudzbinaId: number | null = nova?.porudzbinaId ?? null;
            isprazni();
            setNapomena('');
            setUspesno(true);
            await osvezi();
            setTimeout(() => {
                setUspesno(false);
                if (novaPorudzbinaId) postaviAktivnu(novaPorudzbinaId);
            }, 2000);
        } catch (e) {
            setGreska(e instanceof ApiError
                ? (e.body?.message ?? 'Greška prilikom naručivanja.')
                : 'Server ne odgovara.');
        } finally {
            setPorucivanjeUToku(false);
        }
    };

    return (
        <div className={styles.panel}>
            <span className={styles.tape} />

            <div className={styles.header}>
                <h2 className={styles.naslov}>Korpa</h2>
                {ukupnoStavki > 0 && (
                    <span className={styles.brojStavki}>
                        {ukupnoStavki} {ukupnoStavki === 1 ? 'stavka' : 'stavke'}
                    </span>
                )}
            </div>

            {uspesno ? (
                <motion.div
                    className={styles.uspesno}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <p className={styles.uspesnoNaslov}>Porudžbina poslata!</p>
                    <p className={styles.uspesnoSub}>otvaramo praćenje…</p>
                </motion.div>

            ) : korpa.length === 0 ? (
                <div className={styles.prazna}>
                    <p className={styles.praznaTekst}>korpa je prazna — dodaj nešto iz menija ←</p>
                </div>

            ) : (
                <>
                    <AnimatePresence initial={false}>
                        {korpa.map(item => (
                            <motion.div
                                key={item.proizvod.id}
                                layout
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className={styles.stavka}
                            >
                                <div className={styles.stavkaRed}>
                                    <span className={styles.stavkaNaziv}>{item.proizvod.naziv}</span>
                                    <button
                                        className={styles.ukloniBtn}
                                        onClick={() => ukloni(item.proizvod.id)}
                                        aria-label={`Ukloni ${item.proizvod.naziv}`}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className={styles.stavkaRed}>
                                    <div className={styles.qty}>
                                        <button
                                            className={styles.qtyBtn}
                                            onClick={() => smanji(item.proizvod.id)}
                                        >
                                            −
                                        </button>
                                        <span className={styles.qtyBroj}>{item.kolicina}</span>
                                        <button
                                            className={styles.qtyBtn}
                                            onClick={() => povecaj(item.proizvod.id)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className={styles.stavkaCena}>
                                        {Math.round(item.proizvod.cena * item.kolicina)}
                                        <span className={styles.rsd}>RSD</span>
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className={styles.sekcija}>
                        <span className={styles.sekcLab}>tip porudžbine</span>
                        <div className={styles.tipBiraci}>
                            {(Object.keys(TIP_LABELE) as TipPorudzbine[]).map(tip => (
                                <button
                                    key={tip}
                                    className={tipPorudzbine === tip ? styles.tipPilAktivan : styles.tipPil}
                                    onClick={() => setTipPorudzbine(tip)}
                                >
                                    {TIP_LABELE[tip]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.sekcija}>
                        <span className={styles.sekcLab}>napomena (opciono)</span>
                        <textarea
                            className={styles.napomena}
                            value={napomena}
                            onChange={e => setNapomena(e.target.value)}
                            placeholder="npr. bez šećera..."
                            maxLength={1000}
                            rows={2}
                        />
                    </div>

                    {popust > 0 && (
                        <div className={styles.popustRed}>
                            <span>loyalty popust ({popust}%)</span>
                            <span>−{popustIznos} RSD</span>
                        </div>
                    )}

                    <div className={styles.ukupnoRed}>
                        <span className={styles.ukupnoLab}>UKUPNO</span>
                        <span>
                            {popust > 0 && <span className={styles.ukupnoStaro}>{ukupnaCena}</span>}
                            <span className={styles.ukupnoVrednost}>
                                {zaPlacanje}<span className={styles.rsd}>RSD</span>
                            </span>
                        </span>
                    </div>

                    {greska && <p className={styles.greska}>{greska}</p>}

                    <button
                        className={styles.naruciBtn}
                        onClick={handleNaruci}
                        disabled={porucivanjeUToku}
                    >
                        {porucivanjeUToku ? 'Šaljem…' : 'Naruči →'}
                    </button>

                    <button className={styles.isprazniBtn} onClick={isprazni}>
                        isprazni korpu
                    </button>
                </>
            )}
        </div>
    );
}
