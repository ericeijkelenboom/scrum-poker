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

/// Home template functions
Template.home.events({
    'click #create' : function(event) {
		create_story(false);
    },
    'click #join':  function(event) {
        Router.go('story', {_id: +$('#storyid').val()});
	}
});

Template.story.events({
	'click .available-card a': function(event, template) {
		perform_estimate(event.target.text);
		return false; 
	}, 
	'click #force_show': function(event, template){
		mark_story_done();
		return false;
	},
	'click #create_new': function(event, template) {
		create_story(true);
		return false; 
	}
});

Template.story.active_players = function() {
	return Players.find({$and: [{story_id: current_story_id()}, {active: true}]}).fetch();
}

Template.story.cards = function(){
	return Decks.fibonacci;	
}

Template.story.i_am_moderator = function() {
	return Stories.findOne(current_story_id()).moderator === my_id(); 
}

Template.story.is_valid_estimate = function(estimate) {
	return estimate != -1;
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

perform_estimate = function(estimate) {
	// Can't change estimates when we're done
	if(Stories.findOne(current_story_id()).done)
		return;

	Players.update(my_id(), {$set: {estimate: estimate}});

	try_mark_story_done();
}

try_mark_story_done = function() {
	var missing_estimate_count = Players.find({$and: [{story_id: current_story_id()}, 
		{active: true}, {estimate: -1}]}).count();

	if(missing_estimate_count == 0)
		mark_story_done();
}

mark_story_done = function() {
	Stories.update(current_story_id(), {$set: {done: true}});
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

