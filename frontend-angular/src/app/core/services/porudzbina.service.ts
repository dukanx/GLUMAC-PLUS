import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Porudzbina, PorudzbinaRequest, PageResponse } from '../models/porudzbina.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PorudzbinaService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
  }

  kreiraj(zahtev: PorudzbinaRequest): Observable<Porudzbina> {
    return this.http.post<Porudzbina>(
      `${environment.apiUrl}/api/porudzbine`,
      zahtev,
      { headers: this.headers() }
    );
  }

  // GET jedne porudžbine — koristi Status modal za polling
  getJedan(id: number): Observable<Porudzbina> {
    return this.http.get<Porudzbina>(
      `${environment.apiUrl}/api/porudzbine/${id}`,
      { headers: this.headers() }
    );
  }

  getMoje(page: number, size: number): Observable<PageResponse<Porudzbina> | Porudzbina[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Porudzbina> | Porudzbina[]>(
      `${environment.apiUrl}/api/porudzbine/moje`,
      { headers: this.headers(), params }
    );
  }

  otkazi(id: number): Observable<unknown> {
    return this.http.post(
      `${environment.apiUrl}/api/porudzbine/${id}/otkazi`,
      null,
      { headers: this.headers() }
    );
  }
}
