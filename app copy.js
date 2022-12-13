const { urlencoded } = require('express')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const morgan = require('morgan')
const contacts = require('./data/contacts.js')
const { body, validationResult } = require('express-validator');
const app = express()
const pool = require("./db")
const port = 3000

app.use(express.static("public"));
app.use(express.json());
app.use(urlencoded({extended:true}));

// pake bootstrap
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

// pake ejs dan layout
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', 'layout/layout')
app.use(morgan('dev'))

app.use((req, res, next) => {
    console.log('Time:', Date.now())
    next()
})

// buka halaman index.ejs
app.get('/', (req, res) => {
    res.render('index',
    {
        nama: 'AKW',
        title: 'WebServer EJS',
    })
})

// buka halaman about.ejs
app.get('/about', (req, res) => {
    res.render('about', {title: 'About'})
})

// buka halaman contact.ejs
app.get('/contact', (req, res) => {
    cont = contacts.loadContacts();

    // if (typeof cont !== 'undefined') {
    //     res.render('contact', {
    //         nama: 'AKW',
    //         title: 'WebServer EJS',
    //         cont,
    //     })
    // } else {
    //     res.send('Error!')
    // }

    res.render('contact', {
        title: 'Contact',
        cont,
    })
})

// buka halaman form create contact
app
    .get('/create', (req, res) => {
        res.render('contactAdd', {
            title: 'Add Contact',
        })
    })
    // create contact dengan validasi
    .post('/create', body('name').custom((value) => {
        const duplicate = contacts.checkDuplicate(value);
        if (duplicate){
            throw new Error('Nama sudah ada!');
        }
        return true;
      }).isAlpha('en-US', { ignore: ' ' }).withMessage('Format nama tidak sesuai!'), body('phone').isMobilePhone('id-ID').withMessage('Format No. HP tidak sesuai!'), body('email').isEmail().withMessage('Format email tidak sesuai!'), (req, res) => {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('contactAdd', {
                title: 'Add Contact',
                errors: errors.array(),
            })
        } else {
            let name = req.body.name;
            let email = req.body.email;
            let phone = req.body.phone;
            contacts.save(name, email, phone);
        }

        res.redirect('/contact');
    })

// menampilkan halaman detail dari contact
app.get('/contact/:name', (req, res) => {
    cont = contacts.getName(req.params.name);

    res.render('contactDetail', {
        title: 'Detail Contact',
        cont,
    })
})

// hapus data
app.get('/delete/:name', (req, res) => {
    const cont = contacts.getName(req.params.name);

    if (!cont) {
        res.status("404");
        res.send("404");
    } else {
        contacts.del(req.params.name);
        res.redirect('/contact');
    }
})

// buka halaman update
app
    .get('/update/:name', (req, res) => {
        cont = contacts.getName(req.params.name);

        res.render('contactUpdate', {
            title: 'Update Contact',
            cont,
        })
    })
    // update contact
    .post('/update/:name', body('name').custom((value, {req}) => {
        const duplicate = contacts.checkDuplicate(value);
        if (value !== req.body.prevName && duplicate){
            throw new Error('Nama sudah ada!');
        }
        return true;
      }).isAlpha('en-US', { ignore: ' ' }).withMessage('Format nama tidak sesuai!'), body('phone').isMobilePhone('id-ID').withMessage('Format No. HP tidak sesuai!'), body('email').isEmail().withMessage('Format email tidak sesuai!'), (req, res) => {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('contactAdd', {
                title: 'Add Contact',
                errors: errors.array(),
            })
        } else {
            let where = req.params.name;
            let name = req.body.name;
            let email = req.body.email;
            let phone = req.body.phone;
            contacts.up(where, name, email, phone);
        }

        res.redirect('/contact');
    })

app.get('/product/:id', (req, res) => {
    res.send('product id : ' + req.params.id + '<br></br>'
        + 'category id : ' + req.query.idCat)
})

// diluar route diatas maka akan tampil halaman ini
app.use('/', (req, res) => {
    res.status(404)
    res.send('404: Page not found!')
})

// nampilin di CLI "example app port 3000"
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})