import { motion, AnimatePresence } from 'motion/react';
import styles from './Toast.module.css';

interface Props {
    poruka: string | null;
}

export default function Toast({ poruka }: Props) {
    return (
        <AnimatePresence>
            {poruka && (
                <motion.div
                    className={styles.toast}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                >
                    <span className={styles.ikona}>✓</span>
                    {poruka}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
