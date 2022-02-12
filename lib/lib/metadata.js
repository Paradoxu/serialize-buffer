"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marshal = void 0;
const octets_1 = require("./octets");
const marshal_1 = require("./marshal");
function resolveType(type, target, name, configuration) {
    const properties = Reflect.getOwnMetadata('properties', target) || new Map();
    const isArray = Array.isArray(type);
    type = isArray ? type[0] : type;
    const isMarshal = marshal_1.Marshal.isPrototypeOf(target) || marshal_1.Marshal.isPrototypeOf(type);
    const isOctets = octets_1.Octets.isPrototypeOf(target) || octets_1.Octets.isPrototypeOf(type) || type?.prototype?.constructor?.name === 'Octets';
    const objectTypeName = typeof type === 'string' ? type : type?.name;
    let typeName = objectTypeName.toLowerCase().replace('bigint', 'Long');
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
    });
    Reflect.defineMetadata('properties', properties, target);
}
const marshal = (configuration) => {
    return (target, name) => {
        const properties = Reflect.getOwnMetadata('properties', target) || new Map();
        if (typeof configuration?.type === 'function') {
            properties.set(name, {
                target,
                name,
                isTypeResolved: false,
                resolveType: () => resolveType(configuration.type(), target, name, configuration),
            });
            Reflect.defineMetadata('properties', properties, target);
        }
        else {
            const type = configuration?.type || Reflect.getMetadata("design:type", target, name);
            resolveType(type, target, name, configuration);
        }
    };
};
exports.marshal = marshal;
