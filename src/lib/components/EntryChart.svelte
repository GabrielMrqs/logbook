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
		const ratingData = entries.map((e) => e.ratingStars ?? null);
		const bjjRatingData = entries.map((e) => e.bjjRatingStars ?? null);
		const gymRatingData = entries.map((e) => e.gymRatingStars ?? null);

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
						tension: 0.2,
						yAxisID: 'yWeight'
					},
					{
						label: 'Day rating (1–5)',
						data: ratingData,
						borderColor: '#c05621',
						backgroundColor: 'rgba(192, 86, 33, 0.15)',
						spanGaps: true,
						tension: 0.2,
						yAxisID: 'yNotes'
					},
					{
						label: 'Jiu-jitsu rating',
						data: bjjRatingData,
						borderColor: '#2f855a',
						backgroundColor: 'rgba(47, 133, 90, 0.15)',
						spanGaps: true,
						tension: 0.2,
						yAxisID: 'yNotes'
					},
					{
						label: 'Gym rating',
						data: gymRatingData,
						borderColor: '#805ad5',
						backgroundColor: 'rgba(128, 90, 213, 0.15)',
						spanGaps: true,
						tension: 0.2,
						yAxisID: 'yNotes'
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
					yWeight: {
						position: 'left',
						title: { display: true, text: 'Weight (kg)' }
					},
					yNotes: {
						position: 'right',
						min: 1,
						max: 5,
						title: { display: true, text: 'Ratings (1–5)' },
						grid: { drawOnChartArea: false }
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
</style>
