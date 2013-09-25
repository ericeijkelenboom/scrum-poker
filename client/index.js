Meteor.startup(function () {

  	Deps.autorun(function () {
		// Subscribe 
		story = Meteor.subscribe('story', current_story_id()); 
		
		players = Meteor.subscribe('players_in_story', current_story_id());
		
		me = Meteor.subscribe('player', my_id(), function() {
			obtain_player_id();
		});
		
		// Listen for a new story, started by the moderator
		Stories.find({_id: current_story_id()}).observeChanges({
			changed: function(id, fields) {
				if(fields.next_story) 
					open_story(fields.next_story);
			}
		});
	});
});

obtain_player_id = function() {
	// Create new player if none exists
	if(!my_id()) {
		var player_id = Players.insert({active: true});
		PersistentSession.set('player_id', player_id);
	} else {
		var me = Players.findOne(my_id());
		
		if(!me) {
			// Should only happen in case of DB reset
			var player_id = Players.insert({active: true});
			PersistentSession.set('player_id', player_id);
		} else {
			Players.update(me._id, {$set: {active: true}});
		}
	}

	return my_id();
}

create_story = function(include_other_players) {
	var player_id = my_id();
	var story_id = Stories.insert({moderator: player_id, players: [player_id], done: false});
	
	if(include_other_players)
		Stories.update(current_story_id(), {$set: {next_story: story_id}});

	Router.go('story', {_id: story_id});
}

open_story = function(story_id) {
	Router.go('story', {_id: story_id});
}


current_story_id = function() {
	return Session.get('story_id');
}

my_id = function() {
	return PersistentSession.get('player_id');
}

PersistentSession = _.extend({}, Session, {
  keys: _.object(_.map(amplify.store(), function(value, key) {
    return [key, JSON.stringify(value)]
  })),
  set: function (key, value) {
    Session.set.apply(this, arguments);
    amplify.store(key, value);
  },
});

