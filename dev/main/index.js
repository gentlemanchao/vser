import html from './index.html';
import Vser from 'vser';
import config from './config';
export default class Layout extends Vser {
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
            show: true,
            show2: false,
            test: 'ccc'
        }
    }

    mounted() {
        super.mounted();
    }

    onClick() {
        console.log('click')
    }
    onMsg(data) {
        console.log('msg', data)
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