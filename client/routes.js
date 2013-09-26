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

        story = Meteor.subscribe('story', this.params._id);
      }
    },

  	data: function () {
      var _id = this.params._id;

      // Find story by id or display id
      var story = isNaN(_id) ? Stories.findOne(_id) : Stories.findOne({display_id: +_id});
      if(!story) 
        return story; // 404

      Session.set('story_id', story._id);
      
      // Make sure we have a player
      var player = Players.findOne(obtain_player_id());
      var setModifier = {$set: {story_id: story._id}};

      // Reset estimate if player is moving to another story
      if(player.story_id !== story._id) {
        setModifier.$set['estimate'] = -1;
      }

      // Link player to story
      Players.update(player._id, setModifier);

      return story;
  	},
});

HomeController = RouteController.extend({
  before: function(){
    Session.set('story_id', undefined);
  }, 
});