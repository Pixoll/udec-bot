export class Collection<K, V> extends Map<K, V> {
    public constructor(iterable?: Iterable<readonly [K, V] | [K, V]> | null) {
        super(iterable);
    }

    public find<V2 extends V>(fn: (value: V, key: K, collection: this) => value is V2): V2 | undefined;
    public find(fn: (value: V, key: K, collection: this) => unknown): V | undefined;
    public find<This, V2 extends V>(
        fn: (this: This, value: V, key: K, collection: this) => value is V2,
        thisArg: This,
    ): V2 | undefined;
    public find<This>(fn: (this: This, value: V, key: K, collection: this) => unknown, thisArg: This): V | undefined;
    public find(fn: (value: V, key: K, collection: this) => unknown, thisArg?: unknown): V | undefined {
        if (typeof fn !== 'function') throw new TypeError(`${fn} is not a function`);
        if (thisArg !== undefined) fn = fn.bind(thisArg);
        for (const [key, val] of this) {
            if (fn(val, key, this)) return val;
        }
        return undefined;
    }
}
