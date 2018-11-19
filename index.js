const {
  assoc, constant, identity, map, mapObj, reduceObj
} = require('tinyfunk')

const parseEach = (acc, val, type) =>
  getTypes[type].xfrm(val)

const parseOne =
  reduceObj(parseEach, null)

const parse =
  mapObj(parseOne)

const getTypes = {
  BOOL: { xfrm: identity },
  L:    { xfrm: map(parseOne) },
  M:    { xfrm: parse },
  N:    { xfrm: JSON.parse },
  NULL: { xfrm: constant(null) },
  S:    { xfrm: identity }
}

const serializeEach = (attrs, val, key) =>
  val === undefined || typeof val === 'function'
    ? attrs
    : assoc(key, serializeOne(val), attrs)

const serializeOne = val => {
  const { label, xfrm } = putTypes[typeOf(val)]
  return { [ label ]: xfrm(val) }
}

const serialize =
  reduceObj(serializeEach, {})

const putTypes = {
  array:   { label: 'L',    xfrm: map(serializeOne) },
  boolean: { label: 'BOOL', xfrm: identity },
  null:    { label: 'NULL', xfrm: constant(true) },
  number:  { label: 'N',    xfrm: JSON.stringify },
  object:  { label: 'M',    xfrm: serialize },
  string:  { label: 'S',    xfrm: identity }
}
const typeOf = val =>
  Array.isArray(val)
    ? 'array'
    : val === null
      ? 'null'
      : typeof val

module.exports = { parse, serialize }
