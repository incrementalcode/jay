
/* Misc module */

jay.namespace(global, 'jay', function(jay) {
	
	/* debugging / logging */
	
	jay.assert = function(expr, throwMe) {
		if (!Boolean(expr)) {
			throw jay.getDefault(throwMe, new Error("Assertion failed."))
		}
		return true
	}
	
	jay.debug = function(msg) {
		if (jay.debug.on) console.log(msg);
	};
	
	jay.debug.on = true;
	
	// once everything else is defined
	jay.overlay(global, jay);
});
