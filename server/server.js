//// All server logic
Meteor.publish('stories', function(player_id) {
	return Stories.find({'players.id': player_id});
});

Meteor.publish('players', function() {
	return Players.find({});
});

Meteor.methods({
    create_story: function(player_id){
        var display_id = incrementCounter('story_display_id');
        return Stories.insert({
            display_id: display_id,
            players: [player_id]
            });
    }, 
    
    keepalive: function (player_id) {
    	check(player_id, String);
    	Players.update({_id: player_id}, {$set: {last_keepalive: (new Date()).getTime(), active: true}});
  }
});

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
