export const states = { TOSS: 'toss', MAPS: 'maps', CHAMPS: 'champs', DONE: 'done' };
export const actions = { BAN: 'ban', PICK: 'pick' };

export function* machine(parties, bo, maps, champs, toss) {
    if (parties.length !== 2) throw('2 player system only');
    if ([3, 5].indexOf(bo) == -1) throw(`don't know how to play best of ${bo}`);

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
        const noMoreBans = Object.values(arrangement.maps).filter(x => x.action == actions.BAN).length >= maps.length - bo;
        return (counter + 1) % 4 < 2 || noMoreBans ? actions.PICK : actions.BAN;
    }
    function nextMap(input) {
        return nextTurn(arrangement.maps, bo, mapAction, maps, input, 'invalid map', states.CHAMPS)
    }

    function champAction() {
        return (counter - bo + 1) % 3 ? actions.PICK : actions.BAN;
    }
    function nextChamp(input) {
        return nextTurn(arrangement.champs, bo * 2, champAction, champs, input, 'invalid champ', states.DONE)
    }

    function nextTurn(store, until, action, available, value, err, nextState) {
        if (available.indexOf(value) === -1) throw(err);

        store[value] = {
            action: action(counter),
            by: parties[party++ % parties.length],
            order: counter++
        }

        const done = Object.values(store).filter(x => x.action == actions.PICK).length >= until;

        arrangement.action = action(counter);
        arrangement.by = parties[party % parties.length]

        if (done)
            arrangement.state = nextState;

        return !done;
    }
}
