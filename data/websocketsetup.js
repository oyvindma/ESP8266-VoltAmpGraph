

    var wsUri = "ws://192.168.81.236/ws";
    var output;
    var queue = [];
    
    
    function onOpen(evt)
    {
        writeToScreen("CONNECTED");
        doSend("WebSocket rocks");
    }
    
    function onClose(evt)
    {
        writeToScreen("DISCONNECTED");
    }

    
    function onMessage(evt)
    {
       
        
        //writeToScreen('<span style="color: blue;">RESPONSE: ' + evt.data+'</span>');
        if(evt.data.startsWith("{")){
           let eventData = JSON.parse(evt.data)
           window.sensorChartCh1.addData(eventData.ch1);
           window.sensorChartCh2.addData(eventData.ch2);
           window.sensorChartCh3.addData(eventData.ch3);

           calculateMilliAmpHours(eventData)

        }else{
            console.log("event was:" + evt.data);
        }
    }
    
    function onError(evt)
    {
        writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
    }
    
    function doSend(message)
    {
        writeToScreen("SENT: " + message);
        websocket.send(message);
    }
    
    function writeToScreen(message)
    {
        var pre = document.createElement("p");
        pre.style.wordWrap = "break-word";
        pre.innerHTML = message;
        output.appendChild(pre);
        if(output.childNodes.length >10) output.removeChild(output.childNodes[0]);
    }