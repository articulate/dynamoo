const {
  assoc, compose, constant, identity, map, mapObj, reduceObj
} = require('tinyfunk')

const parseEach = (acc, val, type) =>
  getTypes[type].xfrm(val)

const parseOne =
  reduceObj(parseEach, null)

const parseSet = val =>
  new Set(val)

const parse =
  mapObj(parseOne)

const getTypes = {
  BOOL: { xfrm: identity },
  L:    { xfrm: map(parseOne) },
  M:    { xfrm: parse },
  N:    { xfrm: JSON.parse },
  NULL: { xfrm: constant(null) },
  S:    { xfrm: identity },
  SS:   { xfrm: parseSet }
}

const serializeEach = (attrs, val, key) =>
  val === undefined || typeof val === 'function'
    ? attrs
    : assoc(key, serializeOne(val), attrs)

const serializeOne = val => {
  const { label, xfrm } = putTypes[typeOf(val)]
  return { [ label ]: xfrm(val) }
}

const serializeSet =
  compose(map(String), Array.from)

const serialize =
  reduceObj(serializeEach, {})

const putTypes = {
  array:   { label: 'L',    xfrm: map(serializeOne) },
  boolean: { label: 'BOOL', xfrm: identity },
  null:    { label: 'NULL', xfrm: constant(true) },
  number:  { label: 'N',    xfrm: JSON.stringify },
  object:  { label: 'M',    xfrm: serialize },
  set:     { label: 'SS',   xfrm: serializeSet },
  string:  { label: 'S',    xfrm: identity }
}

const typeOf = val => {
  switch (true) {
    case Array.isArray(val):
      return 'array'
    case val instanceof Set:
      return 'set'
    case val === null:
      return 'null'
    default:
      return typeof val
  }
}

module.exports = { parse, serialize }
