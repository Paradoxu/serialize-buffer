import { Octets } from "./octets";
import { numberUtils } from "./number_utils";
import { Marshal } from "./marshal";

export class OctetsStream extends Octets {
    private static MAXSPARE = 16384;
    // Setting it to true, will make the stream big endian
    public isLittleEndian = false;
    private pos = 0;
    private tranpos = 0;


    constructor(data?: number | Octets | Buffer) {
        super(data);
    }

    public static wrap(paramOctets: Octets): OctetsStream {
        const octetsStream = new OctetsStream();
        octetsStream.swap(paramOctets);
        return octetsStream;
    }

    public clone() {
        const octetsStream = new OctetsStream(super.clone());
        octetsStream.pos = this.pos;
        octetsStream.tranpos = this.pos;
        return octetsStream;
    }

    public eos() {
        return this.pos === this.size();
    }

    public get position(): number {
        return this.pos;
    }

    public getByteSequence(nBytes: number): Uint8Array {
        const ret = new Uint8Array(nBytes);
        for (let i = 0; i < nBytes; i++) {
            ret[i] = super.getByte(this.pos++);
        }
        if (this.isLittleEndian)
            return ret.reverse();
        return ret;
    }

    marshalByte(value: number): OctetsStream {
        this.pushBack(value);
        return this;
    }

    public unmarshalByte(): number {
        if (this.pos + 1 > this.size()) {
            throw new Error(`OctetsStream: out of range`);
        }

        return this.getByte(this.pos++) >>> 0;
    }
    
    marshalUbyte(value: number): OctetsStream {
        this.marshalByte(value >>> 0);
        return this;
    }

    public unmarshalUbyte(): number {
        return this.unmarshalByte() >>> 0;
    }

    marshalBool(value: boolean): OctetsStream {
        this.marshalByte(value ? 1 : 0);
        return this;
    }

    public unmarshalBool(): boolean {
        return this.unmarshalByte() !== 0;
    }

    marshalInt(value: number): OctetsStream {
        return this.marshalByte((value >> 24) & 0xFF)
            .marshalByte((value >> 16) & 0xFF)
            .marshalByte((value >> 8) & 0xFF)
            .marshalByte(value & 0xFF);
    }

    public unmarshalInt(): number {
        if (this.pos + 4 > this.size()) {
            throw new Error(`[MarshalException] pos:${this.pos} size:${this.size()}`);
        }

        const [b1, b2, b3, b4] = this.getByteSequence(4);
        const value = (b1 & 0xFF) << 24 | (b2 & 0xFF) << 16 | (b3 & 0xFF) << 8 | (b4 & 0xFF) << 0;
        return value;
    }

    marshalUint(value: number): OctetsStream {
        return this.marshalInt(value >>> 0);
    }

    public unmarshalUint(): number {
        const value = this.unmarshalInt();
        return value >>> 0;
    }

    marshalShort(value: number): OctetsStream {
        return this.marshalByte(value >> 8).marshalByte(value & 0xFF);
    }

    public unmarshalShort(): number {
        if (this.pos + 2 > this.size()) {
            throw new Error("MarshalException");
        }

        const [b1, b2] = this.getByteSequence(2);
        return b1 << 8 | b2 & 0xFF;
    }

    public unmarshalUshort(): number {
        return this.unmarshalShort() >>> 0;
    }

    public marshalUshort(value: number): OctetsStream {
        return this.marshalShort(value >>> 0);
    }

    marshalLong(value: BigInt): OctetsStream {
        return this.marshalByte(Number((value.valueOf() >> BigInt(56)) & BigInt(0xFF)))
            .marshalByte(Number((value.valueOf() >> BigInt(48)) & BigInt(0xFF)))
            .marshalByte(Number((value.valueOf() >> BigInt(40)) & BigInt(0xFF)))
            .marshalByte(Number((value.valueOf() >> BigInt(32)) & BigInt(0xFF)))
            .marshalByte(Number((value.valueOf() >> BigInt(24)) & BigInt(0xFF)))
            .marshalByte(Number((value.valueOf() >> BigInt(16)) & BigInt(0xFF)))
            .marshalByte(Number((value.valueOf() >> BigInt(8)) & BigInt(0xFF)))
            .marshalByte(Number(value.valueOf() & BigInt(0xFF)));
    }

    public unmarshalLong(): BigInt {
        if (this.pos + 8 > this.size())
            throw new Error("MarshalException");

        const [i1, i2, i3, i4, i5, i6, i7, i8] = this.getByteSequence(8);
        const last8bits = 0xFFn;

        return BigInt(
            (BigInt(i1) & last8bits) << 56n |
            (BigInt(i2) & last8bits) << 48n |
            (BigInt(i3) & last8bits) << 40n |
            (BigInt(i4) & last8bits) << 32n |
            (BigInt(i5) & last8bits) << 24n |
            (BigInt(i6) & last8bits) << 16n |
            (BigInt(i7) & last8bits) << 8n |
            (BigInt(i8) & last8bits) << 0n
        );
    }

    marshalDouble(value: number): OctetsStream {
        return this.marshalLong(numberUtils.doubleToBigInt(value))
    }

    public unmarshalDouble(): number {
        return numberUtils.bigIntToDouble(this.unmarshalLong().valueOf());
    }

