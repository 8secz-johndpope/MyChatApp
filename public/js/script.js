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
		console.log(arr);
		for (const user of arr)
		{
			const infoDiv = $('<div/>').addClass('people');
			infoDiv.html(`
				<div class="people-avatar">
					<img src="${user.avatar}" alt="${user.name}"/>
				</div>
				<div class="people-name">${user.name}</div>
			`);

			$('#people-online').append(infoDiv);
		}

	})

	socket.on('yourid', (id)=>{

		socket.emit('myname', {
			name: "Beo",
			id: id
		});
	
		socket.on('chat message', (data)=>{
			const msg = data.msg;

			console.log(data);
			$('#chat-mes').append($('<p/>').text(msg));
		});

	});
});