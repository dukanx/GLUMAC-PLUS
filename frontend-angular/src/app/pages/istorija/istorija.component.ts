import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule, LucideIconData, Clock, CheckCircle, XCircle, Package,
  ChevronDown, ChevronLeft, ChevronRight, AlertCircle, Eye, ReceiptText,
} from 'lucide-angular';
import { PorudzbinaService } from '../../core/services/porudzbina.service';
import { AktivnaPorudzbinaService } from '../../core/services/aktivna-porudzbina.service';
import { Porudzbina, StatusPorudzbine, TIP_LABELE, TipPorudzbine, PageResponse } from '../../core/models/porudzbina.model';

interface StatusInfo { label: string; ikona: LucideIconData; klasa: string; }

const PAGE_SIZE = 8;

@Component({
  selector: 'app-istorija',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './istorija.component.html',
  styleUrl: './istorija.component.css',
})
export class IstorijaComponent implements OnInit {
  private porudzbinaService = inject(PorudzbinaService);
  private aktivnaService = inject(AktivnaPorudzbinaService);

  // Ikone
  readonly ChevronDown = ChevronDown;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly Eye = Eye;
  readonly ReceiptText = ReceiptText;

  private readonly STATUS_INFO: Record<StatusPorudzbine, StatusInfo> = {
    U_PRIPREMI: { label: 'U pripremi', ikona: Clock, klasa: 'statusUPripremi' },
    SPREMNA: { label: 'Spremna', ikona: Package, klasa: 'statusSpremna' },
    REALIZOVANA: { label: 'Realizovana', ikona: CheckCircle, klasa: 'statusRealizovana' },
    OTKAZANA: { label: 'Otkazana', ikona: XCircle, klasa: 'statusOtkazana' },
  };

  readonly AKTIVNI_KORACI = [
    { status: 'U_PRIPREMI', labela: 'Primljeno' },
    { status: 'SPREMNA', labela: 'U pripremi' },
    { status: 'REALIZOVANA', labela: 'Gotovo' },
  ];

  porudzbine: Porudzbina[] = [];
  ukupnoStrana = 1;
  ukupnoStavki = 0;
  stranica = 0;
  loading = true;
  greska = '';
  otkazivanje: number | null = null;
  uspehPoruka = '';

  private razvijeni = new Set<number>();
  private uspehTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.ucitaj(0);
  }

  ucitaj(page: number): void {
    this.loading = true;
    this.greska = '';
    this.stranica = page;

    this.porudzbinaService.getMoje(page, PAGE_SIZE).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          // Backend vraća plain listu (bez paginacije)
          this.porudzbine = data;
          this.ukupnoStrana = 1;
          this.ukupnoStavki = data.length;
        } else {
          const page = data as PageResponse<Porudzbina>;
          this.porudzbine = page.content ?? [];
          this.ukupnoStrana = page.totalPages ?? 1;
          this.ukupnoStavki = page.totalElements ?? 0;
        }
        this.loading = false;
      },
      error: () => {
        this.greska = 'Nije moguće učitati istoriju. Pokušajte ponovo.';
        this.loading = false;
      },
    });
  }

  // Aktivna (U_PRIPREMI/SPREMNA) ide u istaknutu karticu na vrhu, pa je izbacujemo iz donje liste
  get aktivna(): Porudzbina | null {
    return this.porudzbine.find(p => p.status === 'U_PRIPREMI' || p.status === 'SPREMNA') ?? null;
  }

  get istorija(): Porudzbina[] {
    const akt = this.aktivna;
    return akt ? this.porudzbine.filter(p => p.porudzbinaId !== akt.porudzbinaId) : this.porudzbine;
  }

  statusInfo(status: StatusPorudzbine): StatusInfo {
    return this.STATUS_INFO[status] ?? this.STATUS_INFO['U_PRIPREMI'];
  }

  aktivniIndex(status: StatusPorudzbine): number {
    return status === 'SPREMNA' ? 1 : 0;
  }

  imaPopust(p: Porudzbina): boolean {
    return p.originalnaCena != null && p.originalnaCena > p.ukupanIznos;
  }

  tipLabela(tip?: string): string {
    if (!tip) return '';
    return TIP_LABELE[tip as TipPorudzbine] ?? tip;
  }

  formatirajDatum(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' · '
      + d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
  }

  jeRazvijena(id: number): boolean { return this.razvijeni.has(id); }
  toggleRazvij(id: number): void {
    if (this.razvijeni.has(id)) this.razvijeni.delete(id);
    else this.razvijeni.add(id);
  }

  otkazi(id: number): void {
    this.otkazivanje = id;
    this.porudzbinaService.otkazi(id).subscribe({
      next: () => {
        // Lokalni update — samo promenimo status, bez refetch-a
        this.porudzbine = this.porudzbine.map(p =>
          p.porudzbinaId === id ? { ...p, status: 'OTKAZANA' as StatusPorudzbine } : p
        );
        this.prikaziUspeh('Porudžbina je otkazana.');
        this.otkazivanje = null;
      },
      error: (err) => {
        this.prikaziUspeh(err.error?.message ?? 'Nije moguće otkazati.');
        this.otkazivanje = null;
      },
    });
  }

  pratiAktivnu(): void {
    if (this.aktivna) this.aktivnaService.otvoriStatus(this.aktivna.porudzbinaId);
  }

  promeniStranu(page: number): void {
    if (page < 0 || page >= this.ukupnoStrana || page === this.stranica) return;
    this.ucitaj(page);
  }

  get straneNiz(): number[] {
    return Array.from({ length: this.ukupnoStrana }, (_, i) => i);
  }

  private prikaziUspeh(poruka: string): void {
    this.uspehPoruka = poruka;
    if (this.uspehTimer) clearTimeout(this.uspehTimer);
    this.uspehTimer = setTimeout(() => (this.uspehPoruka = ''), 3200);
  }

  trackById(_: number, p: Porudzbina): number { return p.porudzbinaId; }
}
