/*
 *  Copyright 2014 TWO SIGMA OPEN SOURCE, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

package com.twosigma.beaker;

import com.twosigma.beaker.chart.legend.LegendLayout;
import com.twosigma.beaker.chart.legend.LegendPosition;
import java.util.Observable;

public class Chart extends Observable {
  protected int initWidth  = 640;
  protected int initHeight = 480;
  protected String  title;
  protected Boolean showLegend;
  protected boolean        useToolTip     = true;
  protected LegendPosition legendPosition = new LegendPosition(LegendPosition.Position.TOP_RIGHT);
  protected LegendLayout   legendLayout   = LegendLayout.VERTICAL;

  public Chart setInitWidth(int w) {
    this.initWidth = w;
    return this;
  }

  public Integer getInitWidth() {
    return this.initWidth;
  }

  public Chart setInitHeight(int h) {
    this.initHeight = h;
    return this;
  }

  public Integer getInitHeight() {
    return this.initHeight;
  }

  public Chart setTitle(String title) {
    this.title = title;
    return this;
  }

  public String getTitle() {
    return this.title;
  }

  public Chart setShowLegend(Boolean showLegend) {
    this.showLegend = showLegend;
    return this;
  }

  public Boolean getShowLegend() {
    return this.showLegend;
  }

  public Chart setUseToolTip(boolean useToolTip) {
    this.useToolTip = useToolTip;
    return this;
  }

  public Boolean getUseToolTip() {
    return this.useToolTip;
  }

  public LegendPosition getLegendPosition() {
    return legendPosition;
  }

  public Chart setLegendPosition(LegendPosition legendPosition) {
    this.legendPosition = legendPosition;
    return this;
  }

  public LegendLayout getLegendLayout() {
    return legendLayout;
  }

  public Chart setLegendLayout(LegendLayout legendLayout) {
    this.legendLayout = legendLayout;
    return this;
  }

  @Override
  public synchronized void setChanged() {
    super.setChanged();
  }
}
