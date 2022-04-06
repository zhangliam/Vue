export default class Watcher {
  constructor(vm, expOrFn, cb, options) {
    this.vm = vm;
    if(options) {
      this.computed = !!options.computed
    } else {
      this.deep = false
      this.computed = false
    }

    this.deps = []
    this.depIds = new Set()
    if(typeof expOrFn == 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
    }
    this.cb = cb

    this.dirty = this.computed
    if(this.computed) {
      this.value = undefined
      this.dep = new Dep()
    } else {
      this.value = this.get()
    }

  }
  
  addDep(dep) {
    const id = dep.id;
    if(!this.depIds.has(id)) {
      this.depIds.add(id)
      this.deps.push(dep)
      this.addSub(this)
    }
  }

  get() {
    window.target = this
    let value = this.getter.call(this.vm, this.vm)
    if(this.deep) {
      traverse(value)
    }
    /*
      必须在window.target = undefined; 之前去触发子值的收集依赖逻辑, 这样才能保证子集收集的依赖是当前这个Watcher
      如果在window.target = undefined; 之后去触发的收集依赖逻辑, 那么当前Watcher并不会收集到子值依赖列表中, 也就无法实现deep的功能
    */
    window.target = undefined
    return value
  }

  update() {
    if(this.computed) {
      if(this.dep.subs.length === 0) {
        this.dirty = true
      } else {
        this.getAndInvoke(() => {
          this.dep.notify()
        })
      }
    }

    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }

  getAndInvoke(cb) {
    const value = this.get()
    if(value !== this.value || isObject(value) || this.deep) {
      const oldValue = this.value
      this.value = value
      this.dirty = false

      if(this.user) {
        try {
          cb.call(this.vm, value, oldValue)
        } catch(e) {
          handleError(e)
        }
      } else {
        cb.call(this.vm, value, oldValue)
      }

    }
  }

  evaluate() {
    if(this.dirty) {
      this.value = this.get()
      this.dirty = false
    }
    return this.value
  }

  depend() {
    if(this.dep && Dep.target) {
      this.dep.depend()
    }
  }

  teardown() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].removeSub(this)
    }
  }
}

const seenObjects = new Set();
export function traverse(val) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse(val, seen) {
  let i, keys
  const isA = Array.isArray(val)
  if( (!isA && !isObject(val)) || Object.isForzen(val) ) {
      return
  }

  if(val.__ob__) {
    const depId = val.__ob__.dep.id
    if(seen.has(depId)) {
      return
    }
    seen.add(depId)
  }

  if(isA) {
    i = val.length
    while(i--) _traverse(val[i], seen)
  } else {
    keys = Object.keys(val)
    i = keys.length
    while(i--) _traverse(val[keys[i]], seen)
  }

}


const bailRE = /[^\w.$]/;
export function parsePath(path) {
  if(bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return (obj) => {
    for(let i = 0; i < segments.length; i++) {
      if(!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}

Vue.prototype.$watch = function(expOrFn, cb, options) {
  const vm = this, options = options || {}
  const watcher = new Watcher(vm, expOrFn, cb, options)
  if(options.immediate) {
    cb.call(vm, watcher.value)
  }
  return function unwatchFn() {
    watcher.teardown()
  }
}



