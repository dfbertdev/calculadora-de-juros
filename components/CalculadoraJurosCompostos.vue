<template>
  <div class="simulador-container">
    <h2 class="titulo">Simulador de Investimento & Planejamento Financeiro</h2>

    <!-- Formulário de entrada -->
    <div class="form-container">
      <!-- Linha 1: Valor Inicial e Valor Mensal -->
      <div class="row">
        <div class="form-group">
          <label>Valor Inicial</label>
          <CurrencyInput 
            v-model="valorInicial"
            :options="currencyOptions"
            :disabled="!isFirstSegment"
          />
        </div>
        <div class="form-group">
          <label>Valor Mensal</label>
          <CurrencyInput 
            v-model="valorMensal"
            :options="currencyOptions"
          />
        </div>
      </div>

      <!-- Linha 2: Período e Taxa de Juros -->
      <div class="row">
        <div class="form-group">
          <label>Período</label>
          <div class="inline-inputs">
            <input type="number" v-model.number="periodo" min="1" class="w-100" />
            <select v-model="tipoPeriodo">
              <option value="anos">ano(s)</option>
              <option value="meses">mês(es)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Taxa de Juros</label>
          <div class="inline-inputs">
            <input 
              type="text"
              v-model="taxaJurosStr"
              v-mask="'##%'"
              style="width: 100%"
            />
            <select v-model="tipoTaxa">
              <option value="anual">anual</option>
              <option value="mensal">mensal</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Linha 3: Mês de Início e Data de Nascimento -->
      <div class="row">
        <div class="form-group">
          <label>Mês de Início</label>
          <input type="month" v-model="mesInicio" />
        </div>
        <div class="form-group">
          <label>Data de Nascimento</label>
          <input type="date" v-model="dataNascimento" />
        </div>
      </div>

      <!-- Linha 4: Meta Financeira com Tipo -->
      <div class="row">
        <div class="form-group">
          <label>Meta Financeira</label>
          <div class="inline-inputs">
            <CurrencyInput 
              v-model="metaFinanceira"
              :options="currencyOptions"
              class="w-100"
            />
            <select v-model="metaType">
              <option value="patrimonio">Patrimônio</option>
              <option value="renda">Renda Mensal</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Linha 5: Botões centralizados -->
      <div class="row center btn-group">
        <button class="btn limpar" @click="limparTudo">Limpar</button>
        <button class="btn calcular" @click="adicionarSegmento">Adicionar Segmento</button>
        <button class="btn salvar" @click="salvarSimulacao">Salvar Simulação</button>
      </div>

      <!-- Texto explicativo sobre o cálculo da meta -->
      <div class="info-meta">
        <p>
          Para o cálculo da meta, assume-se que você continuará fazendo os mesmos aportes mensais do último segmento.
        </p>
      </div>

      <!-- Alerta -->
      <div v-if="exibirAlerta" class="alerta">
        Por favor adicione um valor inicial ou mensal.
      </div>
    </div>

    <!-- Seção de Simulações Salvas -->
    <div v-if="simulacoesSalvas.length" class="simulacoes-salvas">
      <h3>Simulações Salvas</h3>
      <table class="tabela-salvas">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Data de Criação</th>
            <th>Carregar</th>
            <th>Excluir</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sim, index) in simulacoesSalvas" :key="sim.id">
            <td>{{ sim.nome }}</td>
            <td>{{ sim.dataCriacao }}</td>
            <td>
              <button class="btn carregar" @click="carregarSimulacao(index)">Carregar</button>
            </td>
            <td>
              <button class="btn excluir" @click="excluirSimulacao(index)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Seção de Resultados -->
    <div v-if="resultado.calculado" class="resultados-container">
      <h2>Resultado</h2>
      <div class="cards-container">
        <div class="card">
          <h3>Valor Total Final</h3>
          <p>{{ formatCurrency(resultado.totalFinal) }}</p>
        </div>
        <div class="card">
          <h3>Valor Total Investido</h3>
          <p>{{ formatCurrency(resultado.totalInvestido) }}</p>
        </div>
        <div class="card">
          <h3>Total em Juros</h3>
          <p>{{ formatCurrency(resultado.totalJuros) }}</p>
        </div>
        <div class="card">
          <h3>Renda Passiva Mensal</h3>
          <p>{{ formatCurrency(rendaPassiva) }}</p>
        </div>
        <div class="card">
          <h3>Idade neste ponto</h3>
          <p v-if="detalhes.length > 0">
            {{ getAgeAt(detalhes[detalhes.length - 1].mes) }} anos ({{ getMonthLabel(detalhes[detalhes.length - 1].mes) }})
          </p>
          <p v-else>-</p>
        </div>
        <div class="card" v-if="metaFinanceira > (metaType==='patrimonio' ? resultado.totalFinal : rendaPassiva)">
          <h3>Idade que irá atingir a meta</h3>
          <p>{{ metaAge }} anos ({{ metaData }})</p>
        </div>
        <div class="card" v-if="dataNascimento">
          <h3>Idade Atual</h3>
          <p>{{ idade }} anos</p>
        </div>
      </div>
  
      <!-- Gráfico -->
      <h3>Gráfico:</h3>
      <GraficoJuros :detalhes="detalhes" :mesInicio="mesInicio" />
  
      <!-- Tabela Resumo dos Segmentos -->
      <h3>Resumo dos Segmentos</h3>
      <table class="tabela-resumo">
        <thead>
          <tr>
            <th>Segmento</th>
            <th>Valor Inicial</th>
            <th>Período (meses)</th>
            <th>Valor Mensal</th>
            <th>Taxa de Juros</th>
            <th>Total Aportado</th>
            <th>Total em Juros</th>
            <th>Montante Final</th>
            <th>Excluir</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(seg, index) in segmentos" :key="index">
            <td>{{ seg.segmento }}</td>
            <td>{{ formatCurrency(seg.valorInicialSegmento) }}</td>
            <td>{{ seg.periodo }}</td>
            <td>{{ formatCurrency(seg.valorMensal) }}</td>
            <td>{{ seg.taxaExibicao }}</td>
            <td>{{ formatCurrency(seg.investido) }}</td>
            <td>{{ formatCurrency(seg.juros) }}</td>
            <td>{{ formatCurrency(seg.montanteFinal) }}</td>
            <td>
              <button class="btn excluir" @click="excluirSegmento(index)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Tabela Detalhamento Mensal -->
      <!-- Tabela Detalhamento Mês a Mês (coluna "Total Aportado" removida) -->
      <h3>Detalhamento Mês a Mês</h3>
      <table class="tabela-detalhes">
        <thead>
          <tr>
            <th>Idade</th>
            <th>Mês</th>
            <th>Taxa de Juros</th>
            <th>Aporte do Mês</th>
            <th>Juros do Mês</th>
            <th>Total Investido</th>
            <th>Total em Juros</th>
            <th>Montante Acumulado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in detalhes" :key="index">
            <td>{{ getAgeAt(item.mes) }} anos</td>
            <td>{{ getMonthLabel(item.mes) }}</td>
            <td>{{ item.taxaMensal.toFixed(2) }}%</td>
            <td>{{ formatCurrency(item.aporteMes) }}</td>
            <td>{{ formatCurrency(item.jurosMes) }}</td>
            <td>{{ formatCurrency(item.totalInvestido) }}</td>
            <td>{{ formatCurrency(item.jurosAcumulados) }}</td>
            <td>{{ formatCurrency(item.totalAcumulado) }}</td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>
