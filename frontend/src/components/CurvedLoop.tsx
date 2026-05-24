import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { FC, PointerEvent } from 'react';
import styles from './CurvedLoop.module.css';

interface CurvedLoopProps {
    marqueeText?: string;
    speed?: number;
    className?: string;
    curveAmount?: number;
    direction?: 'left' | 'right';
    interactive?: boolean;
}

const CurvedLoop: FC<CurvedLoopProps> = ({
    marqueeText = '',
    speed = 2,
    className,
    curveAmount = 400,
    direction = 'left',
    interactive = true,
}) => {
    const text = useMemo(() => {
        const hasTrailing = /\s|\u00A0$/.test(marqueeText);
        return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '\u00A0';
    }, [marqueeText]);

    const measureRef = useRef<SVGTextElement | null>(null);
    const textPathRef = useRef<SVGTextPathElement | null>(null);
    const loopRef = useRef<HTMLDivElement | null>(null);
    const [spacing, setSpacing] = useState(0);
    const uid = useId();
    const pathId = `curve-${uid}`;
    const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

    const dragRef = useRef(false);
    const lastXRef = useRef(0);
    const dirRef = useRef<'left' | 'right'>(direction);
    const velRef = useRef(0);

    const totalText = spacing
        ? Array(Math.ceil(1800 / spacing) + 2)
            .fill(text)
            .join('')
        : text;
    const ready = spacing > 0;

    useEffect(() => {
        dirRef.current = direction;
    }, [direction]);

    useEffect(() => {
        if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength());
    }, [text, className]);

    useEffect(() => {
        if (!spacing || !textPathRef.current) return;
        const initial = -spacing;
        textPathRef.current.setAttribute('startOffset', `${initial}px`);
    }, [spacing]);

    useEffect(() => {
        if (!spacing || !ready) return;

        let frame = 0;
        const step = () => {
            if (!dragRef.current && textPathRef.current) {
                const delta = dirRef.current === 'right' ? speed : -speed;
                const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
                let newOffset = currentOffset + delta;
                const wrapPoint = spacing;

                if (newOffset <= -wrapPoint) newOffset += wrapPoint;
                if (newOffset > 0) newOffset -= wrapPoint;

                textPathRef.current.setAttribute('startOffset', `${newOffset}px`);
            }

            frame = requestAnimationFrame(step);
        };

        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [spacing, speed, ready]);

    const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
        if (!interactive) return;
        dragRef.current = true;
        lastXRef.current = e.clientX;
        velRef.current = 0;
        e.currentTarget.style.cursor = 'grabbing';
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
        if (!interactive || !dragRef.current || !textPathRef.current) return;

        const dx = e.clientX - lastXRef.current;
        lastXRef.current = e.clientX;
        velRef.current = dx;
        const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
        let newOffset = currentOffset + dx;
        const wrapPoint = spacing;

        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;

        textPathRef.current.setAttribute('startOffset', `${newOffset}px`);
    };

    const endDrag = () => {
        if (!interactive) return;
        dragRef.current = false;
        if (loopRef.current) loopRef.current.style.cursor = 'grab';
        dirRef.current = velRef.current > 0 ? 'right' : 'left';
    };

    const cursorStyle = interactive ? 'grab' : 'auto';
    const textClassName = [styles.text, className].filter(Boolean).join(' ');

    return (
        <div
            ref={loopRef}
            className={styles.loop}
            style={{ visibility: ready ? 'visible' : 'hidden', cursor: cursorStyle }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
        >
            <svg className={styles.svg} viewBox="0 0 1440 120" aria-hidden="true">
                <text ref={measureRef} className={styles.measure} xmlSpace="preserve">
                    {text}
                </text>
                <defs>
                    <path id={pathId} d={pathD} fill="none" stroke="transparent" />
                </defs>
                {ready && (
                    <text xmlSpace="preserve" className={textClassName}>
                        <textPath ref={textPathRef} href={`#${pathId}`} xmlSpace="preserve">
                            {totalText}
                        </textPath>
                    </text>
                )}
            </svg>
        </div>
    );
};

export default CurvedLoop;
