
/* Iteration module */

jay.namespace(global, 'jay', function(jay) {

	/* iteration */
	
	jay.Iterator = jay.type(Object, function() {

		this.object = null;
		this.result = null;
		
		this.constructor = function(o) {
			this.object = o;
		}
		
		this.stop = function(result) {
			this.result = result;
			throw 'stop';
		}

		this.iterator = function() {
			return this
		};
				
		this.iterate = function(F) {
			// if the 'result' object or 'stop' function were a property of the iterator you can't use the same iterator for nested loops.
			// so iterate() creates an Iteration which has a result and stop property.
			
			var iteration = new jay.Iteration(this), R;

			try {
				R = this.each(F, iteration);
				if (!jay.isUndefined)
					iteration.result = R;
			} catch (s) {
				if (s != 'stop')
					 throw s
			}
					
			return iteration.result
		};
		
		this.each = jay.abstract(function(F, iteration) {
			
		});
		
	})
	
	jay.Iteration = function(iter) {
		this.iterator = iter;
		this.result = {};
		
		this.stop = function(r) {
			if (!jay.isUndefined(r))
				this.result = r;
			throw 'stop';
		}
	}
	
	jay.PropertyIterator = jay.type(jay.Iterator, function() {
		
		this.each = function(F, iter) {
			var r; for (var p in this.object)
				r = F(this.object[p], p, this.object, iter);
			
			return r;
		};
	})
	
	jay.ArrayIterator = jay.type(jay.Iterator, function() {
		
		this.each = function(F, iter) {
			var r; for (var i = 0; i < this.object.length; i++)
				r = F(this.object[i], i, this.object, iter);
			
			return r
		};
	})
	
	jay.CollectionIterator = jay.type(jay.Iterator, function() {
		
		this.each = function(F, iter) {
			var r; for (var i = 0; i < this.object.length; i++)
				r = F(this.object.item(i), i, this.object, iter);
			
			return r
		};
	})
	
	jay.EachIterator = jay.type(jay.Iterator, function() {
		
		this.each = function(F, iter) {
			return this.object.each(F, iter);
		}
	})
	
	jay.NumberIterator = jay.type(jay.Iterator, function() {
		
		this.each = function(F, iter) {
			var r; for (var i = 0; i < this.object; i++) 
				F(i, i, this.object, iter)
				
			return r
		};
	})
	
	jay.StringIterator = jay.ArrayIterator;
	
	jay.KeyIterator = jay.type(jay.Iterator, function() {

		this.each = function(F, iter) {
			var i = 0, self = this;
			return iterator(this.object).each(function(v, k, o) {
				return F(k, i++, o, iter)
			})
		};
	})
	
	jay.ValueIterator = jay.type(jay.Iterator, function() {

		this.each = function(F, iter) {
			var i = 0, self = this;
			return iterator(this.object).each(function(v, k, o) {
				return F(v, i++, o, iter)
			})
		};
	})
	
	jay.Range = jay.type(Object, function() {
		
		this.constructor = function(first, last, step) {
			this.first = first
			this.last = last
			this.step = step ? step : 1
		}
		
		this.each = function(F, iter) {
			var R; for (var i = this.first, k = 0; i <= this.last; i += this.step)
				R = F(i, k++, this, iter);
			return R;
		}
		
	})
	
	// interface iIterable = { each: function(F) {} }
	// interface iCollection = { length: 0, item: function(i) {} }
	
	jay.iterator = function(o) {
		// if it's an object that specifies it's own iterator (which is how iterators return themselves)
		if (istypeof(o.iterator, Function))
			return o.iterator()
		else if (istypeof(o.each, Function))
			return new EachIterator(o)
		else if (istypeof(o, Number))
			return new NumberIterator(o)
		else if (istypeof(o, String))
			return new StringIterator(o)
		else if (istypeof(o, Array))
			return new ArrayIterator(o)		
		else if (typeof o.item == 'function' && typeof o.length != 'undefined')
			return new CollectionIterator(o)
		else if (typeof o != 'undefined' && o !== null)
			return new PropertyIterator(o)
		else
			throw new Error("Not iterable.")

	}
	
	jay.foreach = function(o, F) {
		return iterator(o).iterate(F)		
	}
	
	// TODO show usage of mapping an array to another array, and an object to another object, and two arrays to one object.
	
	jay.collector = function(/* (o,) F */) {
		// TODO this needs to accept an optional parameter 'acceptVoid', 
		// which causes undefined values to not be discarded. they should be discarded by default, null values should not.
		var o = ((arguments.length > 1) ? arguments[0] : []), F = ((arguments.length > 1) ? arguments[1] : arguments[0]);
		
		return function() {
			var r = F.apply(this, arguments);
			if (typeof r === 'undefined')
				o.push(r);
			return o;
		}
	}
	
	jay.range = function(first, last, step) {
		return new jay.Range(first, last, step)
	}
	
});