    marshalUdouble(value: number): OctetsStream {
        return this.marshalDouble(value >>> 0)
    }

    public unmarshalUdouble(): number {
        return this.unmarshalDouble() >>> 0;
    }

    public marshalFloat(value: number): OctetsStream {
        return this.marshalInt(numberUtils.floatToIntBits(value));
    }

    public unmarshalFloat(): number {
        return numberUtils.intBitsToFloat(this.unmarshalInt());
    }

    public marshalUfloat(value: number): OctetsStream {
        return this.marshalInt(numberUtils.floatToIntBits(value >> 0));
    }

    public unmarshalUfloat(): number {
        return numberUtils.intBitsToFloat(this.unmarshalInt() >> 0);
    }

    public marshalString(value: string, encoding?: 'utf8' | 'utf16le'): OctetsStream {
        const buffer = Buffer.from(value, encoding ?? Octets.getCharset());
        for (const byte of buffer)
            this.marshalByte(byte);
        return this;
    }

    marshalOctets(octets: Octets): OctetsStream {
        this.compactUint32(octets.size());
        this.insert(this.size(), octets);
        return this;
    }

    marshal(stream: Marshal): OctetsStream {
        return stream.marshal(this);
    }

    public compactUint32(value: number): OctetsStream {
        if (value < 64)
            return this.marshalByte(value);
        if (value < 16384)
            return this.marshalShort(value | 0x8000);
        if (value < 536870912)
            return this.marshalInt(value | 0xC0000000);

        this.marshalByte(-32);
        return this.marshalInt(value);
    }

    public compactSint32(value: number): OctetsStream {
        if ((value >= 0)) {
            if (value < 64) return this.marshalByte(value);
            if (value < 8192) return this.marshalShort(value | 0x8000);
            if (value < 268435456) return this.marshalInt(value | 3221225472);

            this.marshalByte(-32);
            return this.marshalInt(value);
        }

        if (-value > 0) {
            value = -value;
            if (value < 64) return this.marshalByte(value | 0x40);
            if (value < 8192) return this.marshalShort(value | 0xA000);
            if (value < 268435456) return this.marshalInt(value | 0xD0000000);

            this.marshalByte(-16);
            return this.marshalInt(value);
        }

        this.marshalByte(-16);
        return this.marshalInt(value);
    }

    public beginTransaction(): OctetsStream {
        this.tranpos = this.pos;
        return this;
    }

    public rollback(): OctetsStream {
        this.pos = this.tranpos;
        return this;
    }

    public commit(): OctetsStream {
        if ((this.pos >= 16384)) {
            this.erase(0, this.pos);
            this.pos = 0;
        }
        return this;
    }

    public setPosition(pos: number): OctetsStream {
        if (isNaN(pos))
            throw new Error("Invalid position");
        this.pos = pos;
        return this;
    }


    public unmarshalString(length?: number, encoing?: 'utf8' | 'utf16le'): string {
        const strLength = (length ?? this.unmarshalInt());
        if (this.pos + strLength > this.size())
            throw new Error("MarshalException - End of stream");

        if (strLength === 0) return "";
        const buffer = Buffer.alloc(strLength);
        for (let i = 0; i < strLength; i++)
            buffer[i] = this.getByte(this.pos++);

        return buffer.toString(encoing ?? Octets.getCharset()).replace(/\0/g, "");
    }

    public uncompactUint32(): number {
        if (this.pos >= this.size()) {
            throw new Error("MarshalException");
        }

        switch (this.getByte(this.pos) & 224) {
            case 224:
                this.unmarshalByte();
                return this.unmarshalInt();
            case 192:
                return (this.unmarshalInt() & 0x3FFFFFFF);
            case 128:
            case 160:
                return (this.unmarshalShort() & 0x7FFF);
        }

        return this.unmarshalByte();
    }

    public uncompactSint32(): number {
        if (this.pos === this.size()) {
            throw new Error("MarshalException");
        }

        switch (this.getByte(this.pos) & 240) {
            case 240:
                this.unmarshalByte();
                return -this.unmarshalInt();
            case 224:
                this.unmarshalByte();
                return this.unmarshalInt();
            case 208:
                return -(this.unmarshalInt() & 0x2FFFFFFF);
            case 192:
                return (this.unmarshalInt() & 0x3FFFFFFF);
            case 160:
            case 176:
                return -(this.unmarshalShort() & 0x5FFF);
            case 128:
            case 144:
                return (this.unmarshalShort() & 0x7FFF);
            case 64:
            case 80:
            case 96:
            case 112:
                return -(this.unmarshalByte() & 0xFFFFFFBF);
        }

        return this.unmarshalByte();
    }

    public unmarshalOctets(octets?: Octets): Octets {
        const octLength = this.uncompactUint32();
        if (this.pos + octLength > this.size()) {
            throw new Error("MarshalException");
        }

        if (octets == null) {
            const newOctets = new Octets(this, this.pos, octLength);
            this.pos = (this.pos + octLength);
            return newOctets;
        } else {
            octets.replace(this, this.pos, octLength);
            this.pos += octLength;
            return this;
        }
    }

    public append(octets: Octets | Buffer): OctetsStream {
        this.insert(this.size(), octets);
        return this;
    }
}