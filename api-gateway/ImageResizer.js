// dependencies
var async = require('async');
var AWS = require('aws-sdk');
var gm = require('gm')
            .subClass({ imageMagick: true }); // Enable ImageMagick integration.
var util = require('util');

// constants
var MAX_WIDTH  = 100;
var MAX_HEIGHT = 100;

// get reference to S3 client 
var s3 = new AWS.S3();

function error(code, message, context) {
	var error_object = { "error_code": code, "error_message" : message };
	//callback(JSON.stringify(error_object));
	context.fail(JSON.stringify(error_object));
}
 
exports.handler = function(event, context, callback) {
    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    var srcBucket = process.env.bucket_name;
    var srcKey    = 'images/' + event.image;
    var dstBucket = srcBucket;
    var dstKey    = srcKey.replace(/^images/, 'resized');
    var width     = parseInt(event.width);
    var height    = parseInt(event.height);

    console.log("srcBucket: " + srcBucket);
    console.log("srcKey:    " + srcKey);
    console.log("dstBucket: " + dstBucket);
    console.log("dstKey:    " + dstKey);
    console.log("width:     " + width);
    console.log("height:    " + height);

    // Do some crude input validation!!!
    if(event.image == "") {
	    error(422, "image parameter is required", context); return;
    }
    if(isNaN(width) || width <= 0 || width > 1000) {
	    error(422, "width parameter is required and must be between 1 and 1000", context); return;
    }
    if(isNaN(height) || height <= 0 || height > 1000) {
	    error(422, "height parameter is required and must be between 1 and 1000", context); return;
    }

    // Get the file extension
    var typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        console.error('unable to infer image type for key ' + srcKey, context);
	error(422, 'unable to infer image type for key ' + srcKey, context); return;
    }
    var imageType = typeMatch[1];
    if (imageType != "jpg" && imageType != "png") {
        console.log('skipping non-image ' + srcKey);
	error(422, "must be an image", context); return;
    }

    dstKey = dstKey.replace(/\.[^.]*$/, '') + "-" + width + "x" + height + "." + imageType;

    // Download the image from S3, transform, and upload back to S3
    async.waterfall([
        function download(next) {
            // Download the image from S3 into a buffer.
            console.log('getting object from s3');
            s3.getObject({
                    Bucket: srcBucket,
                    Key: srcKey
                },
                next);
            },
        function tranform(response, next) {
            gm(response.Body).size(function(err, size) {
                console.log(util.format('original image size is %d x %d', size.width, size.height));
                // Infer the scaling factor to avoid stretching the image unnaturally.
                /*var scalingFactor = Math.min(
                    MAX_WIDTH / size.width,
                    MAX_HEIGHT / size.height
                );
                var width  = scalingFactor * size.width;
                var height = scalingFactor * size.height;*/
                console.log(util.format('thumbnail image size is %d x %d', width, height));

                // Transform the image buffer in memory.
                this.resize(width, height)
                    .toBuffer(imageType, function(err, buffer) {
                        if (err) {
                            next(err);
                        } else {
                            next(null, response.ContentType, buffer);
                        }
                    });
            });
        },
        function upload(contentType, data, next) {
            // Stream the transformed image to a different S3 bucket.
            console.log('putting object to s3');
            s3.putObject({
                    Bucket: dstBucket,
                    Key: dstKey,
                    Body: data,
                    ContentType: contentType
                },
                next);
            }
        ], function (err) {
            if (err) {
                console.error(
                    'Unable to resize ' + srcBucket + '/' + srcKey +
                    ' and upload to ' + dstBucket + '/' + dstKey +
                    ' due to an error: ' + err
                );
		error(400, err, context); 
            } else {
                console.log(
                    'Successfully resized ' + srcBucket + '/' + srcKey +
                    ' and uploaded to ' + dstBucket + '/' + dstKey
                );
		const signedUrlExpireSeconds = 60 * 5

		const url = s3.getSignedUrl('getObject', {
			    Bucket: dstBucket,
		          Key: dstKey,
		          Expires: signedUrlExpireSeconds
		})
            	//context.done("s3://" + dstBucket + "/" + dstKey);
		context.done(url);
            }

        }
    );
};
