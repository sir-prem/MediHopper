const Message = require('../models/message');

// save new messages to DB, and then
// emit the message to the recipient
function saveAndEmitNewMsg(data, io, users) {
    console.log(`${data.fromUsername} (${data.socketId}) says: ${data.msg}`);

    let messageAttributes = {
        content: data.msg,
        fromUsername: data.fromUsername,
        toUsername: data.toUsername
    },
    m = new Message(messageAttributes);

    m.save()
    .then(() => {
        io.to(users[data.toUsername]).emit('to message', data);
    })
    .catch(error => console.log(`error: ${error.message}`));
}

// loads all messages (recent 10) 
// sent to or received by this user
function loadAllMessages(username, io, users) {
    Message.find({
        $or: [
            { fromUsername: username },
            { toUsername: username }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .then(messages => {
            io.to(users[username]).emit("load all messages", messages.reverse());
        });
}

// message history between this user (me) and another specific user
// e.g. only clinic 1 to pgangad, or pgangad to clinic1
function messagesWithUser(myUsername, otherUsername, io, users) {
    Message.find({
        $or: [
            { $and: [{fromUsername:myUsername},{toUsername:otherUsername}] }, 
            { $and: [{fromUsername:otherUsername},{toUsername:myUsername}] }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .then(messages => {
            io.to(users[myUsername]).emit("load messages with user", messages.reverse());
        });
}

module.exports = {
    saveAndEmitNewMsg,
    loadAllMessages,
    messagesWithUser
}