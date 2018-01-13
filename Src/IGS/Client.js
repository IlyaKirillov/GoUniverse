"use strict";

/**
 * Copyright 2017 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     29.10.2017
 * Time     11:50
 */

//var net = require('net');

function CIGSClient(oApp)
{
	this.m_oApp            = oApp;
	this.m_oGlobalSettings = oApp.GetGlobalSettings();

	this.m_oSocket         = new net.Socket();
}

CIGSClient.prototype.Connect = function(sLogin, sPassword, sLocale)
{
	this.private_SendMessage({
		"type"     : "LOGIN",
		"name"     : sLogin,
		"password" : sPassword,
		"locale"   : sLocale ? sLocale : "en_US"
	});
};
CIGSClient.prototype.private_SendMessage = function()
{

};

// client.connect(6969, 'igs.joyjoy.net', function()
// {
// 	console.log('Connected');
// 	client.write('Hello, server! Love, Client.');
// });
//
// client.on('data', function(data) {
// 	console.log('Received: ' + data);
// 	client.destroy(); // kill client after server's response
// });
//
// client.on('close', function() {
// 	console.log('Connection closed');
// });