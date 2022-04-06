export function initMixin(Vue) {
  Vue.prototype._init = function(options) {
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )

    initLifecycle(vm)
    initEvent(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjection(vm)  /* data/props之前初始化inject */
    initState(vm)      /* 让用户可在data/props中使用inject所注入到内容 */
    initProvide(vm)    /* data/props之后初始化provide */
    callHook(vm, 'created')

    if(vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initLifecycle(vm) {
  const options = vm.$options

  let parent = options.parent
  if(parent && !options.abstrcact) {
    while(parent.$options.abstrcact && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

export function initEvents(vm) {
  vm._event = Object.create(null)
  const listeners = vm.$options._parentListeners
  if(listeners) {
    updateComponentListenrs(vm, listeners)
  }
}

/*
  Q：为什么要把生命周期钩子转换成数组
  A：Vue.mixin和用户在实例化Vue.js时，如果设置同一个生命周期钩子，
  触发生命周期时，需同时触发这两个函数。而转换成数组后，可在同一个生命周期钩子列表中保存多个生命周期钩子
*/
export function callHook(vm, hook) {
  const handlers = vm.$options[hook]
  if(handlers) {
    for(let i = 0; l = handlers.length; i < l; i++) {
      try {
        handlers[i].call(vm)
      } catch(e) {
        handeError(e, vm, `${hook} hook`)
      }
    }
  }
}

export function initInjection(vm) {
  const result = resolveInject(vm.$options.inject, vm)
  if(result) {
    observeState.shouldConvert = false
    Object.keys(result).foreach(key => {
      defineReactive(vm, key, result[key])
    })
    observeState.shouldConvert = true
  }
}

import { initProps } from './stateLoad/props'
import { initMethods } from './stateLoad/methods'
import { initData } from './stateLoad/data'
import { initWatch } from './stateLoad/data'

export function initState(vm) {
  vm._watcher = []
  const opts = vm.$options
  if(opts.props) initProps(vm, opts.props)
  if(opts.methods) initMethods(vm, opts.methods)
  if(opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if(opts.computed) initComputed(vm, opts.computed)
  if(opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

export function initProvide() {
  const provide = vm.$options.provide
  if(provide) {
    vm._provided = typeof provide === 'function'
    ? provide.call(vm)
    : provide
  }
}





