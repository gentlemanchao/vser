/****
 * 编译模板字符串为ast语法树
 */
import Ast from './ast';

const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp}]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const tagStartOpenReg = new RegExp(`^<(${qnameCapture})`);
const tagEndReg = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const tagStartCloseReg = /^\s*(\/?)>/;
const doctypeReg = /^<!DOCTYPE [^>]+>/i
const commentReg = /^<!\--[^-->]*-->/;
const remarkReg = /<!--[\s\S]*?-->/g
const attrReg = /^\s*(\S*)=(("([^"]*)")|('([^']*)'))/;
const emptyReg = /^\s+/;
const textReg = /^\S[^<]*/;

const parse = function (html) {
    this.ast = new Ast();
    this.index = 0;
    html = this.removeRemark(html);
    this.html = this.decode(html);
    return this.run();
}
/**
 * 移除注释
 */
parse.prototype.removeRemark = function (str) {
    return str.replace(remarkReg, '');
}
parse.prototype.decode = function (str) {
    let s = "";
    if (str.length == 0) return "";
    s = str.replace(/&amp;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    s = s.replace(/<br\/>/g, "\n");
    return s;
}

/**
 * 指针向前移位
 */
parse.prototype.forward = function (n) {
    this.index += n
    this.html = this.html.substring(n)
}

/**
 * 编译语法树
 */
parse.prototype.run = function () {
    while (this.html) {
        if (emptyReg.test(this.html)) {
            //空白
            const empty = this.html.match(emptyReg);
            empty && this.forward(empty[0].length);
        } else if (doctypeReg.test(this.html)) {
            //文档类型
            const doctype = this.html.match(doctypeReg);
            doctype && (this.ast.addDoctype(doctype[0], this.index), this.forward(doctype[0].length));
        } else if (tagStartOpenReg.test(this.html)) {
            //标签开始
            const open = this.html.match(tagStartOpenReg);
            open && (this.ast.addTag(open[1], this.index + 1), this.forward(open[0].length));

        } else if (tagStartCloseReg.test(this.html)) {
            //标签结束
            const close = this.html.match(tagStartCloseReg);
            close &&
                (this.ast.tagClose(close[0], this.index), this.forward(close[0].length));
        } else if (tagEndReg.test(this.html)) {
            //标签闭合
            const end = this.html.match(tagEndReg);
            end && (this.ast.tagEnd(end[0], this.index), this.forward(end[0].length));
        } else if (attrReg.test(this.html)) {
            //属性
            const attr = this.html.match(attrReg);
            attr && (this.ast.addAttr(attr[1], attr[2], this.index), this.forward(attr[0].length));
        } else if (commentReg.test(this.html)) {
            //注释
            const comment = this.html.match(commentReg);
            comment && (this.ast.addComment(comment[0], this.index), this.forward(comment[0].length));
        } else if (textReg.test(this.html)) {
            //文本
            const text = this.html.match(textReg);
            text && (this.ast.addText(text[0], this.index), this.forward(text[0].length));
        }
    }
    return this.ast;
}
export default parse;