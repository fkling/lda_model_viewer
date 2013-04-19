function WordStatsModel() {
  Widget.call(this, document.getElementById('word_stats'));
  this.selectedWord = ko.observable('');

  this.svg = d3.select("#word_stats").append("svg");
  this.c = this.svg.append("g");

  this.x = this.c.append("g")
    .attr("class", "x axis");

  this.c.append("g")
    .attr("class", "y axis")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");


  ko.applyBindings(this, this.container_);
  dataModel.selectedWords.subscribe(this.draw, this);
  dataModel.metric.subscribe(function() {
    this.draw(dataModel.selectedWords());
  }, this);
  this.enableFullscreen();
}

Widget.inherits(WordStatsModel);

WordStatsModel.prototype.draw = function(words) {
  if (words && words.length === 0) {
    if (this.fullscreen_) {
      this.leaveFullscreen();
    }
    return;
  }
  words = words || this.words_;
  this.words_ = words;
  var margin = this.margin =  {top: 20, right: 20, bottom: 100, left: 60};
  this.width = this.getWidth() - margin.left - margin.right;
  this.height = this.getHeight() - margin.top - margin.bottom;

  this.x0 = d3.scale.ordinal()
    .rangeRoundBands([0, this.width], 0.1);

  this.x1 = d3.scale.ordinal();

  this.y = d3.scale.linear()
    .range([this.height, 0]);

   this.xAxis = d3.svg.axis()
    .scale(this.x0)
    .orient("bottom");

  this.yAxis = d3.svg.axis()
    .scale(this.y)
    .orient("left");

  this.svg
    .attr("width", this.width + margin.left + margin.right)
    .attr("height", this.height + margin.top + margin.bottom);

  this.c
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  this.x
    .attr("transform", "translate(0," + this.height + ")");

  this.updateChart(words);
};

WordStatsModel.prototype.updateChart = function(words) {
  if (!words || words.length === 0) {
    return;
  }
  var dataset = dataModel.getData();
  var rWordMap = dataModel.reverseWordMap;
  var nTopics = dataModel.numTopics;
  var topics = d3.range(nTopics).map(function(i) { return 'Topic ' + (i+1); });
  var data = topics.map(function(topic, topic_index) {
    return {
      topic: topic,
      stats: words.map(function(word) {
        return {word: word, value: dataset[rWordMap[word] * nTopics + topic_index]};
      })
    };
  });


  this.x0.domain(topics);
  this.x1.domain(words).rangeRoundBands([0, this.x0.rangeBand()]);
  this.y.domain([0, d3.max(data, function(d) {
    return d3.max(d.stats, function(d) { return d.value; });
  })]);

  var x0 = this.x0;
  var x1 = this.x1;
  var y = this.y;
  var height = this.height;

  this.c.select('.axis.x').call(this.xAxis);
  this.c.select('.axis.y').call(this.yAxis);

  var word_elements = this.c.selectAll(".word")
    .data(data);

  word_elements.enter()
    .append('g')
    .attr('class', 'word');

  word_elements.attr("transform", function(d) { return "translate(" + x0(d.topic) + ",0)"; });

  word_elements.exit().transition().remove();

  var bars = word_elements.selectAll('rect')
    .data(function(d) { return d.stats; });

  bars.enter().append("rect");
  bars.exit().transition().remove();

  bars.transition()
    .attr("width", x1.rangeBand())
    .attr("x", function(d) { return x1(d.word); })
    .attr("y", function(d) { return y(d.value); })
    .attr("height", function(d) { return height - y(d.value); })
    .style("fill", function(d) { return dataModel.selectedWordColor(d.word); });

};

var wordStatsModel = new WordStatsModel();
