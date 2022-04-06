export function initMethods(vm, method) {
  const props = vm.$options.props
  for(const key in methods) {
    if(methods[key] == null) {
      warn(`Method "${key}" has an undefined value in the component definition..."`)
    }

    if(props && hasOwn(props, key)) {
      warn(`Method "${key}" has already been defined as a prop.`)
    }

    if((key in vm) && isReserved(key)) {
      warn(`Method "${key}" conflicts with an existing Vue instance method`)
    }
    
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
  }
}