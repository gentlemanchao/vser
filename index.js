import Parse from './src/parse'; //编译模板
import VNode from './src/vnode'; //虚拟dom
import Patch from './src/patch'; //渲染和更新渲染
import Cache from './src/cache'; //组件缓存
/***
 * 组件基类
 * 
 * 
 */

export default class Vser {
    constructor(options) {
        this.$$_el = options.el || null; //当前组件插入的插槽dom的对象
        this.template = options.template || null; //string|function //当前组件的html模板片段(运行时编译) | 模板渲染函数(构建时编译生成)
        this.parent = options.parent || null; //父组件实例
        this.$$_style = options.style && options.style.toString && options.style.toString() || options.style; //样式会在组件销毁时移除
        this.$$_styleEl = null;
        this.$$_customerComponents = Object.assign({}, Vser.components, options.components || {}); //自定义组件列表
        this.$$_vNode = new VNode();
        this.$$_cache = new Cache(this);
        this.$$_childrenVnode = options.$$_childrenVnode || []; //插槽内部的虚拟节点
        this.$$_siblings = options.$$_siblings || null; //兄弟子节点
        this.$$_patch = null; //
        this.$$_tree = null; //虚拟dom树
        this.$$_funcQueue = []; //下一帧回调函数队列
        this.$$_nextTickPending = false; //下一帧锁
        this.$$_nextRenderTickPender = false; //下一个渲染帧锁
        this.$$_created = false; //是否已经执行created生命周期函数
        this.$$_beforeMounted = false; //是否已经执行beforeMounted生命周期函数
        this.$$_mounted = false; //是否已经执行mounted生命周期函数
        this.data = this.data();
        this.$$_props = options.$$_props || {}; //上级组件传递的props参数
        this._$$_props = this.props(); //prop的预定义属性
        this.props = {}; //当前组件的props参数
        this.$$_watcher = this.watcher(); //数据监听队列
        this.$parameters = options.parameters || {};
        this.$$_renderFunc = null; //模板解析后的渲染函数
        this.$router = options.router || null;
        this.$refs = {}; //当前组件内子组件实例引用
        this.children = []; //子组件数组
        this._init();
    }


    /**
     * 组件创建后挂载前
     */
    created() {}
    data() {
        return {};
    }
    props() {
        return {};
    }
    watcher() {
        return {};
    }
    /**
     * 组件挂载前
     */
    beforeMounted() {}
    /**
     * 组件已挂载
     */
    mounted() {}
    /**
     * 视图更新前
     */
    beforeUpdated() {
        //重新渲染
        this.$$_setProps();
        this.$$_tree = this.$$_render();
        this.$$_patch.update(this.$$_tree);
        /**
         * 递归更新子组件
         */
        const recursion = function (childrenVNodes) {
            childrenVNodes.forEach((vnode) => {
                if (vnode && vnode.ctx && vnode.ctx.$$_checkPropsChange) {
                    vnode.ctx.$$_props = vnode.data || {};
                    vnode.ctx.$$_checkPropsChange();
                    vnode.children && vnode.children.length && recursion(vnode.children);
                }
            })
        }
        recursion(this.$$_tree.children || []);
        this.$nextTick(() => {
            //触发已更新生命周期方法
            this.updated();
        });
    }

    /**
     * 视图更新后
     */
    updated() {

    }
    /**
     * 组件销毁前
     */
    beforeDestroyed() {
        const children = this.children || [];
        for (let i = 0, len = this.children.length; i < len; i++) {
            const child = children[i];
            child && child.beforeDestroyed && child.beforeDestroyed();
        }
    }
    /**
     * 组件已销毁
     */
    destroyed() {
        const children = this.children || [];
        for (let i = 0, len = this.children.length; i < len; i++) {
            const child = children[i];
            child && child.destroyed && child.destroyed();
        }

        this.$$_removeStyle()
        this.$$_patch.remove(this.$$_tree);
        this.children = [];
    }

    /**
     * 编译前端模板（运行时编译）
     */
    $$_parseTemplate() {
        if (isFunction(this.template)) {
            this.$$_renderFunc = this.template;
        } else if (this.template) {
            const ast = new Parse(this.template);
            let funcStr = ast.render();
            funcStr = funcStr.replace(/[\r\n]/g, '');
            this.$$_renderFunc = new Function(funcStr);
        }
    }
    /**
     * 添加样式，组件销毁时会自动移除
     */
    $$_createStyle() {
        if (!this.$$_style) return;
        let el;
        if (isBelowIe9()) {
            //ie7 8 不支持给style标签设置 innerHTML 和 innerText
            el = document.createElement('div');
            el.innerHTML = `<style>${this.$$_style}</style>`;
        } else {
            el = document.createElement('style');
            el.innerHTML = this.$$_style;
        }
        this.$$_styleEl = el;
        const head = document.getElementsByTagName('head')[0];
        head && head.appendChild(el);
    }
    /**
     * 移除样式
     */
    $$_removeStyle() {
        if (!this.$$_style || !this.$$_styleEl) return;
        this.$$_styleEl.parentNode.removeChild(this.$$_styleEl);
    }
    /**
     * 初始化
     */
    _init() {
        //模板编译
        this.$$_parseTemplate();
        this.$$_createStyle();
        //触发组件已创建生命周期方法
        this.$$_setProps();
        this.$$_created = true;
        this.created();
        // 递归渲染组件 并触发beforeMounted 和 mouted生命周期方法
        this.$$_initRender();
        this.$$_mounted = true;
        this.mounted();
    }

