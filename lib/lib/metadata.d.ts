import { Octets } from './octets';
import { Marshal } from './marshal';
declare type NumberTypes = 'BigInt' | 'Long' | 'Int' | 'Short' | 'Byte' | 'Float' | 'Double';
declare type ReturnAnnotation = (target: any, name: string) => void;
declare type AllowedEncoding = 'utf8' | 'utf16le';
interface MarshalConfigInterface {
    /**
     * Represents the marshal operations for simple types such as numbers,
     * set `unsigned` to true to use unsigned types
     */
    (configuration: {
        type: NumberTypes;
        unsigned?: boolean;
    }): ReturnAnnotation;
    /**
     * Represents the marshal operations for a list of simple types such as an Array of numbers,
     * set `unsigned` to true to use unsigned types, if `compact` is set to true, the marshal will
     * get the length of the array from an (un)compacted int from the given stream, otherwise the length
     * will be read/write from the stream as a normal int type, unless an explicity `length` is set
     */
    (configuration: {
        type: [NumberTypes];
        unsigned?: boolean;
        compact?: boolean;
        length?: number;
    }): ReturnAnnotation;
    /**
     * Represents the marshal operations for boolean type
     */
    (configuration: {
        type: 'Bool';
    }): ReturnAnnotation;
    /**
     * Represents the marshal operations for an enum
     */
    (configuration: {
        type: 'enum';
        enum: () => Record<any, any>;
    }): ReturnAnnotation;
    /**
     * Represents the marshal operations for a String type, if a `length` is set, the marshal will
     * read/write the length of the string from the stream as a normal Int, if `compact` is set to true
     * and `length` is not set, the length of the string will be read/written from an (un)compacted int
     */
    (configuration: {
        type: 'String';
        compact?: boolean;
        length?: number;
        encoding?: AllowedEncoding;
    }): ReturnAnnotation;
    /**
     * Represents the marshal operations for an Array of strings, if `compact` is set to true, the marshal will
     * get the length of the array from an (un)compacted int from the given stream, otherwise the length
     * will be read/write from the stream as a normal int type, unless an explicity `length` is defined, if the strings
     * have a fixed value, set `strLength` to the length of the strings to be read/written
     */
    (configuration: {
        type: ['String'];
        compact?: boolean;
        length?: number;
        strLength?: number;
        encoding?: AllowedEncoding;
    }): ReturnAnnotation;
    /**
     * Represents the marshal operations for a Buffer type, if a `length` is set
     */
    (configuration: {
        type: () => new () => Marshal | Octets;
    }): ReturnAnnotation;
    /**
     * Represents the marshal operations for a list of Buffer types,
     */
    (configuration: {
        type: () => (new () => Marshal | Octets)[];
        compact?: boolean;
        length?: number;
    }): ReturnAnnotation;
}
export interface PropConfiguration {
    constructor: new () => any;
    target: any;
    name: string;
    type: string;
    isMarshal: boolean;
    isOctets: boolean;
    isUnsigned: boolean;
    isArray: boolean;
    length?: number;
    strLength?: number;
    compact?: boolean;
    enum?: () => Record<string, number>;
    encoding?: AllowedEncoding;
    isTypeResolved?: boolean;
    resolveType?: () => void;
}
export declare const marshal: MarshalConfigInterface;
export {};
