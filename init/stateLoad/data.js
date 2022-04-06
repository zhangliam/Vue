export function initData(vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {}

  if(!isPlainObject(data)) {
    data = {}
    process.env.NODE_DEV !== 'pro' && warn('data function should return an object')
  }

  // data代理到Vue.js实例上
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods

  let i = keys.length
  while(i--) {
    const key = keys[i]
    if(process.env.NODE_DEV !== 'pro') {

      if(methods && hasOwn(methods, key)) {
        warn(`methods "${key}" has already been defined`)
      }

      if(props && hasOwn(props, key)) {
        warn(`props "${key}" has already been defined`)
      }

    } 
    if(!isReserved(key)) {
      proxy(vm, `_data`, key)
    }
  }
  // init data 执行observe监测封装类
  observe(data, true /* asRootData */)
}

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy(target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxyGetter() {
    this[sourceKey][key]
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}






