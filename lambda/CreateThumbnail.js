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
 
exports.handler = function(event, context) {
    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    var srcBucket = event.Records[0].s3.bucket.name;
    var srcKey    = event.Records[0].s3.object.key;
    var dstBucket = srcBucket;
    var dstKey    = srcKey.replace(/^images/, 'thumbnails');

    // Get the file extension
    var typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        console.error('unable to infer image type for key ' + srcKey);
        return;
    }
    var imageType = typeMatch[1];
    if (imageType != "jpg" && imageType != "png") {
        console.log('skipping non-image ' + srcKey);
        return;
    }

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
                var scalingFactor = Math.min(
                    MAX_WIDTH / size.width,
                    MAX_HEIGHT / size.height
                );
                var width  = scalingFactor * size.width;
                var height = scalingFactor * size.height;
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
            } else {
                console.log(
                    'Successfully resized ' + srcBucket + '/' + srcKey +
                    ' and uploaded to ' + dstBucket + '/' + dstKey
                );
            }

            context.done();
        }
    );
};
