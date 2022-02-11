"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OctetsStream = void 0;
const octets_1 = require("./octets");
const number_utils_1 = require("./number_utils");
class OctetsStream extends octets_1.Octets {
    constructor(data) {
        super(data);
        // Setting it to true, will make the stream big endian
        this.isLittleEndian = false;
        this.pos = 0;
        this.tranpos = 0;
    }
    static wrap(paramOctets) {
        let octetsStream = new OctetsStream();
        octetsStream.swap(paramOctets);
        return octetsStream;
    }
    clone() {
        const octetsStream = new OctetsStream(super.clone());
        octetsStream.pos = this.pos;
        octetsStream.tranpos = this.pos;
        return octetsStream;
    }
    eos() {
        return this.pos == this.size();
    }
    get position() {
        return this.pos;
    }
    getByteSequence(nBytes) {
        const ret = new Uint8Array(nBytes);
        for (let i = 0; i < nBytes; i++) {
            ret[i] = super.getByte(this.pos++);
        }
        if (this.isLittleEndian)
            return ret.reverse();
        return ret;
    }
    marshalByte(value) {
        this.pushBack(value);
        return this;
    }
    unmarshalByte() {
        if (this.pos + 1 > this.size()) {
            throw new Error(`OctetsStream: out of range`);
        }
        return this.getByte(this.pos++) >>> 0;
    }
    marshalUbyte(value) {
        this.marshalByte(value >>> 0);
        return this;
    }
    unmarshalUbyte() {
        return this.unmarshalByte() >>> 0;
    }
    marshalBool(value) {
        this.marshalByte(value ? 1 : 0);
        return this;
    }
    unmarshalBool() {
        return this.unmarshalByte() !== 0;
    }
    marshalInt(value) {
        return this.marshalByte((value >> 24) & 0xFF)
            .marshalByte((value >> 16) & 0xFF)
            .marshalByte((value >> 8) & 0xFF)
            .marshalByte(value & 0xFF);
    }
    unmarshalInt() {
        if (this.pos + 4 > this.size()) {
            throw new Error(`[MarshalException] pos:${this.pos} size:${this.size()}`);
        }
        const [b1, b2, b3, b4] = this.getByteSequence(4);
        const value = (b1 & 0xFF) << 24 | (b2 & 0xFF) << 16 | (b3 & 0xFF) << 8 | (b4 & 0xFF) << 0;
        return value;
    }
    marshalUint(value) {
        return this.marshalInt(value >>> 0);
    }
    unmarshalUint() {
        const value = this.unmarshalInt();
        return value >>> 0;
    }
    marshalShort(value) {
        return this.marshalByte(value >> 8).marshalByte(value & 0xFF);
    }
    unmarshalShort() {
        if (this.pos + 2 > this.size()) {
            throw new Error("MarshalException");
        }
        const [b1, b2] = this.getByteSequence(2);
        return b1 << 8 | b2 & 0xFF;
    }
    unmarshalUshort() {
        return this.unmarshalShort() >>> 0;
    }
    marshalUshort(value) {
        return this.marshalShort(value >>> 0);
    }
    marshalLong(value) {
        return this.marshalByte(Number((value.valueOf() >> BigInt(56)) & BigInt(0xFF)))
            .marshalByte(Number((value.valueOf() >> BigInt(48)) & BigInt(0xFF)))
            .marshalByte(Number((value.valueOf() >> BigInt(40)) & BigInt(0xFF)))
            .marshalByte(Number((value.valueOf() >> BigInt(32)) & BigInt(0xFF)))
            .marshalByte(Number((value.valueOf() >> BigInt(24)) & BigInt(0xFF)))
            .marshalByte(Number((value.valueOf() >> BigInt(16)) & BigInt(0xFF)))
            .marshalByte(Number((value.valueOf() >> BigInt(8)) & BigInt(0xFF)))
            .marshalByte(Number(value.valueOf() & BigInt(0xFF)));
    }
    unmarshalLong() {
        if (this.pos + 8 > this.size())
            throw new Error("MarshalException");
        const [i1, i2, i3, i4, i5, i6, i7, i8] = this.getByteSequence(8);
        const last8bits = 0xffn;
        return BigInt((BigInt(i1) & last8bits) << 56n |
            (BigInt(i2) & last8bits) << 48n |
            (BigInt(i3) & last8bits) << 40n |
            (BigInt(i4) & last8bits) << 32n |
            (BigInt(i5) & last8bits) << 24n |
            (BigInt(i6) & last8bits) << 16n |
            (BigInt(i7) & last8bits) << 8n |
            (BigInt(i8) & last8bits) << 0n);
    }
    marshalDouble(value) {
        return this.marshalLong(number_utils_1.numberUtils.doubleToBigInt(value));
    }
    unmarshalDouble() {
        return number_utils_1.numberUtils.bigIntToDouble(this.unmarshalLong().valueOf());
    }
    marshalUdouble(value) {
        return this.marshalDouble(value >>> 0);
    }
    unmarshalUdouble() {
        return this.unmarshalDouble() >>> 0;
    }
    marshalFloat(value) {
        return this.marshalInt(number_utils_1.numberUtils.floatToIntBits(value));
    }
    unmarshalFloat() {
        return number_utils_1.numberUtils.intBitsToFloat(this.unmarshalInt());
    }
    marshalUfloat(value) {
        return this.marshalInt(number_utils_1.numberUtils.floatToIntBits(value >> 0));
    }
    unmarshalUfloat() {
        return number_utils_1.numberUtils.intBitsToFloat(this.unmarshalInt() >> 0);
    }
    marshalString(value, encoding) {
        const buffer = Buffer.from(value, encoding ?? octets_1.Octets.getCharset());
        for (let i = 0; i < buffer.length; i++)
            this.marshalByte(buffer[i]);
        return this;
    }
    marshalOctets(octets) {
        this.compactUint32(octets.size());
        this.insert(this.size(), octets);
        return this;
    }
    marshal(stream) {
        return stream.marshal(this);
    }
    compactUint32(value) {
        if (value < 64)
            return this.marshalByte(value);
        if (value < 16384)
            return this.marshalShort(value | 0x8000);
        if (value < 536870912)
            return this.marshalInt(value | 0xC0000000);
        this.marshalByte(-32);
        return this.marshalInt(value);
    }
    compactSint32(value) {
        if ((value >= 0)) {
            if (value < 64)
                return this.marshalByte(value);
            if (value < 8192)
                return this.marshalShort(value | 0x8000);
            if (value < 268435456)
                return this.marshalInt(value | 3221225472);
            this.marshalByte(-32);
            return this.marshalInt(value);
        }
        if (-value > 0) {
            value = -value;
            if (value < 64)
                return this.marshalByte(value | 0x40);
            if (value < 8192)
                return this.marshalShort(value | 0xA000);
            if (value < 268435456)
                return this.marshalInt(value | 0xD0000000);
            this.marshalByte(-16);
            return this.marshalInt(value);
        }
        this.marshalByte(-16);
        return this.marshalInt(value);
    }
    beginTransaction() {
        this.tranpos = this.pos;
        return this;
    }
    rollback() {
        this.pos = this.tranpos;
        return this;
    }
    commit() {
        if ((this.pos >= 16384)) {
            this.erase(0, this.pos);
            this.pos = 0;
        }
        return this;
    }
    setPosition(pos) {
        if (isNaN(pos))
            throw new Error("Invalid position");
        this.pos = pos;
        return this;
    }
    unmarshalString(length, encoing) {
        let strLength = (length ?? this.unmarshalInt());
        if (this.pos + strLength > this.size())
            throw new Error("MarshalException - End of stream");
        if (strLength === 0)
            return "";
        const buffer = Buffer.alloc(strLength);
        for (let i = 0; i < strLength; i++)
            buffer[i] = this.getByte(this.pos++);
        return buffer.toString(encoing ?? octets_1.Octets.getCharset()).replace(/\0/g, "");
    }
    uncompactUint32() {
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
    uncompactSint32() {
        if (this.pos == this.size()) {
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
    unmarshalOctets(octets) {
        const octLength = this.uncompactUint32();
        if (this.pos + octLength > this.size()) {
            throw new Error("MarshalException");
        }
        if (octets == null) {
            let octets = new octets_1.Octets(this, this.pos, octLength);
            this.pos = (this.pos + octLength);
            return octets;
        }
        else {
            octets.replace(this, this.pos, octLength);
            this.pos += octLength;
            return this;
        }
    }
    append(octets) {
        this.insert(this.size(), octets);
        return this;
    }
}
exports.OctetsStream = OctetsStream;
OctetsStream.MAXSPARE = 16384;
