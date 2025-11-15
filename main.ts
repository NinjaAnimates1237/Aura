namespace aura {
    let ws: WebSocket;

    export function connect(roomId: string) {
        ws = new WebSocket("ws://localhost:3000");

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "join", roomId }));
        };

        ws.onmessage = ev => {
            let msg = JSON.parse(ev.data);

            if (msg.type === "update") {
                // apply code update to MakeCode editor
                pxt.editor.applyProjectText(msg.patch);
            }
        };
    }

    export function sendUpdate(code: string) {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
            type: "update",
            roomId: "test",
            patch: code
        }));
    }
}
