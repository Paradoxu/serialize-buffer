import { OctetsStream } from '../index';

test('Push bytes', () => {
  const stream = new OctetsStream();
  stream.pushBack(0x01);
  stream.pushBack(0x02);
  stream.pushBack(0x03);
  stream.pushBack(0x04);
  stream.pushBack(0x05);

  expect(Array.from(stream.getBytes())).toEqual([0x01, 0x02, 0x03, 0x04, 0x05]);
  expect(stream.size()).toBe(5);
});

test('Replace bytes', () => {
  const replaceArray = [0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b];
  const stream = new OctetsStream();
  stream.pushBack(0x01);
  stream.pushBack(0x02);
  stream.pushBack(0x03);
  stream.pushBack(0x04);
  stream.pushBack(0x05);
  stream.replace(Buffer.from(replaceArray), 0);

  expect(Array.from(stream.getBytes())).toEqual(replaceArray);
  expect(stream.size()).toBe(replaceArray.length);
});

test('Replace part bytes', () => {
  const replaceArray = [0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b];
  const stream = new OctetsStream();
  stream.pushBack(0x01);
  stream.pushBack(0x02);
  stream.pushBack(0x03);
  stream.pushBack(0x04);
  stream.pushBack(0x05);
  stream.replace(Buffer.from(replaceArray), 0, 3);

  expect(Array.from(stream.getBytes())).toEqual(replaceArray.slice(0, 3));
  expect(stream.size()).toBe(3);
});
