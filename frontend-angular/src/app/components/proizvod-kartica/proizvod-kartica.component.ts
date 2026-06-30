import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Minus } from 'lucide-angular';
import { Proizvod } from '../../core/models/proizvod.model';

// @Input() — Angular ekvivalent props
// @Output() + EventEmitter — Angular ekvivalent callback props (onDodaj, onPovecaj...)
@Component({
  selector: 'app-proizvod-kartica',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './proizvod-kartica.component.html',
  styleUrl: './proizvod-kartica.component.css',
})
export class ProizvodKarticaComponent {
  @Input({ required: true }) proizvod!: Proizvod;
  @Input() kolicina = 0;
  @Input() popust = 0;

  @Output() dodaj = new EventEmitter<Proizvod>();
  @Output() povecaj = new EventEmitter<number>();
  @Output() smanji = new EventEmitter<number>();

  readonly Plus = Plus;
  readonly Minus = Minus;

  get cena(): number { return Math.round(this.proizvod.cena); }
  get cenaSaPopustom(): number | null {
    return this.popust > 0 ? Math.round(this.cena * (1 - this.popust / 100)) : null;
  }
}
