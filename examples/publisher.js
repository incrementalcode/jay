
var publisher = new TopicPublisher()

var changedMe = false

publisher.subscribe('testing', function() {
	changedMe = true
})

publisher.publish('testing', 'parameter')

assert (changedMe)