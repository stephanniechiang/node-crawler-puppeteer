const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('subtitles.json')

class LowDbHelper {
    constructor() {
        this.db = lowdb(adapter);
    }

    getData() {
        try {
            let data = this.db.getState().books
            return data
        } catch (error) {
            console.log('error', error)
        }
    }

    saveData(arg) {
        try {
            this.db.set('books', arg).write()
            console.log('data saved successfully!!!')
        } catch (error) {
            console.log('error', error)
        }
    }
}

module.exports = { LowDbHelper }