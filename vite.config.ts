import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	base: "/react-tooltip/",
	build: {
		outDir: "dist",
		emptyOutDir: true,
		rollupOptions: {
			output: {
				format: "es",
				entryFileNames: "[name].js",
				chunkFileNames: "[name].js",
				assetFileNames: "[name].[ext]",
			},
		},
	},
});
