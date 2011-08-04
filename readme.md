Jay
====

Jay is a "standard" library (a core / lanuage framework) which aims to make Javascript a more friendly language,
by providing a framework for best practices and easier conceptualization of how to use Javascript.

Jay also overcomes several "design errors" that exist in the Javascript language,
which have been hindering easy understanding of the language and how to use it.

It overcomes deficiencies in the language by providing mechanisms that Javascript
does not itself contain:

	- Type Definition and Checking
	- Object Manipulation
	- Namespacing
	- Customizable (& Functional) Iteration
	- Concurrency
	
Documentation
-------------

See the QuickStart file for a concise overview of the functionality and API of the Jay framework.

A more lengthy guide is also available which goes into more detail about the understanding and benefits of the framework,
but I probably haven't included that in this release yet, feel free to contact me about it.


Design Philosophy
-----------------

Jay was started as an attempt to overcome the complexities and confusions that seem apparent especially to beginners.
These complexities were a result of several design errors and the current immaturity of the Javascript language.

In an attempt to make Javascript more friendly I set out to uncover the nature of the language,
so that it could inspire how we can best use and understand the language.

This understanding has enabled me to morph Javascript into a language that is beautiful, intuitive and powerful.

The mechanisms provided by Jay are guided by how I believe the nature of Javascript indicates we should conceptualize the language,
for the sake of achieving greater power in our development.

While the mechanisms are always designed to extend the functionality of Javascript,
all functionality is targeted solely by what the language indicates about itself,
as opposed to implementing arbitrary features.

This means that the library is much less likely to make assumptions that user's don't share
or to force impositions that limit flexibility.

It also means that the library is easier to learn and understand.
After all, "power" is a factor of functionality *and ease*.


Defining Objects
----------------

The story of Jay starts by taking a look at how Javascript enables us to define objects.

Javascript is a highly dynamic language. 
Perhaps the most influential characteristic of the language is that
the properties on objects can be altered at any time, they can be added, removed, or values swapped.
As a result, mechanisms to do this form the basis of how we use the language.


The 3 C's of Object Specification

	Construction (Instantiation)
	
		newObject = new Object()
	
	Customization (Manipulation)
		
		- object = customize(object, definition)
		
		- object = overlay(object, layerObject)
		
		- object = underlay(object, layerObject)
		
	Creation (Inheritance)
	
		- newObject = create(parentObject)
		
		- newObject = specialize(parentObject, definition)
		

Defining Types
--------------

The greatest contribution that the Jay standard library makes to the language
is in it's uncovering of the truely elegant nature of the type system
that sits within the Javascript language.


Jay brings the prototypal nature of Javascript to the fore-front of the language,
defining a type is done through the action of prototyping. This is the nature of the language,
the type system is powered by prototypes, and the type is represented by the constructor of the prototype.

`NewType = type(ParentType, definition)`
	
	var Person = type(Mammal, function() {
		this.constructor = function(name) {
			this.name = name
		}
		this.talk = function() {
			alert("My name is " + name)
		}
	})
	
A shortcut if you only want to specify the constructor function:

`NewType = constructor(ParentType, constructorFunction)`
		
	var Person = constructor(Mammal, function(name) {
		this.name = name
	})

Type Checking
-------------

Jay makes significant changes to Javascript's type checking mechanisms that overcome several design errors and extend the power of type checking.

### Characteristics:

Three "void" types, the two sub types are mutually exclusive.

	- isVoid(value)

	- isUndefined(value)

	- isNull(value)

An "object" type is anything that is not void. All "object" values inherit from Object.prototype.

	- isObject(value)

A primitive value is one that cannot have new properties set on it, but they still inherit from their base types.
An instance value is the opposite, one that can have new properties set on it.

	- isPrimitive(value)

	- isInstance(value)


### Type Heirarchies:

You can determine the exact type (constructor) of a value. If it is a void value, then the actual value (either undefined or null) is returned instead of a constructor. 
This is very useful for checking the exact type.

	- Constructor = typeOf(value)

