
if(typeof global=='undefined'){global=window;}
if(typeof global.jay=='undefined'){global.jay={};}
(function(jay){jay.namespace=function(container,NS,definition){var names=String(NS).split('/')
for(var i=0;i<names.length;i++){if(names[i]==='')
continue;if(typeof container[names[i]]=='undefined'||container[names[i]]==null){container[names[i]]={}}
container=container[names[i]]}
if(definition){if(typeof definition=='function'){definition.call(container,container)}
else{for(var prop in definition)if(definition.hasOwnProperty(prop))
container[prop]=definition[prop]}}
return container}
jay.use=function(container,NS){var ns=jay.namespace(container,NS);for(var i=2;i<arguments.length;i++)
jay.namespace(container,NS+'/'+arguments[i])
return ns}})(global.jay);jay.namespace(global,'jay',function(){Object.overlay=function(o,properties,fromDeep){for(var p in properties)if(fromDeep||properties.hasOwnProperty(p))
o[p]=properties[p]
return o}
Object.overlayDeep=function(o,properties){return Object.overlay(o,properties,true)}
Object.underlay=function(o,properties,fromDeep,toDeep){for(var p in properties)if(toDeep&&p in o||!toDeep&&o.hasOwnProperty(p))continue;else{if(fromDeep||properties.hasOwnProperty(p))
o[p]=properties[p]}}
Object.mixin=Object.overlay
jay.overlay=Object.overlay
jay.overlayDeep=Object.overlayDeep
jay.underlay=Object.underlay
jay.mixin=Object.mixin
Object.customize=function(o,definition){if(definition){if(typeof definition=='function'){definition.call(o,o)}
else{for(var prop in definition)if(definition.hasOwnProperty(prop))
o[prop]=definition[prop]}}
return o}
Object.specialize=function(parent,definition){return Object.customize(Object.create(parent),definition)}
jay.customize=Object.customize
jay.create=Object.create
jay.specialize=Object.specialize
jay.wrapper=function(wrappedType,getWrapped){var forwarder={}
for(var prop in wrappedType.prototype)if(wrappedType.prototype.hasOwnProperty(prop)&&wrappedType.prototype[prop]instanceof Function){forwarder[prop]=(function(methodName){return function(){var wrapped=getWrapped.call(this)
return wrapped[methodName].apply(wrapped,arguments)}}(prop))}
return forwarder}
jay.constructor=function(parent,C){return jay.prototype(parent,{constructor:C})}
jay.type=jay.prototype=function(parent,protoDefinition){var proto=jay.specialize(parent.prototype,protoDefinition),C=proto.constructor;if(!(proto.hasOwnProperty('constructor')&&typeof proto.constructor=='function'))
C=function(){return parent.apply(this,arguments)};jay.underlay(C,parent);C.prototype=proto;C.parent=parent;return proto.constructor=C;}
Object.isObject=function(o){return!jay.isVoid(o);}
jay.isNull=function(o){return o===null}
jay.isUndefined=function(o){return typeof o=='undefined';}
jay.isVoid=function(o){return o==null||typeof o=='undefined';}
jay.getDefault=function(a,b){return(jay.isVoid(a))?b:a;}
jay.isPrimitive=function(o){var type=typeof o;if(o===null||type==='undefined')
return false;else if(type==='object'||(type==='function'||Object.prototype.toString.call(o)==='[object Function]'))
return false;else
return true}
jay.typeOf=function(o){var t=(o===null)?'null':typeof o;switch(t){case'undefined':return;case'null':return null;case'string':return String;case'number':return Number;case'boolean':return Boolean;case'function':return Function;default:return('constructor'in o&&Object.prototype.toString.call(o.constructor)=='[object Function]')?o.constructor:Object;}}
jay.constructorOf=function(o){return jay.typeOf(o)}
jay.istypeof=function(o,C){var T=jay.typeOf(o)
if(T===null)
return(C===null)?true:false;else if(typeof T==='undefined')
return(typeof C==='undefined')?true:false;return T===C||T.prototype===C.prototype||jay.isinstanceof(T.prototype,C)}
jay.isinstanceof=function(o,C){return(jay.isPrimitive(o))?false:o instanceof C}
jay.isprimitiveof=function(o,C){return jay.isPrimitive(o)&&jay.istypeof(o,C)}
jay.isheirof=function(o,p){var F=function(){}
F.prototype=p
return o instanceof F||jay.istypeof(o,F)}
jay.isimplementationof=function(o,C){if(typeof o=='undefined'||o==null)
return false;else if(jay.isinstanceof(o,C))
return true;else{for(var p in C.prototype){if((typeof C.prototype[p]=='function'||Object.prototype.toString.call(C.prototype[p])=='[object Function]')&&!(typeof o[p]=='function'||Object.prototype.toString.call(o[p])=='[object Function]'))
return false}
return true}}});jay.namespace(global,'jay',function(jay){jay.underlay(Object,{create:function(parent){if(arguments.length==0)
parent=Object
if(arguments.length>1)
throw new Error("This implementation of Object.create does not support descriptors.")
var F=function(){}
F.prototype=obj
return new F()},keys:function(o){var keys=[],k;for(k in o)if(Object.prototype.hasOwnProperty.call(o,k))
keys.push(k);return keys},values:function(o){var keys=Object.keys(o),vals=[],i=0;for(;i<keys.length;i++)
vals.push(o[keys[i]]);return vals}})
jay.underlay(Date,{now:function now(){return+new Date();}})
jay.underlay(Function.prototype,{bind:function(obj){var slice=[].slice,args=slice.call(arguments,1),self=this,nop=function(){},bound=function(){return self.apply(this instanceof nop?this:(obj||{}),args.concat(slice.call(arguments)));};nop.prototype=self.prototype;bound.prototype=new nop();return bound;}})
jay.underlay(String.prototype,{trim:function(){return this.replace(/^\s\s*/,'').replace(/\s\s*$/,'');},contains:function(str){return this.indexOf(str)>=0}})
jay.underlay(Array,{isArray:function(o){return Object.prototype.toString.call(o)==='[object Array]';}})
jay.underlay(Array.prototype,{item:function(i){return this[i];},indexOf:function(searchElement){"use strict";if(this===void 0||this===null)
throw new TypeError();var t=Object(this);var len=t.length>>>0;if(len===0)
return-1;var n=0;if(arguments.length>0)
{n=Number(arguments[1]);if(n!==n)
n=0;else if(n!==0&&n!==(1/0)&&n!==-(1/0))
n=(n>0||-1)*Math.floor(Math.abs(n));}
if(n>=len)
return-1;var k=n>=0?n:Math.max(len-Math.abs(n),0);for(;k<len;k++)
{if(k in t&&t[k]===searchElement)
return k;}
return-1;},lastIndexOf:function(searchElement){"use strict";if(this===void 0||this===null)
throw new TypeError();var t=Object(this);var len=t.length>>>0;if(len===0)
return-1;var n=len;if(arguments.length>0)
{n=Number(arguments[1]);if(n!==n)
n=0;else if(n!==0&&n!==(1/0)&&n!==-(1/0))
n=(n>0||-1)*Math.floor(Math.abs(n));}
var k=n>=0?Math.min(n,len-1):len-Math.abs(n);while(k>=0)
{if(k in t&&t[k]===searchElement)
return k;}
return-1;},contains:function(el){return this.indexOf(el)>=0},every:function(fun){"use strict";if(this===void 0||this===null)
throw new TypeError();var t=Object(this);var len=t.length>>>0;if(typeof fun!=="function")
throw new TypeError();var thisp=arguments[1];for(var i=0;i<len;i++)
{if(i in t&&!fun.call(thisp,t[i],i,t))
return false;}
return true;},some:function(fun){"use strict";if(this===void 0||this===null)
throw new TypeError();var t=Object(this);var len=t.length>>>0;if(typeof fun!=="function")
throw new TypeError();var thisp=arguments[1];for(var i=0;i<len;i++)
{if(i in t&&fun.call(thisp,t[i],i,t))
return true;}
return false;},forEach:function(fun){"use strict";if(this===void 0||this===null)
throw new TypeError();var t=Object(this);var len=t.length>>>0;if(typeof fun!=="function")
throw new TypeError();var thisp=arguments[1];for(var i=0;i<len;i++)
{if(i in t)
fun.call(thisp,t[i],i,t);}},map:function(fun){"use strict";if(this===void 0||this===null)
throw new TypeError();var t=Object(this);var len=t.length>>>0;if(typeof fun!=="function")
throw new TypeError();var res=new Array(len);var thisp=arguments[1];for(var i=0;i<len;i++)
{if(i in t)
res[i]=fun.call(thisp,t[i],i,t);}
return res;},filter:function(fun){"use strict";if(this===void 0||this===null)
throw new TypeError();var t=Object(this);var len=t.length>>>0;if(typeof fun!=="function")
throw new TypeError();var res=[];var thisp=arguments[1];for(var i=0;i<len;i++)
{if(i in t)
{var val=t[i];if(fun.call(thisp,val,i,t))
res.push(val);}}
return res;},reduce:function(fun){"use strict";if(this===void 0||this===null)
throw new TypeError();var t=Object(this);var len=t.length>>>0;if(typeof fun!=="function")
throw new TypeError();if(len==0&&arguments.length==1)
throw new TypeError();var k=0;var accumulator;if(arguments.length>=2)
{accumulator=arguments[1];}
else
{do
{if(k in t)
{accumulator=t[k++];break;}
if(++k>=len)
throw new TypeError();}
while(true);}
while(k<len)
{if(k in t)
accumulator=fun.call(undefined,accumulator,t[k],k,t);k++;}
return accumulator;},reduceRight:function(callbackfn){"use strict";if(this===void 0||this===null)
throw new TypeError();var t=Object(this);var len=t.length>>>0;if(typeof callbackfn!=="function")
throw new TypeError();if(len===0&&arguments.length===1)
throw new TypeError();var k=len-1;var accumulator;if(arguments.length>=2)
{accumulator=arguments[1];}
else
{do
{if(k in this)
{accumulator=this[k--];break;}
if(--k<0)
throw new TypeError();}
while(true);}
while(k>=0)
{if(k in t)
accumulator=callbackfn.call(undefined,accumulator,t[k],k,t);k--;}
return accumulator;}})});jay.namespace(global,'jay',function(jay){jay.block=function(F){F();return F;}
jay.scope=function(F){return new F()}
jay.abstract=function(F){var A=function(){throw new Error("Function Not Implemented")}
F.prototype.constructor=A;A.prototype=F.prototype;A.isAbstract=true;return A}
jay.bind=function(thisObj){var slice=[].slice,args=(arguments.length>2)?arguments[1]:[],self=arguments[arguments.length-1],nop=function(){},bound=function(){return self.apply(this instanceof nop?this:(obj||{}),args.concat(slice.call(arguments)));};nop.prototype=self.prototype;bound.prototype=new nop();return bound;}
jay.partial=function(){return jay.bind(null,arguments[0],arguments[1])}
jay.call=function(){var context,F=arguments[arguments.length-1];if(arguments.length==1)
return F();else{context=arguments[0];if(arguments.length==2)
return F.apply(context);else
return F.apply(context,[].slice.call(arguments,1,arguments.length-1));}}
jay.apply=function(F){var context,F=arguments[arguments.length-1];if(arguments.length==1)
return F();else{context=arguments[0];if(arguments.length==2)
return F.apply(context);else
return F.apply(context,arguments[1])}}
jay.exec=function(){var F=arguments[arguments.length-1];if(arguments.length==1)
return F();else
return F.apply(null,[].slice.call(arguments,0,argument.length-1));}
jay.noop=function(){}});jay.namespace(global,'jay',function(jay){jay.Iterator=jay.type(Object,function(){this.object=null;this.result=null;this.constructor=function(o){this.object=o;}
this.stop=function(result){this.result=result;throw'stop';}
this.iterator=function(){return this};this.iterate=function(F){var iteration=new jay.Iteration(this),R;try{R=this.each(F,iteration);if(!jay.isUndefined)
iteration.result=R;}catch(s){if(s!='stop')
throw s}
return iteration.result};this.each=jay.abstract(function(F,iteration){});})
jay.Iteration=function(iter){this.iterator=iter;this.result={};this.stop=function(r){if(!jay.isUndefined(r))
this.result=r;throw'stop';}}
jay.PropertyIterator=jay.type(jay.Iterator,function(){this.each=function(F,iter){var r;for(var p in this.object)
r=F(this.object[p],p,this.object,iter);return r;};})
jay.ArrayIterator=jay.type(jay.Iterator,function(){this.each=function(F,iter){var r;for(var i=0;i<this.object.length;i++)
r=F(this.object[i],i,this.object,iter);return r};})
jay.CollectionIterator=jay.type(jay.Iterator,function(){this.each=function(F,iter){var r;for(var i=0;i<this.object.length;i++)
r=F(this.object.item(i),i,this.object,iter);return r};})
jay.EachIterator=jay.type(jay.Iterator,function(){this.each=function(F,iter){return this.object.each(F,iter);}})
jay.NumberIterator=jay.type(jay.Iterator,function(){this.each=function(F,iter){var r;for(var i=0;i<this.object;i++)
F(i,i,this.object,iter)
return r};})
jay.StringIterator=jay.ArrayIterator;jay.KeyIterator=jay.type(jay.Iterator,function(){this.each=function(F,iter){var i=0,self=this;return iterator(this.object).each(function(v,k,o){return F(k,i++,o,iter)})};})
jay.ValueIterator=jay.type(jay.Iterator,function(){this.each=function(F,iter){var i=0,self=this;return iterator(this.object).each(function(v,k,o){return F(v,i++,o,iter)})};})
jay.Range=jay.type(Object,function(){this.constructor=function(first,last,step){this.first=first
this.last=last
this.step=step?step:1}
this.each=function(F,iter){var R;for(var i=this.first,k=0;i<=this.last;i+=this.step)
R=F(i,k++,this,iter);return R;}})
jay.iterator=function(o){if(istypeof(o.iterator,Function))
return o.iterator()
else if(istypeof(o.each,Function))
return new EachIterator(o)
else if(istypeof(o,Number))
return new NumberIterator(o)
else if(istypeof(o,String))
return new StringIterator(o)
else if(istypeof(o,Array))
return new ArrayIterator(o)
else if(typeof o.item=='function'&&typeof o.length!='undefined')
return new CollectionIterator(o)
else if(typeof o!='undefined'&&o!==null)
return new PropertyIterator(o)
else
throw new Error("Not iterable.")}
jay.foreach=function(o,F){return iterator(o).iterate(F)}
jay.collector=function(){var o=((arguments.length>1)?arguments[0]:[]),F=((arguments.length>1)?arguments[1]:arguments[0]);return function(){var r=F.apply(this,arguments);if(typeof r==='undefined')
o.push(r);return o;}}
jay.range=function(first,last,step){return new jay.Range(first,last,step)}});jay.namespace(global,'jay',function(jay){jay.assert=function(expr,throwMe){if(!Boolean(expr)){throw jay.getDefault(throwMe,new Error("Assertion failed."))}
return true}
jay.debug=function(msg){if(jay.debug.on)console.log(msg);};jay.debug.on=true;jay.overlay(global,jay);});jay.namespace(global,'jay',function(threading){threading.Thread=function(continuation,interval){function th(){if(th.isPaused)
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
threading.continual=threading.parallel});jay.namespace(global,'jay',function(exports){exports.Publisher=Publisher
exports.TopicPublisher=TopicPublisher
function Publisher(){this.subscribers=[]}
Publisher.prototype.subscribe=function(listener){this.subscribers.push(listener)}
Publisher.prototype.unsubscribe=function(listener){for(var i=0;i<this.subscribers.length;i++)
if(this.subscribers[i]===listener)
delete this.subscribers[i]}
Publisher.prototype.publish=function(src,data){for(var i=0;i<this.subscribers[topic].length;i++)
this.subscribers[i].apply(src,data)}
function TopicPublisher(){this.subscribers={}}
TopicPublisher.prototype.subscribe=function(topic,listener){if(!this.subscribers[topic])
this.subscribers[topic]=[]
this.subscribers[topic].push(listener)
return listener}
TopicPublisher.prototype.unsubscribe=function(topic,listener){if(!this.subscribers[topic])
return
for(var i=0;i<this.subscribers[topic].length;i++)
if(this.subscribers[topic][i]===listener)
delete this.subscribers[topic][i]}
TopicPublisher.prototype.publish=function(topic,src,data){if(!this.subscribers[topic])
return
for(var i=0;i<this.subscribers[topic].length;i++)
this.subscribers[topic][i].apply(src,data)}});if(!this.JSON){this.JSON={};}
(function(){function f(n){return n<10?'0'+n:n;}
if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+
f(this.getUTCMonth()+1)+'-'+
f(this.getUTCDate())+'T'+
f(this.getUTCHours())+':'+
f(this.getUTCMinutes())+':'+
f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}
function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}
if(typeof rep==='function'){value=rep.call(holder,key,value);}
switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}
gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}
v=partial.length===0?'[]':gap?'[\n'+gap+
partial.join(',\n'+gap)+'\n'+
mind+']':'['+partial.join(',')+']';gap=mind;return v;}
if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==='string'){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}
v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+
mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}
if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}
rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}
return str('',{'':value});};}
if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}
return reviver.call(holder,key,value);}
cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+
('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}
throw new SyntaxError('JSON.parse');};}}());