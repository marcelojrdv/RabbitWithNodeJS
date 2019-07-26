var http	= require('http'),
path 		= require('path'),
amqp 		= require('amqp');


//amqp.createConnection() returns an instance of amqp.Connection
//var con = amqp.Connection({ host: 'localhost'});

var con = amqp.createConnection({ host: 'localhost'
	, port: 5672
	, login: 'guest'
	, password: 'guest'
	, connectionTimeout: 10000
	, authMechanism: 'AMQPLAIN'
	, vhost: '/'
	, noDelay: true
	, ssl: { enabled : false
	       }
	});
con.on('ready', function(){
	var exchange 	= con.exchange('teste-exchange2');
	var queue 		= con.queue('minha-fila2');
	queue.bind(exchange, '#');
	//Escuta
	queue.subscribe(function (message, headers, deliveryInfo, messageObject) {
		console.log('Cliente - routingKey ' + deliveryInfo.routingKey);
		console.log('Cliente - message ' + message.message);
	});
	
	//Publica
	var aleatorio 	= Math.floor((Math.random() * 1000) + 1); //1 a 1000
	exchange.publish('routingKey_'+aleatorio, { message: 'cliente_teste_'+aleatorio });
	
	
});



