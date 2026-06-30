import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData, CheckCircle2, Clock, ChefHat, XCircle, X } from 'lucide-angular';
import { Subscription, timer, switchMap } from 'rxjs';
import { PorudzbinaService } from '../../core/services/porudzbina.service';
import { AktivnaPorudzbinaService } from '../../core/services/aktivna-porudzbina.service';
import { StatusPorudzbine } from '../../core/models/porudzbina.model';

interface Korak {
  status: StatusPorudzbine;
  labela: string;
  ikona: LucideIconData;
}

@Component({
  selector: 'app-status-porudzbine',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './status-porudzbine.component.html',
  styleUrl: './status-porudzbine.component.css',
})
export class StatusPorudzbineComponent implements OnInit, OnDestroy {
  private porudzbina = inject(PorudzbinaService);
  private aktivna = inject(AktivnaPorudzbinaService);

  readonly X = X;

  readonly KORACI: Korak[] = [
    { status: 'U_PRIPREMI', labela: 'Primljeno', ikona: Clock },
    { status: 'SPREMNA', labela: 'U pripremi', ikona: ChefHat },
    { status: 'REALIZOVANA', labela: 'Gotovo!', ikona: CheckCircle2 },
  ];
  readonly XCircle = XCircle;

  prikazan = false;
  porudzbinaId: number | null = null;
  status: StatusPorudzbine = 'U_PRIPREMI';
  procenjenoVreme: number | null = null;
  greska = false;

  private otvorenSub!: Subscription;
  private pollSub?: Subscription;

  ngOnInit(): void {
    // Reaguj na otvaranje/zatvaranje status modala
    this.otvorenSub = this.aktivna.statusOtvoren$.subscribe(otvoren => {
      this.prikazan = otvoren && this.aktivna.aktivnaId != null;
      if (this.prikazan) {
        this.pokreniPolling(this.aktivna.aktivnaId!);
      } else {
        this.zaustaviPolling();
      }
    });
  }

  ngOnDestroy(): void {
    this.otvorenSub?.unsubscribe();
    this.zaustaviPolling();
  }

  get zavrseno(): boolean {
    return this.status === 'REALIZOVANA' || this.status === 'OTKAZANA';
  }

  get aktivniKorak(): number {
    if (this.status === 'U_PRIPREMI') return 0;
    if (this.status === 'SPREMNA') return 1;
    if (this.status === 'REALIZOVANA') return 2;
    return -1;
  }

  // timer(0, 8000) — odmah pa svakih 8s; switchMap otkazuje stari GET ako stigne novi tik
  private pokreniPolling(id: number): void {
    this.zaustaviPolling();
    this.porudzbinaId = id;
    this.status = 'U_PRIPREMI';
    this.procenjenoVreme = null;
    this.greska = false;

    this.pollSub = timer(0, 8000).pipe(
      switchMap(() => this.porudzbina.getJedan(id))
    ).subscribe({
      next: (p) => {
        this.status = p.status;
        this.procenjenoVreme = p.procenjenoVreme ?? null;
        // Kad je porudžbina završena, prestani da pollujemo (modal ostaje otvoren)
        if (this.zavrseno) this.zaustaviPolling();
      },
      error: () => { this.greska = true; },
    });
  }

  private zaustaviPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  zatvori(): void {
    this.aktivna.zatvoriStatus();
  }

  zavrsiIZatvori(): void {
    this.aktivna.resetuj();
    this.aktivna.zatvoriStatus();
  }
}
