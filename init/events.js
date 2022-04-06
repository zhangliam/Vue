export function eventsMixin(Vue) {

  Vue.prototype.$on = function(event, fn) {
    // event { string | Array<string> }
    // fn { Function }
    const vm = this
    if(Array.isArray(event)) {
      for(let i = 0, l = event.length; i < l; i++) {
        this.$on(event[i], fn)
      }
    } else {
      (vm._events[event] || vm._events = [] ).push(fn)
    }

    /* 
      vm._events为一个对象用来存储事件；
      来源：
      执行 new Vue(), Vue执行this._init进行一系列初始化操作
      其中会在Vue.js实例创建一个_events属性用来存储事件
      其代码为vm._events = Object.create(null)
    */

    return vm
  }

  Vue.prototype.$once = function(event, fn) {
    const vm = this
    function on() {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }

    on.fn = fn
    vm.$on(event, on)
    return vm
  }

  Vue.prototype.$off = function(event, fn) {

    /*
      用法：移除自定义事件监听器
      1. 如果没有提供参数，则移除所有事件监听器
      2. 如果只提供了事件，则移除该事件所有监听器
      3. 如果同时提供事件与回调，则移除该回调的监听器
    */

    const vm = this
    if(!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }

    if(Array.isArray(event)) {
      for(let i = 0, l = event.length; i < l; i++) {
        this.$off(event[i], fn)
      }
      return vm
    }

    const cbs = vm._events[event]
    if(!cbs) {
      return vm
    }
    if(arguments.length === 1) {
      vm._events[event] = null
      return vm
    }

    if(fn) {
      const cbs = vm._events[event]
      let cb
      let i = cbs.length
      while(i--) {
        cb = cbs[i]
        if(cb === fn || cb.fn === fn) {
          cbs.splice(i, 1)
          break
        }
      }
    }

    return vm
  }

  Vue.prototype.$emit = function(event) {
    const vm = this
    let cbs = vm._events[event]
    if(cbs) {
      const args = toArray(arguments, 1)
      for(let i = 0, l = cbs.length; i < l; i++) {
        try {
          cbs[i].apply(vm, args)
        } catch(e) {
          handleError(e, vm, `event handler for "${event}"`)
        }
      }
    }

    return vm
  }

}