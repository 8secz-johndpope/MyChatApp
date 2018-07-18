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

	socket.on('get all user', (arr)=>{

		for (const user of data)
		{
			const infoDiv = $('<div/>').addClass('people');
			infoDiv.html(`
				<div class="people-avatar">
					<img src="${user.avatar}" alt="${user.name}"/>
				</div>
				<div class="people-name">
					${user.name}
				</div>
			`);

			$('#people-online').append(infoDiv);
		}

	})

	socket.on('chat message', (msg)=>{
		console.log(msg);
		$('#chat-mes').append($('<p/>').text(msg));
	});
});