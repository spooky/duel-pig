<script>
    import { onMount, onDestroy } from 'svelte';
    import Items from './Items.svelte';
    import labels from './labels.js';
    import { establishConnection, post, uid } from './utils.js';
    import { states, actions, machine } from './machine.js';
    import { db } from './stores.js'

    export let bo, sid, sender = localStorage.getItem('nick'), error = null;

    const l = {...labels, 'us': sender};

    let m, unsubscribe = () => {}, arrangement = {}, connected = false;
    let parties = ['us', 'them'], maps = [], champs = [];
    $: mapsDisabled = arrangement.state !== states.MAPS && arrangement.state !== states.DONE || arrangement.by == 'them';
    $: champsDisabled = arrangement.state !== states.CHAMPS && arrangement.state !== states.DONE || arrangement.by == 'them';

    onMount(run);
    onDestroy(unsubscribe);

    function onClick(data) {
        next(data, () => post('messages', { sender, data, sid: bo + sid }));
    }

    function next(data, send = null) {
        if(arrangement.maps[data] || arrangement.champs[data]) return;

        if (send) send();

        arrangement = m.next(data).value || arrangement;

        if (arrangement.state === states.CHAMPS)
            maps = _whenDone(maps, arrangement.maps);

        if (arrangement.state === states.DONE)
            champs = _whenDone(champs, arrangement.champs);

        // console.log(arrangement)
    }

    function run() {
        try {
            establishConnection({ sender, sid: bo + sid }, onJoin, onMsg);
        } catch (err) {
            error = err;
        }
    }

    function onJoin(msg) {
        // console.log('on join', msg);
        const toss = msg.toss == uid({ sender, sid: bo + sid }) ? 0 : 1;
        start(toss);

        connected = true;
    }

    function onMsg(msg) {
        // console.log('on msg', msg);
        if (msg.sender !== sender) {
            next(msg.data);
            l.them = msg.sender;
        }
    }

    function start(toss) {
        unsubscribe();

        unsubscribe = db.subscribe(v => {
            if (!v) return;

            maps = v.maps;
            champs = v.champs;

            try {
                m = machine(parties, bo, maps, champs, toss);
                arrangement = m.next().value;
            } catch(err) {
                error = err;
            }
        });
    }

    function _(name) { return  l[name] || name || ''; }
    function _whenDone(items, lookop) { return items.filter(x => _filter(lookop, x)).sort((l, r) => _order(lookop, l, r)); }
    function _filter(items, item) { return items[item] && items[item].action === actions.PICK; }
    function _order(items, a, b) { return (items[a] || {order: 100}).order - (items[b] || {order: 100}).order; }
</script>

<style>
    header {
        padding: .5em;
        text-align: center;
        font-size: x-large;
        color: #fff;
        box-shadow: 0 0 10px 0px rgba(0, 0, 0, .5);
        display: flex;
        justify-content: center;
    }

    .deck {
        margin: 0 auto;
        padding-bottom: 1em;
        max-width: 1080px;
    }

    .hints { flex: 1; }
</style>

{#if error || !connected}
<div class="deck-centered">
    <h1>{ error || 'Connecting...'}</h1>
</div>
{:else}
<header>
    <span class="hints">{_(arrangement.by + '-' + arrangement.action + '-' + arrangement.state)}</span>
</header>
<div class="deck">
    <Items cls="{arrangement.state} {arrangement.action}" labels={l} items={maps} arrangement={arrangement.maps} disabled={mapsDisabled} img="maps" on:click={e => onClick(e.detail)} />
    <Items cls="{arrangement.state} {arrangement.action}" labels={l} items={champs} arrangement={arrangement.champs} disabled={champsDisabled} img="champs" on:click={e => onClick(e.detail)} />
</div>
{/if}
