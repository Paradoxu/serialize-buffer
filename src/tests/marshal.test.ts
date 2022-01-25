import { marshal, Marshal, OctetsStream } from '../index';

class Person extends Marshal {
    @marshal({ type: 'String', encoding: 'utf8' })
    name: string;

    @marshal({ type: 'Int' })
    age: number;
}

test('Marshal Person', () => {
    const person = new Person();
    person.name = 'John'; // 4 bytes for 'John' + 4 bytes (int) for length
    person.age = 30; // 4 bytes

    const octetsStream = new OctetsStream();
    person.marshal(octetsStream);

    expect(octetsStream.size()).toBe(12);
});

test('Unmarshal Person', () => {
    const person = new Person();
    const octetsStream = new OctetsStream(Buffer.from([0, 0, 0, 3, 0x4c, 0x65, 0x6f, 0, 0, 0, 24]));
    person.unmarshal(octetsStream);

    expect(person.name).toBe('Leo');
    expect(person.age).toBe(24);
});