
/* Namespacing module, and bootstrap for Jay. */

if (typeof global == 'undefined') {
	global = window;
}

if (typeof global.jay == 'undefined') {
	global.jay = {};
}

(function(jay) {


	// namespace() will ensure that a given object path exists, and that references to the object can be obtained at any point and will remain valid.
	// the use of namespace is very similar to "scope()" except provides a named object that can be reused by another call to namespace.
	// (either on the global object or some hidden namespace store).
	jay.namespace = function(container, NS, definition) {
		var names = String(NS).split('/')

		for (var i = 0; i < names.length; i++) {
			// immunity against issues with //
			if (names[i] === '')
				continue;
				
			if (typeof container[names[i]] == 'undefined' || container[names[i]] == null) {
				container[names[i]] = {}
			}
			container = container[names[i]]
		}
		
		// TODO this should actually call customize() instead of embedding the code,
		// but that would cause circular dependency because all other files use the namespace function, perhaps they shouldn't?
		if (definition) {
			if (typeof definition == 'function') {
				definition.call(container, container)
			}
			else {
				for (var prop in definition) if (definition.hasOwnProperty(prop))
					container[prop] = definition[prop]
			}
		}
		
		return container
	}
	
	// will ensure that the base NS exists, and that all the given sub namespaces also exist within it, returning the base NS.
	jay.use = function(container, NS /* subNS, subNS */) {
		var ns = jay.namespace(container, NS);
		
		for (var i = 2; i < arguments.length; i++)
			// note: the namespace() func is immune to issues of double //'s
			jay.namespace(container, NS + '/' + arguments[i])
			
		return ns
	}
	
})(global.jay);
