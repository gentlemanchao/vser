前端渲染调用方式
import Page from 'components/page/index';

new Page({
    $wraper:$('#app'),
    children:[]
});
或
children: [{
    slot: 'page',
    component: Page,
    children: []
})


插槽：


slot:'header',
slot:'body',
slot:'footer'

方法：
/**
* 滚动页面到指定位置
* @param {number} number 
*/
scrollTop(number)