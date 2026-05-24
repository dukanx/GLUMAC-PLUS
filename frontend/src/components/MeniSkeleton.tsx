import styles from './MeniSkeleton.module.css';

export default function MeniSkeleton() {
    return (
        <div className={styles.lista}>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={styles.red}>
                    <div className={styles.levo}>
                        <div className={styles.linijaNaziv} />
                        <div className={styles.linijaOpis} />
                    </div>
                    <div className={styles.desno}>
                        <div className={styles.cena} />
                        <div className={styles.dugme} />
                    </div>
                </div>
            ))}
        </div>
    );
}
