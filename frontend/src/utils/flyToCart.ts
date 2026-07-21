/**
 * Vizuelni "poletni" efekat — kad se doda proizvod, mali krug sa "+" odleti
 * od dugmeta u luku ka floating korpi (dole desno). Čisto dekorativno,
 * radi direktno preko DOM/Web Animations API (bez React state-a).
 */
export function flyToCart(source: HTMLElement | null) {
    if (!source || typeof document === 'undefined') return;
    // Poštuj korisnike koji ne žele animacije.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const rect = source.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    // Cilj — floating dugme dole desno (approx. centar).
    const endX = window.innerWidth - 58;
    const endY = window.innerHeight - 58;
    const dx = endX - startX;
    const dy = endY - startY;

    const el = document.createElement('span');
    el.textContent = '+';
    el.style.cssText = [
        'position:fixed',
        `left:${startX}px`,
        `top:${startY}px`,
        'z-index:200',
        'width:34px',
        'height:34px',
        'border-radius:50%',
        'background:hsl(14 65% 44%)',
        'color:#fff',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        "font-family:'Amatic SC',cursive",
        'font-weight:700',
        'font-size:22px',
        'pointer-events:none',
        'box-shadow:0 6px 16px hsl(22 30% 14% / .3)',
    ].join(';');
    document.body.appendChild(el);

    const anim = el.animate(
        [
            { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0 },
            { transform: `translate(-50%,-50%) translate(${dx * 0.5}px, ${dy * 0.5 - 70}px) scale(1.15)`, opacity: 1, offset: 0.5 },
            { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(0.25)`, opacity: 0.15, offset: 1 },
        ],
        { duration: 680, easing: 'cubic-bezier(.5,0,.75,.4)' }
    );
    anim.onfinish = () => el.remove();
    anim.oncancel = () => el.remove();
}
