"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Marshal = void 0;
class Marshal {
    constructor() {
        const fields = this.getFields();
        for (const field of fields) {
            if (!field.isTypeResolved && field.resolveType)
                field.resolveType();
        }
    }
    getFields() {
        let target = Object.getPrototypeOf(this);
        let fields = [];
        while (target !== Object.prototype) {
            const childFields = Reflect.getOwnMetadata('properties', target) || [];
            fields = [...childFields.values(), ...fields];
            target = Object.getPrototypeOf(target);
        }
        return fields;
    }
    marshal(os) {
        const fields = this.getFields();
        for (const field of fields) {
            try {
                if (field.isArray) {
                    const length = field.length ?? this[field.name].length;
                    // Length isn't fixed so we should write it to the stream
                    if (field.length == null) {
                        const arrLength = this[field.name].length;
                        field.compact ? os.compactUint32(arrLength) : os.marshalInt(arrLength);
                    }
                    if (field.isMarshal) {
                        for (let i = 0; i < length; i++) {
                            os.marshal(this[field.name][i]);
                        }
                    }
                    else {
                        for (let i = 0; i < length; i++)
                            os[`marshal${field.type}`](this[field.name][i]);
                    }
                }
                else if (field.isMarshal) {
                    os.marshal(this[field.name]);
                }
                else if (field.isOctets) {
                    os.marshalOctets(this[field.name]);
                }
                else if (field.enum != null) {
                    const enumValues = typeof field.enum === 'function' ? field.enum() : {};
                    if (typeof this[field.name] === 'string')
                        os.marshalInt(enumValues[this[field.name]]);
                    else
                        os.marshalInt(this[field.name]);
                }
                else if (field.type === 'String') {
                    // String is not fixed length, so we need to marshal the length into the stream
                    if (field.length == null) {
                        const byteLength = field.encoding === 'utf16le' ? 2 : 1;
                        const strLen = this[field.name].length * byteLength;
                        field.compact ? os.compactUint32(strLen) : os.marshalInt(strLen);
                    }
                    os.marshalString(this[field.name], field.encoding);
                }
                else {
                    switch (field.type) {
                        case 'Int':
                            os.marshalInt(this[field.name]);
                            break;
                        case 'Uint':
                            os.marshalUint(this[field.name]);
                            break;
                        case 'Float':
                            os.marshalFloat(this[field.name]);
                            break;
                        case 'Ufloat':
                            os.marshalUfloat(this[field.name]);
                            break;
                        case 'Long':
                            os.marshalLong(this[field.name]);
                            break;
                        case 'Byte':
                            os.marshalByte(this[field.name]);
                            break;
                        case 'Ubyte':
                            os.marshalUbyte(this[field.name]);
                            break;
                        case 'Short':
                            os.marshalShort(this[field.name]);
                            break;
                        case 'Ushort':
                            os.marshalUshort(this[field.name]);
                            break;
                        case 'Double':
                            os.marshalDouble(this[field.name]);
                            break;
                        case 'Udouble':
                            os.marshalUdouble(this[field.name]);
                            break;
                        case 'Bool':
                            os.marshalByte(this[field.name] ? 1 : 0);
                            break;
                        default:
                            throw new Error(`unmarshal is not defined for type: ${field.type}`);
                    }
                }
            }
            catch (e) {
                throw e;
            }
        }
        return os;
    }
    unmarshal(os) {
        const fields = this.getFields();
        for (const field of fields) {
            if (field.isArray) {
                const length = field.length ?? (field.compact ? os.uncompactUint32() : os.unmarshalUint());
                this[field.name] = new Array(length);
                if (field.isMarshal) {
                    for (let i = 0; i < length; i++) {
                        this[field.name][i] = new field.constructor();
                        this[field.name][i].unmarshal(os);
                    }
                }
                else {
                    for (let i = 0; i < length; i++) {
                        if (field.type === 'String') {
                            const byteLength = field.encoding === 'utf16le' ? 2 : 1;
                            const strLength = field.strLength ?? os.unmarshalUint() * byteLength;
                            this[field.name][i] = os.unmarshalString(strLength, field.encoding);
                        }
                        else {
                            this[field.name][i] = os[`unmarshal${field.type}`]();
                        }
                    }
                }
            }
            else if (field.isMarshal) {
                this[field.name] = new field.constructor();
                this[field.name].unmarshal(os);
            }
            else if (field.isOctets) {
                this[field.name] = new field.constructor();
                os.unmarshalOctets(this[field.name]);
            }
            else if (field.enum != null) {
                const enumIndex = os.unmarshalInt();
                const enumValues = typeof field.enum === 'function' ? field.enum() : {};
                if (enumValues[enumIndex] == null)
                    throw new Error(`Invalid enum index: ${enumIndex} for the field ${field.name}`);
                this[field.name] = enumValues[enumIndex];
            }
            else if (field.type === 'String') {
                const byteLength = field.encoding === 'utf16le' ? 2 : 1;
                const length = field.length ?? (field.compact ? os.uncompactUint32() : os.unmarshalUint()) * byteLength;
                this[field.name] = os.unmarshalString(length, field.encoding);
            }
            else {
                switch (field.type) {
                    case 'Int':
                        this[field.name] = os.unmarshalInt();
                        break;
                    case 'Uint':
                        this[field.name] = os.unmarshalUint();
                        break;
                    case 'Float':
                        this[field.name] = os.unmarshalFloat();
                        break;
                    case 'Ufloat':
                        this[field.name] = os.unmarshalUfloat();
                        break;
                    case 'Long':
                        this[field.name] = os.unmarshalLong();
                        break;
                    case 'Byte':
                        this[field.name] = os.unmarshalByte();
                        break;
                    case 'Ubyte':
                        this[field.name] = os.unmarshalUbyte();
                        break;
                    case 'Short':
                        this[field.name] = os.unmarshalShort();
                        break;
                    case 'Ushort':
                        this[field.name] = os.unmarshalUshort();
                        break;
                    case 'Double':
                        this[field.name] = os.unmarshalDouble();
                        break;
                    case 'Udouble':
                        this[field.name] = os.unmarshalUdouble();
                        break;
                    case 'Bool':
                        this[field.name] = os.unmarshalByte() === 1;
                        break;
                    default:
                        throw new Error(`unmarshal is not defined for type: ${field.type}`);
                }
            }
        }
        return os;
    }
    /**
     * A function that calculates the size of the properties
     */
    get sizeOf() {
        const fields = this.getFields();
        let sum = 0;
        for (const field of fields) {
            if (field.isArray) {
                if (field.isMarshal) {
                    for (const f of this[field.name]) {
                        sum += f.sizeOf;
                    }
                }
                else {
                    for (const f of this[field.name])
                        sum += this.getSizeOfBasicField(field);
                }
            }
            else if (field.isMarshal) {
                sum += this[field.name].sizeOf;
            }
            else {
                sum += this.getSizeOfBasicField(field);
            }
        }
        return sum;
    }
    getSizeOfBasicField(field) {
        const type = field.isArray ? field.type[0] : field.type;
        switch (type.toLowerCase()) {
            case 'int':
            case 'uint':
            case 'float':
            case 'ufloat':
            case 'enum':
                return 4;
            case 'long':
            case 'ulong':
                return 8;
            case 'byte':
                return 1;
            case 'string':
                return (field.length ?? this[field.name]?.length ?? 0) * 2;
            default:
                return 0;
        }
    }
}
exports.Marshal = Marshal;
