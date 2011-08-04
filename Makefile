all: dev production

dev:
	cat src/namespaces.js src/typing.js src/ecma5.js src/functions.js src/iteration.js src/misc.js src/thread.js src/publisher.js src/json.js > build/jay.js
	
production:
	jsmin < build/jay.js > build/jay-min.js
	
min:

	jsmin < src/namespaces.js > build/namespaces-min.js
	jsmin < src/typing.js > build/typing-min.js
	jsmin < src/ecma5.js > build/ecma5-min.js
	jsmin < src/functions.js > build/functions-min.js
	jsmin < src/iteration.js > build/iteration-min.js
	jsmin < src/misc.js > build/misc-min.js
	jsmin < src/thread.js > build/thread-min.js
	jsmin < src/publisher.js > build/publisher-min.js
	jsmin < src/json.js > build/json-min.js