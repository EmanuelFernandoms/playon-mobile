import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './explorar.page.html',
  styleUrls: ['./explorar.page.scss'],
})
export class ExplorarPage implements OnInit, AfterViewInit, OnDestroy {

  reservas: any[] = [];
  carregando = false;
  filtrosForm: FormGroup;
  esportesUnicos: any[] = [];
  quadrasUnicas: any[] = [];
  ginasios: any[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      search: [''],
      data: [''],
      status: [''],
      id_esporte: [''],
      id_quadra: [''],
      cidade: [''],
      uf: ['']
    });
  }

  ngOnInit() {
    this.carregarGinasios();
    // Busca inicial sem filtros para carregar todas as reservas e extrair esportes
    this.buscarReservas();
  }

  async carregarGinasios() {
    try {
      const response = await fetch(`${environment.apiBaseUrl}/load-gym-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: ''
      });
      const res = await response.json();
      this.ginasios = res || [];
      this.carregarQuadras();
    } catch (erro) {
      console.error('Erro ao carregar ginásios:', erro);
      this.ginasios = [];
    }
  }

  async carregarQuadras() {
    // Carrega quadras de todos os ginásios
    const quadrasPromises = this.ginasios.map(async (ginasio) => {
      try {
        const response = await fetch(`${environment.apiBaseUrl}/getCourtByGym?id=${ginasio.id}`);
        return await response.json();
      } catch (erro) {
        console.error(`Erro ao carregar quadras do ginásio ${ginasio.id}:`, erro);
        return null;
      }
    });

    try {
      const results = await Promise.all(quadrasPromises);
      const todasQuadras: any[] = [];
      results.forEach(quadras => {
        if (quadras) {
          todasQuadras.push(...quadras);
        }
      });
      this.quadrasUnicas = todasQuadras;
    } catch (erro) {
      console.error('Erro ao carregar quadras:', erro);
      this.quadrasUnicas = [];
    }
  }

  buscarReservas() {
    this.carregando = true;
    
    const formValue = this.filtrosForm.value;
    
    // Cria o body como form-urlencoded
    let body = new URLSearchParams();
    
    if (formValue.search && formValue.search.trim()) {
      body.append('search', formValue.search.trim());
    }
    
    if (formValue.data) {
      body.append('data', formValue.data);
    }
    
    if (formValue.status) {
      body.append('status', formValue.status);
    }
    
    if (formValue.id_esporte) {
      body.append('id_esporte', formValue.id_esporte.toString());
    }
    
    if (formValue.id_quadra) {
      body.append('id_quadra', formValue.id_quadra.toString());
    }
    
    if (formValue.cidade && formValue.cidade.trim()) {
      body.append('cidade', formValue.cidade.trim());
    }
    
    if (formValue.uf && formValue.uf.trim()) {
      body.append('uf', formValue.uf.trim());
    }

    // Se não houver filtros, envia body vazio (ou sem body)
    const bodyToSend = body.toString() || '';

    try {
      const response = await fetch(`${environment.apiBaseUrl}/getBookingAll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyToSend
      });
      
      const res = await response.json();
      this.reservas = res || [];
      // Extrai esportes únicos apenas se ainda não tiver ou se a lista mudou
      if (this.esportesUnicos.length === 0 || res.length > 0) {
        this.extrairEsportesUnicos();
      }
      console.log('Reservas encontradas:', res);
    } catch (erro) {
      console.error('Erro ao buscar reservas:', erro);
      this.reservas = [];
    } finally {
      this.carregando = false;
    }
  }

  extrairEsportesUnicos() {
    const esportesMap = new Map();
    this.reservas.forEach(reserva => {
      if (reserva.id_esporte && reserva.nome_esporte) {
        if (!esportesMap.has(reserva.id_esporte)) {
          esportesMap.set(reserva.id_esporte, {
            id: reserva.id_esporte,
            nome: reserva.nome_esporte
          });
        }
      }
    });
    this.esportesUnicos = Array.from(esportesMap.values());
  }

  limparFiltros() {
    this.filtrosForm.reset();
    this.buscarReservas();
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
    // Expor funções no window para eventos nativos
    (window as any).handleLimparFiltros = () => {
      console.log('🧹 handleLimparFiltros chamado via onclick nativo!');
      this.limparFiltros();
    };
    
    (window as any).handleAbrirReservaExplorar = (id: string) => {
      console.log('📅 handleAbrirReservaExplorar chamado via onclick nativo! ID:', id);
      const reserva = this.reservas.find(r => r.id === id);
      if (reserva) {
        this.abrirReserva(reserva);
      }
    };
  }

  ngOnDestroy() {
    delete (window as any).handleLimparFiltros;
    delete (window as any).handleAbrirReservaExplorar;
  }

}



