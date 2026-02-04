<script lang="ts">
	let { name, value = $bindable(''), max = 5, disabled = false } = $props();

	const stars = $derived(Array.from({ length: max }, (_, i) => i + 1));

	const isFilled = (star: number) => {
		const current = Number(value);
		return Number.isFinite(current) && current >= star;
	};

	const setValue = (star: number) => {
		if (disabled) return;
		value = String(star);
	};

	const clear = () => {
		if (disabled) return;
		value = '';
	};
</script>

<div class="star-rating">
	<div class="stars" role="radiogroup" aria-label="Star rating">
		{#each stars as star}
			<button
				type="button"
				class="star {isFilled(star) ? 'filled' : ''}"
				aria-pressed={isFilled(star)}
				aria-label={`${star} star${star === 1 ? '' : 's'}`}
				onclick={() => setValue(star)}
				disabled={disabled}
			>
				★
			</button>
		{/each}
	</div>
	{#if value}
		<input type="hidden" name={name} value={value} />
		<button type="button" class="star-clear" onclick={clear} disabled={disabled}>Clear</button>
	{/if}
</div>

<style>
	.star-rating {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.stars {
		display: inline-flex;
		gap: 6px;
	}

	.star {
		cursor: pointer;
		font-size: 1.1rem;
		color: #d8d5ce;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: none;
		padding: 0;
	}

	.star:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.star.filled {
		color: #f59f00;
	}

	.star-clear {
		border: none;
		background: none;
		color: #52606d;
		font-size: 0.85rem;
		cursor: pointer;
		padding: 0;
	}

	.star-clear:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
