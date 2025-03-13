// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  nitro: {
    preset: 'static', // Garante que o Nuxt gere um build estático
    prerender: {
      routes: ['/', '/200.html', '/404.html'], // Adiciona a rota principal para garantir que seja gerada
    }
  }
})

