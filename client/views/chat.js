Template.storychat.events({
	'click #chat_message_send': function(event, template) {
		process_chat_input();
	},
	'keyup #chat_message': function(event, template) {
		if ( event.keyCode === 13 ) {
			process_chat_input();
		}
	}
});

Template.storychat.placeholder = function() {
	var me = Players.findOne(my_id());

	if(me.name) {
		return "Type a message " + me.name;
	} else {
		return "Type your name to start chatting";
	}
}

Template.storychat.display_name = function(player_name) {
	return player_name || "Unknown player";
}

process_chat_input = function() {
	var input = $('#chat_message').val();
	var me = Players.findOne(my_id());

	if(!me.name) {
		// Set player name if none exists
		Players.update(my_id(), {name: input});
	} else {
		// Store message
		Stories.update(current_story_id(), {$push: {
			messages: { player_name: me.name, message: input }
		}});
	}

	$('#chat_message').val('');
}
