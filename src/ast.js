function makeMap(str, expectsLowerCase) {
    let map = Object.create(null);
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return expectsLowerCase ?
        function (val) {
            return map[val.toLowerCase()];
        } :
        function (val) {
            return map[val];
        }
}
const isBuiltInTag = makeMap('slot,component', true);

const isReservedAttribute = makeMap('key,ref,slot');


const isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
);
const isSVG = makeMap(
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
);
const isTextInputType = makeMap('text,number,password,search,email,tel,url');
const isUnaryTag = makeMap(
    'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
);
const canBeLeftOpenTag = makeMap(
    'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
);
// HTML5 tags
const isNonPhrasingTag = makeMap(
    'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
    'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
    'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
    'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
    'title,tr,track'
);
const isPlainTextElement = makeMap('script,style,textarea', true)
const isReservedTag = function (tag) {
    return isHTMLTag(tag) || isSVG(tag);
};
const sytaxAttrReg = /^(v-model|v-for|v-if|v-html|v-else-if|v-else|v-show|(v-bind)?:[^=]*|v-on:[^=]*|@[^=]*)$/; //语法
const attrTextReg = /^('([^']*)')|("([^"]*)")$/; //属性前后引号
const textSytaxReg = /{{([\s\S]*?)}}/g; //文本语法
const eventReg = /^@|^v-on/; //事件
const funcReg = /^([^(]*)\(([^)]*)\)/; //函数
const bindReg = /^v-bind/;
// 删除前后引号
const deleteStartAndEnd = function (text) {
    const ret = text.match(attrTextReg);
    if (ret) {
        return ret && (ret[2] || ret[4]);
    } else {
        return text;
    }
}
//删除前面的冒号
const deleteColon = function (str) {
    return str.replace(/^:/, '');
}
//map转字符串
const mapToString = function (map) {
    let arr = [];
    for (let key in map) {
        if (Object.prototype.toString.call(map[key]) == '[object Object]') {
            //对象递归
            arr.push(key + ':' + mapToString(map[key]));
        } else if (Object.prototype.toString.call(map[key]) == '[object Array]') {
            //数组转字符串
            arr.push(key + ': [' + map[key].join(',') + ']');
        } else {
            arr.push(key + ':' + map[key]);
        }
    }
    return arr.length ? `{${arr.join(',')}}` : null;
}
const ast = function () {
    this.index = 0;
    this.docType = null;
    this.tree = null;
    this.current = null;
}
ast.prototype.create = function (type) {
    if (type === 1) {
        return {
            type: 1, //1：节点
            tag: null,
            start: 0,
            end: 0,
            static: true, //是否静态节点
            attrList: [], //属性列表
            syntaxList: [], //语法列表
            attrMap: {}, //属性map
            parent: null,
            children: [], //子节点
        };
    } else if (type === 3) {
        return {
            type: 3, //|3：文本
            start: 0,
            end: 0,
            text: '',
            parent: null
        };
    }
}
/**
 * 添加节点
 */
ast.prototype.addNode = function (node) {
    if (node.type === 1) {
        //根节点
        if (!this.tree) {
            this.tree = node;
            this.current = this.tree;
        } else {
            if (this.current.type === 1) {
                this._addChild(this.current, node);
            } else if (this.current.type === 3) {
                this._addChild(this.current.parent, node);
            }
            this.current = node;
        }
    } else if (node.type === 3) {
        if (!this.tree) {
            throw '根节点不能是文本！';
        } else {
            this._addChild(this.current, node);
            this.current = node;
        }
    }
}
/**
 * 递归寻找未闭合节点并添加子节点
 */
ast.prototype._addChild = function (node, child) {
    if (!node.end) {
        //如果前一个节点未结束，则当前节点为前一个节点的子节点
        child.parent = node;
        node.children.push(child);
    } else {
        //如果前一个节点已结束，则当前节点为上一层未闭合节点的子节点
        node.parent && this._addChild(node.parent, child);
    }
}
ast.prototype.addTag = function (string, index) {
    let node = this.create(1);
    node.tag = string;
    node.start = index;
    this.addNode(node);
}
ast.prototype.tagClose = function (string, index) {
    //如果是自闭合标签则设置节点结束
    if (isUnaryTag(this.current.tag)) {
        this.current.end = string.length + index;
    }
}
/**
 * 节点结束
 */
ast.prototype.tagEnd = function (string, index) {
    this._nodeEnd(this.current, string.length + index);
}
/**
 * 递归设置节点结束
 */
ast.prototype._nodeEnd = function (node, index) {
    if (!node.end) {
        node.end = index;
    } else {
        node.parent && this._nodeEnd(node.parent, index);
    }
}
/**
 * 设置节点属性
 * !important
 */
