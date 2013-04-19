function TopNWordsModel() {
  this.words = ko.observable([]);
  this.nWords = 10;
  dataModel.wordMap.subscribe(this.prepareLists_, this);
  dataModel.metric.subscribe(this.prepareLists_, this);
  dataModel.filterExpression.subscribe(this.prepareLists_, this);
  dataModel.filterInclude.subscribe(this.prepareLists_, this);

  ko.applyBindings(this, document.getElementById('top_n_words'));
}

TopNWordsModel.prototype.prepareLists_ = function() {
  var word_map = dataModel.wordMap();
  var topics = dataModel.topics();
  var num_topics = dataModel.topics().length;
  var data = dataModel.getData();
  var nWords = this.nWords;

  this.words(topics.map(function(list, topic_index) {
    var d = [];
    var i = 0;
    while (d.length < nWords && i < list.length) {
      var word = word_map[list[i]];
      if (dataModel.include(word)) {
        d.push({
          word: word,
          value: data[list[i] * num_topics + topic_index]
        });
      }
      i++;
    }
    return d;
  }));
};

TopNWordsModel.prototype.selectWord = function(row) {
  dataModel.addWord(row.word);
};

var topNWordsModel = new TopNWordsModel();
