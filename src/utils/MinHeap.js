/**
 * Typed-array min-heap used by the priority-flood depression filler.
 * Each entry is (key: Float32, value: Int32).
 */
export class MinHeap {
  constructor(capacity) {
    this.capacity = capacity;
    this.size = 0;
    this.keys   = new Float32Array(capacity);
    this.values = new Int32Array(capacity);
  }

  push(key, value) {
    if (this.size >= this.capacity) return false;
    const i = this.size++;
    this.keys[i] = key;
    this.values[i] = value;
    this._siftUp(i);
    return true;
  }

  pop() {
    if (this.size === 0) return null;
    const key = this.keys[0];
    const value = this.values[0];
    this.size--;
    if (this.size > 0) {
      this.keys[0] = this.keys[this.size];
      this.values[0] = this.values[this.size];
      this._siftDown(0);
    }
    return { key, value };
  }

  _siftUp(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.keys[p] <= this.keys[i]) break;
      this._swap(i, p);
      i = p;
    }
  }

  _siftDown(i) {
    const n = this.size;
    for (;;) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let m = i;
      if (l < n && this.keys[l] < this.keys[m]) m = l;
      if (r < n && this.keys[r] < this.keys[m]) m = r;
      if (m === i) break;
      this._swap(i, m);
      i = m;
    }
  }

  _swap(a, b) {
    const tk = this.keys[a];   this.keys[a]   = this.keys[b];   this.keys[b]   = tk;
    const tv = this.values[a]; this.values[a] = this.values[b]; this.values[b] = tv;
  }
}