export class LinearDataView extends DataView<ArrayBufferLike> {
    private readonly textDecoders: Map<string, TextDecoder>;
    private cursor: number;

    public constructor(buffer: ArrayBufferLike) {
        super(buffer);

        this.textDecoders = new Map();
        this.cursor = 0;
    }

    /**
     * Gets the **null-terminated** string value at the specified byte offset from the start of the view.
     * There is no alignment constraint; multi-byte values may be fetched from any offset.
     *
     * @param encoding https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/TextDecoder#label
     * @param options https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/TextDecoder#options
     */
    public getString(encoding: string = "utf-8", options?: TextDecoderOptions): string {
        encoding = encoding.toLowerCase();

        let textDecoder = this.textDecoders.get(encoding);
        if (!textDecoder) {
            textDecoder = new TextDecoder(encoding, options);
            this.textDecoders.set(encoding, textDecoder);
        }

        const bytes: number[] = [];
        let byte = this.getUint8();
        while (byte !== 0) {
            bytes.push(byte);
            byte = this.getUint8();
        }

        return textDecoder.decode(new Uint8Array(bytes));
    }

    public override getFloat32(): number {
        const data = super.getFloat32(this.cursor);
        this.cursor += 4;
        return data;
    }

    public override getFloat64(): number {
        const data = super.getFloat64(this.cursor);
        this.cursor += 8;
        return data;
    }

    public override getInt8(): number {
        return super.getInt8(this.cursor++);
    }

    public override getInt16(): number {
        const data = super.getInt16(this.cursor);
        this.cursor += 2;
        return data;
    }

    public override getInt32(): number {
        const data = super.getInt32(this.cursor);
        this.cursor += 4;
        return data;
    }

    public override getBigInt64(): bigint {
        const data = super.getBigInt64(this.cursor);
        this.cursor += 8;
        return data;
    }

    public override getUint8(): number {
        return super.getUint8(this.cursor++);
    }

    public override getUint16(): number {
        const data = super.getUint16(this.cursor);
        this.cursor += 2;
        return data;
    }

    public override getUint32(): number {
        const data = super.getUint32(this.cursor);
        this.cursor += 4;
        return data;
    }

    public override getBigUint64(): bigint {
        const data = super.getBigUint64(this.cursor);
        this.cursor += 8;
        return data;
    }
}
