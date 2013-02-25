function DataModel() {
  this.topics = ko.observableArray();
  this.topicData = ko.observableArray();
  this.filteredData = ko.observableArray();
  this.topNWords = ko.observable(100);
  this.selectedTopic = ko.observable(0);
  this.selectedWords = ko.observableArray();
  this.metric = ko.observable(0);

  this.processing = ko.observable(false);
  this.progress = ko.observable(0);

  this.words = ko.observable([]);
  this.wordMap = {};
  
  fileModel.wordMap.subscribe(function(wm) {
    this.selectedWords([]);
    this.numTopics = 0;
    for (var word in wm) {
      this.numTopics = wm[word].length;
    }

    this.topics.removeAll();
    for(var i = 0; i < this.numTopics; i++) {
      this.topics.push({name: 'Topic ' + (i+1), value: i});
    }

    this.prepareWordMap(wm);
  }, this);

  this.selectedTopic.subscribe(function() {
    this.updateTopicData();
  }, this);

  this.topNWords.subscribe(function() {
    this.truncateData(); 
  }, this);

  this.selectedWords.subscribe(function(val) {
    if (val.length === 0) {
      this.selectedWordColor = d3.scale.category10();
    }
  }, this);

  ko.applyBindings(this, document.getElementById('filter'));
}

DataModel.prototype.prepareWordMap = function(wm) {
  // Normalize data
  var self = this;
  var num_topics = this.numTopics;
  var topics = [];
  var words = [];
  var sum = [];
  var wordMap = {};
  for (var i = 0; i < this.numTopics; i++) {
    sum.push(0);
    topics.push([]);
  }

  this.progress(0);
  this.processing('Normalising data');

  batch(wm, 10000, function(key, value, index, total) {
    words[index] = key;
    for (var i = 0, l = value.length; i < l; i++) {
        sum[i] += value[i];
        topics[i][index] = [index, [value[i]]];
    }
    wordMap[key] = [value];
    self.progress(Math.round((index / (total*2)) * 100) );
  }).then(function() {
    return batch(words, 10000, function(index, word, cindex, total) {
      var values = [];
      for (var i = 0, l = num_topics; i < l; i++) {
        var value = topics[i][index][1] / sum[i];
        topics[i][index][1][1]= value;
        values.push(value);
      }
      wordMap[word].push(values);
      self.progress(Math.round(((total + index) / (total*2)) * 100) );
    });
  }).then(function() {
    topics.forEach(function(list) {
      list.sort(function(a, b) {
        return b[1][0] - a[1][0];
      });
    });

    self.topic_values = topics;
    self.words(words);
    self.wordMap = wordMap;

    self.processing(false);
    self.updateTopicData();
  });
};

DataModel.prototype.updateTopicData = function() {
  var topic = this.selectedTopic();
  if (this.words().length === 0) {
   return;
  } 

  this.topicData(this.topic_values[topic]);
  this.truncateData();
};

DataModel.prototype.truncateData = function() {
  this.filteredData(this.topicData.slice(0, this.topNWords()));
};

DataModel.prototype.addWord = function(word) {
  if (this.selectedWords.indexOf(word) > -1) {
    this.removeWord(word);
  }
  else {
    this.selectedWords.push(word);
  }
};

DataModel.prototype.removeWord = function(word) {
  if (this.selectedWords.indexOf(word) > -1) {
    this.selectedWords.remove(word);
  }
};

var dataModel = new DataModel();