</template>
  
<script>
import CurrencyInput from './CurrencyInput.vue'
import GraficoJuros from './GraficoJuros.vue'
  
export default {
  name: 'CalculadoraJuros',
  components: { CurrencyInput, GraficoJuros },
  data() {
    return {
      currencyOptions: {
        currency: 'BRL',
        precision: 2,
        allowNegative: true
      },
      valorInicial: 1000,
      valorMensal: 1000,
      taxaJuros: 8,
      tipoTaxa: 'anual',
      periodo: 1,
      tipoPeriodo: 'anos',
      mesInicio: new Date().toISOString().substr(0, 7),
      metaFinanceira: 0,
      metaType: 'patrimonio',
      dataNascimento: '',
  
      detalhes: [],
      segmentos: [],
      resultado: {
        totalFinal: 0,
        totalInvestido: 0,
        totalJuros: 0,
        calculado: false
      },
      exibirAlerta: false,
      simulacoesSalvas: []
    }
  },
  computed: {
    isFirstSegment() {
      return this.segmentos.length === 0
    },
    taxaJurosStr: {
      get() {
        return `${this.taxaJuros}%`
      },
      set(maskedValue) {
        this.taxaJuros = parseFloat(maskedValue.replace('%','').replace(',', '.')) || 0
      }
    },
    rendaPassiva() {
      if (this.detalhes.length > 0) {
        return this.detalhes[this.detalhes.length - 1].jurosMes
      }
      return 0
    },
    idade() {
      if (!this.dataNascimento) return '-'
      const nascimento = new Date(this.dataNascimento)
      const hoje = new Date()
      let age = hoje.getFullYear() - nascimento.getFullYear()
      const m = hoje.getMonth() - nascimento.getMonth()
      if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        age--
      }
      return age
    },
    tempoMeta() {
      let meses = 0
      if (this.detalhes.length === 0) return 0
      let totalSimulado = this.resultado.totalFinal
      const taxaSimulada = (this.tipoTaxa === 'anual')
        ? Math.pow(1 + this.taxaJuros / 100, 1 / 12) - 1
        : this.taxaJuros / 100
      const aporte = this.valorMensal
  
      if (this.metaType === 'patrimonio') {
        while(totalSimulado < this.metaFinanceira && meses < 600) {
          totalSimulado = totalSimulado + aporte + (totalSimulado * taxaSimulada)
          meses++
        }
      } else if (this.metaType === 'renda') {
        while((totalSimulado * taxaSimulada) < this.metaFinanceira && meses < 600) {
          totalSimulado = totalSimulado + aporte + (totalSimulado * taxaSimulada)
          meses++
        }
      }
      return meses
    },
    metaData() {
      const lastMes = this.detalhes.length > 0 ? this.detalhes[this.detalhes.length - 1].mes : 0
      const base = new Date(this.mesInicio + "-01")
      base.setMonth(base.getMonth() + lastMes + this.tempoMeta)
      return base.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    },
    metaAge() {
      const lastMes = this.detalhes.length > 0 ? this.detalhes[this.detalhes.length - 1].mes : 0
      return this.getAgeAt(lastMes + this.tempoMeta)
    }
  },
  mounted() {
    this.carregarSimulacoesSalvas()
  },
  methods: {
    formatCurrency(value) {
      if (value === null || value === undefined) return ''
      return 'R$ ' + parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    getMonthLabel(mesIndex) {
      const [year, month] = this.mesInicio.split("-").map(Number)
      // Cria a data com mês correto (o mês é 0-indexado)
      const base = new Date(year, month - 1, 1)
      base.setMonth(base.getMonth() + mesIndex)
      return base.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    },
    getAgeAt(mesIndex) {
      if (!this.dataNascimento) return '-'
      const [year, month] = this.mesInicio.split("-").map(Number)
      const simDate = new Date(year, month - 1, 1)
      simDate.setMonth(simDate.getMonth() + mesIndex)
      const birth = new Date(this.dataNascimento)
      let age = simDate.getFullYear() - birth.getFullYear()
      const m = simDate.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && simDate.getDate() < birth.getDate())) {
        age--
      }
      return age
    },
    limparTudo() {
      this.valorInicial = 1000
      this.valorMensal = 1000
      this.taxaJuros = 8
      this.tipoTaxa = 'anual'
      this.periodo = 1
      this.tipoPeriodo = 'anos'
      this.mesInicio = new Date().toISOString().substr(0, 7)
      this.metaFinanceira = 0
      this.metaType = 'patrimonio'
      this.dataNascimento = ''
      this.detalhes = []
      this.segmentos = []
      this.resultado = { totalFinal: 0, totalInvestido: 0, totalJuros: 0, calculado: false }
      this.exibirAlerta = false
    },
    adicionarSegmento() {
      if (this.isFirstSegment && this.valorInicial <= 0 && this.valorMensal <= 0) {
        this.exibirAlerta = true
        return
      }
      this.exibirAlerta = false
  
      const r = (this.tipoTaxa === 'anual')
        ? Math.pow(1 + this.taxaJuros / 100, 1 / 12) - 1
        : this.taxaJuros / 100
      const n = (this.tipoPeriodo === 'anos') ? this.periodo * 12 : this.periodo
  
      this.adicionarSegmentoInterno({
        valorInicialSegmento: this.isFirstSegment ? this.valorInicial : this.resultado.totalFinal,
        valorMensal: this.valorMensal,
        taxaDecimal: r,
        taxaExibicao: `${this.taxaJuros}% ${this.tipoTaxa}`,
        periodo: n
      })
    },
    adicionarSegmentoInterno({ valorInicialSegmento, valorMensal, taxaDecimal, taxaExibicao, periodo }) {
      let totalInvestido, totalAcumulado, jurosAcumulados, startMonth
      let monthlyAportadoSoFar = 0
      let aporteInicialSegmento = 0
      if (this.detalhes.length > 0) {
        monthlyAportadoSoFar = this.detalhes[this.detalhes.length - 1].totalAportadoSoFar
        aporteInicialSegmento = monthlyAportadoSoFar
      }
  
      if (this.segmentos.length === 0 && this.detalhes.length === 0) {
        totalInvestido = valorInicialSegmento
        totalAcumulado = valorInicialSegmento
        jurosAcumulados = 0
        startMonth = 0
  
        // Mês 0: só juros sobre o valor inicial; aporte do mês é 0
        const jurosMes = totalAcumulado * taxaDecimal
        totalAcumulado += jurosMes
        jurosAcumulados = totalAcumulado - totalInvestido
        this.detalhes.push({
          mes: startMonth,
          taxaMensal: taxaDecimal * 100,
          jurosMes,
          totalInvestido,
          totalAportadoSoFar: monthlyAportadoSoFar,
          jurosAcumulados,
          totalAcumulado,
          aporteMes: 0
        })
  
        for (let i = 1; i < periodo; i++) {
          totalInvestido += valorMensal
          totalAcumulado += valorMensal
          monthlyAportadoSoFar += valorMensal
          const jurosMes = totalAcumulado * taxaDecimal
          totalAcumulado += jurosMes
          jurosAcumulados = totalAcumulado - totalInvestido
          this.detalhes.push({
            mes: startMonth + i,
            taxaMensal: taxaDecimal * 100,
            jurosMes,
            totalInvestido,
            totalAportadoSoFar: monthlyAportadoSoFar,
            jurosAcumulados,
            totalAcumulado,
            aporteMes: valorMensal
          })
        }
      } else {
        const lastDetail = this.detalhes[this.detalhes.length - 1]
        totalInvestido = lastDetail.totalInvestido
        totalAcumulado = lastDetail.totalAcumulado
        jurosAcumulados = lastDetail.jurosAcumulados
        startMonth = lastDetail.mes + 1
  
        for (let i = 0; i < periodo; i++) {
          totalInvestido += valorMensal
          totalAcumulado += valorMensal
          monthlyAportadoSoFar += valorMensal
          const jurosMes = totalAcumulado * taxaDecimal
          totalAcumulado += jurosMes
          jurosAcumulados = totalAcumulado - totalInvestido
          this.detalhes.push({
            mes: startMonth + i,
            taxaMensal: taxaDecimal * 100,
            jurosMes,
            totalInvestido,
            totalAportadoSoFar: monthlyAportadoSoFar,
            jurosAcumulados,
            totalAcumulado,
            aporteMes: valorMensal
          })
        }
      }
  
      const last = this.detalhes[this.detalhes.length - 1]
      // Para o resumo, o "aporte investido" é a diferença entre o acumulado de aportes no final do segmento e o acumulado antes do segmento.
      const aporteNoSegmento = monthlyAportadoSoFar - aporteInicialSegmento
      const segObj = {
        segmento: this.segmentos.length + 1,
        valorInicialSegmento,
        periodo,
        valorMensal,
        taxaExibicao,
        investido: aporteNoSegmento,
        // Juros do segmento é a diferença entre o montante final do segmento e a soma do valor inicial do segmento com os aportes realizados
        juros: (last.totalAcumulado - (valorInicialSegmento + aporteNoSegmento)),
        montanteFinal: last.totalAcumulado,
        aporteAcumulado: monthlyAportadoSoFar
      }
      this.segmentos.push(segObj)
  
      this.resultado.totalFinal = last.totalAcumulado
      this.resultado.totalInvestido = last.totalInvestido
      this.resultado.totalJuros = last.totalAcumulado - last.totalInvestido
      this.resultado.calculado = true
    },
    excluirSegmento(index) {
      this.segmentos.splice(index, 1)
      this.$nextTick(() => {
        setTimeout(() => {
          this.recalcularTodosSegmentos()
        }, 100)
      })
    },
    recalcularTodosSegmentos() {
      this.detalhes = []
      this.resultado = { totalFinal: 0, totalInvestido: 0, totalJuros: 0, calculado: false }
      const oldSegments = [...this.segmentos]
      this.segmentos = []
      for (const seg of oldSegments) {
        this.adicionarSegmentoInterno({
          valorInicialSegmento: seg.valorInicialSegmento,
          valorMensal: seg.valorMensal,
          taxaDecimal: this.converterTaxa(seg.taxaExibicao),
          taxaExibicao: seg.taxaExibicao,
          periodo: seg.periodo
        })
      }
    },
    converterTaxa(taxaExibicao) {
      const parts = taxaExibicao.split(' ')
      const valor = parseFloat(parts[0].replace('%','').replace(',', '.')) || 0
      const tipo = parts[1] || 'anual'
      if (tipo === 'anual') {
        return Math.pow(1 + valor / 100, 1 / 12) - 1
      } else {
        return valor / 100
      }
    },
    salvarSimulacao() {
      const sim = {
        id: Date.now(),
        nome: `Simulação ${new Date().toLocaleString()}`,
        dataCriacao: new Date().toLocaleDateString('pt-BR'),
        state: {
          valorInicial: this.valorInicial,
          valorMensal: this.valorMensal,
          taxaJuros: this.taxaJuros,
          tipoTaxa: this.tipoTaxa,
          periodo: this.periodo,
          tipoPeriodo: this.tipoPeriodo,
          mesInicio: this.mesInicio,
          metaFinanceira: this.metaFinanceira,
          metaType: this.metaType,
          dataNascimento: this.dataNascimento,
          detalhes: this.detalhes,
          segmentos: this.segmentos,
          resultado: this.resultado
        }
      }
      let sims = JSON.parse(localStorage.getItem('simulacoesSalvas')) || []
      sims.push(sim)
      localStorage.setItem('simulacoesSalvas', JSON.stringify(sims))
      this.carregarSimulacoesSalvas()
      alert('Simulação salva com sucesso!')
    },
    carregarSimulacoesSalvas() {
      this.simulacoesSalvas = JSON.parse(localStorage.getItem('simulacoesSalvas')) || []
    },
    carregarSimulacao(index) {
      const sim = this.simulacoesSalvas[index]
      if (sim && sim.state) {
        this.valorInicial = sim.state.valorInicial
        this.valorMensal = sim.state.valorMensal
        this.taxaJuros = sim.state.taxaJuros
        this.tipoTaxa = sim.state.tipoTaxa
        this.periodo = sim.state.periodo
        this.tipoPeriodo = sim.state.tipoPeriodo
        this.mesInicio = sim.state.mesInicio
        this.metaFinanceira = sim.state.metaFinanceira
        this.metaType = sim.state.metaType
        this.dataNascimento = sim.state.dataNascimento
        this.detalhes = sim.state.detalhes
        this.segmentos = sim.state.segmentos
        this.resultado = sim.state.resultado
      }
    },
    excluirSimulacao(index) {
      let sims = JSON.parse(localStorage.getItem('simulacoesSalvas')) || []
      sims.splice(index, 1)
      localStorage.setItem('simulacoesSalvas', JSON.stringify(sims))
      this.carregarSimulacoesSalvas()
    }
  }
}
</script>
  
