var ObjectID = require('mongodb').ObjectID;
const slugify = require('slugify')
const AWS = require('aws-sdk');
const formidable = require('formidable');
const sanitize = require("sanitize-filename");
const markdown = require( "markdown" ).markdown;
const s3 = new AWS.S3();
const fs = require('fs');

function getImages(slug){
    return new Promise(function(resolve, reject) {  
        let poss_img = []
    
        let params = {
            Bucket: 'sam-app-bucket', 
        };
        s3.listObjects(params, function(err, data) {

            if (err){
                resolve(poss_img);
            } else {
                
                for(var i = 0; i < data['Contents'].length; i++){
                    poss_img.push(data['Contents'][i]['Key']);;
                }
                resolve(poss_img);    
            }  
        });
    });    
}

function deleteImgs(slug){
    getImages().then(function(poss_imgs) { 
            
            let params = {
                Bucket: "sam-app-bucket", 
                Key: ""
            };

            for(var i = 0; i < poss_imgs.length; i++){
                if(poss_imgs[i].includes(slug)){
                    params.Key = poss_imgs[i];
                    s3.deleteObject(params, function(err, data) {});
                }
            }
    });
}

module.exports = function(app, db) {

    app.post('/api/single_blog', (req, res) => {
        // get single post
        const details = {'slug': req.body.slug };

        getImages().then(function(poss_imgs) { 
            let img_list = [];

            for(var i = 0; i < poss_imgs.length; i++){
                if(poss_imgs[i].includes(req.body.slug)){
                    img_list.push(poss_imgs[i]);
                }
            }

            db.collection('blogs').findOne(details, (err, item) => {
                if (err) {
                    res.send({'result': false, 'reason': err})
                } else {
                    item.img = img_list;
                    item.content = markdown.toHTML(item.content);
                    item.excerpt = markdown.toHTML(item.excerpt);
                    res.send({'result': true, 'data': item});
                } 
            });

        });
    });

    app.get('/api/all_blogs', (req, res) => {
        // get all posts
        getImages().then(function(poss_imgs) { 
            db.collection('blogs').find({}).toArray(function(err, items) {
                items.forEach(function(element) {
                    let img_list = [];

                    for(var i = 0; i < poss_imgs.length; i++){
                        if(poss_imgs[i].includes(element.slug)){
                            img_list.push(poss_imgs[i]);
                        }
                    }
                    element.img = img_list;
                    element.content = markdown.toHTML(element.content);
                    element.excerpt = markdown.toHTML(element.excerpt);
                });
                if (err) {
                    res.send({'result': false, 'reason': err})
                } else {
                    res.send({'result': true, 'data': items}); 
                } 
            });
        });
    });

    app.post('/api/create_post', (req, res) => {
        // new blog post
        const blog = {
            "title": req.body.title,
            "date": req.body.date,
            "content": req.body.content,
            "excerpt": req.body.content.substring(0, 100) + "...",
            "slug": slugify(req.body.title)
        };
 
        db.collection('blogs').insert(blog, (err, result) => {
            if (err) { 
                res.send({'result': false, 'reason': err})
            } else {
                res.send({'result': true, 'data': result.ops[0], 'slug': blog.slug});
            }
        });

    });

    app.post('/api/upload_cover', (req, res) => {
        var form = new formidable.IncomingForm();

        form.parse(req);

        form.on('file', function(field, file) {
            let filename = sanitize(file.name);
           
            let body = new Buffer(file.path, 'binary').toString('base64');

            fs.readFile(file.path, function(err, data) {
                if (err) throw err;
            
                let params = {
                    Body:  data,
                    Bucket: "sam-app-bucket", 
                    Key: "blog_imgs/" + filename, 
                    ContentType: file.type,        
            };

            s3.putObject(params, function(err, data) {
                if(err) res.send({'result': true});
            });
          });
            
            
            
        });
        
        form.on('end', function() {
            res.send({'result': true});
        });

    });

    app.post('/api/delete_post', (req, res) => {
        //  delete single post
        const slug = req.body.slug;
        const details = {'slug': slug};

        db.collection('blogs').remove(details, (err, item) => {
            if (err) {
                res.send({'result': false, 'reason': err})
            } else {
                deleteImgs(slug);
                res.send({"result": true});
            }
        });

    });

    app.post('/api/create_slug', (req, res) => {
        let slug = slugify(req.body.title)
        res.send({'result': true, 'data': slug});
    });


//   will come back to updating a blog pose later.
//   app.put('/blog/:id', (req, res) => {
//     const id = req.params.id;
//     const details = { '_id': new ObjectID(id) };
//     const note = { text: req.body.body, title: req.body.title };
    
//     db.collection('blogs').update(details, note, (err, result) => {
//       if (err) {
//           res.send({'error':'An error has occurred'});
//       } else {
//           res.send(note);
//       } 
//     });
//   });

};