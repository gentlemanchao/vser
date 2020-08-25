/****
 * 虚拟dom
 * 
 */


const vnode = function () {
    this.tree = null;
    this.current = null;
}
const proto = vnode.prototype;

/**
 * 创建虚拟节点
 */
proto.$$_createNode = function (type) {
    return {
        type: type,
        tag: null,
        static: true, //是否静态节点，静态节点不参与diff比较
        ctx: null,
        currentCtx: null, //虚拟dom所对应的组件上下文
        el: null,
        data: null, //动态属性
        attrs: null, //静态属性
        key: null,
        parent: null,
        children: [],
        text: null
    }
}
/**
 * 创建普通节点
 * @param {string} tag 标签名
 * @param {obj} attrs 静态属性
 * @param {obj} props 动态属性
 * @param {array} children 子节点 
 * @param {boolean} isStatic 是否是静态节点 
 */
proto._c = function (tag, attrs, props, children, isStatic) {
    let node = this.$$_createNode(1);
    node.tag = tag;
    node.attrs = attrs || null;
    node.data = props || null;
    node.static = isStatic;
    node.currentCtx = this;
    if (props && props.key) {
        node.key = props.key;
        delete props.key;
    }

    for (let i = 0, len = children.length; i < len; i++) {
        let child = children[i];
        if (Object.prototype.toString.call(child) === '[object Array]') {
            //处理for循环产生的数组
            let newChild = [];
            for (let j = 0, lenj = child.length; j < lenj; j++) {
                let _child = child[j];
                _child.parent = node;
                newChild.push(_child);
            }

            children.splice(i, 1);
            for (let k = 0, lenk = newChild.length; k < lenk; k++) {
                children.splice(i + k, 0, newChild[k]);
            }

        } else {
            child && (child.parent = node);
        }

    }
    node.children = children;
    return node;
}

/**
 * 创建文本节点
 */
proto._t = function (text) {
    let node = this.$$_createNode(3);
    node.text = text;
    return node;
}
/**
 * 循环函数
 */
proto._for = function (obj, callback) {
    let nodes = [];
    switch (Object.prototype.toString.call(obj)) {
        case '[object Number]':
            for (let n = 1; n <= obj; n++) {
                nodes.push(callback && callback(n));
            }
            break;
        case '[object Array]':
            for (let i = 0, len = obj.length; i < len; i++) {
                nodes.push(callback && callback(obj[i], i));
            }
            break;
        case '[object Object]':
            for (let key in obj) {
                nodes.push(callback && callback(obj[key], key));
            }
            break;
    }
    return nodes;
}
export default vnode;