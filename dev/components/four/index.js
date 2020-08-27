import html from './index.html';
import Vser from 'vser';
class Four extends Vser {
    constructor(options) {
        options.template = html;
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
            text: 'hello ! i\'m the four component content',
        }
    }
    mounted() {
        super.mounted();
    }
    beforeUpdated() {
        super.beforeUpdated();
        console.log('---beforeUpdated:four')

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

export default Four;