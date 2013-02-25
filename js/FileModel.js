function FileModel() {
  this.name = ko.observable('');
  this.progress = ko.observable(0);
  this.processing = ko.observable(false); 
  this.numWords = ko.observable(0); 
  this.numTopics = ko.observable(0); 

  this.wordMap = ko.observable({});

  this.initDropHandlers_();
  ko.applyBindings(this, document.getElementById('file_name'));
  ko.applyBindings(this, document.getElementById('file_info'));
  ko.applyBindings(this, document.getElementById('msg'));
}

FileModel.prototype.initDropHandlers_ = function() {
  function handleFileSelect(evt) {
    evt.preventDefault();
    this.setFile(evt.dataTransfer.files[0]);
  }

  function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  // Setup the dnd listeners.
  var dropZone = document.body;
  dropZone.addEventListener('dragover', handleDragOver.bind(this), false);
  dropZone.addEventListener('drop', handleFileSelect.bind(this), false);
};

FileModel.prototype.setFile = function(file) {
  this.name(file.name);
  this.readFile_(file);
};

FileModel.prototype.readFile_ = function(file) {
  var reader = new FileReader();
  reader.onprogress = function(evt) {
    // evt is an ProgressEvent.
    if (evt.lengthComputable) {
      var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
      this.progress(percentLoaded);
    }
  }.bind(this);
  reader.onload = function(evt) {
    this.processing(false);
    this.parseData_(evt.currentTarget.result);
  }.bind(this);
  this.processing('Reading file');
  reader.readAsText(file);
};

FileModel.prototype.parseData_ = function(data) {
  var total = data.length;
  var progress = 0; 
  var index = 0;
  var wm = {};
  var self = this;
  var counter = 0;
  var topic_processed = false;

  this.progress(0);
  this.processing('Parsing data');

  batch(data, 10000, function(data) {
    counter++;
    var word = data.substring(index, data.indexOf('\t', index));
    index += word.length + 1;
    var values = data.substring(index, data.indexOf('\n', index));
    index += values.length + 1;
    values = values.trim().split(/\s+/).map(function(val) {
      return +val;
    });
    
    if (!topic_processed) {
      topic_processed = true;
      self.numTopics(values.length);
    }

    wm[word] = values;
    self.progress(Math.round((index / total) * 100) );
    self.numWords(counter);

    if (index === total) {
      return false;
    }
  }).then(function() {
    self.numWords(counter);
    self.processing(false);
    self.wordMap(wm);
    self.onParseEnd_();
  });
};

FileModel.prototype.onParseEnd_ = function() {
};



var fileModel = new FileModel();
