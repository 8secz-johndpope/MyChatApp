$(document).ready(()=>{
	const socket = io();

	$('#chat').on('submit', (e)=>{
		e.preventDefault();
		e.stopPropagation();
		
		const mes = $('#chat input[name=mes]').val();
		$('#chat input[name=mes]').val('');

		socket.emit('chat message', mes);

		return false;
	})

	socket.on('chat message', (msg)=>{
		console.log(msg);

		$('#chat-mes').append($('<p/>').text(msg));
	});
});