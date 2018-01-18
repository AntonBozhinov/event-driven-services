# App events
This module is a set of event names mapped in a conventional way

### Event naming convention
Every event name must consist of a entity group, entity name, target object, and an action. 
```
'<group>.<name>.<object>.<action>.<status>'
```
examples:

- 'db.mysql.table.created'
- 'service.auth.user.authenticated'
- 'service.gallery.image.added'


### Event mapping convention
Event mapping is done by mapping the event string to a action describing key

example:
```
{
    CONNECTING: 'module.message_broker.driver.connecting',
    CONNECTED: 'module.message_broker.driver.connected',
    CHANNEL_CREATED: 'module.message_broker.channel.created',
    PUBLISH: 'module.message_broker.topic.publish',
    SUBSCRIBE: 'module.message_broker.topic.subscribe',
    SERVICE_READY: 'module.message_broker.service.ready'
}
```