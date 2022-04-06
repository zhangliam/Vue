/* 
  props可以通过数组指定需要哪些属性，在Vue.js内部，数组格式的props将被规格成为对象个格式
*/
function normalizeProps(options, vm) {
  const props = options.props
  if(!props) return
  const res = {}
  let i, val, name
  if(Array.isArray(props)) {
    i = props.length
    while(i--) {
      val = props[i]
      if(typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null }
      } else if(process.env.NODE_DEV !== 'pro') {
        warn('props must be strings when using array syntax')
      }
    } 
  }

  if(isPlainObject(props)) {
    for(const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val) ? val : { type: val }
    }
  }

  if(process.env.NODE_DEV !== 'pro') {
    warn(`invalid value for option "props: expected na Array or an Object"`)
  }

  options.props = res
}

/*
  通过规格化之后的props从其父组件传入的props数据中或从使用new创建实例时传入propData参数中，筛选出需要的数据保存在vm._props中，然后vm上设置一个代理，实现通过vm.x访问vm._props.x的目的
*/

export function initProps(vm, propOptions) {
 const propsData = vm.$options.propsData || {}
 const props = vm._props = {}
 // 缓存props的key
 const keys = vm.$options._propKeys = []
 const isRoot = !vm.$parent
 // root实例的props属性应该转换成响应式数据
 if(!isRoot) {
  toggleObserving(false)
 }

 for(const key in propOptions) {
  keys.push(key)
  const value = validateProp(key, propOptions, propsData, vm)
  defineReactive(props, key, value)
  // 判断key在vm中是否存在，如不存在则调用proxy在vm上设置一个以key为属性的代理，当使用vm[key]其实访问的是vm._props[key]
  if(!(key in vm)) {
    proxy(vm, `_props`, key)
  }
 }

 //toggleObserving决定observer被调用时是否会将value转换成响应式
 toggleObserving(true)
}










