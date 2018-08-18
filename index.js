var http = require('http'),
express = require('express'),
path = require('path');

var app = express();
var express = require('express');
var bodyParser = require('body-parser');



app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

var amqp = require('amqplib/callback_api');


amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'task';
    ch.assertQueue(q, {durable: true});
    ch.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
      }, {noAck: false});
  });

});



app.get('/:id', function(req, res) { //A
   var params = req.params; //B
   var id = req.params.id; //B
   amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
      var q = 'task';
      var msg = process.argv.slice(2).join(' ') || `Hello World!  ${id}`;
      ch.assertQueue(q, {durable: true});
      ch.sendToQueue(q, new Buffer.from(msg), {persistent: true});
      console.log(" [x] Sent '%s'", msg);
    });
  res.send(id); //2

 
})
});






app.use(function (req,res) { //1
    res.render('404', {url:req.url}); //2
});

//2
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});