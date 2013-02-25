function TopNWordsModel() {
  this.words = ko.observable([]);
  this.nWords = 10;
  dataModel.words.subscribe(this.prepareLists_, this);
  dataModel.metric.subscribe(this.prepareLists_, this);

  ko.applyBindings(this, document.getElementById('top_n_words'));
}

TopNWordsModel.prototype.prepareLists_ = function() {
  var word_list = dataModel.words();
  var topic_lists = dataModel.topic_values;
  var metric = dataModel.metric();
  var nWords = this.nWords;

  this.words(topic_lists.map(function(list) {
    return list.slice(0, nWords).map(function(value) {
      return {word: word_list[value[0]], value: value[1][metric]};
    });
  }));
};

TopNWordsModel.prototype.selectWord = function(row) {
  dataModel.addWord(row.word);
};

var topNWordsModel = new TopNWordsModel();
