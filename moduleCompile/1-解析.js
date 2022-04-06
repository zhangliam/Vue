/*
  
  解析器作用是通过模版得到AST（抽象语法树）
  生成AST过程需要借助HTML解析器，当HTML解析器触发不同钩子函数时，构建不同类型节点
  随后，通过栈来得到正在构建节点的父节点，将其添加到父节点下面
  最终，当HTML解析器运行完毕，即可得到完成带DOM层级关系AST

*/

// 开始标签判断
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `( (?:${ncname}\\:)?)${ncname} )`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/

function advance(n) {
  html = html.substring(n)
}

function parseStartTag() {
  const start = html.match(startTagOpen)

  if(start) {
    const match = {
      tagName: start[1],
      attrs: []
    }
  }
  advance(start[0].length)

  let end, attr
  while( !(end = html.match(startTagClose)) && (attr = html.match(attribute)) ) {
    advance(attr[0].length)
    match.attrs.push(attr)
  }

  if(end) {
    match.unarySlash = end[1]
    advance(end[0].length)
    return match
  }

}

// 解析器内部递归
export function parseHTML(html, options) {
 while(html) {
  if(!lastTag || !isPlainTextElement(lastTag)) {
    let textEnd = html.indexOf('<')

    if(textEnd === 0) {
      // 注释
      if(comment.test(html)) {
        continue
      }
      // 条件注释
      if(conditionalCommment.test(html)) {
        continue
      }
      // DOCTYPE
      const doctypeMatch = html.match(doctype)
      if(doctypeMatch) {
        continue
      }
      // 结束标签
      const endTagMatch = html.match(endTag)
      if(endTagMatch) {
        continue
      }
      // 开始标签
      const startTagMatch = parseStartTag()
      if(startTagMatch) {
        continue
      }
    } 

    let text, rest, next
    if(textEnd >= 0) {
      // 解析文本
    }

    if(textEnd < 0) {
      text = html
      html = ''
    }

    if(options.chars && text) {
      options.chars(text)
    }

  } else {
   // 父元素为script, style, textarea 处理逻辑
  }  
 }
}


// parseText('你好{{name}}')
// => ' “你好“ + _s(name)'
function parseText(text) {
  const tagRE = /\{\{((?:.|\n)+?)\}\}/g
  if(!tagRE.test(text)) {
    return 
  }

  const tokens = []
  let lastIndex = tag.lastIndex = 0
  let match, index
  while(( match = tagRE.exec(text))) {
    index = match.index
    if(index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)))
    }

    token.push(`_s(${match[1].trim()})`)
    lastIndex = index + match[0].length
  }

  if(lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)))
  }

  return tokens.join('+')
}

// 解析器最终实现目的伪代码 
parseHTML(template, {

  start(tag, attrs, unary) {
    // 解析标签开始位置时，触发该函数
    let element = creatASTElement(tag, attrs, currentParent)
  },

  end() {
    // 解析标签结束位置时，触发该函数
  },

  chars(text) {
    // 解析文本时，触发该函数
    text = text.trim()
    if(text) {
      const children = currentParent.children
      let expression
      if(expression == parseText(text)) {
        children.push({
          type: 2,
          expression,
          text
        })
      } else {
        children.push({
          type: 3,
          text
        })
      }
    }
  },

  comment(text) {
    // 解析注释，触发该函数
  }

})

// 解析器最终实现目的 => 生成AST节点构造函数(Vnode)伪代码
function creatASTElement(tag, attrs, parent) {
  return {
    type: 1,
    tag,
    attrList: attrs,
    parent,
    children: []
  }
}