ast.prototype.addAttr = function (name, text, index) {
    name = name.replace(bindReg, '');
    let str = name;
    if (text !== null) {
        text = deleteStartAndEnd(text);
        str = name + '=' + text;
    }
    if (sytaxAttrReg.test(name)) {
        //语法属性
        var option = {
            str: str,
            name: name,
            value: text,
            start: index,
            end: index + str.length
            //事件函数
        };
        if (eventReg.test(name) && funcReg.test(text)) {
            var ret = text.match(funcReg);
            if (ret) {
                option.value = ret[1];
                // 函数参数
                option.params = ret[2].trim().split(',');
            }
        }
        this.current.syntaxList.push(option);
        this.current.static = false;
    } else {
        //静态属性
        this.current.attrList.push({
            str: str,
            name: name,
            value: text,
            start: index,
            end: index + str.length
        });
    }
    this.current.attrMap[name] = text;
}
ast.prototype.addText = function (string, index) {
    if (this.current.type === 3) {
        this.current.text = this.current.text + string;
        this.current.end = string.length + index;
    } else {
        let node = this.create(3);
        node.start = index;
        node.end = string.length + index;
        node.text = string;
        this.addNode(node);
    }
}
ast.prototype.addComment = function () {
    //先不处理注释
}
ast.prototype.addDoctype = function (string) {
    this.docType = string;
}

/**
 * 根据语法树创建渲染函数
 */
ast.prototype.render = function () {
    /**
     * 解析ast并生成渲染函数片段
     * @param {*} node 当前节点
     */
    const _parseNode = function (node) {
        let str = '';
        //普通html节点
        if (node.type === 1) {
            //children节点
            let children = [];
            if (node.children && node.children.length) {
                const nodeChildren = node.children || [];
                while (nodeChildren.length) {
                    children.push(_parseNode(nodeChildren[0]));
                    nodeChildren.splice(0, 1);
                }
            }

            //静态属性
            let attrs = {};
            if (node.attrList && node.attrList.length) {
                const attrList = node.attrList;
                for (let j = 0, lenj = attrList.length; j < lenj; j++) {
                    const attr = attrList[j];
                    attrs[`"${attr.name}"`] = `"${attr.value}"`;
                }
            }

            //动态属性
            let params = {};
            if (node.syntaxList && node.syntaxList.length) {
                const syntaxList = node.syntaxList;
                for (let k = 0, lenk = syntaxList.length; k < lenk; k++) {
                    const syntax = syntaxList[k];
                    const _n = deleteColon(syntax.name),
                        _v = syntax.value;
                    if (_n !== 'v-if' && _n !== 'v-for') {
                        if (eventReg.test(_n)) {
                            params[`"${_n}"`] = {
                                func: _v,
                                params: syntax.params
                            }
                        } else {
                            params[`"${_n}"`] = _v;
                        }
                    }
                }
            }

            //当前节点
            str = '_c("' + node.tag + '",' + mapToString(attrs) + ' ,' + mapToString(params) + ',' + '[' + children.join(',') + ']' + ',' + node.static + ')';
            //判断v-if语句
            if (node.attrMap['v-if']) {
                const _parent = node.parent || null;
                const _children = _parent && _parent.children || [];
                let _arrIf = []; //连续的if 和else if
                let _lastIf = null; //最后的else
                _arrIf.push({
                    condition: node.attrMap['v-if'],
                    str: str
                });
                let ifCount = 0; //if条件计数
                //循环处理 v-if后的 v-else-if 和 v-else节点
                for (let _i = 1, _len = _children.length; _i < _len; _i++) {
                    const _node = _children[_i];
                    if (_node.attrMap['v-else-if']) {
                        _arrIf.push({
                            condition: _node.attrMap['v-else-if'],
                            str: _parseNode(_node)
                        });
                        ifCount++;
                    } else if (typeof _node.attrMap['v-else'] !== 'undefined') {
                        _lastIf = _parseNode(_node);
                        ifCount++;
                    } else {
                        break;
                    }
                }

                let ifStr = _lastIf; //if条件块字符串
                for (let _lenj = _arrIf.length, _j = _lenj - 1; _j >= 0; _j--) {
                    const _ifNode = _arrIf[_j];
                    ifStr = '(' + _ifNode.condition + ') ? ' + _ifNode.str + ': (' + ifStr + ')';

                }
                _children.splice(0, ifCount);
                str = ifStr;
            }
            //判断v-for语句
            if (node.attrMap['v-for']) {
                const arr = node.attrMap['v-for'].split(' in ');
                arr.length == 2 && (str = `_for(${arr[1].trim()},function(${arr[0].trim().replace(/^\(|\)$/g,'')}){
                    return ${str};
                })`);
            }
        } else if (node.type === 3) {
            //文本节点
            let text = node.text;
            //转义单双引号,但是不转义模板语法内的单双引号
            text = text.replace(/'/g, "--escaped-SingleQuotationByVser--")
            text = text.replace(/"/g, "--escaped-DoubleQuotationByVser--")
            let ret = text.replace(textSytaxReg, function (str, sytax) {
                sytax = sytax.replace(/--escaped-SingleQuotationByVser--/g, "'");
                sytax = sytax.replace(/--escaped-DoubleQuotationByVser--/g, '"');
                return `" + (${sytax}) + "`;
            });
            ret = ret.replace(/--escaped-SingleQuotationByVser--/g, "\\'");
            ret = ret.replace(/--escaped-DoubleQuotationByVser--/g, '\\"');
            str = `_t("${ret.replace(/\n/g,'')}")`;
        }
        return str;

    }
    const string = _parseNode(this.tree);
    return `with(this){return ${string}}`;
}
module.exports = ast;