    /**
     * 检测当前组件prop参数是否改变，由父组件参数更新时触发，如果改变，则触发beforeUpdate生命周期方法
     */
    $$_checkPropsChange() {
        const _props = this.$$_props || {}; //上级组件传递的参数
        const props = this._$$_props || {}; //预定义的props配置
        for (let key in props) {
            if (this.$$_propsChange(key, _props[key], this.props[key])) {
                //如果有props参数发生改变 则触发beforeUpdate生命周期方法
                this.beforeUpdated();
                break;
            }
        }
    }
    /**
     * 设置当前组件props参数的值
     */
    $$_setProps() {
        const _props = this.$$_props || {}; //上级组件传递的参数
        const props = this._$$_props || {}; //预定义的props配置
        const reservedKey = ['_c', '_t', '_for'];
        for (let key in props) {
            const prop = props[key];
            if (reservedKey.indexOf(key) !== -1) {
                console.error(`参数:"${key}"是保留关键字，禁止使用`);
                break;
            }
            const canTriggerWatcher = (key in this.$$_watcher) && this.$$_propsChange(key, _props[key], this.props[key]);
            const oldval = canTriggerWatcher ? deepCopy(this.props[key]) : null;
            if (typeof (_props[key]) !== 'undefined') {
                const value = _props[key];
                //参数类型校验 只做提醒不报错
                const type = prop.type;
                const valueType = typeOf(value);
                if (Number.name) {
                    //ie浏览器不校验参数类型
                    if (typeOf(type) === 'array') {
                        //多参数类型
                        let typeNames = [];
                        for (let i = 0, len = type.length; i < len; i++) {
                            const _type = type[i];
                            const typeName = _type.name.toLowerCase();
                            typeNames.push(typeName);
                            if (valueType === typeName) {
                                typeNames.length = 0;
                                break;
                            }
                        }

                        if (typeNames.length) {
                            console.error(`参数:"${key}"类型有误，应该是:"${typeNames.join(',')}"之一, 实际是:"${valueType}"`);
                        }

                    } else {
                        //单个参数类型
                        const typeName = type.name.toLowerCase();
                        if (valueType !== typeName) {
                            console.error(`参数:"${key}"类型有误，应该是:"${typeName}", 实际是:"${valueType}"`);
                        }
                    }
                }

                //校验通过
                this.props[key] = _props[key];
                canTriggerWatcher && this.$$_triggerWatcher(key, this.props[key], oldval);
            } else {
                this.props[key] = prop.default || null;
                canTriggerWatcher && this.$$_triggerWatcher(key, this.props[key], oldval);
            }
        }
    }

    /**
     * 检测props参数是否改变  created生命周期后的数据更新才有效
     * @param {*} key 
     */
    $$_propsChange(key, val, oldval) {
        if (!this.$$_created) return false; //对于created生命周期前的不触发
        if (typeof val === 'undefined') return false; //对于未赋值的属性，不触发
        if (!diffData(val, oldval)) {
            return true;
        }
        return false;
    }
    /**
     * 检测数据监听  created生命周期后的数据更新才会触发
     */
    $$_triggerWatcher(key, val, oldVal) {
        const callback = this.$$_watcher[key] || null;
        callback && isFunction(callback) && callback(val, oldVal);
    }

    /**
     * 初始化前端渲染
     */
    $$_initRender() {
        this.$$_beforeMounted = true;
        this.beforeMounted();
        if (this.$$_el && this.$$_renderFunc) {
            this.$$_tree = this.$$_render();
            this.$$_patch = new Patch(this.$$_el, this.$$_tree, this);
        } else {
            console.error(`找不到组件${this.constructor.name||''}的插槽`);
        }
    }


    /**
     * 渲染
     */
    $$_render() {
        return this.$$_renderFunc.call(Object.assign(this, VNode.prototype));
    }

    /**
     * data数据更新
     * 调用方法： 对象方式：this.set({xxx:xxx,yyy:yyy}); 或key-value的方式： this.set(this.data,xxx,xxx);
     * @param {object | *} target  {x:1,y:2}键值对 或 目标参数
     * @param {String|Number} key 参数名或数组索引
     * @param {*} value 参数值
     */
    set(target, key, value) {
        let changed = false; //是否发生值的改变 没发生改变则不触发渲染
        if (arguments.length === 3) {
            changed = !diffData(target[key], value);
            target[key] = value;
        } else if (arguments.length === 1 && typeOf(target) === 'object') {
            for (let key in target) {
                if (!changed && !diffData(this.data[key], target[key])) {
                    changed = true;
                }
                this.data[key] = target[key];
            }
        }
        changed && this.$$_nextRenderTick();
    }

