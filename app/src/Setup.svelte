<script>
    import { createEventDispatcher } from 'svelte';
    import { id, setOpts } from './utils.js';

    export let sid = null;

    const nickKey = 'nick', boKey = 'bo';
    const dispatch = createEventDispatcher();

    let nick = localStorage.getItem(nickKey);
    let bo = +localStorage.getItem(boKey) || 3;

    function onSubmit() {
        localStorage.setItem(nickKey,  nick);
        localStorage.setItem(boKey, bo);

        const args = { bo, sid: sid || id() };
        setOpts(args);
        dispatch('next', args)

        return false;
    }
</script>

<style>
    ::placeholder { color: #666; }
    input,
    select,
    button {
        font-size: x-large;
        height: 2.3em;
        vertical-align: middle;
        display: inline-block;
        border: 1px solid #999;
        color: #fff;
        border-radius: 0;
        margin-bottom: 0;
        background-color: #000;
        margin-bottom: .3em;
    }
    input { width: 12em; }
    button { width: 4em; }
    button:hover { background: #222; }
    button:active { background: #333; }

    .deck {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: rgba(0,0,0,0.6);
    }

    .options {
        text-align: center;
    }

    @media only screen and (max-width: 580px) {
        input,
        select,
        button {
            width: 90%;
            min-width: 250px;
        }
    }
</style>

<div class="deck">
    <form class="options" on:submit|preventDefault="{onSubmit}">
        <input type="text" name="nick" bind:value="{nick}" placeholder="nick" />
        {#if !sid}
        <select bind:value={bo}>
            {#each [3, 5] as v}
            <option value="{v}">Best of {v}</option>
            {/each}
        </select>
        {/if}
        <button type="submit">Go</button>
    </form>
</div>
