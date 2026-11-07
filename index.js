// Zero-dependency deterministic word search grid generator (ES module)
// Live printable demo: https://christmaswordsearch.org/generator/

// Direction vectors [rowDelta, colDelta] by difficulty tier
export const DIRS = {
  // Forward across and down only (ideal for young learners and large-print layouts)
  easy: [[0, 1], [1, 0]],
  // Adds forward diagonals (down-right and up-right)
  medium: [[0, 1], [1, 0], [1, 1], [-1, 1]],
  // All 8 compass directions including backwards placements
  hard: [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]],
};

// Xorshift32 deterministic PRNG so identical seeds reproduce identical grids
export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

// Normalize, deduplicate, and strip spaces/punctuation for grid placement
export function cleanWords(list, max = 30) {
  const out = [];
  const seen = new Set();
  for (const raw of list) {
    const word = String(raw).toUpperCase().replace(/[^A-Z]/g, '');
    if (word.length < 2 || seen.has(word)) continue;
    seen.add(word);
    out.push({ display: String(raw).trim(), word });
    if (out.length >= max) break;
  }
  return out;
}

// Build an N×N word search grid with optional leftover-cell hidden message
export function generate({ words = [], size = 15, difficulty = 'medium', hidden = '', seed = Date.now() } = {}) {
  const r = rng(seed);
  const dirs = DIRS[difficulty] || DIRS.medium;
  const items = cleanWords(words)
    .filter(x => x.word.length <= size)
    .sort((a, b) => b.word.length - a.word.length);

  let best = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    const grid = Array.from({ length: size }, () => Array(size).fill(''));
    const placed = [];
    const skipped = [];

    for (const item of items) {
      let ok = false;
      for (let t = 0; t < 300 && !ok; t++) {
        const [dr, dc] = dirs[Math.floor(r() * dirs.length)];
        const row = Math.floor(r() * size);
        const col = Math.floor(r() * size);
        const er = row + dr * (item.word.length - 1);
        const ec = col + dc * (item.word.length - 1);
        if (er < 0 || er >= size || ec < 0 || ec >= size) continue;

        let fit = true;
        for (let i = 0; i < item.word.length; i++) {
          const ch = grid[row + dr * i][col + dc * i];
          if (ch && ch !== item.word[i]) { fit = false; break; }
        }
        if (!fit) continue;

        const cells = [];
        for (let i = 0; i < item.word.length; i++) {
          grid[row + dr * i][col + dc * i] = item.word[i];
          cells.push([row + dr * i, col + dc * i]);
        }
        placed.push({ ...item, cells });
        ok = true;
      }
      if (!ok) skipped.push(item);
    }

    const res = { grid, placed, skipped };
    if (!best || skipped.length < best.skipped.length) best = res;
    if (!skipped.length) break;
  }

  // Inject optional hidden message across unused cells in reading order, then fill remaining cells
  const { grid } = best;
  const msg = String(hidden).toUpperCase().replace(/[^A-Z]/g, '');
  const empties = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!grid[i][j]) empties.push([i, j]);
    }
  }

  let hiddenPlaced = '';
  if (msg && msg.length <= empties.length) {
    const step = Math.max(1, Math.floor(empties.length / msg.length));
    const hiddenCells = new Set();
    for (let k = 0; k < msg.length; k++) {
      const [i, j] = empties[k * step];
      grid[i][j] = msg[k];
      hiddenCells.add(`${i},${j}`);
    }
    hiddenPlaced = msg;
    best.hiddenCells = [...hiddenCells];
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const [i, j] of empties) {
    if (!grid[i][j]) grid[i][j] = alphabet[Math.floor(r() * 26)];
  }

  return { ...best, size, difficulty, hidden: hiddenPlaced, hiddenCells: best.hiddenCells || [] };
}

// Validate a drag/tap selection from [r1, c1] to [r2, c2] against placed words
export function matchSelection(puzzle, [r1, c1], [r2, c2]) {
  const len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1)) + 1;
  if (!(r1 === r2 || c1 === c2 || Math.abs(r2 - r1) === Math.abs(c2 - c1))) return null;
  for (const p of puzzle.placed) {
    if (p.cells.length !== len) continue;
    const a = p.cells[0];
    const b = p.cells[p.cells.length - 1];
    if ((a[0] === r1 && a[1] === c1 && b[0] === r2 && b[1] === c2) ||
        (a[0] === r2 && a[1] === c2 && b[0] === r1 && b[1] === c1)) {
      return p;
    }
  }
  return null;
}
