const express=require('express');
const path=require('path');
const http=require('http');
const socketio=require('socket.io');
const formatMessage=require('./utils/messages.js');
const {userJoin,getCurrentUser,userLeaves,getRoomUsers}=require('./utils/users.js');

const app=express();
const server=http.createServer(app);
const io=socketio(server);
//set static folder
app.use(express.static(path.join(__dirname,'public')));

const botName='ChartCord Bot';


//run when client connects
io.on('connection',socket=>
{//console.log('new ws connection');
socket.on('joinRoom',({username,room})=>
{  const user=userJoin(socket.id,username,room);
    socket.join(user.room);
    
    //welcome msg to new user
    socket.emit('message',formatMessage(botName,`Welcome to ChatCord...${user.username}`));
    //broadcast to other users, when a user connects
    socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));

    //update users and room info........when a new user joins
    io.to(user.room).emit('roomUsers',
    {room:user.room,
     users:getRoomUsers(user.room) 
    });
});
 //when client disconnects
 socket.on('disconnect',()=>
 {const user=userLeaves(socket.id);
    if(user)
    {
      io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
      //update user and room info........when a  user leaves a room
        io.to(user.room).emit('roomUsers',
        {room:user.room,
        users:getRoomUsers(user.room) 
        });
    }
 });
//listen to chatMessage sent by client
socket.on('chatMessage',msg=>
{   const user=getCurrentUser(socket.id);
    io.to(user.room).emit('message',formatMessage(user.username,msg));
});


});

const PORT=  process.env.PORT || 3000;
server.listen(PORT,()=>console.log(`server running on ${PORT}`)); 