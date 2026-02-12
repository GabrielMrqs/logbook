<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Entry } from '@prisma/client';

	export let entries: Entry[] = [];

	let canvas: HTMLCanvasElement | null = null;
	let chart: { destroy: () => void } | null = null;

	const toDateLabel = (value: Date) => {
		const day = String(value.getUTCDate()).padStart(2, '0');
		const month = String(value.getUTCMonth() + 1).padStart(2, '0');
		const year = String(value.getUTCFullYear());
		return `${day}/${month}/${year}`;
	};

	onMount(async () => {
		const { Chart } = await import('chart.js/auto');

		const labels = entries.map((e) => toDateLabel(e.date));
		const weightData = entries.map((e) => e.weightKg ?? null);

		if (!canvas) return;
		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Weight (kg)',
						data: weightData,
						borderColor: '#2b6cb0',
						backgroundColor: 'rgba(43, 108, 176, 0.15)',
						spanGaps: true,
						tension: 0.2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { mode: 'index', intersect: false },
				plugins: {
					legend: { position: 'bottom' },
					tooltip: {
						callbacks: {
							label: (context) => {
								const value = context.parsed?.y;
								if (value === null || value === undefined) {
									return `${context.dataset.label}: No note`;
								}
								return `${context.dataset.label}: ${value}`;
							}
						}
					}
				},
				scales: {
					y: {
						title: { display: true, text: 'Weight (kg)' }
					}
				}
			}
		});
	});

	onDestroy(() => {
		chart?.destroy();
	});
</script>

<div class="chart-wrap">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.chart-wrap {
		height: 320px;
		width: 100%;
	}

	@media (max-width: 640px) {
		.chart-wrap {
			height: 240px;
		}
	}
</style>
