import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule, RefresherCustomEvent } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { environment } from 'src/environments/environment';

// components

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  esportes: any[] = [];
  ginasios: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🏠 HomePage ngOnInit - Componente carregado!');
    console.log('🏠 Environment API URL:', environment.apiBaseUrl);
    console.log('🏠 Fazendo requisições...');
    
    this.carregarEsportes();
    this.carregarGinasios();
  }

  carregarEsportes() {
    const url = `${environment.apiBaseUrl}/getBookingAll`;
    console.log('📡 Requisição ESPORTES para:', url);
    
    this.http.post<any[]>(url, {}).subscribe({
      next: (res) => {
        console.log('✅ Esportes recebidos:', res);
        this.esportes = res;
      },
      error: (erro) => {
        console.error('❌ Erro ao carregar esportes:', erro);
        console.error('❌ Status:', erro.status);
        console.error('❌ URL:', erro.url);
      }
    });
  }

  carregarGinasios() {
    const url = `${environment.apiBaseUrl}/load-gym-all`;
    console.log('📡 Requisição GINÁSIOS para:', url);
    
    this.http.post<any[]>(url, {}).subscribe({
      next: (res) => {
        console.log('✅ Ginásios recebidos:', res);
        this.ginasios = res;
      },
      error: (erro) => {
        console.error('❌ Erro ao carregar ginásios:', erro);
        console.error('❌ Status:', erro.status);
        console.error('❌ URL:', erro.url);
      }
    });
  }

  abrirGinasio(ginasio: any) {
    if (!ginasio || !ginasio.id) {
      return;
    }
    // Usa o id do ginásio (sempre presente agora)
    this.router.navigate(['/ginasio', ginasio.id], { 
      state: { ginasio: ginasio }
    });
  }

  abrirReserva(reserva: any) {
    if (!reserva || !reserva.id) {
      return;
    }
    this.router.navigate(['/reserva', reserva.id]);
  }

  formatarHorario(horario: string): string {
    if (!horario) return '';
    return horario.substring(0, 5); // Retorna apenas HH:MM
  }

  formatarData(data: string): string {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  doRefresh(event: RefresherCustomEvent) {
    // Recarrega ambos os dados simultaneamente
    forkJoin({
      esportes: this.http.post<any[]>(`${environment.apiBaseUrl}/getBookingAll`, {}),
      ginasios: this.http.post<any[]>(`${environment.apiBaseUrl}/load-gym-all`, {})
    }).subscribe({
      next: (res) => {
        this.esportes = res.esportes || [];
        this.ginasios = res.ginasios || [];
        console.log('Dados atualizados:', res);
        event.target.complete();
      },
      error: (erro) => {
        console.error('Erro ao atualizar dados:', erro);
        event.target.complete();
      }
    });
  }

}
