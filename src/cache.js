/**
 * 组件节点缓存，用于单页应用需要缓存组件的场景，
 * 或者其他需要缓存当前组件的场景
 *  
 * */

export default class Cache {
    constructor(ctx) {
        this.fragmentEl = document.createElement('div'); //组件临时碎片，用于暂存缓存的节点
        this.parentEl = null; //组件父节点
        this.rootEl = null; //组件根节点
        this.nameSpace = ctx; //组件实例
        this.cached = false; //是否已缓存
    }
    /**
     * 寻找根节点
     */
    findRootEl(vnode) {
        if (vnode.el) {
            return vnode.el;
        } else if (!vnode.el && vnode.ctx) {
            return this.findRootEl(vnode.ctx.$$_tree)
        } else {
            return null;
        }

    }
    /**
     * 缓存
     */
    cache() {
        if (this.cached) {
            console.error('cache fail ,it\'s already cached!');
            return;
        }
        const ctx = this.nameSpace;
        const vdomTree = ctx.$$_tree;
        const rootEl = this.rootEl = this.findRootEl(vdomTree);
        const parentEl = this.parentEl = rootEl.parentNode;
        if (rootEl) {
            parentEl.removeChild(rootEl);
            this.fragmentEl.appendChild(rootEl);
            this.cached = true;
        }
    }
    /**
     * 恢复
     */
    recover() {
        if (!this.cached) {
            console.error('recover fail ,it\'s not been cached!')
            return;
        }
        const rootEl = this.rootEl;
        rootEl.parentNode.removeChild(rootEl);
        this.parentEl.appendChild(rootEl);
        this.cached = false;
    }

}