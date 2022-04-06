/* 
  
  优化器的作用是在AST中找到静态子树并打上标记，这样做有两个好处：
  1.每次重新渲染时，不需要为静态子树创建新节点
  2.在虚拟DOM中打补丁的过程可以跳过

  优化器内部实现其实主要分为两个步骤：
  1.在AST中找出所有静态节点并打上标记
  2.在AST中找出所有静态根节点并打上标记

*/

function markStaticRoots(node) {

  if(node.type === 1) {
    // 要使节点符合静态根节点的要求，它必须有子节点
    // 这个子节点不能实只有一个静态文本的子节点，否则优化成本大于收益
    if(node.static && node.children.length && !(node.children.length === 1 && node.children[0].length === 3)) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }

    if(node.children) {
      for(let i=0; i<node.children.length; i++) {
        markStaticRoots(node.children[i])
      }
    }
  }

}