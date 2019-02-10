const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const request = require('request');

const APP_TOKEN = 'EAAfcfYvbAtABAEnmdOPf3U5NQlopip97ooSlhit68QTCaRQ4QCPZAuVzzMUiQJnZAcQ5IZAiXCZCGAguUqm32fvj5sMSr9sEeKtNg6XhVhWdMe0PZCECFlA2vtZCqXmYmaXZB0xirtuC9K3HslIi78ISRPI0ZCKUKXYvurIZATj6R3wZDZD'

app.use(bodyParser.json());

app.listen(3000, () => {
    console.log('Escuchando en puerto 3000');
});

app.get('/', (req, res) => {
    res.send('Bienvenido al taller');
});

app.get('/webhook', (req, res) => {
    
    if(req.query['hub.verify_token'] === 'test_token_say_hello')
    {
        res.send(req.query['hub.challenge']);
    }
    else
    {
        res.send('Tu no tienes que entrar aquí');
    }

});

app.post('/webhook', (req, res) => {
    var data = req.body;
    console.log("hola2");

    if(data.object == 'page')
    {
        data.entry.forEach((pageEntry) => {            
            pageEntry.messaging.forEach((messagingEvent) => {
                if(messagingEvent.message){
                    receiveMessage(messagingEvent);
                }
            });
        });

        res.sendStatus(200);
    }

});
//evento que recibe mensaje enviado desde FB. Se llama desde app.post('/webhook)
function receiveMessage(event) {
    var senderID = event.sender.id;
    var messageText = event.message.text;

    evaluateMessage(senderID,messageText);
    
}

function evaluateMessage (recipientID, message) {
    var finalMessage = '';
    console.log("hola");
    if(isContain(message,'ayuda')){
        finalMessage = 'Por el momento no te puedo ayudar';
    }
    else if(isContain(message,'gato'))
    {
        senderMessageImage(recipientID);

    }
    else if(isContain(message,'clima'))
    {
        getWeather((temperature) => {
            finalMessage = getMessageWeather(temperature);
            sendMessageText(recipientID, finalMessage);
            
        });

    }
    else if(isContain(message,'info'))
    {
        sendMessageTemplate(recipientID);

    }
    else
    {
        finalMessage = 'Solo se repetir mensajes: ' + message;
    }

    sendMessageText(recipientID,finalMessage);

}

//callback. Retorna valor que es enviado a traves de parametro. Parecido al ref
function getWeather(callback){
    request('http://api.geonames.org/findNearByWeatherJSON?lat=43&lng=-2&username=demo', (error, response, data) => {
        if(!error) {
            var response = JSON.parse(data);
            console.log(response);
            var temperature = response.weatherObservation.temperature;
            callback(temperature);
        }
    });        
}

function getMessageWeather(temperature){
    if(temperature > 30) {
        return "En estos momentos tenemos "+temperature+"°. Te recomiendo que no salgas de casa";
    }
    else 
    {
        return "En estos momentos tenemos "+temperature+"°. Disfruta este lindo día";
    }
}

function senderMessageImage (recipientID){
    var messageData = {
        recipient: {
            id: recipientID
        },
        message: {
            attachment: {
                type: "image",
                payload : {
                    url: "http://static.t13.cl/images/sizes/1200x675/1439370835-gatos.jpg"
                }
            }
        }
    };

    callSendAPI(messageData);
}

function sendMessageText(recipientID, message){
    var messageData = {
        recipient: {
            id: recipientID
        },
        message: {
            text: message
        }
    };

    callSendAPI(messageData);
}

function sendMessageTemplate(recipientID){

    var messageData = {
        recipient: {
            id: recipientID
        },
        message: {
            attachment: {
                type: "template",
                payload:{
                    template_type: "generic",
                    elements: [elementTemplate()]
                }
            }
        }
    };

    callSendAPI(messageData);
}

function elementTemplate(){
    return {
        title: "Marco Duarte",
        subtitle: "Desarrollador de Software de Bigote´s code",
        item_url: "http://www.github.com/marc0duarte",
        image_url: "https://www.nexmo.com/wp-content/uploads/2016/08/dx-jamie-comic.jpg",
        buttons: [buttonTemplate()],
    }
}

function buttonTemplate(){
    return {
        type: "web_url",
        url: "http://www.github.com/marc0duarte",
        title: "Ir a página"
    }
}

function isContain(sentence, word){
    return sentence.indexOf(word) > -1
}

function callSendAPI (messageData){
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token : APP_TOKEN},
        method: 'POST',
        json: messageData
    }, (error,response,data) => {
        if(error){
            console.log('No es posible enviar el mensaje');
        }
        else
        {
            console.log('El mensaje fue enviado');
        }
    })
}