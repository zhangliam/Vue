/* v-on指令 */

let target
function updateDOMListeners(oldVnode, vnode) {
  if(isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  const on = vnode.data.on || {}
  const oldon = oldvnode.data.on || {}
  target = vnode.elm
  normalizeEvents(on)
  updateListeners(on, oldon, add, remove, vnode.context)
  target = undefined
}

function add(event, handler, once, capture, passive) {
  // 更新DOM操作withMacroTask推送宏任务
  handler = withMacroTask(handler)
  if(once) handler = createOnceHandler(handler, event, capture)
  target.addEventListener(
    event,
    handler,
    supportPassive ? { capture, passive } : capture
  )
}

function remove(event, handler, capture, _target) {
  (_target || target).removeEventListener(
    event,
    handler._withTask || handler,
    capture
  )
}

function createOnceHandler(handler, event, capture) {
  const _target = target
  return function onceHandler() {
    const res = handler.apply(null, arguments)
    if(res !== null) {
      remove(event, onceHandler, capture, _target)
    }
  }
}


/* 自定义指令内部原理 */

function callHook(dir, hook, vnode, oldValue, isDestroy) {
  const fn = dir.def && dir.def[hook]
  if(fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy)
    } catch(e) {
      handlerError(e, vnode.context, `directives ${dir.name} ${hook} hook`)
    }
  }
}

export default {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives(vnode) {
    updateDirectives(vnode, emptyNode)
  }
}

function updateDirectives(oldVnode, vnode) {
  if(oldVnode.data.directives || vnode.data.directives) {
    _update(oldvnode, vnode)
  }
} 

function _update(oldVnode, vnode) {
  const isCreate = oldVnode === emptyNode
  const isDestroy = vnode === emptyNode
  const oldDirs = normalizeDirectives(oldVnode.data.directives, oldVnode.context)
  const newDirs = normalizeDirectives(vnode.data.directives, vnode.context)

  const dirsWithInsert = []
  const dirsWithPostpatch = []

  let key, oldDir, dir
  for(key in newDirs) {
    oldDir = oldDirs[key]
    dir = newDirs[key]
    if(!oldDir) {
      callHook(dir, 'bind', vnode, oldvnode)
      if(dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir)
      }
    } else {
      dir.oldValue = oldDir.value
      callHook(dir, 'update', vnode, oldvnode)
      if(dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir)
      }
    }
  }

  if(dirsWithInsert.length) {
    const callInsert = () => {
      for(let i = 0; i < dirsWithInsert.length; i++) {
        callHook(dirsWithInsert[i], 'inserted', vnode, oldVnode)
      }
    }
    if(isCreate) {
      mergeVnodeHook(vnode, 'insert', callInsert)
    } else {
      callInsert()
    }
  }

  if(dirsWithPostpatch.length) { 
    mergeVnodeHook(vnode, 'postpatch', ()=> {
      for(let i = 0; i < dirsWithPostpatch.length; i++) {
        callHook(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode)
      }
    })
  }

  if(!isCreate) {
    for(key in oldDirs) {
      if(!newDirs[key]) {
        callHook(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy)
      }
    }
  }

}








