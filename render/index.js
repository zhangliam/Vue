import { nextTick } from 'nextTick'

export function renderMixin(Vue) {

  Vue.prototype.$nextTick = function(fn) {
    return nextTick(fn, this)
  }

}


