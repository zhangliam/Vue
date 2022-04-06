export function set(target, key, val) {

  if(Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return value
  }

  if(key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }

  const ob = target.__ob__
  if(target._isVue || (ob && ob.vmCount)) {
    //target can't be Vue instance || its root $data
    process.env.NODE_ENV != 'productino' && wran('...')
    return val
  }

  if(!ob) {
    target[key] = val
    return val
  }

  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val

}