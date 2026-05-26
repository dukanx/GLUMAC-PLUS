# Eksperiment: zaobljenje uglova (radius)

Ideja: omekšati Calm Editorial stil blagim zaobljenjem za mobilni/iOS osećaj — negde između
strogog editoriala (0px) i mainstream UI-ja. **Nije primenjeno** na `calm-editorial` grani;
ovde je sačuvano da se primeni na zasebnoj test grani (npr. `eksperiment-zaobljenje`).

## Kako primeniti

### 1. Tokeni — `frontend/src/index.css`, u `:root` (posle font tokena)
```css
:root {
  /* ── Zaobljenja (blagi mobilni/iOS osećaj, a da ostane editorialno) ── */
  --r-sm: 8px;    /* dugmad, inputi, badge-evi, male kutije */
  --r-md: 14px;   /* kartice, modali, veće površine */
}
```
Vrednosti su podesive na jednom mestu. Probano 8px/14px — delovalo taman; isprobati i 10px.

### 2. Prototip (već probano na MeniPage površini)
- `components/ProizvodKartica.module.css`
  - `.dodajBtn` → `border-radius: var(--r-sm)`
  - `.kontrole` → `border-radius: var(--r-sm)`
  - `.kontroleBtn` → `border-radius: 4px`
- `pages/MeniPage.module.css`
  - `.loyaltyBaner`, `.rasporedDan`, `.rasporedDanas`, `.greska` → `border-radius: var(--r-sm)`

### 3. Pun rollout (ostatak aplikacije)
Pravilo: `--r-sm` na sitno/interaktivno, `--r-md` na kartice/modale/drawere.

- **Dugmad / inputi / badge-evi (`--r-sm`)** svuda: CartDrawer, MiniKorpa, StatusPorudzbine,
  IstorijaPage, OmiljenePage, PanelPorudzbina, Toast, FloatingBubble badge, Login/Register inputi.
  (Tražiti `border-radius: 0` i zameniti, plus dodati gde nema.)
- **Kartice / modali / draweri (`--r-md`)**: CartDrawer panel, StatusPorudzbine modal,
  Omiljena/Ponovi modali, PanelPorudzbina popup, kartice porudžbina/omiljenih.
- **Ostaviti oštro** (editorial karakter): underline tabovi, dot-grid pozadina, tanke linije/separatori.

### 4. Provera
`npx tsc --noEmit` + vizuelni prolaz kroz sve stranice (mobilni + desktop).
