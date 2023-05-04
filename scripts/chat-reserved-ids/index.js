require('dotenv').config()

const fs = require('fs')
const { MongoClient } = require('mongodb')

const MIN_ID = 10000
const MAX_ID = 99999

const client = new MongoClient(process.env.MONGO_URL)

client.connect().then(init)

async function init () {
  const collection = client.db('chat-server').collection('ids')

  const batch = collection.initializeOrderedBulkOp()

  for (let i = MIN_ID; i <= MAX_ID; i ++) {
    const data = {
      id: i,
      reserved: false,
    }

    let matched

    // match aabb
    if (matched = String(i).match(/(\d)\1{1}(\d(?<!\1))\2/)) {
      data.AABB = true
      data.reserved = true
    }

    // match abcabc
    if (matched = String(i).match(/((\d)(\d(?!\2))(?!\3)(\d(?!\3)))\1/)) {
      data.ABCABC = true
      data.reserved = true
    }

    // match aaabbb
    if (matched = String(i).match(/(\d)\1{2}(\d(?<!\1))\2{2}/)) {
      data.AAABBB = true
      data.reserved = true
    }

    // match repeated
    if (matched = String(i).match(/(\d)\1{2,}/)) {
      const length = matched[0].length
      data['A'.repeat(length)] = true
      data.reserved = true
    }

    batch.insert(data)
  }

  batch.execute().then(console.log)


  const ids = await client.db('chat-server').collection('ids').find({}).toArray()
  console.log(ids)
}

// const stream = fs.createWriteStream('output.txt', { flags: 'a' })

// stream.on('ready', function () {
//   for (let i = MIN_ID; i <= MAX_ID; i ++) {
//     const data = {
//       id: i,
//       reserved: false,
//     }

//     let matched

//     // match aabb
//     if (matched = String(i).match(/(\d)\1{1}(\d(?<!\1))\2/)) {
//       data.AABB = true
//       data.reserved = true
//     }

//     // match abcabc
//     if (matched = String(i).match(/((\d)(\d(?!\2))(?!\3)(\d(?!\3)))\1/)) {
//       data.ABCABC = true
//       data.reserved = true
//     }

//     // match aaabbb
//     if (matched = String(i).match(/(\d)\1{2}(\d(?<!\1))\2{2}/)) {
//       data.AAABBB = true
//       data.reserved = true
//     }

//     // match repeated
//     if (matched = String(i).match(/(\d)\1{2,}/)) {
//       const length = matched[0].length
//       data['A'.repeat(length)] = true
//       data.reserved = true
//     }

//     // console.log(data)
//     stream.write(JSON.stringify(data) + '\n')
//   }

//   stream.close()
// })

