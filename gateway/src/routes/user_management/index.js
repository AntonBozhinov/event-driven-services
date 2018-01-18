const router = require('express').Router();
const broker = require('message-broker');
const events = require('app-events');

router.get('/:id', (req, res) => {
    broker.subscribe('service.user_management.user.get.complete')
    broker.publish('service.user_management.user.get.init', JSON.stringify(req.params), {correlationId: '1234'})
    broker.once('service.user_management.user.get.complete', (info) => {
        res.send(info.content.toString());
    })
});

module.exports = router;