import { PlotCallbackHelper } from './plot_callback_helper.js';
import { ShapeGenerator } from './shape_generator.js';
import {
  matchedData,
  transpar,
  xMap,
  yMap
} from './utilities';
import { plotOptionsReader } from './plot_options_reader.js';

export function ShapesArtist ({svg, data, categorySearch, categorySearchData, color, cValue2, cValue, uniqueDataValuesToShape}) {
  this.points = svg.selectAll(".dot").data(data).enter();
  this.shapeGenerator = new ShapeGenerator(uniqueDataValuesToShape);
  let searchText = plotOptionsReader.getSearchText();
  let featureForTransparency = plotOptionsReader.getFeatureForTransparency();
  let transparentSearchText = plotOptionsReader.getTransparentSearchText()
  let searchMatchOpacityValue = plotOptionsReader.getOpacityValueSearchMatch();
  let noSearchMatchOpacityValue = plotOptionsReader.getOpacityValueSearchNoMatch();


  // ******************************************
  // Static Shape Attributes
  // ******************************************
  let unmatchedShapesAttributes = {
    borderColor: '#000',
    borderWidth: 1,
    shapeSize: 30
  };

  let matchedShapesAttributes = {
    borderColor: 'yellow',
    borderWidth: 2,
    shapeSize: 180
  };

  // ******************************************
  // Shape Helpers
  // ******************************************

  let transformAttributes = (dataPoint) => {
    let translateStyling = `translate(${xMap(dataPoint)},${yMap(dataPoint)})`;
    let rotationStyling = `rotate(${this.shapeGenerator.shapeRotation(dataPoint)})`;
    return `${translateStyling} ${rotationStyling}`;
  };

  // ******************************************
  // Dynamic Shape Attributes
  // ******************************************

  // should extract to the helper, rename helper
  let fill = (shape) => {
    if (plotOptionsReader.logSpectrumEnabled()) {
      return color(cValue2(shape));
    }
    return color(cValue(shape));
  };

  let opacity = (shape) => {
    return transpar(
      shape,
      transparentSearchText,
      featureForTransparency,
      searchMatchOpacityValue,
      noSearchMatchOpacityValue
    )
  };

  let drawShapes = (shapes, attributes) => {
    let shapeAttributes = d3.svg
                            .symbol()
                            .type(this.shapeGenerator.shapeType)
                            .size(attributes['shapeSize']);

    let callbackHelper = new PlotCallbackHelper(svg);
    // consistent attributes
    shapes.attr('class', 'point')
          .attr('d', shapeAttributes)
          .attr('transform', transformAttributes)
          .style('fill', fill)
          .style('opacity', opacity)
          .on("mouseover", callbackHelper.mouseoverCallback(categorySearchData))
          .on("mouseout", callbackHelper.mouseoutCallback)
          .on("click", callbackHelper.clickCallback(categorySearchData))

    // customized attributes
    shapes.style('stroke', attributes['borderColor']) // border color
          .style('stroke-width', attributes['borderWidth'])
  };

  this.drawUnmatchedShapes = () => {
    let unmatchedShapes = this.points
                            .append("path")
                            .filter(matchedData(categorySearch, searchText, false));
    drawShapes(unmatchedShapes, unmatchedShapesAttributes);
  }

  this.drawMatchedShapes = () => {
    let matchedShapes = this.points
                            .append("path")
                            .filter(matchedData(categorySearch, searchText, true));
    drawShapes(matchedShapes, matchedShapesAttributes);
  }
}