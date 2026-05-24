// Zajednički tipovi i labele za porudžbine — koristi se u korpi, mini korpi i omiljenima.

export type TipPorudzbine = 'ZA_PONETI' | 'USPUT' | 'U_LOKALU';

export const TIP_LABELE: Record<TipPorudzbine, string> = {
    ZA_PONETI: 'Za poneti',
    USPUT:     'Usput',
    U_LOKALU:  'U lokalu',
};

// Mapiranje naziva labele tipova
export function tipLabela(tip?: string): string {
    if (!tip) return '';
    return TIP_LABELE[tip as TipPorudzbine] ?? tip;
}