import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule, RefresherCustomEvent } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
})
export class ReservasPage implements OnInit, AfterViewInit, OnDestroy {

  reservas: any[] = [];
  carregando = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.carregarReservas();
  }

  carregarReservas() {
    const usuario = this.authService.getCurrentUser();
    if (!usuario || !usuario.id) {
      this.carregando = false;
      return;
    }

    this.carregando = true;
    this.http.get<any[]>(`${environment.apiBaseUrl}/getBookingByUserId?id=${usuario.id}`)
      .subscribe({
        next: (res) => {
          this.reservas = res || [];
          this.carregando = false;
          console.log('Reservas:', res);
        },
        error: (erro) => {
          console.error('Erro ao carregar reservas:', erro);
          this.carregando = false;
        }
      });
  }

  doRefresh(event: RefresherCustomEvent) {
    this.carregarReservas();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  abrirReserva(reserva: any) {
    this.router.navigate(['/reserva', reserva.id]);
  }

  formatarHorario(horario: string): string {
    if (!horario) return '';
    return horario.substring(0, 5);
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

  ngAfterViewInit() {
    // Expor função no window para eventos nativos
    (window as any).handleAbrirReservaReservas = (id: string) => {
      console.log('📅 handleAbrirReservaReservas chamado via onclick nativo! ID:', id);
      const reserva = this.reservas.find(r => r.id === id);
      if (reserva) {
        this.abrirReserva(reserva);
      }
    };
  }

  ngOnDestroy() {
    delete (window as any).handleAbrirReservaReservas;
  }

}



