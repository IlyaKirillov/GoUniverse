"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     07.07.2016
 * Time     2:05
 */

function CGoUniverseAboutWindow()
{
	CGoUniverseAboutWindow.superclass.constructor.call(this);

	this.m_oApp = null;
}
CommonExtend(CGoUniverseAboutWindow, CDrawingWindow);

CGoUniverseAboutWindow.prototype.Init = function(sDivId, oPr)
{
	CGoUniverseAboutWindow.superclass.Init.call(this, sDivId, false);

	this.Set_Caption(g_oLocalization.common.about.caption);

	this.m_oApp = oPr.App;

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	this.private_InitAboutPage(oMainDiv);

	this.private_UpdatePosition();
	this.Update_Size(true);
};
CGoUniverseAboutWindow.prototype.Get_DefaultWindowSize = function()
{
	if (undefined !== g_oLocalization.common.about.translatedBy)
		return {W : 392, H : 264 + 40};

	return {W : 392, H : 264};
};
CGoUniverseAboutWindow.prototype.Close = function()
{
	CGoUniverseAboutWindow.superclass.Close.call(this);
	RemoveWindow(this);
};
CGoUniverseAboutWindow.prototype.private_InitAboutPage = function(oDiv)
{
	var oDivMainPart           = document.createElement("div");
	oDiv.appendChild(oDivMainPart);

	oDiv.style.overflowX  = "hidden";
	oDiv.style.overflowY  = "hidden";

	oDivMainPart.style.margin  = "0";
	oDivMainPart.style.padding = "10px 20px";

	oDivMainPart.style.fontFamily = "Tahoma, Arial, Verdana";
	oDivMainPart.style.fontSize   = "12px";
	oDivMainPart.style.color      = "#666";
	oDivMainPart.style.background = "#fff";

	var oLogo            = document.createElement("img");
	oLogo.src            = "Files/icon100.png";
	oLogo.width          = 100;
	oLogo.height         = 100;
	oLogo.style['float'] = "left";
	oDivMainPart.appendChild(oLogo);

	var oMargin            = document.createElement("div");
	oMargin.style.width    = "10px";
	oMargin.style.height   = "100px";
	oMargin.style['float'] = "left";
	oDivMainPart.appendChild(oMargin);

	var oHeading = document.createElement("h1");
	oHeading.style.marginLeft = "110px";
	oDivMainPart.appendChild(oHeading);
	Common.Set_InnerTextToElement(oHeading, "Go Universe");

	var oVersion = document.createElement("div");
	oVersion.style.marginLeft = "110px";
	oDivMainPart.appendChild(oVersion);
	Common.Set_InnerTextToElement(oVersion, g_oLocalization.common.about.version + " " + this.m_oApp.GetVersion());

	var oString              = document.createElement("div");
	oString.style.marginLeft = "110px";
	oString.style.paddingTop = "20px";
	oDivMainPart.appendChild(oString);
	Common.Set_InnerTextToElement(oString, g_oLocalization.common.about.visitMessage);
	oString                  = document.createElement("a");
	oString.style.marginLeft = "110px";
	oString.target           = "_blank";
	oString.href             = "https://github.com/IlyaKirillov/GoUniverse";
	oDivMainPart.appendChild(oString);
	Common.Set_InnerTextToElement(oString, "https://github.com/IlyaKirillov/GoUniverse");

	if (undefined !== g_oLocalization.common.about.translatedBy)
	{
		oString                  = document.createElement("div");
		oString.style.marginLeft = "110px";
		oString.style.paddingTop = "20px";
		oDivMainPart.appendChild(oString);
		Common.Set_InnerTextToElement(oString, g_oLocalization.common.about.translatedBy);
	}

	oString                  = document.createElement("div");
	oString.style.paddingTop = "30px";
	oDivMainPart.appendChild(oString);
	Common.Set_InnerTextToElement(oString, "© Ilya Kirillov, 2016-2017. " + g_oLocalization.common.about.allRightReserved);

	var oDiv = document.createElement("div");
	oDiv.innerHTML = '<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">\
	<input type="hidden" name="cmd" value="_s-xclick">\
	<input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----MIIHLwYJKoZIhvcNAQcEoIIHIDCCBxwCAQExggEwMIIBLAIBADCBlDCBjjELMAkGA1UEBhMCVVMxCzAJBgNVBAgTAkNBMRYwFAYDVQQHEw1Nb3VudGFpbiBWaWV3MRQwEgYDVQQKEwtQYXlQYWwgSW5jLjETMBEGA1UECxQKbGl2ZV9jZXJ0czERMA8GA1UEAxQIbGl2ZV9hcGkxHDAaBgkqhkiG9w0BCQEWDXJlQHBheXBhbC5jb20CAQAwDQYJKoZIhvcNAQEBBQAEgYCAOr2BokpkqfUyHlDu+zYrYxpSwArVaN5gah/PjXMlU5lbSjv9477vgkbGs3QxlkpaS3UPz1wWeO4DOHhVj1uOK0/EDviHyqkefaoxjOspf1xt8ZZ7PAJHG3mTkdnngHZVsMwrthca+jbv6VoUbjEq8l0mWW3drjzlsSPOw3jV0zELMAkGBSsOAwIaBQAwgawGCSqGSIb3DQEHATAUBggqhkiG9w0DBwQIX5W4kp9LdKaAgYhqtONzukAdM8fvhhVufR8XZ7zErgIF+w+ztVyD48xP0T50iI+dN0z3AomsTiSELjYJ06iAYSp7EbGGEXiPErMOF0VmN/89efwJMx2eRNxUbf9IBR/RiQAPIcg16m5LsrlPZjcvIjNair12opg0zAbSl+w4S2dDrvbVFb/FOA8rkU/xy5F5e8pZoIIDhzCCA4MwggLsoAMCAQICAQAwDQYJKoZIhvcNAQEFBQAwgY4xCzAJBgNVBAYTAlVTMQswCQYDVQQIEwJDQTEWMBQGA1UEBxMNTW91bnRhaW4gVmlldzEUMBIGA1UEChMLUGF5UGFsIEluYy4xEzARBgNVBAsUCmxpdmVfY2VydHMxETAPBgNVBAMUCGxpdmVfYXBpMRwwGgYJKoZIhvcNAQkBFg1yZUBwYXlwYWwuY29tMB4XDTA0MDIxMzEwMTMxNVoXDTM1MDIxMzEwMTMxNVowgY4xCzAJBgNVBAYTAlVTMQswCQYDVQQIEwJDQTEWMBQGA1UEBxMNTW91bnRhaW4gVmlldzEUMBIGA1UEChMLUGF5UGFsIEluYy4xEzARBgNVBAsUCmxpdmVfY2VydHMxETAPBgNVBAMUCGxpdmVfYXBpMRwwGgYJKoZIhvcNAQkBFg1yZUBwYXlwYWwuY29tMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDBR07d/ETMS1ycjtkpkvjXZe9k+6CieLuLsPumsJ7QC1odNz3sJiCbs2wC0nLE0uLGaEtXynIgRqIddYCHx88pb5HTXv4SZeuv0Rqq4+axW9PLAAATU8w04qqjaSXgbGLP3NmohqM6bV9kZZwZLR/klDaQGo1u9uDb9lr4Yn+rBQIDAQABo4HuMIHrMB0GA1UdDgQWBBSWn3y7xm8XvVk/UtcKG+wQ1mSUazCBuwYDVR0jBIGzMIGwgBSWn3y7xm8XvVk/UtcKG+wQ1mSUa6GBlKSBkTCBjjELMAkGA1UEBhMCVVMxCzAJBgNVBAgTAkNBMRYwFAYDVQQHEw1Nb3VudGFpbiBWaWV3MRQwEgYDVQQKEwtQYXlQYWwgSW5jLjETMBEGA1UECxQKbGl2ZV9jZXJ0czERMA8GA1UEAxQIbGl2ZV9hcGkxHDAaBgkqhkiG9w0BCQEWDXJlQHBheXBhbC5jb22CAQAwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQUFAAOBgQCBXzpWmoBa5e9fo6ujionW1hUhPkOBakTr3YCDjbYfvJEiv/2P+IobhOGJr85+XHhN0v4gUkEDI8r2/rNk1m0GA8HKddvTjyGw/XqXa+LSTlDYkqI8OwR8GEYj4efEtcRpRYBxV8KxAW93YDWzFGvruKnnLbDAF6VR5w/cCMn5hzGCAZowggGWAgEBMIGUMIGOMQswCQYDVQQGEwJVUzELMAkGA1UECBMCQ0ExFjAUBgNVBAcTDU1vdW50YWluIFZpZXcxFDASBgNVBAoTC1BheVBhbCBJbmMuMRMwEQYDVQQLFApsaXZlX2NlcnRzMREwDwYDVQQDFAhsaXZlX2FwaTEcMBoGCSqGSIb3DQEJARYNcmVAcGF5cGFsLmNvbQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMTYwOTA1MTcwMDMzWjAjBgkqhkiG9w0BCQQxFgQUSY0hNjtQYIArmXTBvxgcTVJLRCMwDQYJKoZIhvcNAQEBBQAEgYCWPhkfoI7PJ+mbsDpbJwcJLbf9OBG8hQ+xX/7AXsrNpceGXsByEGf22ATOqJ8+bZttwrI/DyLVWxXAlmVx7zw9rMAP/6ICTUINRN+RSfRVyIfkkCh1gJIO9VE3XXj6uMfG8f6el0EYfzHoT0H7tMpa4eotefIyiytEJmQ1tKlmXw==-----END PKCS7-----\
	">\
	<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0"\
	name="submit" alt="PayPal - The safer, easier way to pay online!">\
	<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">\
	</form>';
	oDiv.style.paddingLeft = "123px";
	oDiv.style.paddingTop  = "20px";
	oDivMainPart.appendChild(oDiv);
};
CGoUniverseAboutWindow.prototype.private_UpdatePosition = function()
{
	if (!this.m_oApp)
		return;

	var oWindowDiv = this.HtmlElement.Control.HtmlElement;

	var nWindowW = parseInt(oWindowDiv.style.width);
	var nWindowH = parseInt(oWindowDiv.style.height);

	var nX = Math.max(0, ((this.m_oApp.GetWidth()  - nWindowW) / 2));
	var nY = Math.max(0, ((this.m_oApp.GetHeight() - nWindowH) / 2));

	oWindowDiv.style.left = nX + "px";
	oWindowDiv.style.top  = nY + "px";
};