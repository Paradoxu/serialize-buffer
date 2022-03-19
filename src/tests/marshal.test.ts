import { marshal, Marshal, OctetsStream } from '../index';

class Person extends Marshal {
  @marshal({ type: 'String', encoding: 'utf8' })
  name: string;

  @marshal({ type: 'Int' })
  age: number;

  @marshal({ type: 'Bool' })
  isMarried: boolean;
}

test('Marshal Person', () => {
  const person = new Person();
  person.name = 'John'; // 4 bytes for 'John' + 4 bytes (int) for length
  person.age = 30; // 4 bytes
  person.isMarried = true; // 1 byte

  const octetsStream = new OctetsStream();
  person.marshal(octetsStream);

  expect(octetsStream.size()).toBe(13);
});

test('Unmarshal Person', () => {
  const person = new Person();
  const octetsStream = new OctetsStream(Buffer.from([0, 0, 0, 3, 0x4c, 0x65, 0x6f, 0, 0, 0, 24, 1]));
  person.unmarshal(octetsStream);

  expect(person.name).toBe('Leo');
  expect(person.age).toBe(24);
  expect(person.isMarried).toBe(true);
});
