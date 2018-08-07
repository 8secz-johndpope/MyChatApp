import Notification from './module/Notification.js';

$(document).ready(async () => {
	const Notify = new Notification();

	const notifyHistory = await Notify.fetch();
	for (const notify of notifyHistory) {
		Notify.add(notify);
	}
});
