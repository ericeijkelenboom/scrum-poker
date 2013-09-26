//// All server logic
var connected_players = {};

Meteor.startup(function() {
  Meteor.publish('story', function(id) {
    // Publish story by id or display id
    debugger; 
    return isNaN(id) ? Stories.find(id) : Stories.find({display_id: +id});
  });

  Meteor.publish('players_in_story', function(story_id) {
    return Players.find({$and: [{story_id: story_id}, {active: true}]});
  });

  Meteor.publish('player', function(player_id) {
    remember_player(player_id, this._session);

    return Players.find({_id: player_id});
  });
});


Meteor.methods({
  create_story: function(player_id){
      var story_id = Stories.insert({
          display_id: incrementCounter('story_display_id'),
          moderator: player_id,
          players: [player_id],
          done: false
         });
      
      return story_id;
  }, 
});  

//Keep track of connected players 
var remember_player = function(player_id, my_session) {
  if(my_session.socket && player_id) {
   connected_players[my_session.socket.id] = player_id;
    
   my_session.socket.on('close', function() {
     delete connected_players[this.id];
   });
  }
}

// Deactivate all players that are no longer connected
Meteor.setInterval(function(){
	var connected_player_ids = _.map(connected_players, function(x) {return x;});
	
  Players.update(	{$and: [{_id: {$nin: connected_player_ids}}, {active: true}]}, 
					{$set: {active: false}}, 
					{multi: true});	
}, 1000);
