import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verifica se há usuário salvo no localStorage ao inicializar
    const storedUser = this.getStoredUser();
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  // Helper para enviar dados como form-urlencoded
  private getFormUrlEncodedParams(data: any): HttpParams {
    let params = new HttpParams();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        params = params.set(key, data[key]);
      }
    }
    return params;
  }

  // Login
  login(email: string, senha: string): Observable<User> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = this.getFormUrlEncodedParams({ email, senha });
    
    return this.http.post<User>(`${environment.apiBaseUrl}/startSessionUser`, body.toString(), { headers }).pipe(
      tap((response) => {
        if (response && response.id) {
          this.setUser(response);
        }
      })
    );
  }

  // Enviar código de verificação
  sendEmailToken(email: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = this.getFormUrlEncodedParams({ email });
    console.log('Enviando email token para:', email);
    return this.http.post<any>(`${environment.apiBaseUrl}/sendEmailTokenUser`, body.toString(), { headers });
  }

  // Registrar usuário (usa JSON porque é PUT)
  register(email: string, senha: string, nome: string, telefone: string): Observable<User> {
    const body = { email, senha, nome, telefone };
    
    return this.http.put<User>(`${environment.apiBaseUrl}/registerUser`, body).pipe(
      tap((user) => {
        this.setUser(user);
      })
    );
  }

  // Definir usuário na sessão
  setUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Obter usuário atual
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    try {
      const stored = localStorage.getItem('currentUser');
      if (!stored || stored === 'null' || stored === 'undefined' || stored.trim() === '') {
        return false;
      }
      
      const user = JSON.parse(stored);
      // Verifica se o usuário existe e tem os campos obrigatórios
      const isAuth = user !== null && user !== undefined && user.id !== undefined && user.id !== null;
      return isAuth;
    } catch (error) {
      return false;
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Obter usuário do localStorage
  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('currentUser');
      if (!stored || stored === 'null' || stored === 'undefined' || stored.trim() === '') {
        return null;
      }
      
      const user = JSON.parse(stored);
      // Valida se o usuário tem os campos obrigatórios
      if (user && user.id !== undefined && user.id !== null) {
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }
}

