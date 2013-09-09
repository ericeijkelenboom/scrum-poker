Meteor.startup(function () {

 	Meteor.call('initialize_player', SessionAmplify.get('player_id'), function(error, player_id) {
 		SessionAmplify.set('player_id', player_id);
 	});
 	
 	Deps.autorun(function () {
		// Subscribe to all players and the stories this player is in
		stories_sub = Meteor.subscribe('stories', SessionAmplify.get('player_id'));
		players_sub = Meteor.subscribe('players');
		
		// Listen for a new story, started by the moderator
		Stories.find({_id: Session.get('story_id')}).observeChanges({
			changed: function(id, fields) {
				if(fields.next_story) {
					open_story(fields.next_story);
				}
			}
		});
	});
});

/// Home template functions
Template.home.events({
    'click #create' : function(event) {
		create_new_story(false);
    },
    'click #join':  function(event) {
        Router.go('story', {_id: +$('#storyid').val()});
	}
});

Template.home.rendered = function() {
	Session.set('story_id', undefined);
}

/// Story template functions
Template.story.active_players = function() {
	return active_players();
};

Template.story.cards = function(){
	return Decks.fibonacci;	
}

Template.story.story_complete = function() {
	return story_complete();
}

Template.story.i_am_moderator = function() {
	return current_story().moderator === SessionAmplify.get('player_id'); 
}

Template.story.events({
	'tap, click .available-card a': function(event, template) {
		perform_estimate(event.target.text);
		return false;
	}, 
	'tap, click #force_show': function(event, template){
		mark_story_complete(true);
	},
	'tap, click #create_new': function(event, template) {
		create_new_story(true);
	}
});

init_story = function(story) {
	// Save story in session
	Session.set('story_id', story._id);

	// Add current player to the story
	Stories.update(story._id, {$addToSet: {players: SessionAmplify.get('player_id')}});
}

current_story = function() {
	return Stories.findOne(Session.get('story_id'));
}

me = function(){
	return Players.findOne(SessionAmplify.get('player_id'));
}

var create_new_story = function(from_existing_story) {
	// Create story on the server
    Meteor.call('create_story', SessionAmplify.get('player_id'), function(error, storyId){
    	
    	if(from_existing_story) {
	    	// Notify other players of the new story 
    		Stories.update(Session.get('story_id'), {$set: {next_story: storyId}});	
    	}	
       
        open_story(storyId);
    });
}

var open_story = function(storyId) {
	Router.go('story', {_id: storyId});
}

var mark_story_complete = function(force) {
	var story = current_story();
	
	if((story.estimates && story.players.length <= story.estimates.length) || force)
		Stories.update({_id: Session.get('story_id')}, {$set: {completed: true}});
}

var perform_estimate = function(estimate) {
	if(current_story().completed)
		return; // No more estimates allowed
	
	// Add existing estimate and add a new one 
	Stories.update({_id: Session.get('story_id')}, {$pull: {estimates: {player_id: me()._id}}});
	Stories.update(Session.get('story_id'), {$addToSet: {estimates: {player_id: SessionAmplify.get('player_id'), estimate: estimate}}});
	
	mark_story_complete();
}

var active_players = function() {
	var player_ids = current_story().players;
	return Players.find({$and: [{_id: {$in: player_ids}}, {active: true}]}).fetch();
}

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

isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