You can check if a value inherits from or is a certain a type, do not try use a void value as a constructor though.

	- istypeof(value, Constructor)
	
You can check that a value is primitive and inherits from or is a certain type, likewise for whether it is an instance and not a primitive.

	- isprimitiveof(value, Constructor)
	
	- isinstanceof(value, Constructor)
	
You can check whether a value inherits from an arbitrary value, as opposed to checking that it inherits from a type.

	- isheirof(value, parentValue)

You can check whether an value provides all the methods that are defined on a type's prototype, regardless of whether there is inheritance.
 
	- isimplementationof(value, Constructor)
	
	
Namespacing
-----------

A namespace is a plain object that is available within a given container, under the nested structure specified by the namespace symbol.

The namespace system uses / (forward slashes) as it's delimiter, so that you can use domain names as a namespace. 
You can avoid giving delimiters at all by using nested namespace definitions.

The most important utility of the namespace mechanism is that it means you can access a symbol whether or not it exists yet,
and the contents in the namespace will always be preserved if it already exists.

You can customize the namespace object without concern to whether it exists yet or not. 
	
	- namespace(container, NS, definition)
	
The `container` parameter allows you to easily work within hierarchies, start off by using the `global` variable as the container.
The definition function is passed the namespace object as the first parameter, this is just a plain object that properties can be placed in, 
and that can then be used as the container parameters for any sub namespace calls. You can also pass in an object instead of function, 
in which case the given object will be mixed into the namespace object.

If you are just using the namespace, as opposed to defining it, then you can obtain an alias to the base namespace, 
while also ensuring that several sub namespaces within it exist.

	- use(container, NS [ subNS, subNS, ... ])
	

Events
------

	new TopicPublisher()
	
	TopicPublisher.prototype:
		
		- subscribe(topic, listener)
		
		- unsubscribe(topic, listener)
		
		- publish(topic, src, data)

	
Iteration
---------

Using the foreach() function you can iterate over any type of object when you would have previously had to use different iteration constructs depending on the object type.
Customizable iteration (by overriding each()) will be used by the foreach() function.

	foreach(object, iterationFunc)

There are some useful iterators provided such as range() which dynamically iterates over a range instead of pre-computing the whole set.

	range(from, to, step)

Functional programming techniques like comprehensions / mapping etc are supported by combining a collector() function and foreach().

	collector(func)

	var doubles = foreach (arr, collector(function(el) { return el * 2; }))


Concurrency
-----------

Jay provides what I think is a really nice, and unique library to support concurrency and asynchronous nature of Javascript.

The concept of *fibers* are used to manage the often messy tangle of asynchronous callbacks and the inability to work over more than one thread.

With the fibers library you can queue asynchronous functions onto a fiber (thread) and synchronize the threads at any point so that asynchronous callbacks are
executed in sequential order.

	var thread = new Thread(), answer = null;
	
	$.ajax('/', { 
		success: thread.sync(function(responseText) {
			answer = responseText; 
			alert("I'm about to tell you the answer" );
		})
	})	
	
	// the function below will only be executed after the previous block on the thread has been unblocked.
	thread.schedule(function() { 
		alert('The answer is ' + answer);
	})


It is also possible to easily mimmick `parallel()` and `continous()` (never ending) functions.

	
	var series = [1];

	continual(function() {
		
		return function calculateSomeMoreResults() {
			for (var count = 0, n = series[series.length]; count < 10; count++) {
				series.push(n * (n + 1))
			}
		}
		
	})

	


ECMA 5 Assurance
----------------

ECMA 5 is the latest standardization for Javascript. It introduces several methods on the built-in types.
The latest engines implement most of this standard, the other engines usually don't implement any of it. 

Jay provides assurance that all those new methods, except for a few that cannot be mimmicked, can be used in older browsers.

The source for this is taken from Mozilla.

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
		
