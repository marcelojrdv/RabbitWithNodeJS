var express = require('express'),
http 		= require('http'),
path 		= require('path'),
bodyParser	= require('body-parser'),
amqp 		= require('amqp');

var app = express();
var server = http.createServer(app);

//Porta 3000
//app.get('port') era pra pegar a porta 3000
server.listen(3000, function(){
  console.log("RabbitMQ + Node.js rodando OK! Porta: "+3000/*app.get('port')*/);
  
  //Criar socket
  /* var socket = io.listen(app);
     
    socket.on('connection', function(client){
      client.on('message', function(msg){
        exchange.publish("key.a.b", msg);
      })
      client.on('disconnect', function(){
      })
      queue.subscribe( {ack:true}, function(message){
        client.send(message.data.toString())
        queue.shift()
      })
    })*/
});

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(bodyParser());
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')));

//Configurações
/*app.configure(function(){
	  app.set('port', process.env.PORT || 3000);
	  app.set('views', __dirname + '/views');
	  app.set('view engine', 'jade');
	  //app.use(express.bodyParser());
	  app.use(bodyParser());
	  app.use(express.static(path.join(__dirname, 'public')));
});*/

//Definindo o padrão da conexão para a troca de mensagens e para minha fila de mensagens
app.connectionStatus = 'Sem conexao com o servidor';
app.exchangeStatus = 'Nenhum exchange estabelecido';
app.queueStatus = 'Sem fila estabelecida';

//Rota padrão
app.get('/', function(req, res){
	  res.render('index.hjs',
	    {
	      title: 'RabbitMQ e Node/Express',
	      connectionStatus: app.connectionStatus,
	      exchangeStatus: app.exchangeStatus,
	      queueStatus: app.queueStatus
	    });
	});

//Rota contato
app.get('/contato', function(req, res){
	  res.render('contato.hjs',
	    {
	      title: 'Página de Contato!',
	      connectionStatus: app.connectionStatus,
	      exchangeStatus: app.exchangeStatus,
	      queueStatus: app.queueStatus
	    });
	});

//Evento post após o clique
app.post('/start-server', function(req, res){
	  app.rabbitMqConnection = amqp.createConnection({ host: 'localhost' });
	  app.rabbitMqConnection.on('ready', function(){
		  app.connectionStatus = 'Conectado!';
		  res.redirect('/');
	  });
});

app.post('/new-exchange', function(req, res){
	  app.e = app.rabbitMqConnection.exchange('teste-exchange2');
	  app.exchangeStatus = 'A fila esta pronta para uso !';
	  res.redirect('/');
});


app.post('/new-queue', function(req, res){
	  app.q = app.rabbitMqConnection.queue('minha-fila2');
	  app.queueStatus = 'A fila esta pronta para uso !';
	  res.redirect('/');
	  
	  //Mostra as mensagem que chegaram
	  app.q.subscribe(function (message, headers, deliveryInfo, messageObject) {
		  console.log('Server - routing key ' + deliveryInfo.routingKey);
		  console.log('Server - message' + message.message	);
	  });
});

app.get('/message-service', function(req, res){
	  app.q.bind(app.e, '#');
	  res.render('message-service.hjs',
	    {
	      title: 'Messaging Service',
	      sentMessage: 'Primeiro (fixo)'
	    });
});

app.post('/newMessage', function(req, res){
	 //MODULO BodyParser FALHANDO
	 /*var newMessage = req.body.newMessage;
	 app.e.publish('routingKey', { message: newMessage });*/
	 var aleatorio = Math.floor((Math.random() * 1000) + 1); //1 a 1000
	 app.e.publish('routingKey_'+aleatorio, { message: 'cliente_teste_'+aleatorio });
	
	  app.q.subscribe(function(msg){
	  res.render('message-service.hjs',
	    {
	      title: 'You\'ve got mail!',
	      sentMessage: msg.message
	    });
	  });
});  

