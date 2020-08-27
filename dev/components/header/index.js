import html from './index.html';
import './styles/index.style';
import Vser from 'vser';
import config from './config';


export default class Header extends Vser {
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

    mounted() {
        super.mounted();

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
