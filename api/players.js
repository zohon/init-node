var _ = require('underscore');

var listPlayers = [];

var Get = function(id, eventEmitter) {

	if(id) {
		var result = _.where(listPlayers, {id : id});
		return result[0];
	} else {
		console.log(listPlayers);
		return listPlayers;
	}

}

var Post = function(params, eventEmitter) {

	if (!params || !params.userInfo) {
		return false;
	}

	var item = {
		id : params.userInfo,
		x : 0,
		y : 0
	};

	var result = _.where(listPlayers, {id : params.userInfo});


	if(result.length > 0) {
		return false;
	}

	_.each(params, function(data, index) {
		if(data) {
			item[index] = data;
		}
	});

	listPlayers.push(item);

	eventEmitter.emit('MAJ', {
		target : 'players',
		action : 'Post',
		data : item
	});

    return listPlayers;
}

var Put = function(params, eventEmitter) {

	var item = _.where(listPlayers, {id : params.id})[0];

	if(item) {

		_.each(params, function(data, index) {
			if(data) {
				item[index] = data;
			}
		});

		eventEmitter.emit('MAJ', {
			target : 'players',
			action : 'Get',
			data : item
		});

	    return item;
	}
}

var Delete = function(id, eventEmitter) {

	if(id) {

		var item = _.where(listPlayers, {id : id})[0];

		if(item) {
			listPlayers = _.without(listPlayers, _.findWhere(listPlayers, {id: item.id}));

			eventEmitter.emit('MAJ', {
				target : 'players',
				action : 'Delete',
				data : item
			});
			
			return item;
		}

	}
    
}

exports.Get = Get;
exports.Post = Post;
exports.Put = Put;
exports.Delete = Delete;