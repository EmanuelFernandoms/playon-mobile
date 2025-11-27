import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-quadra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './quadra.page.html',
  styleUrls: ['./quadra.page.scss'],
})
export class QuadraPage implements OnInit, AfterViewInit, OnDestroy {

  quadra: any = null;
  ginasio: any = null;
  quadraId: number = 0;
  ginasioId: number = 0;
  
  // Calendário
  currentDate = new Date();
  selectedDate: Date | null = null;
  selectedDateString: string = '';
  
  // Reservas e horários
  reservasDoDia: any[] = [];
  horariosLivres: string[] = [];
  horariosSelecionados: string[] = [];
  
  // Formulário de reserva
  reservaForm: FormGroup;
  mostrarFormulario = false;
  esportes: any[] = [];
  
  carregando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.reservaForm = this.fb.group({
      id_esporte: ['', [Validators.required]],
      observacoes: [''],
      privada: [0]
    });
  }

  ngOnInit() {
    const state = history.state;
    if (state && state.quadra && state.ginasio) {
      this.quadra = state.quadra;
      this.ginasio = state.ginasio;
      this.quadraId = this.quadra.id || this.quadra.numero;
      this.ginasioId = this.ginasio.id;
    } else {
      this.route.params.subscribe(params => {
        this.quadraId = +params['id'];
        this.carregarQuadra();
      });
    }
    
    this.carregarEsportes();
  }

  carregarQuadra() {
    // Se não tiver os dados, busca novamente
    if (!this.quadra || !this.ginasio) {
      // Implementar busca se necessário
    }
  }

  async carregarEsportes() {
    if (!this.quadraId) return;
    
    try {
      const response = await fetch(`${environment.apiBaseUrl}/getSportsByGym?id=${this.quadraId}`);
      const res = await response.json();
      this.esportes = res || [];
      console.log('Esportes disponíveis:', res);
    } catch (erro) {
      console.error('Erro ao carregar esportes:', erro);
      this.esportes = [];
    }
  }

  selecionarData(data: Date) {
    // Verifica se a data não é no passado
    if (this.isDataPassada(data)) {
      this.showToast('Não é possível criar reservas no passado', 'danger');
      return;
    }
    
    this.selectedDate = data;
    this.selectedDateString = this.formatarDataParaAPI(data);
    this.horariosSelecionados = [];
    this.mostrarFormulario = false;
    this.carregarReservasDoDia();
  }

  isDataPassada(data: Date): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataComparar = new Date(data);
    dataComparar.setHours(0, 0, 0, 0);
    return dataComparar < hoje;
  }

  async carregarReservasDoDia() {
    if (!this.selectedDateString || !this.quadraId) return;
    
    this.carregando = true;
    try {
      // O parâmetro 'gym' na verdade se refere ao id da quadra
      const response = await fetch(`${environment.apiBaseUrl}/getBookingByDate?gym=${this.quadraId}&date=${this.selectedDateString}`);
      const res = await response.json();
      // A resposta já vem filtrada pela quadra, mas vamos garantir
      this.reservasDoDia = (res || []).filter((r: any) => r.id_quadra == this.quadraId);
      this.calcularHorariosLivres();
    } catch (erro) {
      console.error('Erro ao carregar reservas:', erro);
      this.reservasDoDia = [];
    } finally {
      this.carregando = false;
    }
  }

  calcularHorariosLivres() {
    // Horário de funcionamento do ginásio (padrão 8h às 23h)
    const horaInicio = this.ginasio?.hora_abertura ? this.extrairHora(this.ginasio.hora_abertura) : 8;
    const horaFim = this.ginasio?.hora_fechamento ? this.extrairHora(this.ginasio.hora_fechamento) : 23;
    
    // Cria lista de todos os horários possíveis (de hora em hora)
    const todosHorarios: string[] = [];
    for (let h = horaInicio; h < horaFim; h++) {
      todosHorarios.push(`${h.toString().padStart(2, '0')}:00`);
    }
    
    // Remove horários que estão reservados
    const horariosReservados = new Set<string>();
    this.reservasDoDia.forEach(reserva => {
      const inicio = this.extrairHora(reserva.hora_inicio);
      const fim = this.extrairHora(reserva.hora_fim);
      for (let h = inicio; h < fim; h++) {
        horariosReservados.add(`${h.toString().padStart(2, '0')}:00`);
      }
    });
    
    // Filtra horários livres
    this.horariosLivres = todosHorarios.filter(h => !horariosReservados.has(h));
  }

  extrairHora(horario: string): number {
    if (!horario) return 0;
    return parseInt(horario.substring(0, 2));
  }

  toggleHorario(horario: string) {
    const index = this.horariosSelecionados.indexOf(horario);
    if (index > -1) {
      this.horariosSelecionados.splice(index, 1);
    } else {
      // Verifica se é um horário consecutivo
      if (this.horariosSelecionados.length === 0 || this.isHorarioConsecutivo(horario)) {
        this.horariosSelecionados.push(horario);
        this.horariosSelecionados.sort();
      } else {
        this.showToast('Selecione horários consecutivos', 'danger');
      }
    }
    
    if (this.horariosSelecionados.length > 0) {
      this.mostrarFormulario = true;
    } else {
      this.mostrarFormulario = false;
    }
  }

  isHorarioConsecutivo(horario: string): boolean {
    if (this.horariosSelecionados.length === 0) return true;
    
    const hora = this.extrairHora(horario);
    const horariosOrdenados = [...this.horariosSelecionados].sort();
    const ultimoHorario = horariosOrdenados[horariosOrdenados.length - 1];
    const ultimaHora = this.extrairHora(ultimoHorario);
    
    return hora === ultimaHora + 1;
  }

  async criarReserva() {
    if (this.reservaForm.invalid || this.horariosSelecionados.length === 0) {
      this.showToast('Preencha todos os campos obrigatórios', 'danger');
      return;
    }

    // Valida se a data não é no passado
    if (!this.selectedDate || this.isDataPassada(this.selectedDate)) {
      this.showToast('Não é possível criar reservas no passado', 'danger');
      return;
    }

    // Valida se o horário não é no passado (se for hoje)
    if (this.isHoje(this.selectedDate)) {
      const agora = new Date();
      const horaAtual = agora.getHours();
      const primeiroHorario = this.horariosSelecionados[0];
      const horaReserva = this.extrairHora(primeiroHorario);
      
      if (horaReserva < horaAtual) {
        this.showToast('Não é possível criar reservas em horários que já passaram', 'danger');
        return;
      }
    }

    const usuario = this.authService.getCurrentUser();
    if (!usuario) {
      this.showToast('Você precisa estar logado', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Criando reserva...'
    });
    await loading.present();

    const horaInicio = this.horariosSelecionados[0] + ':00';
    const ultimoHorario = this.horariosSelecionados[this.horariosSelecionados.length - 1];
    const horaFim = (this.extrairHora(ultimoHorario) + 1).toString().padStart(2, '0') + ':00';

    const body = {
      id_usuario: usuario.id,
      id_quadra: this.quadraId,
      data: this.selectedDateString,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      observacoes: this.reservaForm.get('observacoes')?.value || '',
      privada: this.reservaForm.get('privada')?.value || 0,
      id_esporte: this.reservaForm.get('id_esporte')?.value
    };

    try {
      const response = await fetch(`${environment.apiBaseUrl}/registerBooking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const res = await response.json();
      loading.dismiss();
      this.showToast('Reserva criada com sucesso!', 'success');
      
      // O endpoint retorna o ID da reserva
      // Pode ser res.id ou res (se a resposta for apenas o ID)
      const reservaId = res?.id || res;
      
      if (reservaId) {
        setTimeout(() => {
          this.router.navigate(['/reserva', reservaId]);
        }, 500); // Pequeno delay para o toast aparecer
      } else {
        // Se não tiver ID, recarrega as reservas do dia
        this.carregarReservasDoDia();
        // Limpa seleção e formulário
        this.horariosSelecionados = [];
        this.mostrarFormulario = false;
        this.reservaForm.reset();
      }
    } catch (erro) {
      loading.dismiss();
      console.error('Erro ao criar reserva:', erro);
      this.showToast('Erro ao criar reserva. Tente novamente.', 'danger');
    }
  }

  formatarDataParaAPI(data: Date): string {
    const year = data.getFullYear();
    const month = (data.getMonth() + 1).toString().padStart(2, '0');
    const day = data.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatarDataParaExibicao(data: Date): string {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      weekday: 'long'
    });
  }

  formatarHorario(horario: string): string {
    if (!horario) return '';
    return horario.substring(0, 5);
  }

  getDiasDoMes(): Date[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const primeiroDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const dias: Date[] = [];
    
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(new Date(year, month, dia));
    }
    
    return dias;
  }

  mesAnterior() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
  }

  mesProximo() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
  }

  isHoje(data: Date): boolean {
    const hoje = new Date();
    return data.toDateString() === hoje.toDateString();
  }

  isSelecionado(data: Date): boolean {
    if (!this.selectedDate) return false;
    return data.toDateString() === this.selectedDate.toDateString();
  }

  isDataDesabilitada(data: Date): boolean {
    return this.isDataPassada(data);
  }

  isReservado(horario: string): boolean {
    return this.reservasDoDia.some(r => {
      const inicio = this.extrairHora(r.hora_inicio);
      const fim = this.extrairHora(r.hora_fim);
      const hora = this.extrairHora(horario);
      return hora >= inicio && hora < fim;
    });
  }

  voltar() {
    this.router.navigate(['/ginasio', this.ginasioId]);
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

  ngAfterViewInit() {
    // Expor funções no window para eventos nativos
    (window as any).handleVoltarQuadra = () => {
      console.log('⬅️ handleVoltarQuadra chamado via onclick nativo!');
      this.voltar();
    };
    
    (window as any).handleMesAnterior = () => {
      console.log('⬅️ handleMesAnterior chamado via onclick nativo!');
      this.mesAnterior();
    };
    
    (window as any).handleMesProximo = () => {
      console.log('➡️ handleMesProximo chamado via onclick nativo!');
      this.mesProximo();
    };
    
    (window as any).handleSelecionarData = (timestamp: number) => {
      console.log('📅 handleSelecionarData chamado via onclick nativo! Timestamp:', timestamp);
      const data = new Date(timestamp);
      if (!this.isDataDesabilitada(data)) {
        this.selecionarData(data);
      }
    };
    
    (window as any).handleToggleHorario = (horario: string) => {
      console.log('⏰ handleToggleHorario chamado via onclick nativo! Horário:', horario);
      this.toggleHorario(horario);
    };
    
    (window as any).handleCriarReserva = () => {
      console.log('✅ handleCriarReserva chamado via onclick nativo!');
      this.criarReserva();
    };
  }

  ngOnDestroy() {
    delete (window as any).handleVoltarQuadra;
    delete (window as any).handleMesAnterior;
    delete (window as any).handleMesProximo;
    delete (window as any).handleSelecionarData;
    delete (window as any).handleToggleHorario;
    delete (window as any).handleCriarReserva;
  }

}

