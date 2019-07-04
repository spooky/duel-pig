<script>
    import { onDestroy } from 'svelte';
    import Setup from './Setup.svelte';
    import Shuffle from './Shuffle.svelte';
    import { getOpts } from './utils.js';

    const screens = {
        SETUP: 'setup',
        SHUFFLE: 'shuffle'
    },
    cfg = {
          [screens.SETUP]: { component: Setup,   next: e => change(e.detail, screens.SHUFFLE) },
        [screens.SHUFFLE]: { component: Shuffle, next: e => change(e.detail) }
    };

    let opts,
        nick = localStorage.getItem('nick'),
        screen = resolveScreen();

    function change(args, next) {
        opts = args;
        screen = next;
    }

    function resolveScreen() {
        opts = getOpts();
        return opts && nick
            ? screens.SHUFFLE
            : screens.SETUP;
    }
</script>

<svelte:window on:hashchange={() => window.location.reload()} />

{#if cfg[screen]}
<svelte:component this={cfg[screen].component} on:next={cfg[screen].next} {...opts} />
{:else}
<div class="deck-centered">
    <h1>nope</h1>
</div>
{/if}
