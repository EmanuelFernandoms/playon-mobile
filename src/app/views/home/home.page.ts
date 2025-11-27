import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, RefresherCustomEvent } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🏠 HomePage ngOnInit - Componente carregado!');
    console.log('🏠 Environment API URL:', environment.apiBaseUrl);
    console.log('🏠 Fazendo requisições...');
    
    this.carregarEsportes();
    this.carregarGinasios();
  }


  async carregarEsportes() {
    const url = `${environment.apiBaseUrl}/getBookingAll`;
    console.log('📡 Requisição ESPORTES para:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: ''
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const res = await response.json();
      console.log('✅ Esportes recebidos:', res);
      this.esportes = res || [];
    } catch (erro) {
      console.error('❌ Erro ao carregar esportes:', erro);
      this.esportes = [];
    }
  }

  async carregarGinasios() {
    const url = `${environment.apiBaseUrl}/load-gym-all`;
    console.log('📡 Requisição GINÁSIOS para:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: ''
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const res = await response.json();
      console.log('✅ Ginásios recebidos:', res);
      this.ginasios = res || [];
    } catch (erro) {
      console.error('❌ Erro ao carregar ginásios:', erro);
      this.ginasios = [];
    }
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

  async doRefresh(event: RefresherCustomEvent) {
    // Recarrega ambos os dados simultaneamente
    try {
      const [esportesRes, ginasiosRes] = await Promise.all([
        fetch(`${environment.apiBaseUrl}/getBookingAll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: ''
        }),
        fetch(`${environment.apiBaseUrl}/load-gym-all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: ''
        })
      ]);
      
      this.esportes = await esportesRes.json() || [];
      this.ginasios = await ginasiosRes.json() || [];
      console.log('Dados atualizados');
    } catch (erro) {
      console.error('Erro ao atualizar dados:', erro);
    } finally {
      event.target.complete();
    }
  }

}
