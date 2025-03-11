<template>
    <div>
      <canvas ref="chart"></canvas>
    </div>
  </template>
  
  <script>
  import { Chart, registerables } from 'chart.js';
  Chart.register(...registerables);
  
  export default {
    name: 'GraficoJuros',
    props: {
      detalhes: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        chart: null,
      };
    },
    mounted() {
      this.renderChart();
    },
    watch: {
      detalhes: {
        deep: true,
        handler() {
          this.renderChart();
        }
      }
    },
    methods: {
      renderChart() {
        // Se já existir um gráfico, destrói-o antes de criar um novo
        if (this.chart) {
          this.chart.destroy();
        }
        
        // Define os rótulos e dados a partir do array de detalhes
        const labels = this.detalhes.map(item => item.mes);
        const totalInvestidoData = this.detalhes.map(item => item.totalInvestido);
        const totalAcumuladoData = this.detalhes.map(item => item.totalAcumulado);
        
        // Cria o gráfico com Chart.js
        const ctx = this.$refs.chart.getContext('2d');
        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Total Investido',
                data: totalInvestidoData,
                borderColor: 'blue',
                fill: false,
                tension: 0.1,
              },
              {
                label: 'Valor em Juros',
                data: totalAcumuladoData,
                borderColor: 'green',
                fill: false,
                tension: 0.1,
              }
            ]
          },
          options: {
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const datasetIndex = context.datasetIndex;
                    const value = context.parsed.y;
                    let label = context.dataset.label || '';
                    if (datasetIndex === 1) {
                      // Para a linha de juros, mostramos a diferença entre totalAcumulado e totalInvestido
                      const totalInvestido = context.chart.data.datasets[0].data[context.dataIndex];
                      const juros = value - totalInvestido;
                      label += ': ' + juros.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      });
                    } else {
                      label += ': ' + value.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      });
                    }
                    return label;
                  }
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Meses'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Valores'
                },
                beginAtZero: true
              }
            }
          }
        });
      }
    }
  }
  </script>
  
  <style scoped>
  canvas {
    max-width: 100%;
    height: 400px;
  }
  </style>
  