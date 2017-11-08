function fetchNearestCops(db, coordinates, callback) {
    db.collection('policeData').createIndex({
        "location": "2dsphere"
    }, function() {
        db.collection("policeData").find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: coordinates
                    },
                    $maxDistance: 2000
                }
            }
        }).toArray(function(err, results) {
            if(err) {
                console.log(err)
            }else {
                callback(results);
            }
        });
    });
}

function fetchCopDetails(db, userId, callback) {
  console.log("z")
    db.collection("policeData").findOne({
        userId: userId
    }, function(err, results) {
        if (err) {
          console.log("e")
            console.log(err);
        } else {
          console.log("f");
            callback({
                copId: results.userId,
                displayName: results.displayName,
                phone: results.phone,
                location: results.location
            });
        }
    });
}

    //Saves details like citizen’s location, time
    function saveRequest(db, issueId, requestTime, location, citizenId, status, callback){
        db.collection('requestsData').insert({
            "_id": issueId,
            "requestTime": requestTime,
            "location": location,
            "citizenId": citizenId,
            "status": status
        }, function(err, results){
               if(err) {
                   console.log(err);
               }else{
                   callback(results);
               }
        });
    }

    function updateRequest(db, requestId, copId, status, callback) {
    db.collection('requestsData').update({
        "_id": requestId //Perform update for the given requestId
    }, {
        $set: {
            "status": status, //Update status to 'engaged'
            "copId": copId  //save cop's userId
        }
    }, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            callback("Issue updated")
        }
    });
    }

    function fetchRequests(db, callback) {
    var collection = db.collection('requestsData');
    //Using stream to process potentially huge records
    var stream = collection.find({}, {
        requestTime: true,
        status: true,
        location: true
    }).stream();
    var requestsData = [];
    stream.on('data', function(request) {
        requestsData.push(request);
    });
    //Runs after results are fetched
    stream.on('end', function() {
        callback(requestsData);
    });
}


exports.fetchRequests = fetchRequests;
exports.updateRequest = updateRequest;
exports.saveRequest = saveRequest;

exports.fetchCopDetails = fetchCopDetails;


exports.fetchNearestCops = fetchNearestCops;
