import styles from './MeniSkeleton.module.css';

export default function MeniSkeleton() {
    return (
        <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.kartica}>
                    <div className={styles.slika} />
                    <div className={styles.telo}>
                        <div className={styles.linija} style={{ width: '70%' }} />
                        <div className={styles.linija} style={{ width: '90%' }} />
                        <div className={styles.linija} style={{ width: '50%' }} />
                        <div className={styles.footer}>
                            <div className={styles.cena} />
                            <div className={styles.dugme} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
