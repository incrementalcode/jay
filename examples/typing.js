
namespace({}, 'Type Reflection', function() {
	
	block(function primitives() {

		var neverwas;				
		var nothing = null;			

		assert (isVoid(nothing));
		assert (isVoid(neverwas));

		assert( !istypeof(neverwas, Object) );
		assert( !istypeof(nothing, Object) );
		
		assert (isUndefined(neverwas));
		assert (!isUndefined(nothing));

		assert (isNull(nothing));
		assert (!isNull(neverwas));
		
		
		var one = 1;				assert( istypeof(one, Number) ); assert( istypeof(one, Object) );
		var msg = "hello";			assert( istypeof(msg, String) ); assert( istypeof(msg, Object) );
		var no = false;				assert( istypeof(no, Boolean) ); assert( istypeof(no, Object) );
		
		assert( isheirof(one, Number.prototype) );
		assert( isheirof(msg, String.prototype) );
		assert( isheirof(no, Boolean.prototype) );
		
		assert( !isinstanceof(one, Number) );
		assert( !isinstanceof(msg, String) );
		assert( !isinstanceof(no, Boolean) );
	})
	
	
})

namespace({}, 'Manipulating Objects', function() {

	
	namespace(this, 'Torturing the Existing', function() {
		
		namespace(this, 'Ensuring Values', function() {
			/* using overlay() */
			
			assert(Object.overlay); assert(overlay === Object.overlay);
			assert(Object.mixin === Object.overlay); assert(mixin === overlay);

			function ensuringValues () {

				var nativeIndexOf = Array.prototype.indexOf;
				
				overlay(Array.prototype, {
					indexOf: function(el) {
						return "Nope. Sorry, nothing here. #liesProgramsCanTell"
					}
				})
				
				assert(Array.prototype.indexOf !== nativeIndexOf)

			}
		
		})
		
		namespace(this, 'Ensuring Properties', function() {
			/* using underlay() */

			assert(Object.underlay); assert(underlay === Object.underlay);
				
			function ensuringProperties () {
				
				var nativeIndexOf = Array.prototype.indexOf;
				
				underlay(Array.prototype, {
					indexOf: function(el) {
						return "But I swear, there's nothing here. #liesThisProgramCantTell"
					},
					lieToMe: function(el) {
						return "This array doesn't have that element, but since this is called lieToMe, you know not to believe me...which technically means I'm not lying to you...which means..."
					}
				})
				
				assert(Array.prototype.indexOf === nativeIndexOf)
				assert(typeof Array.prototype.lieToMe() === 'string')
			
			}
						
		})
	
		namespace(this, 'Having Your Way', function() {
			/* using customize() */
			
			assert(Object.customize); assert(customize);
			
			function havingYourWay() {
				
				block(function nothingUseful() {
				
					var nativeIndexOf = Array.prototype.indexOf;
					
					customize(Array.prototype, {
						indexOf: function(el) {
							return "Nope. Sorry, nothing here. #liesProgramsCanTell"
						}
					})
					
					assert(Array.prototype.indexOf === nativeIndexOf)
				
				})
				
				block(function somethingUseful() {

					var isInternetExplorer = true

					customize(Array.prototype, function() {
						if (isInternetExplorer)
							this.indexOf = function() {
								return "Sorry. Not smart enough to hold that elements. #solidTruth"
							};
					})
				})
				
				block(function theGoodStuff() {
					
					customize(Number.prototype, function() {
						
						var secretCodez = Math.random() * 100;
						
						this.encrypt = function(number) {
							return number * secretCodez;
						};
						
						if (this.encrypt) this.decrypt = function(number) {
							return number / secretCodez;
						};
					})
				})
			}
			
		})
	})

	namespace(this, 'Creating Objects', function() {
		
		namespace(this, 'Arbitrary Inheritance', function() {
			
			block(function creation() {
			
				assert (Object.create); assert (create);
				
				var somewhere = {
					country: "South Africa"
				}
				
				var somewhereSpecific = create(somewhere)
				
				somewhereSpecific.city = "Cape Town"
				
				assert (somewhere.country === somewhereSpecific.country)
				assert (somewhere !== somewhereSpecific)
				assert (somewhere.city !== somewhereSpecific.city)
				assert (somewhereSpecific.city === "Cape Town")
				
				assert (constructorOf(somewhereSpecific) !== somewhere)
				assert (constructorOf(somewhereSpecific) === constructorOf(somewhere))
				// assert (!isinstanceof(somewhereSpecific, somewhere))
				// assert (isheirof(somewhereSpecific, somewhere))
			})
			
			block(function specialization() {
				
				assert (Object.specialize); assert (specialize);
				
				var somewhere = {
					country: "South Africa"
				}
				
				var somewhereSpecific = specialize(somewhere, {
					city: "Cape Town"
				})
				
				somewhereSpecific = specialize(somewhere, function() {
					this.city = "Cape Town"
				})
				
				assert (somewhere.country === somewhereSpecific.country)
				assert (somewhere !== somewhereSpecific)
				assert (somewhere.city !== somewhereSpecific.city)
				assert (somewhereSpecific.city === "Cape Town")
			})
	
		})
		
		namespace(this, 'Type Inheritance', function() {
			
			block(function brokenJavascript() {
				
				var Node = function() {}
				
				var Element = function(tagName) {
					this.tagName = tagName
				};
				
				Element.prototype = new Node()
				
				Element.prototype.getElementById = function(id) {}
				
				Element.prototype.byId = Element.prototype.getElementById
				
			})
			
			block(function lessBrokenJavascript() {
				/* with arbitrary inheritance */
				
				var Node = function() {}
				
				var Element = function(tagName) {
					this.tagName = tagName
				}
				
				Element.prototype = Object.create(Node.prototype)

				Element.prototype.getElementById = function(id) {}
				
				Element.prototype.byId = Element.prototype.getElementById

			})
			
			block(function leastBrokenJavascript() {
				/* with object customization */
				
				var Node = function() {}
				
				var Element = function(tagName) {
					this.tagName = tagName
				}
				
				Element.prototype = specialize(Node.prototype, function() {
					
					var classSecret = 1234
					
					this.getElementById = function(id) {}
				
					this.byId = this.getElementById

				})
			})
			
			block(function betterJavascript() {
				/* with constructor creation */
				
				var Node = function() {}
				
				var Element = constructor(Node, function(tagName) {
					this.tagName = tagName
				})
				
				customize(Node.prototype, function() {
					
					var classSecret = 1234
					
					this.getElementById = function(id) {}
				
					this.byId = this.getElementById

				})

			})
			
			block(function superJavascript() {
				/* with first-class prototyping support */
				
				var Node = function() {}
				
				Element = type(Node, function() {
					
					var classSecret = 1234
					
					this.constructor = function(tagName) {
						this.tagName = tagName
					}
					
					this.getElementById = function(id) {}
				
					this.byId = this.getElementById

				})

			})
			
			block(function shortcutToSuperJavascript() {
				/* with constructor creation => which forwards to prototype creation */
				
				var FormElement = constructor(Element, function(id, href) {
					this.id = id
					this.href = href
				})
				
			})
			
			block(function prototypesOverConstructors() {
				/* prototypes are represented by constructors, 
					if you don't have a constructor, a default constructors will be provided for you. */
				
				var Node = function() {}
				
				Element = type(Node, {})
				
				var TableElement = type(Element, function() {
					
					this.addRow = function() {
					
					}
				})
				
				assert (TableElement !== null && TableElement !== undefined)
				assert (isinstanceof(TableElement.prototype, Element))
				assert (isinstanceof(TableElement.prototype, Node))
				assert (TableElement.prototype.addRow)
				
				assert (TableElement.parent === Element)
				assert (TableElement.parent.parent === Node)
			})
		})
	})
})