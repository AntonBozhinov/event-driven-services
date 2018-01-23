module.exports = {
    CONNECTING: 'module.message_broker.driver.connecting',
    CONNECTED: 'module.message_broker.driver.connected',
    CHANNEL_CREATED: 'module.message_broker.channel.created',
    PUBLISH: 'module.message_broker.topic.publish',
    SUBSCRIBE: 'module.message_broker.topic.subscribe',
    SERVICE_READY: 'module.message_broker.service.ready',
    REGISTER_EVENT: 'module.message_broker.event.register.init',
    EVENT_REGISTERED: 'module.message_broker.event.register.done',
    REGISTER_EVENT_ERROR: 'module.message_broker.event.register.error',
    DELETE_EVENT: 'module.message_broker.event.delete.init',
    EVENT_DELETED: 'module.message_broker.event.delete.done',
    DELETE_EVENT_ERROR: 'module.message_broker.event.delete.error',
    UPDATE_EVENT: 'module.message_broker.event.update.init',
    EVENT_UPDATED: 'module.message_broker.event.update.done',
    UPDATE_EVENT_ERROR: 'module.message_broker.event.update.error',
    ADD_LISTENER: 'module.message_broker.listener.add.init',
    LISTENER_ADDED: 'module.message_broker.listener.add.done',
    ADD_LISTENER_ERROR: 'module.message_broker.listener.add.error',
    REMOVE_LISTENER: 'module.message_broker.listener.remove.init',
    LISTENER_REMOVED: 'module.message_broker.listener.remove.done',
    REMOVE_LISTENER_ERROR: 'module.message_broker.listener.remove.error',
    REMOVE_ALL_LISTENERS: 'module.message_broker.listener.removeAll.init',
    ALL_LISTENERS_REMOVED: 'module.message_broker.listener.removeAll.done',
    REMOVE_ALL_LISTENERS_ERROR: 'module.message_broker.listener.removeAll.error',
};
