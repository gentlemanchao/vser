/**
 * 渲染
 */
import Events from './event';

/**
 * 
 * @param {dom object} el 挂载的节点
 * @param {vnode object} vnode 虚拟dom树 
 * @param {*} nameSpace 组件实例
 */
const patch = function (el, vnode, nameSpace) {
    this.el = el || null;
    this.vnode = vnode || null;
    this.event = new Events();
    this.nameSpace = nameSpace;
    this.init();
}

/**
 * 是否是对象
 * @param {*} obj 
 */
const isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}
/**
 * 短横线转驼峰式
 * @param {*} str 
 */
const toCamel = function (str) {
    return str.replace(/([^-])(?:-+([^-]))/g, function ($0, $1, $2) {
        return $1 + $2.toUpperCase();
    });
}

const hasClass = function (el, name) {
    if (!el.className) return false;
    if (el.classList) {
        return el.classList.contains(name);
    } else {
        const names = el.className.split(' ');
        for (let i = 0; i < names.length; i++) {
            if (names[i].trim() === name) {
                return true;
            }
        }
        return false;
    }
}
const addClass = function (el, name) {
    if (hasClass(el, name)) return;
    if (el.classList) {
        el.classList.add(name);
    } else {
        el.className = el.className + ' ' + name;
    }

}
const removeClass = function (el, name) {
    if (!el.className) return;
    if (!hasClass(el, name)) return;
    if (el.classList) {
        el.classList.remove(name);
    } else {
        let names = el.className.split(' ');
        for (let i = 0; i < names.length; i++) {
            if (names[i].trim() === name) {
                names.splice(i, 1);
                break;
            }
        }
        el.className = names.join(' ');
    }
}

const proto = patch.prototype;
proto.init = function () {
    if (this.el && this.vnode) {
        const _this = this.nameSpace;
        if (_this.$$_siblings) {
            this.createBefore(_this.$$_siblings, this.vnode);
        } else {
            this.create(this.el, this.vnode);
        }
    }

}

/**
 * 添加事件
 */
proto._addEvent = function (el, eventName, obj, namespace) {
    const self = this;
    const _listener = function (e) {
        let params = obj.params || [];
        params.push({
            el: el,
            e: e
        });
        obj.func.apply(namespace || self.nameSpace, params);
    }
    obj.listener = this.event.add(el, eventName, _listener);
}
/**
 * 移除事件
 */
proto._removeEvent = function (el, eventName, obj) {
    this.event.remove(el, eventName, obj.listener);
}
/**
 * 更新样式class 
 */
proto._updateClass = function (el, value) {
    if (typeof value === 'string') {
        //如果是静态属性，则直接添加
        const arr = value.split(' ');
        for (let i = 0, len = arr.length; i < len; i++) {
            addClass(el, arr[i]);
        }
    } else if (isObject(value)) {
        //动态属性
        for (let key in value) {
            //如果满足条件则添加样式名，如果不满足条件则移除样式名
            value[key] ? addClass(el, key) : removeClass(el, key);
        }
    }
}
/**
 * 更新样式
 */
proto._updateStyle = function (el, value) {

    if (typeof value === 'string') {
        //如果是静态属性，则直接添加
        const arr = value.split(';');

        for (let i = 0, len = arr.length; i < len; i++) {
            const _style = arr[i];
            const pos = _style.indexOf(':');
            if (pos !== -1) {
                const name = toCamel(_style.substring(0, pos).trim());
                const value = _style.substring(pos + 1).trim();
                el.style[name] = value;
            }
        }


    } else if (isObject(value)) {
        //动态属性
        for (let key in value) {
            el.style[toCamel(('' + key).trim())] = value[key];
        }
    }

}
/**
 * 更新html
 */
proto._updateHtml = function (el, value) {
    el && (el.innerHTML = value);
}
/**
 * 添加属性
 */
proto._addAttr = function (el, name, value, vnode) {
    if (name.indexOf('@') === 0) {
        name = name.substring(1);
        this._addEvent(el, name, value, vnode.currentCtx);
        return;
    }
    switch (name) {
        case 'class':
            this._updateClass(el, value);
            break;
        case 'style':
            this._updateStyle(el, value);
            break;
        case 'v-html':
            this._updateHtml(el, value);
            break;
        default:
            el && el.setAttribute(name, value);
    }

}
proto._removeAttr = function (el, name, value) {

}
/**
 * 创建html节点
 * @params {*} vnode 当前要创建的虚拟dom
 * @params {*} parent  父节点 节点对象 非必填
 * @params {*} sibling  兄弟节点 节点对象 非必填 
 */
