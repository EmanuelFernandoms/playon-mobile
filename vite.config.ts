import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 8100,
    allowedHosts: [
      'playon.app.br',
      'localhost',
      '3.132.216.251'
    ]
  }
});

