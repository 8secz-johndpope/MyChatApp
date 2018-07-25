"use strict";

class Chat {
    constructor(chatDisplay)
    {
        this.socket = io();
        this.user = null;
        this.view = chatDisplay;
        this.event = {
            "recv": null,
            "send": null
        };
    }

    async init()
    {
        this.user = await this._getMyInfo();
        this.socket.on('receive chat', (data)=>{
            if (!this.event.recv) throw new Error('Event Recv not found');
            this.event.recv(data);
        });
        this.socket.on('res msg with', (data)=>{
            this._updateHistory(data);
        })
    }

    /**
     * 
     * @param {Function} callback (data: json)=>any 
     */
    onMessage(callback)
    {
        this.event['recv'] = callback;
    }

    send(msg)
    {
        this.socket.emit('', data);
    }

    async _getMyInfo()
    {
        return await new Promise((res , rej)=>{
            $.ajax({
                url: '/api/me',
                type: 'GET',
                dataType: 'json',
                success: (json)=>{
                    if (json.err) {
                        rej(json.msg);
                    }
                    else res(json.data)
                },
                error: (err)=>{
                    rej(err);
                }
            });
        });
    }
}