proto._createEl = function (vnode, parent, sibling) {
    if (!vnode) return null;
    let el = null;
    if (vnode.type === 1) {
        const _this = this.nameSpace;
        const customerComponents = vnode.currentCtx && vnode.currentCtx.$$_customerComponents || {}; //自定义组件
        if (vnode.tag === 'slot') {
            //插槽名
            const name = vnode.attrs && vnode.attrs.name;
            if (!name) {
                //默认插槽 没有插槽名
                const _childrenVnode = _this.$$_childrenVnode || [];
                let found = false; //判断是否具有对应子节点
                for (let i = 0, len = _childrenVnode.length; i < len; i++) {
                    const _vnode = _childrenVnode[i];
                    (!_vnode.attrs || !_vnode.attrs.slot) && (found = true) && this.create(parent, _vnode);
                }

                if (!found && vnode.children.length) {
                    const vnodeChildren = vnode.children;
                    for (let j = 0, lenj = vnodeChildren.length; j < lenj; j++) {
                        this.create(parent, vnodeChildren[j]);
                    }
                }


            } else {
                //有插槽名
                const _childrenVnode = _this.$$_childrenVnode || [];
                let found = false; //判断是否具有对应子节点

                for (let k = 0, lenk = _childrenVnode.length; k < lenk; k++) {
                    const _vnode = _childrenVnode[k];
                    _vnode.attrs && _vnode.attrs.slot === name && (found = true) && this.create(parent, _vnode);
                }

                if (!found && vnode.children.length) {
                    const vnodeChildren = vnode.children;
                    for (let h = 0, lenh = vnodeChildren; h < lenh; h++) {
                        this.create(parent, vnodeChildren[h]);
                    }
                }
            }

            return 'slot';
        } else if (vnode.tag in customerComponents) {
            //内联子组件
            const comp = customerComponents[vnode.tag];
            if (comp && typeof comp === 'function') {
                const ref = vnode.attrs && vnode.attrs.ref;
                let _opts = {
                    el: parent,
                    $$_siblings: sibling,
                    parent: vnode.currentCtx,
                    parameters: _this.$parameters || {},
                    router: _this.$router || null,
                    $$_props: vnode.data, //传给子组件的组件参数
                    $$_childrenVnode: vnode.children, //要添加到子组件内部插槽内的节点vnode
                }
                // try {
                const ctx = new comp(_opts);
                vnode.ctx = ctx;
                ref && (_this.$refs[ref] = ctx);
                _this.children.push(ctx);
                // } catch (e) {
                // console.error(`组件${vnode.tag}初始化失败:${e.message||''}`);
                // }
            }
            return 'comp';
        }

        el = document.createElement(vnode.tag);
        const attrs = vnode.attrs;
        const data = vnode.data;
        if (attrs) {
            for (let key in attrs) {
                this._addAttr(el, key, attrs[key], vnode);
            }
        }
        if (data) {
            for (let key in data) {
                this._addAttr(el, key, data[key], vnode);
            }
        }
    } else if (vnode.type === 3) {
        el = document.createTextNode(vnode.text);
    }
    return el;
}
/**
 * 递归创建
 * @param {*} parent 要添加虚拟dom的父节点
 * @param {*} vnode 当前要创建的虚拟dom
 */
proto.create = function (parent, vnode) {
    const el = this._createEl(vnode, parent);
    if (el === 'slot') {
        //如果是插槽

    } else if (el === 'comp') {
        //如果是内联组件

    } else if (el) {
        //如果是普通节点
        vnode.el = el;
        parent.appendChild(el);
        if (vnode.children && vnode.children.length) {
            const vnodeChildren = vnode.children;
            for (let i = 0, len = vnodeChildren.length; i < len; i++) {
                this.create(el, vnodeChildren[i]);
            }
        }

    }
}
/**
 * 递归创建 在节点前创建
 * 
 */
