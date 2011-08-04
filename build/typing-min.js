
jay.namespace(global,'jay',function(){Object.overlay=function(o,properties,fromDeep){for(var p in properties)if(fromDeep||properties.hasOwnProperty(p))
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
return true}}});