/*
  
  _c createElement(<tagname>, <data>, <children>) 元素节点 
  _v createTextVNode 文本节点
  _e createEmptyVNode 注释节点

  <div id="el">
    <p>Hello {{ name }}</p>
  </div>

  由genElement方法递归生成如下字符串
  code = _c('div', {'id': 'el'}, [_c('p', [_v('Hello' + _s(name))])] )
  
  将字符串作为code包裹在with语句中执行
  const eventCode = `with(this) { return ${code} }`
  const hello = new Function(eventCode)
  hello()

*/

function genElement(el, state) {
  // if el.plain is true, the element attribute is null
  const data = el.plain ? undefined : genData(el, state)
  const children = genChildren(el, state)

  code = `_c('${el.tag} ${ data ? `,${data}` : '' } ${ children ? `,${ children }` : '' } )`

  return code
}

function genData(el: ASTElementstate, state:CodegenState) : string {
  let data = '{'

  if(el.key) {
    data += `key:${el.key}`
  }

  if(el.ref) {
    data += `ref:${el.ref}`
  }

  if(el.pre) {
    data += `pre:true,`
  }

  data = data.replace(/,$/, '') + '}'
  return data
}

function genChildren(el, state) {
  const children = el.children
  if(children.length) {
    return `[${ children.map( c => genNode(c, state)).join(',') }]`
  }
}

function genNode(node, state) {
  if(node.type === 1) {
    return genElement(node, state)
  }

  if(node.type === 3 && node.isComment) {
    return genComment(node)
  }

  return genText(node)
}

function genText(text) {
  return `_v(${text.type === 2 ? text.expression : JSON.stringify(text.text) })`
}

function genCommet(comment) {
  return `_e(${ JSON.stringify(comment.text) })`
}

