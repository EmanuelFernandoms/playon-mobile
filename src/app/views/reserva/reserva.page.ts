import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './reserva.page.html',
  styleUrls: ['./reserva.page.scss'],
})
export class ReservaPage implements OnInit {

  reserva: any = null;
  jogadores: any[] = [];
  reservaId: number = 0;
  carregando = true;
  usuarioAtual: any = null;
  usuarioEstaNaReserva = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.reservaId = +params['id'];
      if (this.reservaId) {
        this.carregarReserva();
        this.carregarJogadores();
      }
    });
  }

  carregarReserva() {
    this.carregando = true;
    this.http.get<any>(`${environment.apiBaseUrl}/getBookingById?id=${this.reservaId}`)
      .subscribe({
        next: (res) => {
          this.reserva = res;
          this.carregando = false;
          console.log('Reserva:', res);
        },
        error: (erro) => {
          console.error('Erro ao carregar reserva:', erro);
          this.carregando = false;
        }
      });
  }

  carregarJogadores() {
    this.http.get<any[]>(`${environment.apiBaseUrl}/getPlayersBookingById?id=${this.reservaId}`)
      .subscribe({
        next: (res) => {
          this.jogadores = res;
          this.verificarUsuarioNaReserva();
          console.log('Jogadores:', res);
        },
        error: (erro) => {
          console.error('Erro ao carregar jogadores:', erro);
        }
      });
  }

  verificarUsuarioNaReserva() {
    this.usuarioAtual = this.authService.getCurrentUser();
    if (this.usuarioAtual && this.jogadores.length > 0) {
      // Verifica se o id do usuário atual está na lista de jogadores
      this.usuarioEstaNaReserva = this.jogadores.some(
        jogador => jogador.id === this.usuarioAtual.id
      );
    } else {
      this.usuarioEstaNaReserva = false;
    }
  }

  reservaJaPassou(): boolean {
    if (!this.reserva || !this.reserva.data || !this.reserva.hora_fim) {
      return false;
    }
    
    const dataReserva = new Date(`${this.reserva.data}T${this.reserva.hora_fim}`);
    const agora = new Date();
    
    return dataReserva < agora;
  }

  calcularValorPorJogador(): number {
    if (!this.reserva || !this.reserva.valor || !this.jogadores || this.jogadores.length === 0) {
      return 0;
    }
    
    const valorTotal = parseFloat(this.reserva.valor);
    return valorTotal / this.jogadores.length;
  }

  async entrarNaReserva() {
    if (!this.usuarioAtual) {
      this.showToast('Você precisa estar logado para entrar na reserva', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Entrando na reserva...'
    });
    await loading.present();

    const body = {
      id_usuario: this.usuarioAtual.id,
      id_reserva: this.reservaId
    };

    this.http.put<any>(`${environment.apiBaseUrl}/registerPlayersBooking`, body)
      .subscribe({
        next: (res) => {
          loading.dismiss();
          if (res === true || res === 'true') {
            this.showToast('Você entrou na reserva com sucesso!', 'success');
            this.carregarJogadores(); // Recarrega a lista de jogadores
          } else {
            this.showToast('Erro ao entrar na reserva', 'danger');
          }
        },
        error: (erro) => {
          loading.dismiss();
          console.error('Erro ao entrar na reserva:', erro);
          this.showToast('Erro ao entrar na reserva. Tente novamente.', 'danger');
        }
      });
  }

  async sairDaReserva() {
    if (!this.usuarioAtual) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Saindo da reserva...'
    });
    await loading.present();

    const body = {
      id_usuario: this.usuarioAtual.id,
      id_reserva: this.reservaId
    };

    // DELETE com body usando request method
    this.http.request<any>('DELETE', `${environment.apiBaseUrl}/deletePlayersBooking`, { body })
      .subscribe({
        next: (res) => {
          loading.dismiss();
          this.showToast('Você saiu da reserva', 'success');
          this.carregarJogadores(); // Recarrega a lista de jogadores
        },
        error: (erro) => {
          loading.dismiss();
          console.error('Erro ao sair da reserva:', erro);
          this.showToast('Erro ao sair da reserva. Tente novamente.', 'danger');
        }
      });
  }

  async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
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

  voltar() {
    this.router.navigate(['/home']);
  }

}

