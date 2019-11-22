const { expect } = require('chai')
const { omit } = require('tinyfunk')

const { parse, serialize } = require('.')

describe('dynamoo', () => {
  const item = {
    bool: true,
    func: Function.prototype,
    list: ['a', 1, false, null, { key: 'val' }],
    map: { key: 'val', nested: ['list'] },
    null: null,
    num: 42,
    set: new Set(['a', 'a', 'b']),
    string: 'strung',
    undef: undefined
  }

  const serialized = {
    bool: { BOOL: true },
    list: {
      L: [
        { S: 'a' },
        { N: '1' },
        { BOOL: false },
        { NULL: true },
        { M: { key: { S: 'val' } } }
      ]
    },
    map: {
      M: {
        key: { S: 'val' },
        nested: { L: [{ S: 'list' }] }
      }
    },
    null: { NULL: true },
    num: { N: '42' },
    set: { SS: ['a', 'b'] },
    string: { S: 'strung' }
  }

  describe('serialize', () => {
    it('serializes the input item into DynamoDB data types', () =>
      expect(serialize(item)).to.eql(serialized)
    )
  })

  describe('parse', () => {
    it('parses the DynamoDB item into a POJO', () =>
      expect(parse(serialized)).to.eql(omit(['func', 'undef'], item))
    )
  })
})
