Template.home.events({
    'click #create' : function(event) {
		var userId = setUserId();
        		
		// Create story on the server
        Meteor.call('createStory', userId, function(error, id){
            Router.go('story', {_id: id});
        });
    },
    'click #join':  function(event) {
        setUserId();
		Router.go('story', {_id: +$('#storyid').val()});
	}
});

Template.story.created = function(){
	var story = this.data;
	SessionAmplify.set('currentStoryId', story._id);
	
	Stories.update({_id: story._id}, {$addToSet: {users: SessionAmplify.get('userId')}});
};

Template.story.connectedUsersCount = function(){
	return Stories.findOne(SessionAmplify.get('currentStoryId')).users.length;
};

var setUserId = function() { 
	if(!SessionAmplify.get('userId'))
       	SessionAmplify.set('userId', Random.id());
       	
    return SessionAmplify.get('userId');
}

// Utility functions
log = function(message) {
  if (typeof console !== 'undefined')
      console.log(message);
}

isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
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