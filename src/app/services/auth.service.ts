import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
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

  constructor() {
    // Verifica se há usuário salvo no localStorage ao inicializar
    const storedUser = this.getStoredUser();
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  // Helper para enviar dados como form-urlencoded
  private getFormUrlEncoded(data: any): string {
    const params = new URLSearchParams();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        params.append(key, data[key]);
      }
    }
    return params.toString();
  }

  // Função genérica para fazer requisições HTTP nativas
  private async fetchNative<T>(url: string, options: RequestInit = {}): Promise<T> {
    console.log('🌐 Fetch nativo - URL:', url);
    console.log('🌐 Fetch nativo - Options:', JSON.stringify(options, null, 2));
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...options.headers
        }
      });
      
      console.log('🌐 Fetch nativo - Status:', response.status);
      console.log('🌐 Fetch nativo - OK:', response.ok);
      console.log('🌐 Fetch nativo - Headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('🌐 Fetch nativo - Resposta texto:', text);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      
      try {
        const json = JSON.parse(text);
        console.log('🌐 Fetch nativo - Resposta JSON:', json);
        return json as T;
      } catch (e) {
        console.error('🌐 Fetch nativo - Erro ao parsear JSON:', e);
        throw new Error('Resposta não é JSON válido');
      }
    } catch (error) {
      console.error('🌐 Fetch nativo - Erro:', error);
      throw error;
    }
  }

  // Login
  login(email: string, senha: string): Observable<User> {
    const url = `${environment.apiBaseUrl}/startSessionUser`;
    const body = this.getFormUrlEncoded({ email, senha });
    
    console.log('🔐 AuthService.login - URL:', url);
    console.log('🔐 AuthService.login - Body:', body);
    
    const promise = this.fetchNative<User>(url, {
      method: 'POST',
      body: body
    }).then((response) => {
      console.log('✅ AuthService.login - Resposta recebida:', response);
      if (response && response.id) {
        this.setUser(response);
        console.log('✅ Usuário salvo no localStorage');
        return response;
      } else {
        console.error('❌ Resposta inválida - sem ID:', response);
        throw new Error('Resposta inválida do servidor');
      }
    });
    
    return from(promise);
  }

  // Enviar código de verificação
  sendEmailToken(email: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/sendEmailTokenUser`;
    const body = this.getFormUrlEncoded({ email });
    console.log('📧 Enviando email token para:', email);
    const promise = this.fetchNative<any>(url, {
      method: 'POST',
      body: body
    });
    return from(promise);
  }

  // Registrar usuário
  register(email: string, senha: string, nome: string, telefone: string): Observable<User> {
    const url = `${environment.apiBaseUrl}/registerUser`;
    const body = JSON.stringify({ email, senha, nome, telefone });
    
    const promise = this.fetchNative<User>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    }).then((user) => {
      this.setUser(user);
      return user;
    });
    
    return from(promise);
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