    /**
     * 触发事件
     */
    $emit() {
        const args = arguments;
        const name = args[0];
        const _func = this.$$_props[`@${name}`];
        if (_func && _func.func && typeof _func.func === 'function') {
            let _args = [];
            if (_func.params && _func.params.length) {
                _args = _func.params;
            } else {
                for (let i = 1; i < arguments.length; i++) {
                    _args.push(arguments[i]);
                }
            }
            _func.func.apply(this.parent, _args);
        }
    }
    /**
     * 下一帧延时方法
     * @param {Function} callback 下一帧执行的回调方法
     */
    $$_nextFrame(callback) {
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame =
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (_callback) {
                    return window.setTimeout(_callback, 1000 / 60);
                };
        }
        window.requestAnimationFrame(function () {
            callback && callback();
        });
    }
    /**
     * 下一帧渲染
     */
    $$_nextRenderTick() {
        if (this.$$_nextRenderTickPender) return;
        this.$$_nextRenderTickPender = true;
        this.$$_nextFrame(() => {
            this.beforeUpdated();
            this.$$_nextRenderTickPender = false;
        });
    }
    /**
     * 下一帧延时方法
     * @param {Function} callback 下一帧执行的回调方法
     */
    $nextTick(callback) {
        this.$$_funcQueue.push(callback);
        if (this.$$_nextTickPending) return;
        this.$$_nextTickPending = true;
        this.$$_nextFrame(() => {
            const funcQueue = this.$$_funcQueue.slice(0);
            for (let i = 0; i < funcQueue.length; i++) {
                funcQueue[i]();
            }
            this.$$_funcQueue.length = 0;
            this.$$_nextTickPending = false;
        });
    }
}

/**
 * 全局组件配置
 */
Vser.components = {};
/**
 * 注册全局组件方法
 */
Vser.component = function (name, componentObj) {
    if (!name) return;
    if (typeof componentObj !== 'function') return;
    Vser.components[name] = componentObj;
}

/**
 * 使用插件
 */
Vser.use = function (plugin) {
    if (!plugin) return;
    if (typeof plugin.install == 'function') {
        plugin.install(Vser);
    }
}


const isFunction = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
}

/**
 * 递归比较两个值是否相同 相同为true不同为false
 * @param {*} data1 
 * @param {*} data2 
 */
const diffData = function (data1, data2) {
    const type = typeOf(data1);
    if (type !== typeOf(data2)) {
        return false;
    }
    //第一步简单判断全等或者是否是NaN
    if (data1 === data2 || (data1 !== data1 && data2 !== data2)) {
        return true;
    } else if (type === 'boolean' || type === 'number' || type === 'string' || type === 'null' || type === 'undefined') {
        return data1 === data2;
    } else if (type === 'array' && data1.length === data2.length) {
        for (let i = 0; i < data1.length; i++) {
            if (!diffData(data1[i], data2[i])) {
                return false;
            }
        }
        return true;
    } else if (type === 'object') {
        for (let key in data1) {
            if (!diffData(data1[key], data2[key])) {
                return false;
            }
        }
        return true;
    } else {
        //1. function date regExp直接不做比较返回不相同 
        //2. 数组长度不一致
        return false;
    }
}

/***
 * 对象或数组的深拷贝
 * @param {Object|Array} 用于拷贝的对象或数组
 */
const deepCopy = function (data) {
    const t = typeOf(data);
    let o;

    if (t === 'array') {
        o = [];
    } else if (t === 'object') {
        o = {};
    } else {
        return data;
    }

    if (t === 'array') {
        for (let i = 0; i < data.length; i++) {
            o.push(deepCopy(data[i]));
        }
    } else if (t === 'object') {
        for (let i in data) {
            o[i] = deepCopy(data[i]);
        }
    }
    return o;
};

/**
 * 获取数据类型
 * @param {} obj 用于判断的数据
 */
const typeOf = function (obj) {
    const toString = Object.prototype.toString;
    const map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
    };
    return map[toString.call(obj)];
};

//?未用
const isBelowIe9 = function () {
    if (navigator.appName == "Microsoft Internet Explorer") {
        let version = navigator.appVersion.split(";")[1].trim();
        if (version === "MSIE 8.0" || version === "MSIE 7.0" || version === "MSIE 6.0") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * 创建唯一id
 * @param string name 名称 添加到id前的名称
 * @return xxx_jpw09e2p9ehqkqjf8p
 */
const createId = function (name) {
    let id = new Date().getTime().toString(36);
    id += Math.random()
        .toString(36)
        .substr(3);
    return (name ? (name + '_') : '') + id;
}