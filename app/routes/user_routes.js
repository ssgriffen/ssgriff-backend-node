module.exports = function(app, db) {
    app.post('/api/signin', (req, res) => {
        if(req.body.password === 'sam'){
            res.send({'result': true});
        } else {
            res.send({'result': false});
        }
    });
};