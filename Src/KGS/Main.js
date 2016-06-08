"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 17.05.2016
 * Time: 12:48
 */

window.onload         = OnDocumentReady;
window.onbeforeunload = OnDocumentClose;
window.onresize       = OnDocumentResize;

var urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/g;
function SplitTextToLines(sText)
{
	var aLines = [];

	var nBreakPos = -1;
	var nCurPos   = 0;
	while (-1 !== (nBreakPos = sText.indexOf(String.fromCharCode(10), nCurPos)))
	{
		aLines.push(sText.substr(nCurPos, nBreakPos - nCurPos));

		nCurPos = nBreakPos + 1;
		if (nCurPos >= sText.length)
			break;
	}

	if (nCurPos < sText.length)
		aLines.push(sText.substr(nCurPos, sText.length - nCurPos));

	for (var nIndex = 0, nCount = aLines.length; nIndex < nCount; ++nIndex)
	{
		aLines[nIndex] = aLines[nIndex].replace(urlRegEx, "<a href='$1' target='_blank'>$1</a>");
	}

	return aLines;
}

var oApp = null;
function OnDocumentReady()
{
	oApp = new CGoUniverseApplication();
	oApp.Init();
}

function OnDocumentClose()
{
	if (oApp)
		oApp.Close();
}

function OnDocumentResize()
{
	if (oApp)
		oApp.OnResize();
}





