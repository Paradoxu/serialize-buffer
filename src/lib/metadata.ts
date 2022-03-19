import { Octets } from './octets';
import { Marshal } from './marshal';

type NumberTypes = 'BigInt' | 'Long' | 'Int' | 'Short' | 'Byte' | 'Float' | 'Double';
type MarshalType = () => new () => Marshal | [new () => Marshal];
type OctetsType = () => new () => Octets | [new () => Octets];
type AllowedTypes = NumberTypes | [NumberTypes] | MarshalType | OctetsType | 'String' | ['String'];

type ReturnAnnotation = (target: any, name: string) => void;
type AllowedEncoding = 'utf8' | 'utf16le';

interface MarshalConfigInterface {
  /**
   * Represents the marshal operations for simple types such as numbers,
   * set `unsigned` to true to use unsigned types
   */
  (configuration: { type: NumberTypes; unsigned?: boolean }): ReturnAnnotation;

  /**
   * Represents the marshal operations for a list of simple types such as an Array of numbers,
   * set `unsigned` to true to use unsigned types, if `compact` is set to true, the marshal will
   * get the length of the array from an (un)compacted int from the given stream, otherwise the length
   * will be read/write from the stream as a normal int type, unless an explicity `length` is set
   */
  (configuration: { type: [NumberTypes]; unsigned?: boolean; compact?: boolean; length?: number }): ReturnAnnotation;

  /**
   * Represents the marshal operations for boolean type
   */
  (configuration: { type: 'Bool' }): ReturnAnnotation;

  /**
   * Represents the marshal operations for an enum
   */
  (configuration: { type: 'enum'; enum: () => Record<any, any> }): ReturnAnnotation;

  /**
   * Represents the marshal operations for a String type, if a `length` is set, the marshal will
   * read/write the length of the string from the stream as a normal Int, if `compact` is set to true
   * and `length` is not set, the length of the string will be read/written from an (un)compacted int
   */
  (configuration: { type: 'String'; compact?: boolean; length?: number; encoding?: AllowedEncoding }): ReturnAnnotation;

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
  // (configuration: { type: ['String'], compact?: boolean, length?: number, encoding?: AllowedEncoding }): ReturnAnnotation;

  /**
   * Represents the marshal operations for a Buffer type, if a `length` is set
   */
  (configuration: { type: () => new () => Marshal | Octets }): ReturnAnnotation;

  /**
   * Represents the marshal operations for a list of Buffer types,
   */
  (configuration: { type: () => (new () => Marshal | Octets)[]; compact?: boolean; length?: number }): ReturnAnnotation;
}

interface MarshalConfiguration {
  type: AllowedTypes;
  length?: number;
  compact?: boolean;
  isList?: boolean;
  unsigned?: boolean;
  enum?: () => Record<any, any>;
  encoding?: AllowedEncoding;
  strLength?: number;
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

function resolveType(type: any, target: any, name: string, configuration?: Partial<MarshalConfiguration>) {
  const properties: Map<string, PropConfiguration> =
    Reflect.getOwnMetadata('properties', target) || new Map<string, PropConfiguration>();
  const isArray = Array.isArray(type);
  type = isArray ? type[0] : type;

  const isMarshal = Marshal.isPrototypeOf(target) || Marshal.isPrototypeOf(type);
  const isOctets =
    Octets.isPrototypeOf(target) || Octets.isPrototypeOf(type) || type?.prototype?.constructor?.name === 'Octets';
  const objectTypeName = typeof type === 'string' ? type : type?.name;
  let typeName: string = objectTypeName.toLowerCase().replace('bigint', 'Long');

  // If the type is a number type and unsigned
  if (['long', 'int', 'short', 'byte', 'float'].includes(typeName) && configuration?.unsigned)
    typeName = `U${typeName}`;

  properties.set(name, {
    ...configuration,
    name,
    type: `${typeName.charAt(0).toUpperCase()}${typeName.slice(1)}`,
    isMarshal,
    isOctets,
    constructor: type ?? configuration?.type,
    isArray: typeName === 'array' || isArray,
    isTypeResolved: true,
    target: undefined,
  } as any);

  Reflect.defineMetadata('properties', properties, target);
}

export const marshal: MarshalConfigInterface = (configuration: Record<string, any>) => {
  return (target: any, name: string) => {
    const properties: Map<string, PropConfiguration> =
      Reflect.getOwnMetadata('properties', target) || new Map<string, PropConfiguration>();

    if (typeof configuration?.type === 'function') {
      properties.set(name, {
        target,
        name,
        isTypeResolved: false,
        resolveType: () => resolveType(configuration.type(), target, name, configuration),
      } as any);
      Reflect.defineMetadata('properties', properties, target);
    } else {
      const type = configuration?.type || Reflect.getMetadata('design:type', target, name);
      resolveType(type, target, name, configuration);
    }
  };
};
