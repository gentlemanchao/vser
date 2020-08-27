前端渲染调用方式
import Footer from 'components/footer/index';

children: [{
    slot:'footer',
    component:Footer,
    current:'user'      //当前页，通过data-href的参数选中当前页的tab
}]
