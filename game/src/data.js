// Sizzle & Serve — the menu: every ingredient and every recipe the kitchen can serve.
// Original names, drawn and sounded by this game's own code; no commercial game is copied.

// One ingredient: id, label, colour, key the player presses, and how it is prepared.
export const INGREDIENTS = {
  bun:     { id: 'bun',     label: 'Bun',     key: '1', color: '#f2b25c', prep: 'instant', tip: 'Soft toasted bun' },
  patty:   { id: 'patty',   label: 'Patty',   key: '2', color: '#8a5a33', prep: 'grill',   tip: 'Grill it — pull at golden, never burnt' },
  lettuce: { id: 'lettuce', label: 'Lettuce', key: '3', color: '#7dc242', prep: 'chop',    tip: 'Chop twice for crisp ribbons' },
  tomato:  { id: 'tomato',  label: 'Tomato',  key: '4', color: '#e5484d', prep: 'chop',    tip: 'Chop twice for juicy slices' },
  cheese:  { id: 'cheese',  label: 'Cheese',  key: '5', color: '#ffc93c', prep: 'instant', tip: 'A melty slice' },
  sauce:   { id: 'sauce',   label: 'Sauce',   key: '6', color: '#ff8c42', prep: 'instant', tip: 'House secret sauce' },
};

export const INGREDIENT_ORDER = ['bun', 'patty', 'lettuce', 'tomato', 'cheese', 'sauce'];

// Recipes unlock as the shift heats up. `needs` is a multiset of ingredient ids.
export const RECIPES = [
  { name: 'Classic Burger', needs: ['bun', 'patty', 'lettuce'], minLevel: 1, base: 100 },
  { name: 'Cheese Melt',    needs: ['bun', 'patty', 'cheese', 'sauce'], minLevel: 1, base: 120 },
  { name: 'Garden Stack',   needs: ['bun', 'patty', 'lettuce', 'tomato'], minLevel: 2, base: 140 },
  { name: 'Double Trouble', needs: ['bun', 'patty', 'patty', 'cheese'], minLevel: 2, base: 170 },
  { name: 'Veggie Delight', needs: ['bun', 'lettuce', 'tomato', 'cheese', 'sauce'], minLevel: 3, base: 160 },
  { name: 'Warung Special', needs: ['bun', 'patty', 'lettuce', 'tomato', 'cheese', 'sauce'], minLevel: 3, base: 220 },
];

export function recipesForLevel(level) {
  return RECIPES.filter((r) => r.minLevel <= level);
}

// Difficulty curve: orders arrive faster and their patience shrinks as levels rise.
export function levelForServed(served) {
  return 1 + Math.floor(served / 5);
}

export function orderPatienceSeconds(level) {
  return Math.max(24, 46 - (level - 1) * 4);
}

export function spawnIntervalSeconds(level) {
  return Math.max(7, 13 - (level - 1) * 1.5);
}

export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 3;
export const GRILL_COOK_SECONDS = 5; // patty is perfect from here...
export const GRILL_BURN_SECONDS = 9; // ...and burnt from here. Pull it in between.
export const CHOPS_NEEDED = 2;
