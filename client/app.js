Meteor.startup(function () {
 	// Create random player id if none exists
 	if(!SessionAmplify.get('player_id')) {
  		var player_id = Players.insert({last_keepalive: (new Date()).getTime(), active: true});
		SessionAmplify.set('player_id', player_id);
 	}
 	
 	Deps.autorun(function () {
		// Subscribe to all players and the stories this player is in
		stories_sub = Meteor.subscribe('stories', SessionAmplify.get('player_id'));
		
		// TODO: client does not need read access to this collection
		players_sub = Meteor.subscribe('players');
	});
});

Template.home.events({
    'click #create' : function(event) {
		// Create story on the server
        Meteor.call('create_story', SessionAmplify.get('player_id'), function(error, storyId){
            Router.go('story', {_id: storyId});
        });
    },
    'click #join':  function(event) {
        Router.go('story', {_id: +$('#storyid').val()});
	}
});

Template.story.created = function(){
	var story = this.data;
	
	// Save story in session
	Session.set('story_id', story._id);
	
	// Add player to story if not yet there
	Stories.update(story._id, {$addToSet: {players: SessionAmplify.get('player_id')}});
};

Template.story.players = function() {
	var player_ids = Stories.findOne(Session.get('story_id')).players;
	
	return Players.find({_id: {$in: player_ids}}).fetch();
};

// Send keepalives so the server can tell when a player leaves.
//
// TODO this is not a great idiom. meteor server does not yet have a
// way to expose connection status to user code. Once it does, this
// code can go away.
Meteor.setInterval(function() {
	if (Meteor.status().connected && Session.get('story_id'))
    	Meteor.call('keepalive', SessionAmplify.get('player_id'), Session.get('story_id'));
	}, 10*1000);
	
// Amplify session
SessionAmplify = _.extend({}, Session, {
  keys: _.object(_.map(amplify.store(), function(value, key) {
    return [key, JSON.stringify(value)]
  })),
  set: function (key, value) {
    Session.set.apply(this, arguments);
    amplify.store(key, value);
  },
});

// Utility functions
log = function(message) {
  if (typeof console !== 'undefined')
      console.log(message);
}

isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
