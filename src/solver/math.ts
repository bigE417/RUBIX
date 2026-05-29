const fact = [1, 1, 2, 6, 24, 120, 720, 5040, 40320];

export const binom: number[][] = (() => {
  const b: number[][] = Array.from({ length: 13 }, () => new Array(13).fill(0));
  for (let i = 0; i <= 12; i++) {
    b[i][0] = b[i][i] = 1;
    for (let j = 1; j < i; j++) b[i][j] = b[i - 1][j - 1] + b[i - 1][j];
  }
  return b;
})();

export function permToIndex(perm: readonly number[]): number {
  let idx = 0;
  const n = perm.length;
  for (let i = 0; i < n; i++) {
    let smaller = 0;
    for (let j = i + 1; j < n; j++) if (perm[j] < perm[i]) smaller++;
    idx += smaller * fact[n - 1 - i];
  }
  return idx;
}

export function indexToPerm(idx: number, n: number, out: number[]): void {
  out.length = n;
  const used = new Array(n).fill(false);
  for (let i = 0; i < n; i++) {
    const f = fact[n - 1 - i];
    const p = Math.floor(idx / f);
    idx %= f;
    let cnt = 0;
    for (let k = 0; k < n; k++) {
      if (!used[k]) {
        if (cnt === p) {
          out[i] = k;
          used[k] = true;
          break;
        }
        cnt++;
      }
    }
  }
}

export function combRank12_4(pos: readonly number[]): number {
  let r = 0;
  const k = 4;
  for (let i = 0; i < k; i++) {
    const c = pos[i];
    for (let v = i === 0 ? 0 : pos[i - 1] + 1; v < c; v++) {
      const n = 11 - v;
      const m = 3 - i;
      if (m >= 0 && m <= n) r += binom[n][m];
    }
  }
  return r;
}

export function combUnrank12_4(rank: number, pos: number[]): void {
  const k = 4;
  const n = 12;
  for (let i = 0; i < k; i++) {
    for (let v = i === 0 ? 0 : pos[i - 1] + 1; v < n; v++) {
      const m = k - 1 - i;
      const remaining = n - 1 - v;
      const cnt = binom[remaining][m];
      if (rank < cnt) {
        pos[i] = v;
        break;
      }
      rank -= cnt;
    }
  }
}
