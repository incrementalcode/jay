Jay Quick Start
===============

## Object Manipulation

1) `create(parentObject)` : a new object will be created which inherits directly from parentObject.

	Object.create({ type: 'Animal' });

2) `overlay(ontoObject, overlayObject)` : the properties of overlayObject will be overlaid on top of actualObject. Only the properties directly on overlayObject will be used, overlayDeep can be used instead to include inherited properties of overlayObject.

	overlay(obj, {
		organization: 'ngspinners'
	});

	overlayDeep(obj, {});

3) `underlay` : the properties of underlayObject will be copied onto actualObject, only if the properties do not already exist on actualObject.

	underlay(String.prototype, {
		contains: function() { return false; }
	});

4) `customize(customizeObject, definitionFunc | overlayObject)` : A more general version of mixins. definitionFunc is a function that will be executed with actualObject as it's context object (assigned to `this`). An overlayObject can also be accepted instead of a definitionFunc in which it acts the same as `overlay`.

	var tim = customize({}, function() {
		this.name = "Tim";
	});
	
	tim = customize({}, {
		name: "Tim"
	});
	
5) `specialize(parentObject, definitionFunc | definitionOverlay)` : this is a combination of `create` and `customize`, so a new object is created which inherits from parentObject, and has the given customization run on it.

	var tim = specialize(Object.prototype, function() {
		this.name = "Tim"
	});
	
## Type Definition

1) `type(parentConstructor, protoypeCustomization)` : creates and returns a new type that has prototypal inheritance from parentConstructor, the prototype is customized using prototypeCustomization which is sent to `specialize`. The prototype definition should specify a constructor property, otherwise a default constructor will be created. Types are represented by their constructor, which is returned by `type`. The action of creating a type can be called prototyping, and `prototype` can be used an alias of `type`.
	

	var Person = type(Object, {
		constructor: function(name) {
			this.name = name;
		}
	});

	var Girl = type(Person, function() {
	
		this.constructor = function(name, weight) {
			Person.call(this, name);

			this.weight = weight + 10;
		}
		
		this.eat = function() {
			this.weight += 10;
		}
	})
	
2) `constructor(parentConstructor, childConstructor)` : as a shortcut when no customization needs to take place on the new prototype, the childConstructor can be specified directly in a call to `constructor`, which just forwards to `type`. This is useful if all you need to do is setup the type heirarchy, which will be done in this call.

	var Person = constructor(Object, function(name) {
		this.name = name;
	});
	
## Type Checking

1) `isVoid` : void is a pseudo type that consists of the null and undefined types.

	isVoid(nothing);
	
2) `isNull` : when a variable has been set to the null value.

	isNull(null);
	
3) `isUndefined` : when a variable is undefined (no value has been assigned to it).

	isUndefined(variable);
	
4) `isObject` : when a value is not void, it is considered an object. Objects inherit from Object.prototype and can have properties retrieved off them.

	isObject(null);

5) `isPrimitive` : a primitive is an object (i.e. non-void) that can *not* have properties set on it, a function is not primitive.

	isPrimitive("hello"); // "hello" is primitive
	isPrimitive(new String("hello")); // this is not primitive

6) `isInstance` : an instance is an object (i.e. non-void) that can *also* have properties set on it. 

	isInstance("hello"); // "hello" is a primitive, not an instance
	isInstance(new String("hello")); // this is an instance

7) `istypeof` : checks if a variable inherits from a certain type, the whole hierarchy is checked not just direct membership. This accepts the type constructor itself, and works with primitive / instance variables (unlike the builtin instanceof operator).

	istypeof("hello", String); // this is true


8) `isprimitiveof` : checks if a variable inherits from a certain type and is a primitive value of that type.

	isprimitiveof("hello", String); // this is true
	
9) `isinstanceof` : checks if a variable inherits from a certain type and is an instance value of that type. This is just an alias for the builtin `instanceof` operator.

	isinstanceof("hello", String); // this is false

10) `isheirof` : this is not type checking, it just directly checks the inheritance chain between two objects, which may have been created using Object.create (arbitrary inheritance).
	
	isheirof(new String(), String.prototype); // this is true
	
11) `typeOf` : returns the exact constructor that created a variable (only as accurately as possible).

	typeOf("hello") == String; // this is true


## Namespacing

1) `namespace(container, NS, definition)` : will ensure that the property structure given in the NS string (delimited by / not .) exists within container, and then pass the last object on that chain to the definition function.

	namespace(global, "ngspinners.com/jay", function(jay) {
		// the property chain will now look like : global['ngspinners.com']['jay']
		jay.version = "0.1 or something";
		
		namespace(jay, "iteration", function(it) {
			// the it namespace object may have already been defined, this ensures it isn't overridden
			
			it.foreach = ...
		})
	})

2) `use(container, NS, NS [ subNS, subNS, ... ])` : returns a reference to the topmost namespace object in the NS string, while ensuring that the subNS namespaces exist within that as well.


## Iteration


1) `foreach(object, iterationFunc)` : will execute iterationFunc once for each element in object, regardless of what type of object it is or iteration it needs, supports custom iterators on objects.

	// foreach will return the value returned from the last iteration
	var six = foreach([1,2,3], function(number, k) {
		return number * 2;
	})

