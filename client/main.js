let axios = require('axios')
let ldb = require('./lowdbHelper.js').LowDbHelper
let ldbHelper = new ldb()
let allSubtitles = ldbHelper.getData()

let server = "http://localhost"
let podsWorkDone = []
let subtitlesDetails = []
let errors = []

function main() {
  let execute = process.argv[2] ? process.argv[2] : 0
  execute = parseInt(execute)
  switch (execute) {
    case 0:
      getSubtitles()
      break;
    case 1:
      getSubtitlesDetails()
      break;
  }
}

function getSubtitles() {
  console.log('getting subtitles')
  let data = {
    url: 'http://books.toscrape.com/index.html',
    nrOfPages: 20
  }
  let begin = Date.now();
  axios.post(`${server}/api/subtitles`, data).then(result => {
    let end = Date.now();
    let timeSpent = (end - begin) / 1000 + "secs";
    console.log(`took ${timeSpent} to retrieve ${result.data.subtitles.length} subtitles`)
    ldbHelper.saveData(result.data.subtitles)
  })
}

function getSubtitlesDetails() {
  let begin = Date.now()
  for (let j = 0; j < allSubtitles.length; j++) {
    let data = {
      url: allSubtitles[j].url,
      nrOfPages: 1
    }
    sendRequest(data, function (result) {
      parseResult(result, begin)
    })
  }
}
  
async function sendRequest(payload, cb) {
  let subtitle = payload
  try {
    await axios.post(`${server}/api/subtitles`, subtitle).then(response => {
      ldbHelper.saveData(result.data.subtitles)
      if (Object.keys(response.data).includes('error')) {
        let res = {
          url: subtitle.url,
          error: response.data.error
        }
        cb(res)
      } else {
        cb(response.data)
      }
    })
  } catch (error) {
    console.log(error)
    let res = {
      url: subtitle.url,
      error: error
    }
    cb({ res })
  }
}

function parseResult(result, begin){
  try {
    let end = Date.now()
    let timeSpent = (end - begin) / 1000 + "secs ";
    if (!Object.keys(result).includes("error")) {
      let wasSuccessful = Object.keys(result.subtitlesDetails).length > 0 ? true : false
      if (wasSuccessful) {
        let podID = result.hostname
        let podsIDs = podsWorkDone.length > 0 ? podsWorkDone.map(pod => { return Object.keys(pod)[0]}) : []
        if (!podsIDs.includes(podID)) {
          let podWork = {}
          podWork[podID] = 1
          podsWorkDone.push(podWork)
        } else {
          for (let pwd = 0; pwd < podsWorkDone.length; pwd++) {
            if (Object.keys(podsWorkDone[pwd]).includes(podID)) {
              podsWorkDone[pwd][podID] += 1
              break
            }
          }
        }
        subtitlesDetails.push(result)
      } else {
        errors.push(result)
      }
    } else {
      errors.push(result)
    }
    console.log('podsWorkDone', podsWorkDone, ', retrieved ' + subtitlesDetails.length + " subtitles, ",
      "took " + timeSpent + ", ", "used " + podsWorkDone.length + " pods,", " errors: " + errors.length)
    saveSubtitleDetails()
  } catch (error) {
    console.log(error)
  }
}

function saveSubtitleDetails() {
  let subtitles = ldbHelper.getData()
  for (let b = 0; b < subtitles.length; b++) {
    for (let d = 0; d < subtitlesDetails.length; d++) {
      let item = subtitlesDetails[d]
      if (subtitles[b].url === item.url) {
        subtitles[b].subtitlesDetails = item.subtitlesDetails
        break
      }
    }
  }
  ldbHelper.saveData(subtitles)
}

main()