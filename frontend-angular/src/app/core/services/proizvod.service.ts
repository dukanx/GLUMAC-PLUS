import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Proizvod } from '../models/proizvod.model';

@Injectable({ providedIn: 'root' })
export class ProizvodService {
  private http = inject(HttpClient);

  getSvi(): Observable<Proizvod[]> {
    return this.http.get<Proizvod[]>(`${environment.apiUrl}/api/proizvodi`);
  }

  getJedan(id: number): Observable<Proizvod> {
    return this.http.get<Proizvod>(`${environment.apiUrl}/api/proizvodi/${id}`);
  }
}
