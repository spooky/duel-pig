export const states = { TOSS: 'toss', MAPS: 'maps', CHAMPS: 'champs', DONE: 'done' };
export const actions = { BAN: 'ban', PICK: 'pick' };

export function* machine(parties, bo, maps, champs, toss) {
    if (parties.length !== 2) throw('2 player system only');

    const arrangement = { maps: {}, champs: {}, state: null, action: null, by: null };

    arrangement.state = states.TOSS;
    let party = toss; //Math.floor(Math.random() * parties.length);

    arrangement.state = states.MAPS;
    arrangement.action = actions.BAN;
    arrangement.by = parties[party % parties.length]

    let counter = 1;

    let input;
    do input = yield arrangement;
    while (nextMap(input));

    arrangement.action = champAction();

    do input = yield arrangement;
    while (nextChamp(input));

    arrangement.action = null;
    arrangement.by = null;

    return arrangement;

    function mapAction() {
        return counter > 2 ? actions.PICK : actions.BAN;
    }
    function nextMap(input) {
        return nextTurn(arrangement.maps, bo + 2 /* bans */, mapAction, maps, input, 'invalid map', states.CHAMPS)
    }

    function champAction() {
        return (counter - bo) % 3 ? actions.PICK : actions.BAN;
    }
    function nextChamp(input) {
        return nextTurn(arrangement.champs, bo * 3 /* 1 ban, 2 picks */, champAction, champs, input, 'invalid champ', states.DONE)
    }

    function nextTurn(store, until, action, available, value, err, nextState) {
        if (available.indexOf(value) === -1) throw(err);

        store[value] = {
            action: action(counter),
            by: parties[party++ % parties.length],
            order: counter++
        }

        const done = Object.keys(store).length >= until;

        arrangement.action = action(counter);
        arrangement.by = parties[party % parties.length]

        if (done)
            arrangement.state = nextState;

        return !done;
    }
}
