const fs = require('fs');
const { default: isAlpha } = require('validator/lib/isAlpha');
const { default: isEmail } = require('validator/lib/isEmail');
const { default: isMobilePhone } = require('validator/lib/isMobilePhone');
const pool = require("../db");

// Membuat folder data apabila tidak ada
const dirPath = './data';
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

// Membuat file contacts.json jika belum ada
const dataPath = './data/contacts.json';
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, '[]', 'utf-8');
}

// Read file contacts.json
function loadContacts() {
    const file = fs.readFileSync('data/contacts.json', 'utf-8');
    const contacts = JSON.parse(file);
    return contacts;
}

// Menyimpan value ke dalam file contacts.json di folder data
function save(name, email, phone) {
    const contact = { name, email, phone }
    const contacts = loadContacts();
    // const duplicate = contacts.find((contact) => contact.name === name );
    // if (duplicate) {
    //     // console.log('Data yang serupa sudah ada!');
    //     // return false;
    //     return { msg: "Nama sudah ada" };
    // } else {
    //     contacts.push(contact);
    //     fs.writeFileSync('data/contacts.json', JSON.stringify(contacts));
    //     console.log('Terimakasih sudah memasukkan data!');
    //     return {msg: undefined}
    // }
    contacts.push(contact);
    fs.writeFileSync('data/contacts.json', JSON.stringify(contacts))
}

// Menampilkan list dari file JSON
function show() {
    const filedataObj = loadContacts();
    for (let i = 0; i < filedataObj.length; i++) {
        let obj = filedataObj[i];

        console.log(obj.name, obj.email, obj.phone);
    }
}

// Menampilkan data dari file JSON berdasarkan nama yang dicari
function getName(name) {
    const contacts = loadContacts();
    const found = contacts.find((contact) => contact.name === name);
    if (found) {
        console.log(found.name, found.email, found.phone);
    } else {
        console.log('Nama tidak ditemukan!');
    }
    return found;
}

// Menghapus data dari file JSON
function del(name) {
    const contacts = loadContacts();
    const fil = contacts.filter((contact) => contact.name !== name);
    fs.writeFileSync('data/contacts.json', JSON.stringify(fil));
}

// Mengupdate data pada file JSON berdasarkan nama yang dicari (menggunakan --where)
function up(where, name, email, phone) {
    const contacts = loadContacts();
    const fil = contacts.find((contacts) => contacts.name === where);
    del(name);
    if (name !== undefined) {
        if (isAlpha(name, 'en-US', { ignore: ' ' })) {
            fil.name = name;
        } else {
            console.log('Nama tidak sesuai dengan format!');
        }
    }
    if (email !== undefined) {
        if (isEmail(email)) {
            fil.email = email;
        } else {
            console.log('Email tidak sesuai dengan format!');
        }
    }
    if (phone !== undefined) {
        if (isMobilePhone(phone, 'id-ID')) {
            fil.phone = phone;
        } else {
            console.log('No hp tidak sesuai dengan format!');
        }
    }
    fs.writeFileSync('data/contacts.json', JSON.stringify(contacts));
    console.log('Data telah terupdate!');
}

async function checkDuplicate(name) {
    // const contacts = loadContacts();
    // const duplicate = contacts.find((contact) => contact.name === name );
    const {rows:duplicate} = await pool.query(`SELECT * FROM public.contacts WHERE name='${name}'`)
    if(duplicate.length>0){
        return duplicate[0]
    } else {
        return undefined
    }
}

module.exports = { loadContacts, save, show, getName, del, up, checkDuplicate };

checkDuplicate('wefwf')