

namespace (global, 'Iteration', function() {
	
	namespace (this, 'Golden Rules', function() {
			
		block(function objectEnumeration() {
		
			var properties = { 1: null, 2: null, 3: null, 4: null }, counter = 1;
			
			foreach (properties, function(v, k) {
				if (properties.hasOwnProperty(k))
					assert(k == counter++)
			})
			
		})
		
		
		block(function arrayIteration() {
		
			var items = [1,2,3,4,5], counter = 1;
			
			foreach (items, function(v, k) {
				assert(v == counter++)
			})
			
			// never try to iterate arrays with for (var i in items), that is property enumeration
			
		})
		
	})
	
	namespace (this, 'Customizable Iteration', function() {
		
		var Range = function(from, to, skip) { skip = getDefault(skip, 1)
			this.each = function(F, iter) {
				var r, n = 0; for (var i = from; i <= to; i += skip)
					r = F(i, n++, this, iter)
				return r
			}
		}
		
		foreach (new Range(5, 10), function(v, k) {
			assert (v == 5 + k)
		})
		
	})
	
	namespace (this, 'Break Free', function() {
		
		var items = [1,2,3,4,5], counter = 1;
		
		foreach (items, function(v, k, array, iter) {
			assert(v == counter++)
			
			if (v  == 3)
				iter.stop()
		})
		
		assert(counter == 4)
		
	})

})