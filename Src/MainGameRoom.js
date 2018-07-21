"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 21.07.2018
 * Time: 11:37
 */

window.onload         = OnDocumentReady;
window.onbeforeunload = OnDocumentClose;
window.onresize       = OnDocumentResize;


var bc = null;
function OnDocumentReady()
{
	var sGameId = GetJsonFromUrl().id;

	bc = new BroadcastChannel("GoUniverse.GameRoom=" + sGameId);
	bc.postMessage({Type : "Ready"});

	bc.onmessage = function(e) 
	{
		var oMessage = e.data;
		var sType = oMessage.Type;

		switch(sType)
		{
			case "GameName":
			document.title = oMessage.GameName;
			break;
		}

		 console.log(oMessage); 
	}
}

function OnDocumentClose()
{
	bc.close();
}

function OnDocumentResize()
{
}