<style scoped>
.w-100{
  width: 100%;
}
/* Container principal */
.simulador-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
}
  
.titulo {
  color: #b31c1c;
  margin-bottom: 20px;
  font-size: 1.5rem;
}
  
/* Formulário */
.form-container {
  background-color: #f7f7f7;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}
  
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}
.center {
  justify-content: center;
}
.inline-inputs {
  display: flex;
  gap: 8px;
  align-items: center;
}
  
.form-group {
  flex: 1 1 1px;
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 5px;
}
.form-group input,
.form-group select {
  padding: 8px;
  font-size: 1rem;
  border-radius: 3px;
  border: 1px solid #ccc;
}
  
/* Botões */
.btn-group {
  gap: 10px;
}
.btn {
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 3px;
  border: none;
  font-size: 1rem;
}
.calcular {
  background-color: #b31c1c;
  color: #fff;
}
.calcular:hover {
  background-color: #d42020;
}
.limpar {
  background-color: #888;
  color: #fff;
}
.limpar:hover {
  background-color: #666;
}
.salvar {
  background-color: #007bff;
  color: #fff;
}
.salvar:hover {
  background-color: #0056b3;
}
.excluir {
  background-color: #dc3545;
  color: #fff;
}
.excluir:hover {
  background-color: #c82333;
}
.carregar {
  background-color: #28a745;
  color: #fff;
}
.carregar:hover {
  background-color: #218838;
}
  
