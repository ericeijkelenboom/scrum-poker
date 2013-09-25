
// Story events 
Template.story.events({
	'click .playingCards a': function(event, template) {
		perform_estimate($(event.target).text());
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

Template.story.estimates = function() {
	return _.map(active_players(), function(player) {
		return player.estimate;
	});
}

Template.story.active_players = function() {
	return active_players();
}

Template.story.cards = function(){
	return Decks.fibonacci;	
}

Template.story.can_force_show = function() {
	if(this.done) return false; 

	// Force show enabled for the moderator only
	return Stories.findOne(current_story_id()).moderator === my_id(); 
}

Template.story.is_valid_estimate = function(estimate) {
	return estimate != -1;
}

active_players = function() {
	return Players.find({$and: [{story_id: current_story_id()}, {active: true}]}).fetch();
}

perform_estimate = function(estimate) {
	// Can't change estimates when we're done
	if(Stories.findOne(current_story_id()).done)
		return;

	Players.update(my_id(), {$set: {estimate: +estimate}});

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