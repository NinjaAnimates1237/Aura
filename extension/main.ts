namespace aura {
    let ws: WebSocket;
    let roomId: string;

    // connect to Aura server
    export function connect(id: string) {
        roomId = id;
        ws = new WebSocket("ws://localhost:3000");

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "join", roomId: id }));
        };

        ws.onmessage = (ev) => {
            const data = JSON.parse(ev.data);

            // initial sync
            if (data.type === "sync") {
                if (data.xml && pxt?.editor) {
                    pxt.editor.setBlocksXml(data.xml);
                }
            }

            // updates from others
            if (data.type === "update") {
                if (pxt?.editor) {
                    pxt.editor.setBlocksXml(data.xml);
                }
            }
        };
    }

    // send updated blocks xml to Aura server
    export function send() {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const xml = pxt.editor.getBlocksXml();

        ws.send(JSON.stringify({
            type: "update",
            roomId: roomId,
            xml: xml
        }));
    }
}