/* Texto explicativo da meta */
.info-meta {
  text-align: center;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 10px;
}
  
/* Alerta */
.alerta {
  background-color: #ffd6d6;
  color: #b31c1c;
  padding: 10px;
  border-radius: 3px;
  font-size: 0.9rem;
}
  
/* Simulações Salvas */
.simulacoes-salvas {
  margin-bottom: 20px;
}
.tabela-salvas {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
.tabela-salvas th,
.tabela-salvas td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}
.tabela-salvas th {
  background-color: #f2f2f2;
  font-weight: 600;
}
  
/* Resultados */
.resultados-container {
  margin-top: 20px;
}
.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.card {
  flex: 1 1 200px;
  background-color: #f1f1f1;
  border-radius: 5px;
  padding: 15px;
  text-align: center;
  border: 1px solid #ddd;
}
.card h3 {
  color: #b31c1c;
  margin-bottom: 10px;
}
  
/* Tabelas */
.tabela-resumo,
.tabela-detalhes {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
.tabela-resumo th,
.tabela-detalhes th,
.tabela-resumo td,
.tabela-detalhes td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: right;
}
.tabela-resumo th,
.tabela-detalhes th {
  background-color: #f2f2f2;
  font-weight: 600;
}
.tabela-resumo td:first-child,
.tabela-detalhes td:first-child,
.tabela-resumo th:first-child,
.tabela-detalhes th:first-child {
  text-align: left;
}
  
/* Responsividade */
@media (max-width: 768px) {
  .row {
    flex-direction: column;
  }
  .btn-group {
    flex-direction: column;
  }
  .cards-container {
    flex-direction: column;
  }
}
</style>
