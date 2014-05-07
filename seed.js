#!/usr/bin/env node

/**
 * This script inserts into mongo the contents of all the .json files in the /seeds directory.
 *
 * The name of the file is the collection that the contents of that file will be inserted into.
 *      Example: This script will insert all the records in cohort.json into the collection "cohort"
 *
 * Note: Make sure all .json files in the /seeds directory are the singular form.
 *
 * Usage: $ node seed
 *
 * @author Tom Caflisch
 */

var optimist = require('optimist');
var argv = optimist
    .usage('Populate mongo from a set of .json files. \n Usage: $ node seed')
    .describe('d', 'The path to your mongo db')
    .demand(['d'])
    .argv;
var monk = require('monk');
var dir = './seeds';
var db = monk('mongodb://'+argv.d);
var fs = require('fs'); // Used to get all the files in a directory
var count = 0;  // Counter variable used to call the callback after all the mongo inserts have completed

// Read all the files in the ./seeds folder
var list = fs.readdirSync(dir);

// Call the method to actually seed the db and when it's complete, close the connection to mongo
seed_db(list, function() {
  db.close();
});

/**
 * Loops through all the .json files in ./seeds and remove all the records from the collection,
 *    then insert each of the records from the seed files themselves.
 *
 * @param list      - The list of all the files
 * @param callback
 */
function seed_db(list, callback) {

  // For every file in the list
  list.forEach(function (file) {

    // Set the filename without the extension to the variable collection_name
    var collection_name = file.split(".")[0];

    // Parses the contents of the current .json file
    var parsedJSON = require(dir + '/' + file);

    // Add the number of records to the count variable
    count += parsedJSON.length;

    // Loop through all the objects in the current .json file
    for (var i = 0; i < parsedJSON.length; i++) {

      var collection = db.get(collection_name);

      // Remove all records in the collection
      collection.remove({}, function() {

        // Insert records into the collection
        collection.insert(parsedJSON[i], function (err, doc) {

          // Decrement the count in each callback of the insert statement
          count--;

          if (err) {
            console.log(err);
          }

          // Once all the records have been inserted, call the callback
          if(count == 0) {
            return callback();
          }
        });
      })
    }
  });
}





