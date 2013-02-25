function Model(file) {
  "use strict";
  this.title = file.name;
  this.progress = ko.observable('0%');
  this.file_ = file;
  this.loading = ko.observable(true);
  this.parsing = ko.observable(false);

  this.wordMap_ = {};
  this.topics = ko.observable(0);
  this.topicNames = ko.computed(function() {
    var topics = this.topics();
    var names = [];
    for (var i = 0; i < topics; i++) {
      names.push({name: 'Topic ' + (i + 1), value: i});
    }
    return names;
  }, this);
  this.selectedTopic = ko.observable(0);

  this.selectedTopic.subscribe(function() {
    this.createWordCloud();
  }, this);

  this.readFile_(file);

}

Model.prototype.readFile_ = function(file) {
  var reader = new FileReader();
  reader.onprogress = function(evt) {
    // evt is an ProgressEvent.
    if (evt.lengthComputable) {
      var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
      this.progress(percentLoaded + '%');
    }
  }.bind(this);
  reader.onload = function(evt) {
    this.loading(false);
    this.parseData_(evt.currentTarget.result);
  }.bind(this);
  reader.readAsText(file);
};

Model.prototype.parseData_ = function(data) {
  var total = data.length;
  var progress = 0; 
  var index = 0;
  var wm = this.wordMap_;
  var self = this;

  this.progress(0);
  this.parsing(true);

  batch(data, 1000, function(data) {
    var word = data.substring(index, data.indexOf('\t', index));
    index += word.length + 1;
    var values = data.substring(index, data.indexOf('\n', index));
    index += values.length + 1;
    values = values.trim().split(/\s+/).map(function(val) {
      return +val;
    });

    wm[word] = values;
    self.progress(Math.round((index / total) * 100) + '%');

    if (index === total) {
      return false;
    }
  }).then(function() {
    self.parsing(false);
    self.onParseEnd_();
  });
};

Model.prototype.onParseEnd_ = function() {
  // Get number of topics
  for (var word in this.wordMap_) {
    this.topics(this.wordMap_[word].length);
    break;
  }
};



