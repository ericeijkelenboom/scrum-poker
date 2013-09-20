Router.map(function() { 
	this.route('home', {path: '/'});
  this.route('story', {path: '/story/:_id'});
});

StoryController = RouteController.extend({
  	notFoundTemplate: 'storyNotFound',

  	waitOn: function () {
		  return [story, players, me];
  	},

    before: function(){
      // Make sure we can see the latest changes from the server
      if(story){
        story.stop();

        story = Meteor.subscribe('story', this.params._id, function() {
          log('Re-subscribed to story');
        });
      }
    },

  	data: function () {
      var _id = this.params._id;

      // Find story
    	var story = Stories.findOne(_id);
      log('Router: found story ' + JSON.stringify(story));

      if(!story) 
        return story; // 404

      Session.set('story_id', _id);
      log('Setting session id to ' + _id);

      // Make sure we have a player
      var player = Players.findOne(obtain_player_id());

      var setModifier = {$set: {story_id: _id}};

      // Reset estimate if player is moving to another story
      if(player.story_id !== _id) {
        setModifier.$set['estimate'] = -1;
        log('Reset estimate');
      }

      // Link player to story
      Players.update(player._id, setModifier);
      log('Linked player to story: ' + JSON.stringify(Players.findOne(player._id)));

      return story;
  	},
});

HomeController = RouteController.extend({
  before: function(){
    Session.set('story_id', undefined);
    log('Setting story_id to undefined');
  }, 
});