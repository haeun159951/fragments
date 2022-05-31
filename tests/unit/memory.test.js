const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory');

describe('memory', () => {
  test('writeFragment() returns nothing', async () => {
    const result = await writeFragment({ ownerId: '1', id: '1', fragment: 'fragment' });
    expect(result).toBe(undefined);
  });

  test('readFragment() returns from writeFragment()', async () => {
    const result = await readFragment('1', '1');
    expect(result).toEqual({ ownerId: '1', id: '1', fragment: 'fragment' });
  });

  test('readFragment() returns nothing with no proper data', async () => {
    const result = await readFragment('0', '1');
    expect(result).toBe(undefined);
  });

  test('writeFragmentData() returns nothing', async () => {
    const result = await writeFragmentData('2', '2', 'fragment 2');
    expect(result).toBe(undefined);
  });

  test('readFragmentData() returns from writeFragmentData()', async () => {
    const result = await readFragmentData('2', '2');
    expect(result).toEqual('fragment 2');
  });

  test('readFragmentData() returns nothing', async () => {
    const result = await readFragmentData('0', '2');
    expect(result).toBe(undefined);
  });

  test('listFragments() returns from writeFragmentData()', async () => {
    await writeFragment({ ownerId: '1', id: '1', fragment: 'fragment 1' });
    await writeFragmentData('1', '1', 'fragment 1');
    await writeFragment({ ownerId: '1', id: '2', fragment: 'fragment 2' });
    await writeFragmentData('1', '2', 'fragment 2');
    const list = await listFragments('1');
    expect(list).toEqual(['1', '2']);
  });

  test('deleteFragment() deletes metadata and data ', async () => {
    await writeFragment({ ownerId: '1', id: '1', fragment: 'fragment 1' });
    await writeFragmentData('1', '1', 'fragment 1');
    await deleteFragment('1', '1');
    const result = await readFragment('1', '1');
    expect(result).toBe(undefined);
    const result2 = await readFragmentData('1', '1');
    expect(result2).toBe(undefined);
  });
});
