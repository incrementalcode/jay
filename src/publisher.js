
/* Publisher module */

jay.namespace (global, 'jay', function(exports) { 

	exports.Publisher = Publisher
	exports.TopicPublisher = TopicPublisher

	// TODO Publisher should be a wrapper around the more general and powerful TopicPublisher.

	function Publisher() {
		this.subscribers = []
	}

	Publisher.prototype.subscribe = function(listener) {
		this.subscribers.push(listener)
	}

	Publisher.prototype.unsubscribe = function(listener) {
		for (var i = 0; i < this.subscribers.length; i++)
			if (this.subscribers[i] === listener)
				delete this.subscribers[i]
	}

	Publisher.prototype.publish = function(src, data) { // should this take arbitrary args and pass on? It's easier to debug when an object is passed on.
		for (var i = 0; i < this.subscribers[topic].length; i++)
			this.subscribers[i].apply(src, data)
	}

	// Topic Publisher (not a subtype of publisher, a different interface)

	function TopicPublisher() {
		this.subscribers = {
		}
	}

	TopicPublisher.prototype.subscribe = function(topic, listener) {
		if (!this.subscribers[topic])
			this.subscribers[topic] = []
	
		this.subscribers[topic].push(listener)
		
		return listener
	}

	TopicPublisher.prototype.unsubscribe = function(topic, listener) {
		if (!this.subscribers[topic])
			return

		for (var i = 0; i < this.subscribers[topic].length; i++)
			if (this.subscribers[topic][i] === listener)
				delete this.subscribers[topic][i]
	}

	TopicPublisher.prototype.publish = function(topic, src, data) {
		if (!this.subscribers[topic])
			return

		for (var i = 0; i < this.subscribers[topic].length; i++)
			this.subscribers[topic][i].apply(src, data)
	}

});

