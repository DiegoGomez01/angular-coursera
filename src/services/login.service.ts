import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  constructor(
    private http: HttpClient,
  ) { }

  public get currentUserValue() {
    const user = localStorage.getItem('userLogged');
    if (!user) {
      return null;
    }
    return user
  }

  login(email, password): Observable<any> {
    return of(email === 'test@test.com' && password === '12345678').pipe(delay(2000));
  }

  getInfoUserToSave(): Observable<any> {
    return of(this.currentUserValue).pipe(delay(2000));
  }
}
