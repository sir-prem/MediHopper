// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

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

        const session = socket.request.session;
        console.log(`saving sid ${socket.id} in session ${session.id}`);
        session.socketId = socket.id;
        session.save();

        socket.on('from message', (data) => {    
            console.log(`${data.fromUsername} (${data.socketId}) says: ${data.msg}`);

            io.to(users[data.toUsername]).emit('to message', data);
        });
    });
}

module.exports = {
    chatInit
}