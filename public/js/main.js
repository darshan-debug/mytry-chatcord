const chatForm=document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');

//get username and room from url
const{username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true}); 


const socket = io();

// send back the clients-username,room to server
socket.emit('joinRoom',{username,room});

//get room and (users for a room),when a user joins/leaves a room
socket.on('roomUsers',({room,users})=>
{ displayRoomName(room);
  displayRoomUsers(users);
});

//message from server
socket.on('message',message=>
{
 displayMessage(message);  
 
 //Scrolldown
 chatMessages.scrollTop=chatMessages.scrollHeight;

});

//collecting message ,suubmited on chat.html
chatForm.addEventListener('submit',e=>
{ e.preventDefault();
    //get message text
  const msg =e.target.elements.msg.value;
  //emiting msg to server
  socket.emit('chatMessage',msg); 
  //clear input
  e.target.elements.msg.value='';
  e.target.elements.msg.focus();

})

//Display message from server,to DOM
function displayMessage(message)
{ const div=document.createElement('div');
   div.classList.add('message');
   div.innerHTML=`<p class="meta">${message.username}<span>   ${message.time}</span></p>
   <p class="text">
       ${message.text}
   </p>`;
   document.querySelector('.chat-messages').appendChild(div);
}
//add roomname to DOM 
function displayRoomName(room)
{roomName.innerText=room;}
//add (users of that room) to DOM
function displayRoomUsers(users)
{
  userList.innerHTML=`${users.map(user=>`<li>${user.username}</li>`).join('')}`;
}
