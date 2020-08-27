import html from './index.html';
import Vser from 'vser';

class Second extends Vser {
    constructor(options) {
        options.template = html;
        super(options);
    }
    created() {
        super.created();
    }
    beforeMounted() {
        super.beforeMounted();
        console.log('---second',this);
    }
    data() {
        return {
            text: 'hello ! i\'m the second component content',
        }
    }
    props() {
        return {
            value: {
                type: Number,
                default: 0
            },
            list: {
                type: Array,
                default: []
            },
            bol: {
                type: Boolean,
                default: false
            },
            "on-click": {
                type: Function
            },
            girl: {
                type: String,
                default: ''
            }

        }

    }
    watcher() {
        return {
            girl(val, oldval) {
                console.log('--girl change:', val);
            },
            bol(val, oldval) {
                console.log('--bol change:', val);
            },
            list(val, oldval) {
                console.log('--list change:', val);
            }

        }

    }
    clickButton(e) {
        this.set({
            text: this.data.text + '-----1'
        });
        this.$emit('clicksecond', {
            hi: 123
        });
        location.hash = location.hash + '-'
    }
    mounted() {
        super.mounted();
        // console.log(this)
    }
    beforeUpdated() {
        super.beforeUpdated();
        console.log('---beforeUpdated:second')
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

export default Second