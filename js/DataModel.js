function DataModel() {
  this.topicNames = ko.observableArray();
  this.topics = ko.observable();
  this.filteredData = ko.observableArray();
  this.topNWords = ko.observable(100);
  this.selectedTopic = ko.observable(0);
  this.selectedWords = ko.observableArray();
  this.metric = ko.observable(0);
  this.data = ko.observable();

  this.processing = ko.observable(false);
  this.progress = ko.observable(0);

  this.wordMap = ko.observable([]);
  this.reverseWordMap = {};

  fileModel.wordMap.subscribe(function(wm) {
    this.selectedWords([]);
    this.numTopics = 0;
    for (var word in wm) {
      this.numTopics = wm[word].length;
    }

    var names = [];
    for(var i = 0; i < this.numTopics; i++) {
      names.push({name: 'Topic ' + (i+1), value: i});
    }
    this.topicNames(names);

    this.prepareData(wm);
  }, this);

  this.selectedTopic.subscribe(this.filterData.bind(this));

  this.topNWords.subscribe(function() {
    this.filterData();
  }, this);

  this.selectedWords.subscribe(function(val) {
    if (val.length === 0) {
      this.selectedWordColor = d3.scale.category10();
    }
  }, this);

  ko.applyBindings(this, document.getElementById('filter'));
}

DataModel.prototype.getData = function() {
  return this.data()[this.metric()];
};

DataModel.prototype.getOffset = function(word_index, topic_index) {
  return word_index * this.num_topics * 8 + i + topic_index * 8;
};

DataModel.prototype.prepareData = function(wm) {
  // Normalize data
  var self = this;
  var num_topics = this.numTopics;
  var num_words = fileModel.numWords();
  var raw_data = new ArrayBuffer(num_topics * num_words * 8);
  var norm_data = new ArrayBuffer(num_topics * num_words * 8);
  var raw_data_view = new Float64Array(raw_data);
  var norm_data_view = new Float64Array(norm_data);
  var data = [
    raw_data_view,
    norm_data_view
  ];
  var wordMap = [];
  var reverseWordMap = {};
  var sum = new Array(this.numTopics);
  for (var i = 0; i < this.numTopics; i++) {
    sum[i] = 0;
  }

  this.progress(0);
  this.processing('Normalising data');

  batch(wm, 5000, function(key, values, index, total) {
    wordMap[index] = key;
    for (var i = 0, l = values.length; i < l; i++) {
        sum[i] += values[i];
    }
    raw_data_view.set(values, index * num_topics);
    reverseWordMap[key] = index;
    self.progress(Math.round((index / (total*2)) * 100) );
  }).then(function() {
    var l = num_topics;
    return batch(wordMap, 5000, function(index, word, cindex, total) {
      var ndata = norm_data_view;
      var rdata = raw_data_view;
      for (var i = 0, o = index * num_topics; i < l; i += 1,o += 1 ) {
        ndata[o] = rdata[o] / sum[i];
      }
      self.progress(Math.round(((total + index) / (total*2)) * 100) );
    });
  }).then(function() {
    var topics = new Array(num_topics);
    var rdata = raw_data_view;
    var ntopics = num_topics;
    for (var i = 0, l = num_topics; i < l; i++) {
      topics[i] = d3.range(num_words).sort(function(a, b) {
        return rdata[b*ntopics + i] - rdata[a*ntopics + i];
      });
    }

    self.data(data);
    self.topics(topics);
    self.reverseWordMap = reverseWordMap;
    self.wordMap(wordMap);

    self.processing(false);
    self.filterData();
  });
};

DataModel.prototype.filterData = function() {
  if (this.topics().length === 0) {
    return;
  }
  this.filteredData(this.topics()[+this.selectedTopic()].slice(0, this.topNWords()));
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
