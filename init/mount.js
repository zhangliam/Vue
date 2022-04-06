const mount = Vue.prototype.$mount
Vue.prototype.$mount = function(el) {

  el = el && query(el)
  const options = this.$options
  if(!options.render) {
    let template = options.template
    if(template) {
      if(typeof template === 'string') {
        if(template.charAt(0) === '#') {
          template = idToTemplate(template)
        }
      }
      if(template.nodeType) {
        template = template.innerHTML
      }
    } else {
      if(process.env.NODE_ENV !== 'production') {
        warn('invalid template option: ' + template, this)
      }
    }
  } else if (el) {
    template = getOuterHTML(el)
  }

  if(template) {
    const { render } = compileToFunctions(
      template,
      {...},
      this
    )
  }

  return mount.call(this, el)

}

function compileToFunctions(template, options, vm) {

  options = extend({}, options)
  const key = options.delimiters ? String(options.delimiters) + template : template

  if(cache[key]) {
    return cache[key]
  }

  const compiled = compile(template, options)
  const res = {}
  res.render = createFunction(compiled.render)

  return (cache[key] = res)

}

function createFunction(code) {
  return new Function(code)
}




