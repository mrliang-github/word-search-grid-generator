# Deterministic Word Search Grid Generator

A zero-dependency, seed-reproducible word search layout engine written in plain JavaScript (ES module). Supports configurable grid sizes (`8×8` to `20×20`), three directional difficulty tiers (`easy`, `medium`, `hard`), automatic multi-word normalization, and leftover-cell hidden messages.

**Live interactive demo & printable PDF maker:** [https://christmaswordsearch.org/generator/](https://christmaswordsearch.org/generator/)

Also powers seasonal printable worksheet tools on [ChristmasWordSearch.org](https://christmaswordsearch.org/), including [Large Print Word Searches](https://christmaswordsearch.org/large-print/), [Christmas Gift Tags](https://christmaswordsearch.org/christmas-gift-tags/), [Christmas Trivia Quiz](https://christmaswordsearch.org/christmas-trivia/), [Christmas Word Scramble](https://christmaswordsearch.org/christmas-word-scramble/), [Christmas Bingo Cards](https://christmaswordsearch.org/christmas-bingo/), [Christmas Mad Libs Stories](https://christmaswordsearch.org/christmas-mad-libs/), and [Editable Place Cards](https://christmaswordsearch.org/place-cards/christmas/).

## Quick Start

```js
import { generate, matchSelection } from './index.js';

const puzzle = generate({
  words: ['Reindeer', 'Candy Cane', 'Snowflake', 'Mistletoe', 'Sleigh'],
  size: 12,
  difficulty: 'medium', // 'easy' | 'medium' | 'hard'
  hidden: 'LOOK UNDER THE TREE',
  seed: 42,
});

console.log(puzzle.grid.map(row => row.join(' ')).join('\n'));
console.log('Placed words:', puzzle.placed.map(p => p.display));
```

## Features

- **Deterministic (`seed`)**: Identical word lists and seeds rebuild the exact same `N×N` grid on any device without storing state on a server.
- **3 Difficulty Tiers**:
  - `easy`: Forward across (`→`) and down (`↓`) only — ideal for kids and large-print puzzles.
  - `medium`: Adds forward diagonals (`↘`, `↗`).
  - `hard`: All 8 compass directions including backwards words.
- **Hidden Secret Message**: Distributes a secret phrase across unused squares in reading order before filling remaining cells.
- **Selection Matcher**: `matchSelection(puzzle, startCell, endCell)` validates interactive drag/tap coordinates in both forward and reverse order.

## Run Tests

```bash
npm test
```

## License

MIT
