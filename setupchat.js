// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
const ChatController = require('./controllers/chat');

function chatInit (io, sessionMiddleware, passport, users) {

    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));

    io.use((socket, next) => {
        if (socket.request.user) {
            next();
        } else {
            next(new Error('unauthorized'))
        }
    });

    io.on('connect', async (socket) => {
        console.log(`new connection ${socket.id}`);

        socket.on('disconnect', () => {    
            console.log('user disconnected');  
        });
        
        socket.on('whoami', (cb) => {
            cb(socket.request.user ? socket.request.user.username : '');
        });

        //map usernames to their socket ID's as key-value pairs
        users[socket.request.user.username] = socket.id;

        await ChatController.loadAllMessagesByRole(socket.request.user.username, io, users, 'patient', 50);
        await ChatController.loadAllMessagesByRole(socket.request.user.username, io, users, 'doctor', 50);
        ChatController.sendersToRecipient(socket.request.user.username, io, users);

        const session = socket.request.session;
        console.log(`saving sid ${socket.id} in session ${session.id}`);
        session.socketId = socket.id;
        session.save();

        // save new messages to DB, and then
        // emit the message to the recipient
        socket.on('from message', (data) => {    
           ChatController.saveAndEmitNewMsg(data, io, users);
        });
/*
        console.log(`HERE 1`);
        socket.on('recipient user', (data) => {
            console.log(`SETUPCHAT JS: recipient username is: ${data.recipientUsername}`);
            ChatController.messagesWithUser(socket.request.user.username, 
                                            data.recipientUsername, io, users, 50);
        });
        console.log(`HERE 2`);
        */

    });
}

module.exports = {
    chatInit
}