const computedWatcherOptions = { lazy: true }

export function initComputed(vm, computed) {
  // 计算属性在SSR(是否服务端渲染)环境中为一个普通的getter方法
  const isSSR = isServerRendering()
  const watchers = vm._computedWatchers = Object.create(null)

  for(const key in computed) {
    const userDef = computed(key)
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if(process.env.NODE_DEV !== 'pro') {
      warn(`Getter is missing for computed property "${key}"`)
    }
    // 在非SSR环境中为计算属性创建内部观察器
    if(!isSSR) {
      watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions)
    }
    if(!(key in vm)) {
      defineComputed(vm, key, userDef)
    }
    if(key in vm.$data || vm.$options.props && key in vm.$options.props) {
      warn(`data || props has already defined`)
    }
  }

}

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

function defineComputed(target, key, userDef) {
  const shouldCache = !isServerRendering()
  if(typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache ? createComputedGetter(key) : userDef
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
    ? (shouldCache && userDef.cache !== false
    ? createComputedGetter(key) : userDef.get)
    : noop

    sharedPropertyDefinition.set = userDef.set
    ? userDef.set
    : noop
  } 

  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if(watcher) {
      if(watchers.dirty) {
        watcher.depend()
        return watcher.evaluate()
      }
      return watcher.value
    }
  }
}




