
jay.namespace(global,'jay',function(jay){jay.underlay(Object,{create:function(parent){if(arguments.length==0)
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
return accumulator;}})});