//// All server logic
Meteor.publish('stories', function(player_id) {
	return Stories.find({'players.id': player_id});
});

Meteor.publish('players', function() {
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
    
    keepalive: function (player_id) {
    	check(player_id, String);
    	Players.update({_id: player_id}, {$set: {last_keepalive: (new Date()).getTime(), active: true}});
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

// Set those players that have not come in to idle  
Meteor.setInterval(function () {
	var now = (new Date()).getTime();
	var idle_threshold = now - 15*1000; // 15 sec
	var remove_threshold = now - 60*60*1000; // 1hr
	//debugger; 
	
	Players.update({$and: [{last_keepalive: {$lt: idle_threshold}}, {active: true}]}, {$set: {active: false}});
	
	// XXX need to deal with people coming back!
	// Players.remove({$lt: {last_keepalive: remove_threshold}});

}, 20*1000);
