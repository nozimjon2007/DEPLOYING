const {
    Router
} = require('express');
const multer = require('../middleware/multer').single("photo");
const Schema = require('../model/Schema');
const user = require('../model/Register');
const path = require('path');
const router = Router();


// add page page methof of Get
router.get('/product/add', (req, res) => {
    res.render('add', {
        title: "Add page",
        page: "Maxsulotlar Qo'shish",
        button: "Submit"
    });
});

// data add page methof of Post
router.post('/product/add', multer, (req, res) => {
    // console.log(req.body);
    // console.log(req.file);
    req.checkBody("title", "Maxsulot nomini bosh qoldirish mumkin emas.").notEmpty();
    req.checkBody("price", "Maxsulot price bosh qoldirish mumkin emas.").notEmpty();
    req.checkBody("category", "Maxsulot category bosh qoldirish mumkin emas.").notEmpty();

    const errors = req.validationErrors();
    if (errors) {
        res.render("add", {
            title: "Error",
            errors: errors
        });
    } else {
        // console.log("Test");
        const db = new Schema({
            title: req.body.title,
            price: req.body.price,
            category: req.body.category,
            comments: req.body.comments,
            sale: req.body.sale,
            photo: req.file.path,
            dirUser: req.user.id
        });
        db.save((err) => {
            if (err) {
                console.log(err);
            } else {
                req.flash("success", "All succesfully! Ok!!");
                res.redirect("/");
            }
        });
    }
});

router.get('/product/edit/:userId', multer, (req, res) => {
    Schema.findById(req.params.userId, (err, data) => {
        if (data.dirUser != req.user._id) {
            req.flsh("danger", 'Maxsulot o`zgartirildi')
            res.redirect('/')
        } else {
            res.render('add', {
                title: 'Mahsulotni o`zgartirish',
                datas: data
            })
        }
    })
})

// card update page methof of Post
router.post('/product/edit/:userId', multer, (req, res) => {

    const errors = req.validationErrors();
    if (errors) {
        res.render("add", {
            title: "Error",
            errors: errors
        });
    } else {
        // console.log("Test");
        const db = ({
            title: req.body.title,
            price: req.body.price,
            category: req.body.category,
            comments: req.body.comments,
            sale: req.body.sale,
            photo: req.file.path
        });
        const ids = {
            _id: req.params.userId
        }
        Schema.updateOne(ids, db, (err) => {
            if (err) {
                console.log(err);
            } else {
                req.flash("info", "Maxsulot o'zgartirildi");
                res.redirect("/");
            }
        });
    }
});


// card delete page methof of Get
router.get("/product/remove/:id", (req, res) => {
    if (!req.user.id) {
        res.status(500).send()
    }
    let id = {
        _id: req.params.id
    }
    Schema.findById(req.params.id, (err, data) => {
        if (data.dirUser != req.user._id) {
            req.flash('danger', "Eror")
            res.redirect('/')
        } else {
            Schema.findOneAndDelete(id, (err) => {
                if (err) console.log(err)
                else {
                    req.flash('success', 'Maxsulotingiz o`chirildi')
                    res.redirect('/')
                }
            })
        }
    });
});

module.exports = router;