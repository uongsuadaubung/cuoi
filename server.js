const express = require('express');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
// Thiết lập thư mục public để phục vụ tệp tĩnh
app.use(express.static(path.join(__dirname, 'cuoi')));
// Cấu hình body-parser để xử lý JSON
app.use(bodyParser.json());
const url = 'mongodb+srv://meow:test123@cluster0.6oza2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Thay thế bằng URL của MongoDB của bạn
const dbName = 'cuoi'; // Thay thế bằng tên cơ sở dữ liệu của bạn

const xlsx = require('xlsx');


MongoClient.connect(url).then(client => {
  const db = client.db(dbName);
  const confirmationCollection = db.collection('confirmation');
  const diaryCollection = db.collection('diary');
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cuoi', 'index.html'));
  });

  // Route POST /confirm để nhận dữ liệu JSON
  app.post('/api/confirmation', async (req, res) => {
    const receivedData = req.body;
    if (!receivedData.your_name || !receivedData.wedding_ceremony || !receivedData.groom_reception || !receivedData.bride_reception || !receivedData.will_you_attend || !receivedData.whose_guest_are_you) {
      res.status(400).json({message: 'Không nhận được được dữ liệu!'});
      return;
    }
    const newData = {
      your_name: receivedData.your_name.trim(),
      wedding_ceremony: receivedData.wedding_ceremony.trim(),
      groom_reception: receivedData.groom_reception.trim(),
      bride_reception: receivedData.bride_reception.trim(),
      will_you_attend: receivedData.will_you_attend.trim(),
      whose_guest_are_you: receivedData.whose_guest_are_you.trim()
    }
    const find = await confirmationCollection.findOne({
      your_name: newData.your_name,
      wedding_ceremony: newData.wedding_ceremony,
      groom_reception: newData.groom_reception,
      bride_reception: newData.bride_reception,
      will_you_attend: newData.will_you_attend,
      whose_guest_are_you: newData.whose_guest_are_you
    })
    if (find){
      res.json({message: 'Dữ liệu đã được nhận!', data: newData});
      return;
    }
    const data = await confirmationCollection.insertOne(newData);
    if (data.insertedId){
      res.json({message: 'Dữ liệu đã được nhận!', data: newData});
    }else {
      res.status(500).json({message: "Lỗi lưu dữ liệu"})
    }


  });

  app.get('/api/diary', async (req, res) => {
    const data = await diaryCollection.find()
      .sort({_id:-1})
      .limit(5)
      .toArray();
    res.json({message: "oke", data: data});
  })
  app.post('/api/diary', async (req, res) => {
    const receivedData = req.body;

    if (!receivedData.name || !receivedData.message) {
      res.status(400).json({message: 'Không nhận được được dữ liệu!'});
      return;
    }
    const newData = {
      name: receivedData.name.trim(),
      message: receivedData.message.trim(),
      time: receivedData.time,
    }
    const find = await diaryCollection.findOne({
      name: newData.name,
      message: newData.message,
    });
    const fiveDiary = await diaryCollection.find()
      .sort({_id:-1})
      .limit(5)
      .toArray();
    if (find){
      res.json({message: "oke", data: fiveDiary});
    }

    const data = await diaryCollection.insertOne(newData);

    if (data.insertedId){
      fiveDiary.pop();
      fiveDiary.unshift(newData);
      res.json({message: "oke", data: fiveDiary});
    }else {
      res.status(500).json({message: "Lỗi thêm dữ liệu"});
    }


  })

  app.get('/excel-diary', async (req, res) => {
    const diaryData = await diaryCollection.find()
      .sort({_id:-1})
      .toArray();

    const workBook = xlsx.utils.book_new();
    const workSheet = xlsx.utils.json_to_sheet(diaryData);
    xlsx.utils.book_append_sheet(workBook, workSheet, 'Sheet1');
    const filePath = path.join(__dirname, 'data.xlsx');
    xlsx.writeFile(workBook, filePath);
    res.download(filePath, "data.xlsx", (err) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error sending file');
      }
    });
  });

  app.get('/excel-confirmation', async (req, res) => {
    const confirmationData = await confirmationCollection.find()
      .sort({_id:-1})
      .toArray();

    const workBook = xlsx.utils.book_new();
    const workSheet = xlsx.utils.json_to_sheet(confirmationData);
    xlsx.utils.book_append_sheet(workBook, workSheet, 'Sheet1');
    const filePath = path.join(__dirname, 'confirm.xlsx');
    xlsx.writeFile(workBook, filePath);
    res.download(filePath, "confirm.xlsx", (err) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error sending file');
      }
    });
  })


// Middleware để xử lý lỗi 404
  app.use((req, res) => {
    res.status(404).send('404 - Không tìm thấy trang!');
  });

// Khởi động server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng http://localhost:${PORT}`);
  });

}).catch(error => {
  console.error(error)
});




