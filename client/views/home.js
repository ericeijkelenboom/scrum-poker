// Home events
Template.home.events({
    'click #create' : function(event) {
		create_story(false);
    },
    'click #join':  function(event) {
        var target = $('#storyIdInputGroup');
        target.is(':hidden') ? target.show() : target.hide();
        return false; 
	},
    'click #joinGo':  function(event) {
    	Router.go('story', {_id: +$('#storyId').val()});
	}
});