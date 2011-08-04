
/* Threading module */

jay.namespace(global, 'jay', function(threading) {
	
	/* This threading module allows multiple threads to be managed, using task-slicing. 
		It can schedule functions to run sequentially, potentially after a block has been cleared.
		It can synchronize asynchronous callbacks back into the sequential processing of a given thread.
		Threads can be put to sleep, woken up and killed. The thread rate of execution can be controlled.
		Continually executing functions can be implemented, by returning itself if it still wants to be executed again.
	*/
	
	threading.Thread = function(continuation, interval) {
		
		function th() {
			
			/* This is the thread function, it processes what ever has been scheduled for execution.
				The thread execution blocks whenever it encounters a function that has been blocked. */
			
			if (th.isPaused)
				return
				
			function processTasks(){
				
				th.isScheduledToProcess = false
				
				if (th.isPaused || th.queue.length == 0 || th.queue[0].isBlocked)
					return
				
				// set this as the current thread
				var prevThread = thread
				thread = th
				
				var task = th.queue.shift()
				
				task()
				
				if (th.queue.length > 0)
					scheduleProcessing()
				
				// restore the previous thread (this is only needed because the main thread doesn't actually execute so it doesn't restore itself)
				thread = prevThread
				
			}
			
			scheduleProcessing()
			
			function scheduleProcessing() {
				
				if (th.isScheduledToProcess)
					return
					
				th.isScheduledToProcess = true
				
				th.timer = setTimeout(processTasks, th.interval)
			}

		}
		
		th.isScheduledToProcess = false
		th.isPaused = false
		th.timer = null
		th.interval = (typeof interval == 'undefined') ? 100 : interval
		th.queue = []
		th.locks = []
		
		th.schedule = function(F) { if (typeof F != 'function') throw new Error("Trying to schedule a non-function!!")
			// we add the function onto the queue for normal invocation by the thread executor,
			
			th.queue.push(F)
			
			th()
			
			return F
		}
		
		th.sched = th.schedule
		
		th.sync = function(F) {
			
			/* A blocked function is put onto the thread. Once unblocked it will pass it's invocation to the actual function. 
				The thread cannot unblock the function. */
			
			var thisObj = null
			var args = null
			
			function blocker() {
				F.apply(thisObj, args)
			}
			
			blocker.isBlocked = true
			
			th.schedule(blocker)
			
			/* A function is returned to the caller, which can be invoked to unblock the scheduled function and run the thread. 
				The caller is obviously responsible for unblocking the function. */
			
			return function() {
				thisObj = this
				args = arguments
				delete blocker.isBlocked
				th()
			}
		}
		
		// if a function scheduled on the thread will no longer be called (an error occured in the code that would call it),
		// then it needs to be removed from the thread. The question is whether we remove all occurences of the function, 
		// just the first or only let the user remove by position index. 
		// The schedule function returns the function passed to it, however, the sync function needs to returns the function that unblocks the function passed to it, so it can be passed to caller,
		// so there is no way to remove that function passed to it unless that function itself is tracked separately, this can be very confusing to users (that they don't get the function itself but rather an unblocker)
		// to get the position indexes of a function find can be used().
		// ERROR the sync() function doesn't actually queue the function that it receives (which is a required feature).
		// the only way to remove a syncd function is to run the unblocker sync returns, and then remove the origin function before returning control to the scheduler.
		// TODO take out all these functions so people don't need to know this complication.
		// Alternatively, we can keep a list of functions that are on the queue and what positions they are in, so that the find and remove functions work properly,
		// as opposed to being complicated by the blocker functions...
		
		// remove all occurences of a function on the thread queue
		th.remove = function(F) { 
			typed(F, Function)
			console.log(' looking for F to remove from thread')
			for (var i = 0; i < th.queue.length; i++)
				if (th.queue[i] == F) {
					console.log ('found an occurence of F to remove from thread')
					th.remove(i)
					i--
				}
		}
		
		// remove the function at position i on the thread queue
		var suprRemove = th.remove;
		th.remove = function(i) {
			if (!isinstanceof(i, Number))
				suprRemove.call(this, i)
				
			if (i > th.queue.length - 1) {
				th.queue.splice(i, 1)
				if (i == 0) // if this one was blocking the thread make sure the thread is scheduled to process itself
					th()
			}
		}
		
		// get all the positions of function F in the thread queue
		th.find = function(F) {
			var p = []
			for (var i = 0; i < th.queue.length; i++)
				if (th.queue[i] == F)
					p.push(i)
			
			return p
		}
		
		th.blocked = th.sync // TODO what should we call this, just 'block'? then rename 'block' to 'wait'? or can the user just 'schedule(blocked(function(){}))'?
		
		th.block = function(duration) {
			// TODO, this function should probably block regardless of whether the thread is woken up while it is still blocked, 
			// i.e. use a function.isBlocked the same as sync does. These issues need to be made clear to the user.
			if (typeof duration != 'undefined' && duration == 0)
				return
				
			// the blocking only happens after tasks already scheduled are completed
			th.schedule(function() {
				// put the thread to sleep for the given duration
				th.sleep(duration)
			}) 
		}
		
		th.sleep = function(duration) {
			// pausing happens immediately
			if (typeof duration == 'undefined' || duration == null || duration > 0) { // don't really sleep if duration == 0
				clearInterval(th.timer)
				th.isPaused = true
				
				if (typeof duration != 'undefined' && duration >= 0)
					setTimeout(th.wakeup, duration)
			}
		}
				
		th.wakeup = function() {
			th.isPaused = false
			th()
		}
		
		th.kill = function() {
			// whats the difference between kill and sleep? 
			th.sleep()
		}
		
		if (continuation instanceof Function) {
			th.schedule(function repeater() {
				
				var result = continuation.call(th)

				// automatically scheduling itself it perhaps less flexible than we would like, make it return the function to reschedule. we want to be able to keep the thread alive, when the continuation has finished.
				
				if (result instanceof Function) {
					continuation = result
					th.schedule(repeater) // it makes a big difference if the continuation reschedules itself before or after it's execution, if before then the stuff it schedules in it's execution is never reached.
				}
				
			})
		}
		
		return th
	}
	
	threading.thread = threading.Thread() // the main thread
	
	threading.parallel = function(F, interval) {
		
		var th = Thread(F, interval)
		
		th()
		
		return th
		
	}
	
	threading.continual = threading.parallel
	
	// ends the current task so that the current thread receives control again, which can be passed on to another thread. (the task equivalent of a functions 'return').
	//threading.yield = function() { // yield(value, to)
		// throw some exception that the Thread executor receives, if we are in the top level thread (which is faked), then you can't yield (without an error going to the host application).
	//}
	
});