proto.createBefore = function (sibling, vnode) {
    const el = this._createEl(vnode, vnode.parent && vnode.parent.el, sibling);
    if (el === 'slot') {
        //如果是插槽

    } else if (el === 'comp') {
        //如果是内联组件

    } else if (el) {
        //如果是普通节点
        vnode.el = el;
        sibling.parentNode.insertBefore(el, sibling);
        if (vnode.children && vnode.children.length) {
            const vnodeChildren = vnode.children;
            for (let i = 0, len = vnodeChildren.length; i < len; i++) {
                this.create(el, vnodeChildren[i]);
            }

        }
    }
}


/**
 * 递归删除
 * @param {*} vnode 
 * @param {boolean} recursive 是否递归删除
 */
proto.remove = function (vnode, recursive) {
    if (!vnode) return;
    const _this = this.nameSpace;
    if (vnode.tag === 'slot') {
        //如果是插槽

    } else if (vnode.tag && vnode.tag in _this.$$_customerComponents) {
        //移除子组件
        if (vnode.ctx) {
            vnode.ctx.beforeDestroyed();
            vnode.ctx.destroyed();
            vnode = null;
        }
    } else {
        const data = vnode.data || {};
        const el = vnode.el;
        for (let key in data) {
            if (key.indexOf('@') === 0) {
                const value = data[key];
                const name = key.substring(1);
                this._removeEvent(el, name, value);
            }
        }

        if (vnode.children && vnode.children.length) {
            const vnodeChildren = vnode.children;
            for (let i = 0, len = vnodeChildren.length; i < len; i++) {
                this.remove(vnodeChildren[i], true);
            }

        }

        !recursive && el.parentNode && el.parentNode.removeChild(el); //对于递归删除而言，只需要删除根节点即可，子节点只需要移除事件。
        vnode = null;
    }

}

/**
 * tag比较，相同返回false 不同返回true
 */
proto._diffTag = function (vnode, oldVNode) {
    if (vnode === oldVNode || vnode && oldVNode && vnode.type === 3 && oldVNode.type === 3 && vnode.text === oldVNode.text) {
        return false;
    } else if (vnode === oldVNode || vnode && oldVNode && vnode.type === 1 && oldVNode.type === 1 && vnode.tag === oldVNode.tag &&
        vnode.key == oldVNode.key) {
        return false;
    } else {
        return true;
    }
}

//节点改变，移除后重新添加
proto._updateNode = function (node, oldVNode) {

    const self = this;
    //创建新节点
    const el = this._createEl(node);
    node.el = el;
    // 在旧节点前插入新节点
    oldVNode.el.parentNode.insertBefore(el, oldVNode.el);
    //移除旧节点
    this.remove(oldVNode);
    //递归添加子节点
    if (node.children && node.children.length) {
        const children = node.children;
        for (let i = 0, len = children.length; i < len; i++) {
            this.create(el, children[i]);
        }
    }
}

/**
 * 属性比较，相同返回false 不同返回true
 */
proto._diffData = function (data, oldData) {
    if (!data && !oldData) {
        return false;
    }
    if (!data || !oldData && (data !== oldData)) {
        return true;
    }
    //如果存在监听函数，则拷贝到新的虚拟dom里面
    if (oldData['listener']) {
        data['listener'] = oldData['listener'];
    }
    for (let key in oldData) {
        //假设方法不会改变
        if (key === 'func') {
            continue;
        }
        if (key === 'listener') {
            continue;
        }
        const item = data[key];
        const oldItem = oldData[key];
        //递归比较
        if (typeof oldItem === 'object') {
            if (this._diffData(item, oldItem)) {
                return true;
            }
        } else {
            if (item !== oldItem) {
                return true;
            }
        }
    }
    return false;

}
//属性改变 更新参数
proto._updateData = function (node, oldVNode) {
    const data = node.data,
        oldData = oldVNode.data,
        el = node.el;
    for (let key in oldData) {
        const _d = data[key],
            _oldD = oldData[key];
        if (key.indexOf('@') === 0) {
            //事件只有参数会更新
            if (this._diffData(_d['params'], _oldD['params'])) {
                // 参数改变 移除事件
                const name = key.substring(1);
                this._removeEvent(el, name, _oldD);
                // 再重新绑定
                this._addEvent(el, name, _d, node.currentCtx);
            }
            continue;
        }
        switch (key) {
            case 'class':
                if (this._diffData(_d, _oldD)) {
                    this._updateClass(el, _d);
                }
                break;
            case 'style':
                if (this._diffData(_d, _oldD)) {
                    this._updateStyle(el, _d);
                }
                break;
            case 'v-html':
                if (_d !== _oldD) {
                    this._updateHtml(el, _d);
                }
                break;
            default:
                el && el.setAttribute(key, _d);
        }

    }




}
/**
 * 是否相同
 * return true|false (相同|不同)
 */
