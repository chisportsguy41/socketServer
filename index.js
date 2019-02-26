let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

var names = [];
var botNames = ['Trish', 'Kandis', 'Glinda', 'Val', 'Romelia', 'Almeta',
  'Deloise', 'Joanie', 'Ayana', 'Jerrell', 'Heidi', 'Julian', 'Aisha', 
  'Curt', 'Merlyn', 'Johnny', 'Lorretta', 'Mirella', 'Ann', 'Wendi'];
 
io.on('connection', (socket) => {
  
  socket.on('disconnect', function(){
    for(var i = 0; i < names.length; i++){
      if (names[i] === socket.nickname) {
        names.splice(i, 1);
        break;
      }
    }
    console.log(names);
    io.emit('users-changed', {user: socket.nickname, event: 'left'});   
  });
 
  socket.on('set-nickname', (name) => {
    socket.nickname = name;
    names.push(name);
    console.log(names);
    io.emit('users-changed', {user: name, event: 'joined'});    
  });
  
  socket.on('add-message', (message) => {
    socket.broadcast.emit('message', {text: message.text, name: message.name});
  });

  socket.on('start-game', (message) => {
    console.log(message.text);
    console.log(message.number);
    if (names.length < message.number) {
      for (var i = names.length; i < message.number; i++) {
        let rand = Math.floor(Math.random()*botNames.length);
        names.push(botNames[rand]);
      }
    }
    console.log(names);
    console.log(message.deck);
    socket.broadcast.emit('status-changed', 
      {event: 'started', user: socket.nickname, text: 'started the game'});
    io.emit('status-changed', {event: 'set-players', list: names, deck: message.deck});
  });

  socket.on('reset', (message) => {
    console.log(message.text);
    console.log(message.number);
    if (names.length < message.number) {
      for (var i = names.length; i < message.number; i++) {
        let rand = Math.floor(Math.random()*botNames.length);
        names.push(botNames[rand]);
      }
    }
    console.log(names);
    io.emit('status-changed', {event: 'reset', user: socket.nickname, text: 'reset the game'});
    io.emit('status-changed', {event: 'set-players', list: names, deck: message.deck});
  });
});
 
var port = process.env.PORT || 3001;
 
http.listen(port, function(){
   console.log('listening in http://localhost:' + port);
});