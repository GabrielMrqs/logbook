import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
    allowedHosts: ["app.gmarx.click"],
    host: true,
    port: 5173
  }
});
