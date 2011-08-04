
/* File messages.js */

namespace(global, 'hello', function(hi) {
	
	assert(hi)
	
	namespace(hi, 'messages', function() {
		
		assert(hi.messages)
		
		hi.messages.morning = "Good morning.";
		hi.messages.afternoon = "Good afternoon.";
		hi.messages.night = "Good evening.";
		hi.messages.sleeptime = "Hello. I'm tired, is there something you need.";
		
	})
	
})

/* File languages.js */

namespace(global, 'hello', function(hello) {
	
	namespace(hello, 'languages', function() {
		
		assert(hello.languages)
		
		hello.languages.english = true
		
	})
	
})

/* File hello.js */


namespace(global, 'hello', function(hello) {
	
	hello.greet = function() {
		var hour = new Date().getHours(), msg;
		if (hour >= 21 || hour < 8)
			msg = hello.messages.sleeptime;
		else if (hour >= 8 < 12)
			msg = hello.messages.morning;
		else if (hour >= 12 && hour < 17)
			msg = hello.message.afternoon;
		else if (hour >= 17 && hour < 21)
			msg = hello.message.night;
			
		console.log(msg)
	}
	
})

/* File application.js */

var helloWorld = use(global, 'hello', 'languages', 'messages')

if (!helloWorld.languages.english)
	console.log ("Non comprehendo")
else 
	helloWorld.greet()

// tests
assert(hello)
assert(global.hello)
assert(helloWorld.languages)
assert(helloWorld.messages)
assert(helloWorld.greet)
assert(helloWorld.languages === use(global, 'hello/languages'))