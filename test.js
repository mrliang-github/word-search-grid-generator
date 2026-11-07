import assert from 'node:assert/strict';
import { generate, matchSelection } from './index.js';

const words = ['Reindeer', 'Candy Cane', 'Snowflake', 'Mistletoe', 'Sleigh'];
const a = generate({ words, size: 12, difficulty: 'medium', hidden: 'HAPPY HOLIDAYS', seed: 42 });
const b = generate({ words, size: 12, difficulty: 'medium', hidden: 'HAPPY HOLIDAYS', seed: 42 });

assert.deepEqual(a.grid, b.grid, 'Same seed should produce identical grid');
assert.equal(a.placed.length, 5, 'All 5 words should fit in 12x12');
assert.equal(a.hidden, 'HAPPYHOLIDAYS');

const first = a.placed[0];
const matched = matchSelection(a, first.cells[0], first.cells.at(-1));
assert.equal(matched?.word, first.word);

console.log('All tests passed.');
