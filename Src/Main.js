"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 17.05.2016
 * Time: 12:48
 */

window.onload         = OnDocumentReady;
window.onbeforeunload = OnDocumentClose;
window.onresize       = OnDocumentResize;

var oApp = null;
function OnDocumentReady()
{
	g_oLocalization = new CLocalizationsManager();

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

window.addEventListener("focus", function()
{
	if (oApp)
		oApp.Focus();
});

window.addEventListener("blur", function()
{
	if (oApp)
		oApp.Blur();
});