proto._isSame = function (_new, _old) {
    if (_new === _old) {
        return true;
    } else if ((_new === null || _old === null) && _new !== _old) {
        return false;
    } else if (!this._diffTag(_new, _old)) {
        return true;
    } else {
        return false;
    }
}

//children比较
proto._diffChildren = function (children, oldChildren, parentNode) {
    const len1 = children.length,
        len2 = oldChildren.length;
    for (let i = 0; i < len1; i++) {
        const item = children[i];
        let exist = false; //是否存在
        let old = oldChildren[i] || null;
        //首先判断是否相同位置，列表渲染大概率是相同节点
        if (old && !old._delete && this._isSame(item, old)) {
            exist = true;
            item.el = old.el;
            item.ctx = old.ctx || null;
            old._delete = true;
            this.diff(item, old);
        } else {
            for (let j = 0; j < len2; j++) {
                old = oldChildren[j];
                //找到相同的节点
                if (old && !old._delete && this._isSame(item, old)) {
                    const el = old.el;
                    item.el = el;
                    item.ctx = old.ctx || null;
                    old._delete = true;
                    if (!j === i) {
                        //移动位置
                        const _el = el.cloneNode(true);
                        el.parentNode.removeChild(el);
                        const addr = old[i].el;
                        addr.parentNode.insertBefore(_el, addr);
                    }
                    this.diff(item, old);
                    exist = true;
                    break;
                }
            }
        }
        //不存在相同节点，创建新的
        if (!exist) {
            //oldChildren 可能为空数组
            if (i < len2 - 1) {
                const sibling = this.findExistSibling(oldChildren || [], i);
                if (sibling) {
                    //找到了兄弟节点
                    item && this.createBefore(sibling.el, item);
                } else {
                    //兄弟节点一个也没有
                    item && this.create(parentNode, item);
                }
            } else {
                item && this.create(parentNode, item);
            }
        }
    }
    //删除剩余的节点
    for (let k = 0; k < oldChildren.length; k++) {
        const _item = oldChildren[k];
        if (_item && !_item._delete) {
            this.remove(_item);
        }
    }
    //清空旧数组
    oldChildren.length = 0;
}

/**
 * 根据索引 寻找兄弟节点
 */
proto.findExistSibling = function (list, index) {
    let sibling = null;
    for (let i = index; i < list.length; i++) {
        const item = list[i];
        if (item) {
            sibling = item;
            break;
        }
    }
    return sibling;
}
/**
 * 比较
 */
proto.diff = function (vnode, oldVNode) {
    if (!vnode && oldVNode) {
        this.remove(oldVNode);
        return;
    } else if (!oldVNode && vnode && vnode.parent && vnode.parent.el) {
        this.create(vnode.parent.el, vnode);
        return;
    }
    if (vnode.type === 1 && vnode.static) {
        //静态节点，不做比较
        vnode.el = oldVNode.el;
        vnode.ctx = oldVNode.ctx || null;
        //比较children节点
        if (vnode.children.length || oldVNode.children.length) {
            this._diffChildren(vnode.children, oldVNode.children, vnode.el);
        }
    } else {
        if (this._diffTag(vnode, oldVNode)) {
            //节点改变，移除后重新添加
            this._updateNode(vnode, oldVNode);
        } else {
            vnode.el = oldVNode.el;
            vnode.ctx = oldVNode.ctx || null;
            if (this._diffData(vnode.data, oldVNode.data)) {
                //属性改变 更新参数
                this._updateData(vnode, oldVNode)
            } else {
                vnode.data = oldVNode.data;
            }
            //比较children节点
            if (vnode.children.length || oldVNode.children.length) {
                this._diffChildren(vnode.children || [], oldVNode.children || [], vnode.el);
            }
        }
    }
}


/**
 * 更新
 */
proto.update = function (vnode) {
    // debugger
    this.diff(vnode, this.vnode);
    this.vnode = vnode;
}

export default patch;