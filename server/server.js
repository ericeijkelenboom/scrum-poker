//// All server logic

// Map of all connected players
var memory = {};

Meteor.publish('stories', function(player_id) {
	// Keep track of connected players 
	if(this._session.socket && player_id) {
		memory[this._session.socket.id] = player_id;
		
		this._session.socket.on('close', function() {
			delete memory[this.id];
		});
	}
	
	return Stories.find({'players.id': player_id});
});

Meteor.publish('players', function(stuff) {
	return Players.find({active: true});
});

Meteor.methods({
    create_story: function(player_id){
        var display_id = incrementCounter('story_display_id');
        return Stories.insert({
            display_id: display_id,
            players: [player_id], 
            moderator: player_id,
            estimates: []
            });
    }, 
    
  	initialize_player: function(player_id) {
  		if(!player_id) { 
  			return create_new_player();
  		}
  		else {
  			var player = Players.findOne(player_id);
  			if(!player)
  				return create_new_player();
  				
  			Players.update(player_id, {$set: {active: true}});
  			return player_id;
  		}
  	}
});

var create_new_player = function() {
	return Players.insert({last_keepalive: (new Date()).getTime(), active: true});
}

// Deactivate all players that are no longer in memory
Meteor.setInterval(function(){
	var players_in_memory = _.map(memory, function(x) {return x;});
	Players.update({$and: [{_id: {$nin: players_in_memory}}, {active: true}]}, {$set: {active: false}}, {multi: true});	
}, 1000);
