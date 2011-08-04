
jay.namespace(global,'jay',function(jay){jay.block=function(F){F();return F;}
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
jay.noop=function(){}});