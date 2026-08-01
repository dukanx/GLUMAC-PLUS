import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { TIP_LABELE, type TipPorudzbine } from '../types/porudzbina';
import { cenaStavke } from '../utils/korpa';
import { usePorucivanje } from '../hooks/usePorucivanje';
import { Korpa } from './Doodle';
import { NatpisDugmeta } from './Ucitavanje';
import styles from './MiniKorpa.module.css';

export default function MiniKorpa() {
    const { korpa, povecaj, smanji, ukloni, isprazni, ukupnoStavki } = useCart();

    const {
        tipPorudzbine, setTipPorudzbine,
        napomena, setNapomena,
        porucivanjeUToku, uspesno, greska,
        popust, ukupnaCena, zaPlacanje, popustIznos,
        naruci,
    } = usePorucivanje();

    return (
        <div className={styles.panel}>
            <span className={styles.tape} />

            <div className={styles.header}>
                <h2 className={styles.naslov}>
                    <Korpa size={26} strokeWidth={2} />
                    Korpa
                </h2>
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
                    <p className={styles.praznaTekst}>korpa je prazna — dodaj nešto iz menija</p>
                </div>

            ) : (
                <>
                    <AnimatePresence initial={false}>
                        {korpa.map(item => (
                            <motion.div
                                key={item.id}
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
                                        onClick={() => ukloni(item.id)}
                                        aria-label={`Ukloni ${item.proizvod.naziv}`}
                                    >
                                        ✕
                                    </button>
                                </div>
                                {item.dodaci.length > 0 && (
                                    <ul className={styles.dodaciStavke}>
                                        {item.dodaci.map(d => (
                                            <li key={d.proizvod.id} className={styles.dodatakStavka}>
                                                + {d.proizvod.naziv}
                                                <span className={styles.dodatakStavkaCena}>
                                                    {Math.round(d.proizvod.cena * d.kolicina)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className={styles.stavkaRed}>
                                    <div className={styles.qty}>
                                        <button
                                            className={styles.qtyBtn}
                                            onClick={() => smanji(item.id)}
                                        >
                                            −
                                        </button>
                                        <span className={styles.qtyBroj}>{item.kolicina}</span>
                                        <button
                                            className={styles.qtyBtn}
                                            onClick={() => povecaj(item.id)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className={styles.stavkaCena}>
                                        {Math.round(cenaStavke(item))}
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
                        onClick={naruci}
                        disabled={porucivanjeUToku}
                    >
                        <NatpisDugmeta uToku={porucivanjeUToku} opis="Šaljem porudžbinu">Naruči</NatpisDugmeta>
                    </button>

                    <button className={styles.isprazniBtn} onClick={isprazni}>
                        isprazni korpu
                    </button>
                </>
            )}
        </div>
    );
}
