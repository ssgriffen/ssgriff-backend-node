const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_PRIMARY_EMAIL,
      pass: process.env.GMAIL_APP_KEY
    }
});


module.exports = function(app, db) {    
    app.post('/api/send_mail', (req, res) => {
        let mailOptions = {
            from: req.body.email,
            to: process.env.GMAIL_PRIMARY_EMAIL,
            subject: 'New Contact from samgriffen.com',
            html: "<p><b>From:</b> " + req.body.name +"</p></br><p><b>Email:</b> " + req.body.email +"</p><p><b>Content:</b> " + req.body.content +"</p>"
        };
              
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                res.send({'result': false, 'reason': error});
            } else {
                res.send({'result': true});
            }
        });

    });
};