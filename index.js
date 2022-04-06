import { initMixin } from './init'
import { stateMixin } from '.render/state'
import { renderMixin } from './render/index'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue(options) {
  if(process.env.NODE_ENV !== 'production' && !(this in instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword ')
  }
  this._init(options)
}

/* Vue构造函数prototype属性挂载不同方法 */
// 初始化
initMixin(Vue) 
// 数据相关实例方法
stateMixin(Vue)
// 事件相关实例方法
eventsMixin(Vue)
// 生命周期相关实例方法
lifecycleMixin(Vue)
// 其他外部实例方法例如nextTick
renderMixin(Vue)

export default Vue





