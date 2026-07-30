// Poređenje teksta koje ne mari za kvačice ni za pismo — koristi se za pretragu
// u meniju i u panelu zaposlenog.

// Srpska ćirilica → latinica bez kvačica, da bi „шунка" i „sunka" bili isti pojam.
// Digrafi (љ→lj, њ→nj, џ→dz, ђ→dj) daju isto što i latinična reč posle skidanja
// kvačica, pa se pretraga poklapa u oba smera.
const CIRILICA: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'dj', е: 'e', ж: 'z', з: 'z',
    и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', ћ: 'c', у: 'u', ф: 'f', х: 'h', ц: 'c',
    ч: 'c', џ: 'dz', ш: 's',
};

/**
 * Svodi tekst na mala latinična slova bez dijakritike, da bi „sunka", „šunka"
 * i „шунка" bili jedan isti pojam.
 *
 * NFD razlaže ć/č/š/ž na osnovno slovo + kombinujući znak, pa se znak obriše.
 * Slovo đ tako ne radi — ono je zaseban glif (U+0111), NFD ga ne dira, zato ide
 * ručno. Prevodi se u „dj", ne u „d", jer tako i inače kucamo bez kvačica
 * (djubre, Djordje), pa se poklopi i kad korisnik kuca đ i kad kuca dj.
 */
export function normalizuj(tekst: string): string {
    return tekst
        .toLowerCase()
        .replace(/[Ѐ-ӿ]/g, s => CIRILICA[s] ?? s)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'dj');
}

/**
 * Da li tekst sadrži pojam, bez obzira na kvačice, pismo i veličinu slova.
 * Prazan pojam prolazi sve (pretraga nije ni počela).
 */
export function sadrzi(tekst: string, pojam: string): boolean {
    const p = normalizuj(pojam.trim());
    return p === '' || normalizuj(tekst).includes(p);
}
