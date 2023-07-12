var http       = require('http');
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

// initialize OpenAI code
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const promptPreamble = process.env.PROMPT

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();

// middleware used to malke all responses CORS complient
router.use(function(req, res, next) {
    // go ahead and make the response CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// route GET reqs to /pulse to logic that sends a OK response
router.get('/pulse', function(req, res) {
    res.status(200).json({result: 'I am alive.'});
});

// route POST reqs to /prompt to logic that forwards the prompt on to ChatGPT
router.post('/prompt', async function(req, res) {
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: promptPreamble + ' ' + req.body.prompt,
            max_tokens: 1000,
            temperature: 0.7
        });

        res.status(200).json({result: completion.data.choices[0].text});

    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            res.status(error.response.status).json({result: error.response.data});

        } else {
            console.log(error.message);
        }
    }
});

app.use('/api', router);

//Create a secure server
var server = http.createServer(app);
var port = 8090
server.listen(port)
console.log('listening on port ' + port);
