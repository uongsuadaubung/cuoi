const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
// Thiết lập thư mục public để phục vụ tệp tĩnh
app.use(express.static(path.join(__dirname, 'cuoi')));
// Cấu hình body-parser để xử lý JSON
app.use(bodyParser.json());
const fs = require('fs');

const diaryPath = path.join(__dirname, 'diary.txt');
const confirmationPath = path.join(__dirname, 'confirmation.txt');

const xlsx = require('xlsx');


const saveFile = (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data));
}

const readFile = (path) => {
    let data = "[]";
    if (!fs.existsSync(path)) {
        saveFile(path,data);
    }else {
        data = fs.readFileSync(path, 'utf8');
    }
    return JSON.parse(data);
}
const diaryData = readFile(diaryPath);

const confirmationData = readFile(confirmationPath);
// Route chính
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cuoi', 'index.html'));
});
// Route POST /confirm để nhận dữ liệu JSON
app.post('/api/confirmation', (req, res) => {
    const receivedData = req.body;
    //{
    //   "your_name": "kien",
    //   "wedding_ceremony": "Yes",
    //   "groom_reception": "No",
    //   "bride_reception": "No",
    //   "will_you_attend": "I will definitely attend",
    //   "whose_guest_are_you": "Bride"
    // }
    if (!receivedData.your_name || !receivedData.wedding_ceremony || !receivedData.groom_reception || !receivedData.bride_reception || !receivedData.will_you_attend || !receivedData.whose_guest_are_you) {
        res.status(400).json({ message: 'Không nhận được được dữ liệu!' });
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

    let find = false;
    confirmationData.forEach(item => {
        if (item.your_name === newData.your_name
            && item.wedding_ceremony === newData.wedding_ceremony
            && item.groom_reception === newData.groom_reception
            && item.bride_reception === newData.bride_reception
            && item.will_you_attend === newData.will_you_attend
            && item.whose_guest_are_you === newData.whose_guest_are_you){
            find = true;
        }
    })
    if (!find){
        confirmationData.unshift(newData);
        saveFile(confirmationPath,confirmationData);
    }


    res.json({ message: 'Dữ liệu đã được nhận!', data: receivedData });
});

app.get('/api/diary', (req, res) => {

    res.json({message: "oke", data: diaryData.slice(0,5)});
})
app.post('/api/diary', (req, res) => {
    const receivedData = req.body;

    if (!receivedData.name || !receivedData.message) {
        res.status(400).json({ message: 'Không nhận được được dữ liệu!' });
        return;
    }
    const newData = {
        name: receivedData.name.trim(),
        message: receivedData.message.trim(),
        time: receivedData.time,
    }
    if (!diaryData.find(item => item.name === newData.name && item.message === newData.message)) {
        diaryData.unshift(newData);
        saveFile(diaryPath,diaryData);
    }

    res.json({message: "oke", data: diaryData.slice(0,5)});
})

app.get('/excel-diary', (req, res) => {
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

app.get('/excel-confirmation', (req, res) => {
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
