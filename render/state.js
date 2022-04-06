import { set, del } from './Observer'

export function stateMixin(Vue) {
  Vue.prototype.$set = set
  Vue.prototype.$del = del
  Vue.prototype.$watch = function(expOrFn, cb, options) {}
}