// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
const Message = require('./models/message');
const User = require('./models/user');
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

    io.on('connect', (socket) => {
        console.log(`new connection ${socket.id}`);

        socket.on('disconnect', () => {    
            console.log('user disconnected');  
        });
        
        socket.on('whoami', (cb) => {
            cb(socket.request.user ? socket.request.user.username : '');
        });

        //map usernames to their socket ID's as key-value pairs
        users[socket.request.user.username] = socket.id;

        /*
        Message.find({
            $or: [
                { fromUsername: socket.request.user.username },
                { toUsername: socket.request.user.username }
                ]
            })
            .sort({ createdAt: -1 })
            .limit(10)
            .then(messages => {
                io.to(users[socket.request.user.username]).emit("load all messages", messages.reverse());
            });
            */
        ChatController.loadAllMessages(socket.request.user.username, io, users);


        const session = socket.request.session;
        console.log(`saving sid ${socket.id} in session ${session.id}`);
        session.socketId = socket.id;
        session.save();

        socket.on('from message', (data) => {    

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
        });
    });
}

module.exports = {
    chatInit
}