```
_______
< dynamoo >
 -------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

# dynamoo
[![npm version](https://img.shields.io/npm/v/dynamoo.svg)](https://www.npmjs.com/package/dynamoo)
[![npm downloads](https://img.shields.io/npm/dm/dynamoo.svg)](https://www.npmjs.com/package/dynamoo)
[![Build Status](https://travis-ci.org/articulate/dynamoo.svg?branch=master)](https://travis-ci.org/articulate/dynamoo)
[![Coverage Status](https://coveralls.io/repos/github/articulate/dynamoo/badge.svg?branch=master)](https://coveralls.io/github/articulate/dynamoo?branch=master)

Serialize and parse DynamoDB items.

## API

- [`serialize`](#serialize)
- [`parse`](#parse)
- [Caveat emptor](#caveat-emptor)

### `serialize`

Serializing data to store in DynamoDB is hard, but `dynamoo` makes it easier.  Suppose you have this item you want to `putItem` to DynamoDB:

```js
const item = {
  bool: true,
  func: Function.prototype,
  list: ['a', 1, false, null, { key: 'val' }],
  map: { key: 'val', nested: ['list'] },
  null: null,
  num: 42,
  string: 'strung',
  undef: undefined
}
```

Just `serialize` that data before sending, like this:

```js
const AWS = require('aws-sdk')
const { serialize } = require('dynamoo')

const dynamo = new AWS.DynamoDB()

dynamo.putItem({ Item: serialize(item), TableName }, console.log)
```

The serialized `Item` that gets sent looks like this:

```js
const Item = {
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
  string: { S: 'strung' }
}
```

Wow!  It's like magic!  Notice that any `Function` or `undefined` attributes are ignored, since the former doesn't serialize, and the latter technically doesn't exist.

### `parse`

But wait... what about querying DynamoDB?  The `data.Items` that are found need to be parsed.  Got you covered on that as well:

```js
const { parse } = require('dynamoo')

dynamo.query(params, (err, data) =>
  console.log(data.Items.map(parse))
)
```

Notice that `parse` accepts a single `Item`.  So for `query` you'll need to `.map()`, but for `getItem`, you can use it like this:

```js
dynamo.getItem({ Key, TableName }, (err, data) =>
  console.log(parse(data.Item))
)
```

The careful observer will notice that - with the exception of `Function` and `undefined` attributes - the `serialize` and `parse` functions are isomorphic!  :heart_eyes:

```js
const { expect } = require('chai')

expect(parse(serialize(item))).to.eql(item)
```

### Caveat emptor

By design, `dynamoo` only supports the following basic data types for attributes:

  - `Array`
  - `Boolean`
  - `null`
  - `Number`
  - `Object`
  - `String`

If you want to use any other fancier types, such as `Map`, `Set`, etc., then this library won't work for you.
