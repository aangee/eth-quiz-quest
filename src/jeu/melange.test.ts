import { describe, it, expect } from 'vitest';
import { melanger } from './melange';

describe('melanger', () => {
  it('garde le même contenu et ne modifie pas l\'entrée', () => {
    const e = [1, 2, 3, 4, 5];
    const r = melanger(e);
    expect([...r].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(e).toEqual([1, 2, 3, 4, 5]);
  });
  it('est déterministe avec un alea fixe', () => {
    const a = melanger(['a', 'b', 'c', 'd'], () => 0);
    const b = melanger(['a', 'b', 'c', 'd'], () => 0);
    expect(a).toEqual(b);
    expect(a).toEqual(['b', 'c', 'd', 'a']);
  });
});
