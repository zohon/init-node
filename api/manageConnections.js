var _ = require('underscore');
var uuid = require('node-uuid');

var TableName = "manageConnections";
var listItems = [];
var defaultValue = {};

var Access = function(connectionId) {
	var connection = Get({id : connectionId});
	if(connection) {
		return connection;
	} else {
		return false;
	}
}

var Get = function(search) {

	if(search) {

		var result = _.where(listItems, search)[0];

		if(result) {
			return result;
		}

	} else {

		Items = [];

		_.each(listItems, function(item, index) {
			Items.push(Display(item));
		});

		return Items;
	}

}


var Display = function(item) {

	var result = {};

	if(item.id) { result.id = item.id;}
	if(item.session) { result.session = item.session;}
	if(item.resto) { result.resto = item.resto;}

	return result;
}

var Post = function(params) {

	if (!params) {
		return false;
	}

	var item = _.clone(defaultValue);

	if(!params.id) {
		item.id  = uuid.v4();
	}

	_.each(params, function(data, index) {
		if(data !== undefined) {
			item[index] = data;
		}
	});
	
	listItems.push(item);
}

var Put = function(params) {

	var item = _.where(listItems, {id : params.id})[0];

	if(item) {

		_.each(params, function(data, index) {
			if(data != undefined && index != 'id') {
				item[index] = data;
			}
		});

	}

}



var Delete = function(id) {

	if(id) {

		var item = _.where(listItems, {id : id})[0];

		if(item) {

			if(item.session) {
				var sessions = require('../api/sessions');
				sessions.DeleteConnection(item);
			}

			listItems = _.without(listItems, _.findWhere(listItems, {id: item.id}));

		}

	}
    
}

exports.Access = Access;
exports.Get = Get;
exports.Post = Post;
exports.Put = Put;
exports.Delete = Delete;

var Call = function(search, params) {

	var results = _.where(listItems, search);

	if(results.length == 1) {
		target = results[0];
		if(target && target.connection) {
			target.connection.send(JSON.stringify(params));
		}
	} else if(results.length > 1) {
		_.each(results, function(target, index) {
			if(target && target.connection) {
				target.connection.send(JSON.stringify(params));
			}
		});
	}

}
exports.Call = Call;

var BroadCast = function(message) {

	_.each(listItems, function(target, index) {
		if(target && target.connection) {
			target.connection.send(JSON.stringify(message));
		}
	});

}
exports.BroadCast = BroadCast;

