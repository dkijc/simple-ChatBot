/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var zipcodes = require('zipcodes');
var serverPort = 8000;
var adjectives = ['horrendous', 'great', 'complicated', 'interesting', 'beautiful', 'cool', 'fantastic', 'unique', 'ugly', 'dope', 'pretty'];

//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function(){// we wait until the client has loaded and contacted us that it is ready to go.
    socket.emit('answer',"Hey, Hello I am \"Burt\", Your friendly bot."); //We start with the introduction;
    setTimeout(timedQuestion, 2000, socket,"What is your Name?"); // Wait a moment and respond with a question.
  });
  socket.on('message', (data)=>{ // If we get a new message from the client we process it;
        console.log(data);
        if (questionNum ===  0 && !data.match(/^[0-9a-zA-Z]+$/)) {
          var adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
          socket.emit('answer',"That's a " + adjective + " name! But it's too complicated for me :-("); //We start with the introduction;
          setTimeout(timedQuestion, 2500, socket, "Do you have any simpler name that you go by??"); // Wait a moment and respond with a question.
        }
        else if (questionNum ===  1 && !data.match(/^[0-9]+$/)) {
          socket.emit('answer',"That's not a number :-(!"); //We start with the introduction;
          setTimeout(timedQuestion, 2500, socket, "Can you tell me your real age? Don't be shy :)"); // Wait a moment and respond with a question.
        }
        else if (questionNum ===  2 && !data.match(/^[0-9]+$/)) {
          socket.emit('answer',"That's not a number :-(!"); //We start with the introduction;
          setTimeout(timedQuestion, 2500, socket, "I think all zipcodes are numbers, no?? Try it again, please~"); // Wait a moment and respond with a question.
        } 
        else if (questionNum ===  3 && !data.match(/^[a-zA-Z]+$/)) {
          socket.emit('answer',"I'm sorry I only accept alphabet character :("); //We start with the introduction;
          setTimeout(timedQuestion, 2500, socket, "Where would you like to visit?"); // Wait a moment and respond with a question.
        } 
        else {
          questionNum = bot(data, socket, questionNum);
        }
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data,socket,questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;

/// These are the main statments that make up the conversation.
 
  if (questionNum == 0) {
  answer= 'Hello ' + input + ' :-)';// output response
  waitTime =2000;
  question = 'How old are you?';			    	// load next question
  }
  else if (questionNum == 1) {
  answer= 'Really ' + input + ' Years old? So that means you where born in: ' + (2018-parseInt(input));// output response
  waitTime =2000;
  question = 'Where do you live? (zipcode, please~)';			    	// load next question
  }
  else if (questionNum == 2) {
    if (zipcodes.lookup(input) === undefined ) {
      socket.emit('answer',"I'm sorry I don't recognize that zipcode :("); //We start with the introduction;
      setTimeout(timedQuestion, 2500, socket, "Can you recheck the number please?"); // Wait a moment and respond with a question.
    } else {
      answer= ' Cool! I have never been to ' + zipcodes.lookup(input).city +'.';
      waitTime =2000;
      question = 'Is it usually hot, mild, or cold there?';			    	// load next question
    }
  }
  else if (questionNum == 3) {
  answer= 'Ah, I like it ' + input + '!';
  waitTime = 2000;
  question = 'Where would you like to visit?';			    	// load next question
  }
  else{
    answer= 'Great! I hope I get to meet you in ' + input + ' in person!';// output response
    waitTime =0;
    question = '';
  }


/// We take the changed data and distribute it across the required objects.
  socket.emit('answer',answer);
  setTimeout(timedQuestion, waitTime,socket,question);
  return (questionNum+1);
}

function timedQuestion(socket,question) {
  if(question!=''){
  socket.emit('question',question);
}
  else{
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
