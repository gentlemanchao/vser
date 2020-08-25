//ie8
if (window.Event && !Event.prototype.preventDefault) {
    Event.prototype.preventDefault = function () {
        this.returnValue = false;
    };
}
//ie8
if (window.Event && !Event.prototype.stopPropagation) {
    Event.prototype.stopPropagation = function () {
        this.cancelBubble = true;
    };
}

const _events = function () {
    this.isIe78 = !window.addEventListener;
    this.isIe7 = typeof (Event) === 'undefined';
    this.events = []; //事件队列
}

const proto = _events.prototype;
proto.add = function (el, type, listener, option, isDelegate) {
    const self = this;
    if (!option) {
        option = {};
    }
    let opt = {
        passive: !!option.passive,
        capture: !!option.capture
    }
    let _listener = null;
    if (self.isIe7) {
        //ie7
        _listener = function (e) {
            e.target = e.srcElement;
            e.currentTarget = el;
            e.stopPropagation = function () {
                this.cancelBubble = true;
            };
            e.preventDefault = function () {
                this.returnValue = false;
            };
            listener.call(el, e);
        };
    } else if (self.isIe78) {
        //ie8
        _listener = function (e) {
            e.target = e.srcElement;
            e.currentTarget = el;
            listener.call(el, e);
        };
    } else {
        _listener = function (e) {
            listener.call(el, e);
        };
    }
    this.addEvent(el, type, _listener, opt);
    this.events.push({
        object: el,
        type: type,
        listener: listener,
        _listener: _listener
    });
    return _listener;
}
proto.remove = function (el, type, listener, option) {
    if (!option) {
        option = {};
    }
    const opt = {
        capture: !!option.capture
    }
    let counter = 0,
        events = this.events,
        len = events.length;
    while (counter < len) {
        const eventListener = events[counter];
        if (eventListener.object == el && eventListener.type == type && eventListener._listener == listener) {
            this.removeEvent(el, type, eventListener._listener, opt);
            events.splice(counter, 1);
            break;
        }
        ++counter;
    }
}

proto.addEvent = function (el, type, listener, options) {
    if (!this.isIe78) {
        el.addEventListener(type, listener, options);
    } else {
        el.attachEvent("on" + type, listener);
    }
}
proto.removeEvent = function (el, type, listener, options) {
    if (!this.isIe78) {
        el.removeEventListener(type, listener, options);
    } else {
        el.detachEvent("on" + type, listener);
    }
}

export default _events;