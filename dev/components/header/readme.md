前端渲染调用方式
import Header from 'components/header/index';

children: [{
        ref: 'head',
        slot: 'header',
        component: Header,
        parameters: {}
        title: '发资讯',
        left: {
            show: true, //是否显示左上角
            class: '', //左上角css类名('go-back' 显示返回键图标 | 'arrow-left-black' 黑色箭头图标 | 'arrow-left-white' 白色箭头图标 | 'home' 主页图标 )
            text: '',//显示的文本
            style: '', //自定义样式
            callback:($dom,cmp)=>{} //点击事件回掉 cmp为当前组件实例
        },
        center: { //优先级低于title只有当title为null或空字符串时，才会生效
            show: true, //是否显示
            type: 'text', //显示类型文本或输入框 'text|input'
            text: 'xxx', //显示的文本
            class: '', //自定义样式类名
            style: '', //自定义样式
            editable: true, //输入框是否可编辑 true|false  
            placeholder: '',
            inputCallback: (value, $dom,cmp) => {}, //type为input editable 为true
            changeCallback: (value, $dom,cmp) => {}, //type为input editable 为true
            clickCallback: ($dom) => {}, //type为input editable 为false 或 type为text
            focusCallback: (value, $dom) => {}, //type为input
            blurCallback: (value, $dom) => {}, //type为input
            enterCallback: (value, $dom) => {}, // 回车键 type为input
            clearCallback: ($dom) => {}, //type为input
        },
        right: {
            show: true, //是否显示右上角
            class: '', //右上角css类名（'share'是分享图标 | 'message'是消息图标 )
            text: '',  //右上角显示文本（为空则不显示）
            style: '', //自定义样式
            callback:($dom,cmp)=>{} //点击事件回掉
        }

    }
]

方法：

    /**
     * 设置中间区域
     * @param {*} options 配置项 具体参照 defaults.center
     */
    setCenter(options) {
    }
    /**
     * 设置左侧区域
     * @param {*} options 配置项 具体参照 defaults.left
     */
    setLeft(options) {
    }
    /**
     * 设置右侧区域
     * @param {*} options 配置项 具体参照 defaults.right
     */
    setRight(options) {
    }

    /***
     * 获取中间输入框的输入内容
     */
    getInputVal()
    setInputVal(text)
    setInputFocus()