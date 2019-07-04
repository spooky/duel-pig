<script>
    import { createEventDispatcher } from 'svelte';

    export let items;
    export let arrangement;
    export let img;
    export let disabled;
    export let cls;
    export let labels;

    const dispatch = createEventDispatcher();
    function _(name) { return  labels[name] || name || ''; }
</script>

<style>
    section { margin-top: 1em; }

    ul {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    li {
        list-style-type: none;
        display: flex;
        margin-right: .3em;
        margin-bottom: .3em;
    }

    ul, li {
        margin: 0;
        padding: 0;
    }

    span {
        display: inline-block;
        margin-right: .3em;
    }

    .us { background: royalblue; }
    .them { background: red; }

    .tile {
        position: relative;
        padding: 1px;
        margin: 2px;
        background: #666;
        border: 0;
        box-shadow: 0 0 10px 0px rgba(0, 0, 0, .5);
        width: 10em;
        min-height: 90px;
    }
    .tile[disabled] {
        opacity: .6;
        cursor: default;
    }
    .tile img {
        width: 100%;
        display: block;
    }

    .tile .action,
    .tile .party,
    .tile .overlay {
        padding: 0;
        margin: 0;
        position: absolute;
        color: #fff;
        background: none;
        font-size: x-large;
        display: flex;
        align-items: center;
        justify-content: center;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .ban .tile:hover .overlay,
    .tile .action.ban {
        background: url('img/ban.svg') #0008 no-repeat 50% 50%;
        background-size: 50%;
    }
    .pick .tile:hover .overlay {
        background: #fff5;
    }

    .ban .tile[disabled]:hover .overlay { background: none; }
    /*.done ul { justify-content: space-around; }*/

    .tile .party.us { background: #4169E155; }
    .tile .party.them { background: #f005; }
</style>

<div class={cls}>
    <section>
        <ul>
        {#each items as item}
            <li>
                <button class="tile" on:click={e => dispatch('click', item)} {disabled} title="{_(item)}">
                {#if arrangement[item]}
                    <span class="party {arrangement[item].by}">{_(arrangement[item].by)}</span>
                    <span class="action {arrangement[item].action}"></span>
                {/if}
                <img src="img/{img}/{item}.jpg" alt="{item}" />
                <span class="overlay"></span>
                </button>
            </li>
        {/each}
        </ul>
    </section>
</div>