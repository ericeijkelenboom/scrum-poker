Router.map(function() { 
	
	this.route('home', {path: '/'});
	
  	this.route('story', {
		path: '/story/:_id',
    	controller: 'StoryController',
  	});
});

StoryController = RouteController.extend({
  	template: 'story',
  
  	notFoundTemplate: 'storyNotFound',

  	waitOn: function () {
		return stories_sub;
  	},

  	data: function () {
    	var story; 
    	
    	if(isNumber(this.params._id)) 
			story = Stories.findOne({display_id: +this.params._id});
		else 
			story = Stories.findOne(this.params._id);

		if(story)
			init_story(story);
									
		return story;
  	},

  	show: function () {
    	// render the RouteController's template into the main yield location
    	this.render();
  	}
});