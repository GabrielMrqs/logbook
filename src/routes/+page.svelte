<script lang="ts">
	import type { Entry } from '@prisma/client';
	import EntryChart from '$lib/components/EntryChart.svelte';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import StarRating from '$lib/components/StarRating.svelte';

	let { data, form } = $props();
	const today = $derived(data.today as string);

	let date = $state('');
	let weightKg = $state('');
	let trainedBjj = $state(false);
	let wentGym = $state(false);
	let bjjRatingStars = $state('');
	let gymRatingStars = $state('');
	let ratingStars = $state('');
	let bjjComment = $state('');
	let gymComment = $state('');
	let ratingComment = $state('');

	const toDateLabel = (value: Date) => {
		const day = String(value.getUTCDate()).padStart(2, '0');
		const month = String(value.getUTCMonth() + 1).padStart(2, '0');
		const year = String(value.getUTCFullYear());
		return `${day}/${month}/${year}`;
	};

	const resetForm = () => {
		date = today;
		weightKg = '';
		trainedBjj = false;
		wentGym = false;
		bjjRatingStars = '';
		gymRatingStars = '';
		ratingStars = '';
		bjjComment = '';
		gymComment = '';
		ratingComment = '';
	};

	const editEntry = (entry: Entry) => {
		date = toDateLabel(entry.date);
		weightKg = entry.weightKg?.toString() ?? '';
		trainedBjj = entry.trainedBjj;
		wentGym = entry.wentGym;
		bjjRatingStars = entry.bjjRatingStars?.toString() ?? '';
		gymRatingStars = entry.gymRatingStars?.toString() ?? '';
		ratingStars = entry.ratingStars?.toString() ?? '';
		bjjComment = entry.bjjComment ?? '';
		gymComment = entry.gymComment ?? '';
		ratingComment = entry.ratingComment ?? '';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	$effect(() => {
		if (!date) {
			date = today;
		}
	});

	$effect(() => {
		if (!trainedBjj) {
			bjjRatingStars = '';
		}
	});

	$effect(() => {
		if (!wentGym) {
			gymRatingStars = '';
		}
	});
</script>

<svelte:head>
	<title>Logbook</title>
</svelte:head>

<main>
	{#if data.session}
		<section class="panel header">
			<div>
				<p class="muted">Logged in as</p>
				<p class="user">
					{data.session.user?.name ?? data.session.user?.email ?? 'User'}
				</p>
			</div>
			<form method="POST" action="/auth/signout" class="logout">
				<input type="hidden" name="callbackUrl" value="/" />
				<button type="submit" class="secondary">Logout</button>
			</form>
		</section>

		<section class="panel">
			<h1>Logbook</h1>
			<p class="muted">Track weight, training, gym, and day rating. One entry per day.</p>

			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}

			<form method="POST" action="?/save" class="entry-form">
				<div class="grid">
					<label>
						<span>Date (dd/MM/yyyy)</span>
						<DatePicker name="date" bind:value={date} />
					</label>

					<label>
						<span>Weight (kg)</span>
						<input type="number" name="weightKg" inputmode="decimal" min="0" step="0.1" bind:value={weightKg} />
					</label>
				</div>

				<div class="grid comments">
					<div class="group">
						<label class="checkbox">
							<input type="checkbox" name="trainedBjj" bind:checked={trainedBjj} />
							<span>Trained BJJ</span>
						</label>
						<label class:disabled={!trainedBjj}>
							<span>BJJ Rating</span>
							<StarRating
								name="bjjRatingStars"
								bind:value={bjjRatingStars}
								disabled={!trainedBjj}
							/>
						</label>
						<label>
							<span>BJJ Comment</span>
							<textarea name="bjjComment" rows="2" bind:value={bjjComment}></textarea>
						</label>
					</div>

					<div class="group">
						<label class="checkbox">
							<input type="checkbox" name="wentGym" bind:checked={wentGym} />
							<span>Went to Gym</span>
						</label>
						<label class:disabled={!wentGym}>
							<span>Gym Rating</span>
							<StarRating
								name="gymRatingStars"
								bind:value={gymRatingStars}
								disabled={!wentGym}
							/>
						</label>
						<label>
							<span>Gym Comment</span>
							<textarea name="gymComment" rows="2" bind:value={gymComment}></textarea>
						</label>
					</div>

					<div class="group">
						<span class="section-label">Overall day rating</span>
						<label>
							<span>Rating</span>
							<StarRating name="ratingStars" bind:value={ratingStars} />
						</label>
						<label>
							<span>Rating Comment</span>
							<textarea name="ratingComment" rows="2" bind:value={ratingComment}></textarea>
						</label>
					</div>
				</div>

				<div class="actions">
					<button type="submit">Save</button>
					<button type="button" class="secondary" onclick={resetForm}>Clear</button>
				</div>
			</form>
		</section>

		<section class="panel">
			<h2>Recent Entries</h2>
			{#if data.entriesRecent.length === 0}
				<p class="muted">No entries yet.</p>
			{:else}
				<div class="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Date</th>
								<th>Weight</th>
								<th>BJJ</th>
								<th>Gym</th>
								<th>Rating</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each data.entriesRecent as entry}
								<tr>
									<td>{toDateLabel(entry.date)}</td>
									<td>{entry.weightKg ?? '-'}</td>
									<td>
										{entry.trainedBjj ? 'Yes' : 'No'}
										{#if entry.bjjRatingStars}
											<span class="muted"> · {entry.bjjRatingStars}★</span>
										{/if}
									</td>
									<td>
										{entry.wentGym ? 'Yes' : 'No'}
										{#if entry.gymRatingStars}
											<span class="muted"> · {entry.gymRatingStars}★</span>
										{/if}
									</td>
									<td>{entry.ratingStars ?? '-'}</td>
									<td class="actions-cell">
										<button type="button" class="link" onclick={() => editEntry(entry)}>Edit</button>
										<form method="POST" action="?/delete">
											<input type="hidden" name="id" value={entry.id} />
											<button type="submit" class="link danger">Delete</button>
										</form>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>

		<section class="panel">
			<h2>Trends</h2>
			<div class="stats-grid">
				<div class="stat-card">
					<p class="stat-label">Gym days</p>
					<p class="stat-value">{data.gymDaysCount}</p>
				</div>
				<div class="stat-card">
					<p class="stat-label">Jiu-jitsu days</p>
					<p class="stat-value">{data.jiuDaysCount}</p>
				</div>
			</div>
			{#if data.entriesAsc.length < 2}
				<p class="muted">Add at least two entries to see the chart.</p>
			{:else}
				<EntryChart entries={data.entriesAsc} />
			{/if}
		</section>
	{:else}
		<section class="panel hero">
			<h1>Logbook</h1>
			<p class="muted">Sign in to track your daily training and ratings.</p>
			<form method="POST" action="/auth/signin/google">
				<input type="hidden" name="callbackUrl" value="/" />
				<button type="submit">Sign in with Google</button>
			</form>
		</section>
	{/if}
</main>
