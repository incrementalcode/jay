
jay.namespace(global,'jay',function(exports){exports.Publisher=Publisher
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
this.subscribers[topic][i].apply(src,data)}});