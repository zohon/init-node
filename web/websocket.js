function websocketListener() {

    console.log('websocketListener');

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    window.connection = new WebSocket('ws://'+window.location.hostname+":1337");

    connection.onopen = function () {
        // connection is opened and ready to use
        getAllInformations();
        connection.send("im connected");
        clearInterval(window.listenInterval);
    };

    connection.onerror = function (error) {
        // an error occurred when sending/receiving data
    };

    connection.onmessage = function (message) {
        // try to decode json (I assume that each message from server is json)
        try {
            var result = JSON.parse(message.data);
            actionMessage(result);
        } catch (e) {
            //console.log(message.data);
            return;
        }
        // handle incoming message
    };

    connection.onclose = function (error) {
        //$('body').html('Server is down try to refresh');
        window.listenInterval = setInterval(websocketListener(), 500);
        // an error occurred when sending/receiving data
    };

    return connection;
}


function actionMessage(params) {

    console.log("actionMessage");
    console.log(params);
        
    if(params.target == 'connection') {

        if(!window.user) {
            window.user = {};
        }
       
        window.user.id = params.data;
        
    } else {

        var targetScope = angular.element('[ng-controller="main"]').scope();

        if(params.action == 'Post') {
            targetScope.add(params.target, params.data);
        } else if(params.action == 'Delete') {
            targetScope.delete(params.target, params.data.id);
        } else if(params.action == 'Get') {
            console.log('Get ' +params.target );
            targetScope.get(params.target, params.data);
        } else if(params.action == 'Index') {
            targetScope.index(params.target, params.data);
        }

    }

}


function getAllInformations() {
    console.log('getAllInformations');
}