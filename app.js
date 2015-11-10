var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var path = require('path');
var uuid = require('node-uuid');
var http = require('http');
var events = require('events');
var example = require('example');

var WebsocketPort = 1337;
var appPort = 3000;

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.use(bodyParser.json());


// Api
app.get('/api/:target', function (req, res) {
    var data = require('./api/'+req.params.target);
    res.send(data.Get(""));
});

app.get('/api/:target/:params', function (req, res) {
    var data = require('./api/'+req.params.target);
    res.send(data.Get(req.params.params));
});

//Web Part
app.use('/web', express.static(__dirname + '/web'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

var server = app.listen(appPort, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Running app at http://%s:%s', host, appPort);
});

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});

server.listen(WebsocketPort, function() {
  var host = server.address().address;
  console.log('Running websocket at http://%s:%s', host, WebsocketPort);
});


// WEBSOCKET
var WebSocketServer = require('websocket').server;

// create the server
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

var listConnections = require('./api/manageConnections');

// WebSocket server
wsServer.on('request', function(request) {

    var connection = request.accept(null, request.origin);

    connection.id = uuid.v4();
    connection.send(JSON.stringify({
        target : 'connection',
        data : connection.id,
    }));

    console.log(listConnections);

    listConnections.Post({ // addConnection
        id : connection.id,
        connection : connection
    });

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        // process WebSocket message
        if (message.type === 'utf8') {
            try {
                var result = JSON.parse(message.utf8Data);
                //console.log(result);
                actionMessage(result, connection.id);
            } catch (e) {
                //console.log(message.utf8Data);
                return;
            }
            //connection.send(message.utf8Data);
        }
    });

    connection.on('close', function(data) {
        listConnections.Delete(connection.id) // delete connections
       //delete connections[connection.id]; // close user connection
    });

    function actionMessage(params, connectionId) {

        if(params.target && params.action) {

            if(!params.data) {
                var datas = "";
            } else {
                var datas = params.data; 
            }
            
            console.log("actionMessage");
            console.log(params);

            var data = require('./api/'+params.target);
            data[params.action](datas, connectionId);
        }
    }

});
