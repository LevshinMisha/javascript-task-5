'use strict';

class Listener {
    constructor(event, context, handler, { several = -1, through = 1 }) {
        this.event = event;
        this.context = context;
        this.handler = handler;
        this.several = several;
        this.through = through;
        this.count = 0;
    }

    notify() {
        if (this.several - this.count !== 0) {
            if (this.count % this.through === 0) {
                this.handler.call(this.context);
            }
            this.count++;
        }
    }
}

module.exports = () => {
    return {
        listeners: [],

        on: function (event, context, handler) {
            this.listeners.push(new Listener(event, context, handler, {}));

            return this;
        },

        off: function (event, context) {
            this.listeners = this.listeners.filter(item => !(item.context === context &&
                (item.event === event || item.event.startsWith(event + '.'))));

            return this;
        },

        emit: function (event) {
            this.listeners.filter(item => item.event === event).forEach(item => item.notify());

            if (event.includes('.')) {
                this.emit(event.slice(0, event.lastIndexOf('.')));
            }

            return this;
        },

        several: function (event, context, handler, times) {
            this.listeners.push(new Listener(event, context, handler,
                { several: times > 0 ? times : -1 }));

            return this;
        },

        through: function (event, context, handler, frequency) {
            this.listeners.push(new Listener(event, context, handler,
                { through: frequency > 0 ? frequency : 1 }));

            return this;
        }
    };
};

module.exports.isStar = true;
