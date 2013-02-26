function TopNWordsModel() {
  this.words = ko.observable([]);
  this.nWords = 10;
  dataModel.wordMap.subscribe(this.prepareLists_, this);
  dataModel.metric.subscribe(this.prepareLists_, this);

  ko.applyBindings(this, document.getElementById('top_n_words'));
}

TopNWordsModel.prototype.prepareLists_ = function() {
  var word_map = dataModel.wordMap();
  var topics = dataModel.topics();
  var num_topics = dataModel.topics().length;
  var data = dataModel.getData();
  var nWords = this.nWords;

  this.words(topics.map(function(list, topic_index) {
    return list.slice(0, nWords).map(function(word_index) {
      return {
        word: word_map[word_index],
        value: data[word_index * num_topics + topic_index]
      };
    });
  }));
};

TopNWordsModel.prototype.selectWord = function(row) {
  dataModel.addWord(row.word);
};

var topNWordsModel = new TopNWordsModel();
