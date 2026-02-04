<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let { name = 'date', value = $bindable(''), placeholder = 'dd/MM/yyyy' } = $props();

	let input: HTMLInputElement | null = null;
	let picker: { setDate: (date: string, triggerChange?: boolean) => void; destroy: () => void } | null = null;

	onMount(async () => {
		const { default: flatpickr } = await import('flatpickr');
		if (!input) return;
		picker = flatpickr(input, {
			dateFormat: 'd/m/Y',
			allowInput: true,
			defaultDate: value || undefined,
			onChange: (_selectedDates, dateStr) => {
				value = dateStr;
			}
		});
	});

	$effect(() => {
		if (picker && value) {
			picker.setDate(value, false);
		}
	});

	onDestroy(() => {
		picker?.destroy();
	});
</script>

<input
	bind:this={input}
	type="text"
	{name}
	{placeholder}
	bind:value
/>
