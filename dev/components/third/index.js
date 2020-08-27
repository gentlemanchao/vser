import html from './index.html';
import Vser from 'vser';
class Third extends Vser {
    constructor(options) {
        options.template = html;
        super(options);
    }
    created() {
        super.created();
    }
    beforeMounted() {
        super.beforeMounted();
        console.log('---third', this);
    }
    data() {
        return {
            text: 'hello ! i\'m the third component content',
        }
    }
    mounted() {
        super.mounted();
    }
    beforeUpdated() {
        super.beforeUpdated();
        console.log('---beforeUpdated:thire')

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

export default Third;