2) `collector(iterationFunc)` : returns a function that wraps iterationFunc, collecting all the return values of iterationFunc into an array that is returned instead of the value itself.

	var doubles = foreach([1,2,3], collector(function(n) {
		return n * 2;
	}))

3) `range(from, to, step)` : will return an iterator that dynamically iterates through values between from and to incrementing by step.

	var tens = foreach(range(10, 100, 10), collector(function(n) { return n; }));

4) `each(iterationFunc, iteration)` : customize the iteration of an object by putting an each function on it.

	this.each = function(F, iter) {
		var r;
		
		for (var i = 0; i < this.object.length; i++)
			r = F(this.object[i], i, this.object, iter);
		
		return r
	};


## Events

1) `TopicPublisher()` : a constructor for a topic publisher object

	var publisher = new TopicPublisher()

2) `TopicPublisher.prototype.subscribe(topic, listener)` : subscribe a listener to any events of the given topic

	var listener = publisher.subscribe('load', function() {
		alert('we love alert')
	})
	
3) `TopicPublisher.prototype.unsubscribe(topic, listener)` : unsubscribe a listener function from a certain topic

	publisher.unsubscribe('load', listener)

4) `TopicPublisher.prototype.publish(topic, src, dataArray)` : will execute all of the publisher's listeners for the given topic, using src as the `this` object, and the dataArray as the list of argument values given to the listeners

	publisher.publish('load', window, [event, somethingelse])


## Fibers


1) `Thread()` : constructs a new thread object that can queue and synchronize asynchronous function.

	var thread = new Thread();
	
2) `Thread.prototype.schedule(func)` : schedules func to be executed asynchronously, only after all the previously scheduled functions have been executed.

	var i = 1;

	thread.schedule(function() { alert(i + ' hello'); }) // '2 hello'
	
	i++;
	
3) `Thread.prototype.sync(func)` : will synchronize the thread at this point, meaning that the thread will only clear this function when some external caller unblocks the thread by executing the unblocker function that is `sync` returns. All functions scheduled after this one will only be executed after this function has been blocked. 

	var answer = null;
	
	$.ajax('/', { 
		success: thread.sync(function(responseText) { answer = responseText; alert("I'm about to tell you the answer" ); })
	})	
	
	// the function below will only be executed after the previous block on the thread has been unblocked.
	thread.schedule(function() { alert('The answer is ' + answer); })

4) `Thread.protoype.sleep(duration)` : will prevent the thread from executing any more functions on it's queue for a fixed amount of time (`duration` milliseconds). If duration is not given the thread will sleep until wakeup() is called.

	thread.schedule(function() { alert("You'll only hear from me after two seconds"; });
	
	thread.sleep(2000)

5) `Thread.prototype.wakeup()` : will wakeup the thread after it has been put to sleep.

	thread.sleep();

	thread.wakeup();

6) `parallel(continuation, interval)` : creates a thread that will effectively execute forever, in parallel to other threads. The continuation function must return the function to execute (i.e. itself) on the next task slice (which will only occur after interval milliseconds, default 0), the thread continues to execute as long as a function is returned and the thread is not put to sleep.

	var series = [1];

	parallel(function() {
		
		return function calculateSomeMoreResults() {
			for (var count = 0, n = series[series.length]; count < 10; count++) {
				series.push(n * (n + 1))
			}
		}
		
	})
	
	var altSeries = [1];
	
	parrallel(function() {
		return function calculateSomeMoreResults() {
			for (var i = altSeries.length; i < series.length; i++) {
				altSeries.push(series[i] * (series[i] + 2))
			}
		}
	})
	
7) `continual(func, interval)` : a straight alias for `parallel`, it will create a function (thread) that executes continually (there is no end to it), this is here for greater readability (and because it sounds cool).
	
	var sprinter = continual(function() {
		sprinter.distance = 0;
		
		return function() {
			sprinter.distance += 1;	
		}
	}, 0)

	var leaper = parallel(function() {
		leaper.distance = 0;
		
		return function() {
			leaper.distance += 50;
	
			if (leaper.distance > sprinter.distance)
				sprinter.kill()
		}
		
	}, 100)
	
	
## ECMA 5

The ecma 5 functions that can be mimmicked in ecma 3 browsers have been included so that you can safely use them in all browsers.

Object:
	
	- create(parent)
	
	- keys(o)
	
	- values(o)
	
Date:

	- now()
	
Function.prototype:

	- bind(object [arg, arg ...])
	
String.prototype:
	
	- trim()
	
	- contains(str)
	
Array:

	- isArray()
	
Array.prototype:

	- item(i)
	
	- indexOf(searchElement [ fromIndex ])
	
	- lastIndexOf(searchElement [ fromIndex])
	
	- contains(el)
	
	- every(func [thisp])
	
	- some(func [thisp])
	
	- forEach(func [thisp])
	
	- map(func [thisp])
	
	- filter(func [thisp])
	
	- reduce(func [initialValue])
	
	- reduceRight(callbackfn [initialValue])
	
