'use strict';

getEmitter.isStar = true;
module.exports = getEmitter;

class Listener {
    constructor(event, context, handler, { several, through }) {
        this.event = event;
        this.context = context;
        this.handler = handler;
        this.several = several;
        this.through = through;
        this.on = true;
        this.count = 0;
    }

    notify() {
        if (this.on && (this.several - this.count !== 0)) {
            if (this.count % this.through === 0) {
                this.handler.call(this.context);
            }
            this.count++;
        }
    }
}

function getEmitter() {
    return {
        listeners: [],

        listen: function (event, context, handler, options) {
            this.listeners.push(new Listener(event, context, handler, options));

            return this;
        },

        on: function (event, context, handler) {
            return this.listen(event, context, handler, { several: -1, through: 1 });
        },

        off: function (event, context) {
            this.listeners.forEach(listener => {
                if (listener.context === context && (listener.event.startsWith(event + '.') ||
                    listener.event === event)) {
                    listener.on = false;
                }
            });

            return this;
        },

        emit: function (event) {
            this.listeners.forEach(item => {
                if (item.event === event) {
                    item.notify();
                }
            });

            if (event.includes('.')) {
                this.emit(event.slice(0, event.lastIndexOf('.')));
            }

            return this;
        },

        several: function (event, context, handler, times) {
            if (times > 0) {
                return this.listen(event, context, handler, { several: times, through: 1 });
            }

            return this.on(event, context, handler);
        },

        through: function (event, context, handler, frequency) {
            if (frequency > 0) {
                return this.listen(event, context, handler, { several: -1, through: frequency });
            }

            return this.on(event, context, handler);
        }
    };
}
