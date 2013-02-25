function WordCloudModel() {
  this.visible = ko.observable(false);
  this.width = 600;
  this.height = 600;
  this.fill = d3.scale.category20b();

  var svg = d3.select('#word_cloud').append("svg")
    .attr("width", this.width)
    .attr("height", this.width);
  this.background_ = svg.append("g");
  this.vis_ = svg.append("g")
    .attr("transform", "translate(" + [this.width >> 1, this.height >> 1] + ")");

  this.cloud_ = d3.layout.cloud()
    .size([this.width, this.height])
    .timeInterval(10)
    .text(function(d) { return d.word; })
    .font("Arial")
    .rotate(0)
    .on("end", this.draw_words_.bind(this));

  ko.applyBindings(this, document.getElementById('word_cloud'));
  dataModel.filteredData.subscribe(this.setTerms, this);
}

WordCloudModel.prototype.setTerms = function(words) {
  if (words.length === 0) {
    this.visible(false);
    return;
  }
  this.visible(true);
  var word_list = dataModel.words();

  words = words.map(function(value) {
    return {word: word_list[value[0]], value: value[1][0]};
  });

  var fontSize = d3.scale.log()
    .domain([words[words.length - 1].value, words[0].value])
    .range([10, 80]);

  this.cloud_.stop()
    .fontSize(function(d) { return fontSize(d.value); })
    .words(words)
    .start();
};

WordCloudModel.prototype.draw_words_ = function(data, bounds) {
  var fill = this.fill;
  var w = this.width;
  var h = this.height;
  var scale = bounds ? Math.min(
      w / Math.abs(bounds[1].x - w / 2),
      w / Math.abs(bounds[0].x - w / 2),
      h / Math.abs(bounds[1].y - h / 2),
      h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;
  var words = data;
  var text = this.vis_.selectAll("text")
    .data(words, function(d) { return d.text.toLowerCase(); });
  text.transition()
    .duration(1000)
    .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
    .style("font-size", function(d) { return d.size + "px"; });
  text.enter().append("text")
    .attr("text-anchor", "middle")
    .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
    .style("font-size", function(d) { return d.size + "px"; })
    .style("opacity", 1e-6)
    .transition()
    .duration(1000)
    .style("opacity", 1);
  text.style("font-family", function(d) { return d.font; })
    .style("fill", function(d) { return fill(d.text.toLowerCase()); })
    .style('user-select', 'none')
    .style('cursor', 'pointer')
    .text(function(d) { return d.text; })
    .on('click', function(d) { dataModel.addWord(d.text); });
  var exitGroup = this.background_.append("g")
    .attr("transform", this.vis_.attr("transform"));
  var exitGroupNode = exitGroup.node();
  text.exit().each(function() {
    exitGroupNode.appendChild(this);
  });
  exitGroup.transition()
    .duration(1000)
    .style("opacity", 1e-6)
    .remove();
  this.vis_.transition()
    .delay(1000)
    .duration(750)
    .attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
};

var wordCloudModel = new WordCloudModel();
