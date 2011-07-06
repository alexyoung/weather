var brain = require('brain')
  , bayes = new brain.BayesianClassifier()
  , neural = new brain.NeuralNetwork()
  , fs = require('fs');

function loadWeather(file, train, done) {
  var dataOffset = 7;

  fs.readFile(file, function(err, data) {
    if (err) throw err;
    var rows = data.toString().split('\n').slice(dataOffset);
    rows.forEach(function(row, i) {
      var cols = row.split(/\s+/);
      if (cols && cols.length > 1) {
        train({
            year: parseInt(cols[1], 10)
          , month: parseInt(cols[2], 10)
          , maxTemp: parseFloat(cols[3])
          , minTemp: parseFloat(cols[4])
          , temp: (parseFloat(cols[3]) + parseFloat(cols[4])) / 2.0
          , rain: parseFloat(cols[6])
          , sunHours: parseFloat(cols[7])
        });
      }

      if (i === rows.length - 1) {
        done();
      }
    });
  });
}

function classifyHeat(temp) {
  if (temp < 0) {
    return 'freezing';
  } else if (temp > 0 && temp < 10) {
    return 'cold';
  } else if (temp >= 10 && temp < 16) {
    return 'cool';
  } else if (temp >= 16 && temp < 20) {
    return 'warm';
  } else if (temp >= 20) {
    return 'hot';
  }
}

loadWeather(__dirname + '/data/heathrowdata.txt', function(values) {
  var heat = classifyHeat(values.temp);
  bayes.train(values.month.toString(), heat);
}, function() {
  console.log('Month\tAvg. Temperature');
  for (var i = 1; i <= 12; i++) {
    console.log(i + '\t' + bayes.classify(i.toString()));
  }
});
