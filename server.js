var sys = require ('sys'),
url = require('url'),
http = require('http'),
qs = require('querystring');
var io = require('socket.io').listen(61001);
var bets=[];
var timer=120000;

// SMS Inbound
http.createServer(function (req, res) {
 
	if(req.method=='POST') {
		var body='';
		req.on('data', function (data) {
			body +=data;
		});
	
		req.on('end',function(){
			var POST =  qs.parse(body);
			console.log(POST);
	                if (!isNaN(parseInt(POST.comments))) {
        	                bets.push({"number":POST.sender,"bet":POST.comments});
                	        io.sockets.emit("player",{"number":POST.sender,"bet":POST.comments});
	                }

		});
	}
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.write(":)");
  res.end();
}).listen(60101);

// Web Server
var connect = require('connect');
connect.createServer(
    connect.static(__dirname)
).listen(65001);


io.sockets.on('connection', function (socket) {
  socket.emit('hello', bets);
  socket.on('clear', function (data) {
    bets=[];
  });
});

function pingStart() {
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3 + 4 * 5000;
  io.sockets.emit("start",{"spinAngleStart":spinAngleStart,"spinTimeTotal":spinTimeTotal});
}

function secondsToString(seconds)
{
var numminutes = Math.floor(seconds / 60000);
var numseconds = (seconds - (60000*numminutes))/1000;
pre='';
if(numseconds<10) pre='0';
return numminutes + ":" +pre+ numseconds;

}

function decrement(){
 if(timer==0) {
 	timer = 120000;
	pingStart();
 } else {
 	timer = timer - 1000;
 }
 io.sockets.emit("timer",{"remain":secondsToString(timer)});
}

setInterval(decrement,1000);

