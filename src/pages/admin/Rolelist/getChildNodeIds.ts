import _ from 'lodash';

const getChildNodeIds = (data, id) => {
  // 递归深度找到节点
  const findNode = (dataArray, targetId) => {
    for (let node of dataArray) {
      if (node.value === targetId) {
        return node;
      }
      if (node.children) {
        const foundNode = findNode(node.children, targetId);
        if (foundNode) return foundNode;
      }
    }
    return null;
  };
  
  // 找到父节点
  const parentNode = findNode(data, id);
  
  // 通过递归获取子节点 ID
  const getIds = (node) => {
    let ids:any = [];
    if (node.children) {
      node.children.forEach(child => {
        ids.push(child.value, ...getIds(child));
      });
    }
    // 移除父节点ID
    return _.without(ids, id);
  };

  if (parentNode){ 
    return getIds(parentNode);
  }
  
  return []; // 如果没有找到节点，返回空数组
}
function getTreeSelectCheckedValues(data) {
    // 定义一个递归函数获取节点的id
    function getCheckedIds(node) {
      let ids:any = [];
      if (node.checked) {
        ids.push(node.id);
      }
      if (node.children) {
        for (let child of node.children) {
          ids = ids.concat(getCheckedIds(child));
        }
      }
      return ids;
    }
  
    let checkedIds = [];
    for (let node of data) {
      checkedIds = checkedIds.concat(getCheckedIds(node));
    }

    return checkedIds;
}
export {
    getTreeSelectCheckedValues
}
// 模块导出
export default getChildNodeIds;