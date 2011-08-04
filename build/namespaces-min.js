
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
return ns}})(global.jay);