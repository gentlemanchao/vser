import html from './index.html';
import './styles/index.style';
import Vser from 'vser';
import config from './config';

export default class Footer extends Vser {
    constructor(options) {
        options.template = html;
        Object.assign(options, config);
        super(options);
    }
    created() {
        super.created();
    }
    beforeMounted() {
        super.beforeMounted();
    }
    data() {
        return {
            menuList: [{
                icon: 'icon-0',
                name: '首页',
                link: 'home',

            }, {
                icon: 'icon-1',
                name: '商品列表',
                link: 'second'
            }, {
                icon: 'icon-2',
                name: '购物车',
                link: 'third'
            }, {
                icon: 'icon-3',
                name: '历史订单',
                link: 'four'
            }, {
                icon: 'icon-4',
                name: '我的',
                link: 'five'
            }]
        }
    }
    mounted() {
        super.mounted();

    }

    /**
     * 点击菜单
     * @param {*} item 
     */
    onClick(item) {
        this.$router.replace({
            name: item.link,
            params: {
                id: 911
            }
        });
    }
    beforeUpdated() {
        super.beforeUpdated();

    }
    updated() {
        super.updated();

    }
    beforeDestroyed() {
        super.beforeDestroyed();

    }
    destroyed() {
        super.destroyed();

    }


}
