import { readable } from 'svelte/store';

export const db = readable(
    null,
    function start(set) {
        set({
            // maps: ['awoken', 'blood_covenant', 'blood_run', 'burial_chamber', 'church', 'corrupted_keep', 'dark_zone', 'deep_embrace', 'exile', 'lockbox', 'longest_yard', 'insomnia', 'ruins_of_sarnath', 'tempest_shrine', 'the_molten_falls', 'tower_of_koth', 'vale_of_pnath'],
            maps: ['awoken', 'blood_covenant', 'blood_run', 'corrupted_keep', 'dark_zone', 'deep_embrace', 'exile', 'insomnia', 'ruins_of_sarnath', 'the_molten_falls', 'tower_of_koth', 'vale_of_pnath'],
            champs: ['anarki', 'athena', 'bj', 'clutch', 'death_knight', 'doom', 'eisen', 'galena', 'keel', 'nyx', 'ranger', 'scalebearer', 'slash', 'sorlag', 'strogg', 'visor']
        });

        return function stop() {}
    }
);
