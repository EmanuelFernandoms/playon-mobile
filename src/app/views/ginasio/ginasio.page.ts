import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ginasio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './ginasio.page.html',
  styleUrls: ['./ginasio.page.scss'],
})
export class GinasioPage implements OnInit, AfterViewInit, OnDestroy {

  ginasio: any = null;
  quadras: any[] = [];
  ginasioId: number | string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Tenta pegar do state primeiro (navegação interna)
    const state = history.state;
    if (state && state.ginasio) {
      this.ginasio = state.ginasio;
      this.ginasioId = this.ginasio.id;
      this.carregarQuadras();
    } else {
      // Se não tiver no state, pega do parâmetro da rota
      this.route.params.subscribe(params => {
        const id = params['id'];
        if (id) {
          this.ginasioId = id;
          this.carregarGinasio();
          this.carregarQuadras();
        }
      });
    }
  }

  async carregarGinasio() {
    // Se não tiver o ginásio completo, busca novamente
    if (!this.ginasio) {
      try {
        const response = await fetch(`${environment.apiBaseUrl}/load-gym-all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: ''
        });
        const res = await response.json();
        // Busca pelo id (que agora sempre existe)
        this.ginasio = res.find((g: any) => g.id == this.ginasioId);
        if (this.ginasio) {
          this.ginasioId = this.ginasio.id;
        }
        console.log('Ginásio:', this.ginasio);
      } catch (erro) {
        console.error('Erro ao carregar ginásio:', erro);
      }
    } else {
      this.ginasioId = this.ginasio.id;
    }
  }

  async carregarQuadras() {
    if (!this.ginasioId) {
      console.error('ID do ginásio não disponível');
      return;
    }

    try {
      const response = await fetch(`${environment.apiBaseUrl}/getCourtByGym?id=${this.ginasioId}`);
      const res = await response.json();
      this.quadras = res || [];
      console.log('Quadras:', res);
    } catch (erro) {
      console.error('Erro ao carregar quadras:', erro);
      this.quadras = [];
    }
  }

  formatarHorario(horario: string): string {
    if (!horario) return '';
    return horario.substring(0, 5); // Retorna apenas HH:MM
  }

  abrirQuadra(quadra: any) {
    if (!quadra || !quadra.id) {
      return;
    }
    // Passa o ginásio e a quadra para a página da quadra
    this.router.navigate(['/quadra', quadra.id], {
      state: { 
        quadra: quadra,
        ginasio: this.ginasio
      }
    });
  }

  voltar() {
    this.router.navigate(['/home']);
  }

  ngAfterViewInit() {
    // Expor funções no window para eventos nativos
    (window as any).handleVoltarGinasio = () => {
      console.log('⬅️ handleVoltarGinasio chamado via onclick nativo!');
      this.voltar();
    };
    
    (window as any).handleAbrirQuadra = (id: string) => {
      console.log('🏀 handleAbrirQuadra chamado via onclick nativo! ID:', id);
      const quadra = this.quadras.find(q => q.id === id);
      if (quadra) {
        this.abrirQuadra(quadra);
      }
    };
  }

  ngOnDestroy() {
    delete (window as any).handleVoltarGinasio;
    delete (window as any).handleAbrirQuadra;
  }

}

