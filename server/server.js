const express = require('express');
const bodyParser = require('body-parser')
const os = require('os');

const PORT = 5000;
const app = express();
let timeout = 1500000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

let browsers = 0
let maxNumberOfBrowsers = 20

app.get('/', (req, res) => {
  console.log(os.hostname())
  let response = {
    msg: 'hello world',
    hostname: os.hostname().toString()
  }
  res.send(response);
});

app.post('/api/subtitles', async (req, res) => {
  req.setTimeout(timeout);
  try {
    let data = req.body
    console.log(req.body.url)
    while (browsers == maxNumberOfBrowsers) {
      await sleep(1000)
    }
    await getSubtitlessHandler(data).then(result => {
      let response = {
        msg: 'retrieved subtitles ',
        hostname: os.hostname(),
        subtitlesDetails: result
      }
      console.log('done')
      res.send(response)
    })
  } catch (error) {
    res.send({ error: error.toString() })
  }
});

async function getSubtitlessHandler(arg) {
  let pMng = require('./puppeteerManager')
  let puppeteerMng = new pMng.PuppeteerManager(arg)
  browsers += 1
  try {
    let subtitlesDetails = await puppeteerMng.getSubtitles().then(result => {
      return result
    })
    browsers -= 1
    return subtitlesDetails
  } catch (error) {
    browsers -= 1
    console.log(error)
  }
}

function sleep(ms) {
  console.log(' running maximum number of browsers')
  return new Promise(resolve => setTimeout(resolve, ms))
}

app.listen(PORT);
console.log(`Running on port: ${PORT}`);