const Message = require('../models/message');

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

// message history between clinic user and a specific patient
// e.g. only clinic 1 to pgangad, or pgangad to clinic1
function messagesWithPatient(clinicUsername, patientUsername, io, users) {

}

module.exports = {
    loadAllMessages
}