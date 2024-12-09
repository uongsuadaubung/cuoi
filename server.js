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




const saveFile = (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data));
}

const readFile = (path) => {
    let data = "";
    if (!fs.existsSync(path)) {
        saveFile(path,[]);
        data = [];
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
    //   "will_you_attend": "I will definitely attend",
    //   "whose_guest_are_you": "Bride"
    // }
    if (!confirmationData.find(item=>{
        item.your_name === receivedData.your_name &&
            item.wedding_ceremony === receivedData.wedding_ceremony &&
            item.groom_reception === receivedData.groom_reception &&
            item.will_you_attend === receivedData.will_you_attend &&
            item.whose_guest_are_you === receivedData.whose_guest_are_you
    })){
        confirmationData.unshift(receivedData);
        saveFile(confirmationPath,confirmationData);
    }


    res.json({ message: 'Dữ liệu đã được nhận!', data: receivedData });
});

app.get('/api/diary', (req, res) => {

    res.json({message: "oke", data: diaryData.slice(0,10)});
})
app.post('/api/diary', (req, res) => {
    const receivedData = req.body;
    if (!diaryData.find(item => item.name === receivedData.name && item.message === receivedData.message)) {
        diaryData.unshift(receivedData);
        saveFile(diaryPath,diaryData);
    }

    res.json({message: "oke", data: diaryData.slice(0,10)});
})

app.get('/excel-diary', (req, res) => {

});

app.get('/excel-confirmation', (req, res) => {

})


// Middleware để xử lý lỗi 404
app.use((req, res, next) => {
    res.status(404).send('404 - Không tìm thấy trang!');
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng http://localhost:${PORT}`);
});
