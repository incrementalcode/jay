
jay.namespace(global,'jay',function(threading){threading.Thread=function(continuation,interval){function th(){if(th.isPaused)
return
function processTasks(){th.isScheduledToProcess=false
if(th.isPaused||th.queue.length==0||th.queue[0].isBlocked)
return
var prevThread=thread
thread=th
var task=th.queue.shift()
task()
if(th.queue.length>0)
scheduleProcessing()
thread=prevThread}
scheduleProcessing()
function scheduleProcessing(){if(th.isScheduledToProcess)
return
th.isScheduledToProcess=true
th.timer=setTimeout(processTasks,th.interval)}}
th.isScheduledToProcess=false
th.isPaused=false
th.timer=null
th.interval=(typeof interval=='undefined')?100:interval
th.queue=[]
th.locks=[]
th.schedule=function(F){if(typeof F!='function')throw new Error("Trying to schedule a non-function!!")
th.queue.push(F)
th()
return F}
th.sched=th.schedule
th.sync=function(F){var thisObj=null
var args=null
function blocker(){F.apply(thisObj,args)}
blocker.isBlocked=true
th.schedule(blocker)
return function(){thisObj=this
args=arguments
delete blocker.isBlocked
th()}}
th.remove=function(F){typed(F,Function)
console.log(' looking for F to remove from thread')
for(var i=0;i<th.queue.length;i++)
if(th.queue[i]==F){console.log('found an occurence of F to remove from thread')
th.remove(i)
i--}}
var suprRemove=th.remove;th.remove=function(i){if(!isinstanceof(i,Number))
suprRemove.call(this,i)
if(i>th.queue.length-1){th.queue.splice(i,1)
if(i==0)
th()}}
th.find=function(F){var p=[]
for(var i=0;i<th.queue.length;i++)
if(th.queue[i]==F)
p.push(i)
return p}
th.blocked=th.sync
th.block=function(duration){if(typeof duration!='undefined'&&duration==0)
return
th.schedule(function(){th.sleep(duration)})}
th.sleep=function(duration){if(typeof duration=='undefined'||duration==null||duration>0){clearInterval(th.timer)
th.isPaused=true
if(typeof duration!='undefined'&&duration>=0)
setTimeout(th.wakeup,duration)}}
th.wakeup=function(){th.isPaused=false
th()}
th.kill=function(){th.sleep()}
if(continuation instanceof Function){th.schedule(function repeater(){var result=continuation.call(th)
if(result instanceof Function){continuation=result
th.schedule(repeater)}})}
return th}
threading.thread=threading.Thread()
threading.parallel=function(F,interval){var th=Thread(F,interval)
th()
return th}
threading.continual=threading.parallel});