const Message = require('../models/message');
const User = require('../models/user');
const ChatUtils = require('../utils/chatUtils');

function chat (req, res, next) {
    res.render("chat");
}

function chatDashboard(req, res, next) {
    res.render("clinic-chat-dashboard");
}

async function chatWithUser(req, res, next) {
    const username = req.params.username;
    if (username === 'undefined') {
        req.flash("info","Find a GP and join a queue, before chatting.");
        res.redirect("/user-profile");
    }
    else {
        var recipient = await User.findOne({username: username}).exec();
        var messages = await messagesWithUser(res.locals.currentUser.username, recipient.username, 50);
        var htmlDisplayString = '';
        for (i = messages.length-1; i >= 0; i--) {
            htmlDisplayString += ChatUtils.displayMessageString(messages[i].createdAt, true, messages[i]);
        }

        res.render("chat-with-user", 
                    {
                        recipient:recipient,
                        htmlDisplayString: htmlDisplayString,
                        myRole: res.locals.currentUser.role
                    });
    }
}

// save new messages to DB, and then
// emit the message to the recipient
function saveAndEmitNewMsg(data, io, users) {
    console.log(`${data.fromUsername} (${data.socketId}) says: ${data.content}`);

    let messageAttributes = {
        content: data.content,
        fromUsername: data.fromUsername,
        toUsername: data.toUsername
    },
    m = new Message(messageAttributes);

    m.save()
    .then(() => {
        io.to(users[data.toUsername]).emit('to message', data);
        io.to(users[data.fromUsername]).emit('to message', data);
        sendersToRecipient(data.toUsername, io, users);
    })
    .catch(error => console.log(`error: ${error.message}`));
}

// loads all messages (recent 'limitby' amount) sent to or received by this user
// by the give role i.e. 'patient' or 'doctor'
async function loadAllMessagesByRole(username, io, users, role, limitby) {
    var filteredMessages;
    var messages = await Message.find({
        $or: [
            { fromUsername: username },
            { toUsername: username }
            ]
        })
        .sort({ createdAt: -1 });
    var filteredMessages = await filterMessagesByRole(messages, role, limitby);
    io.to(users[username]).emit(`load ${role} messages`, filteredMessages.reverse());
}

// filter the messages array by role, i.e. messages
// with doctors, or messages with patients
// note: limitby limits how many filtered messages are returned
async function filterMessagesByRole(messages, role, limitby) {
    var filteredMessages = [];
    var message, toUser, fromUser;

    for (i = 0; i < messages.length; i++) {
        
        message = messages[i];
        toUser = await User.findOne({username: message.toUsername}).exec();
        fromUser = await User.findOne({username: message.fromUsername}).exec();

        // 'admin' role will always be one party of the message
        // the "other party" will be either 'doctor' or 'patient' role
        // so we figure this out here
        var otherPartyRole = '';
        if (toUser.role === 'admin') {
            otherPartyRole = fromUser.role;
        }
        else { // fromUser.role === 'admin'
            otherPartyRole = toUser.role;
        }

        // now that we have the "other party's" role, if it matches the 
        // role we are filtering for, then we push this message into the 
        // 'filteredMessages' output array
        if (otherPartyRole === role) {
            filteredMessages.push(message);
        }

        // if we reach the limit of number of msgs to display,
        // then break out of 'for loop'
        if (filteredMessages.length === limitby) {
            break;
        }
    }
    return filteredMessages;

}

// message history between this user (me) and another specific user
// e.g. only clinic 1 to pgangad, or pgangad to clinic1
async function messagesWithUser(myUsername, recipientUsername, limitby) {
    console.log(`CTRLR JS: recipient username is: ${recipientUsername}`);
    var messages = await Message.find({
        $or: [
            { $and: [{fromUsername:myUsername},{toUsername:recipientUsername}] }, 
            { $and: [{fromUsername:recipientUsername},{toUsername:myUsername}] }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(limitby);

    return messages;
}

// function that returns arrays for all patients and all doctors 
// who have sent messages to this recipient (clinic)
async function sendersToRecipient(recipientUsername, io, users) {
    var senderUsernames = [];
    var doctorUsernames = [];
    var patientUsernames = [];

    var senderUsernames = await Message.find({toUsername:recipientUsername})
                                        .distinct('fromUsername');

    for (i = 0; i < senderUsernames.length; i++) {
        var user = await User.findOne({username: senderUsernames[i]}).exec();

        if(user.role === 'doctor') {
            doctorUsernames.push(senderUsernames[i]);
        }
        else { // user.role === 'patient'
            patientUsernames.push(senderUsernames[i]);
        }
    }

    console.log(`patient senders: ${patientUsernames}`);
    console.log(`doctor senders: ${doctorUsernames}`);

    io.to(users[recipientUsername]).emit("doctors to me", doctorUsernames);
    io.to(users[recipientUsername]).emit("patients to me", patientUsernames);

}

module.exports = {
    chat,
    chatDashboard,
    chatWithUser,
    saveAndEmitNewMsg,
    loadAllMessagesByRole,
    messagesWithUser,
    sendersToRecipient
}