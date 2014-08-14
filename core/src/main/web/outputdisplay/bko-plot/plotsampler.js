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

(function() {
  'use strict';
  var retfunc = function(plotUtils) {
    var PlotSampler = function(_x, _y){
      this.xs = _x;
      this.y = _y;
      this.n = _x.length;
      this.buildCoordTable();
      this.buildSegTree();
    };

    PlotSampler.prototype.buildCoordTable = function() {
      this.x = this.xs.splice(0); // copy xs to x
      _.uniq(this.xs); // keep unique values in xs
      for (var i = 0; i < this.n; i++) {
        this.x[i] = this.mapIndex(this.x[i]);
      }
    };

    PlotSampler.prototype.buildSegTree = function() {
      this.mins = [];
      this.maxs = [];
      this.sums = [];
      this.cnts = [];
      for (var i = 0; i < this.n; i++) {
        this.mins.push(0);
        this.maxs.push(0);
        this.sums.push(0);
        this.cnts.push(0);
      }
      this.initSegTree(0, 0, this.n - 1);
    };

    PlotSampler.prototype.initSegTree = function(k, nl, nr) {
      if (nl == nr) {
        this.mins[k] = this.y[k];
        this.maxs[k] = this.y[k];
        this.sums[k] = this.y[k];
        this.cnts[k] = 1;
        return;
      }
      var nm = Math.floor((nl + nr) / 2),
          kl = 2 * k + 1,
          kr = 2 * k + 2;
      this.initSegTree(kl, nl, nm);
      this.initSegTree(kr, nm + 1, nr);
      this.mins[k] = Math.min(this.mins[kl], this.mins[kr]);
      this.maxs[k] = Math.max(this.maxs[kl], this.maxs[kr]);
      this.sums[k] = this.sums[kl] + this.sums[kr];
      this.cnts[k] = this.cnts[kl] + this.cnts[kr];
    };

    PlotSampler.prototype.sample = function(xl, xr, count) {
      if (count <= 0 || xr < xl) {
        console.error("incorrect sample parameters");
        return [];
      }
      var step = (xr - xl) / count;
      var ret = [];
      for (var i = 0; i < count; i++) {
        var sl = xl + i * step,
            sr = xl + (i + 1) * step - 1E-12; // [sl,sr) closed open, be ware of precision problem
        var ele = this.query(sl, sr);
        ret.push(ele);
      }
      return ret;
    };

    PlotSampler.prototype.query = function(xl, xr) {
      var l = this.mapIndex(xl),
          r = this.mapIndex(xr);
      return this.querySegTree = this.querySegTree(0, 0, this.n - 1, l, r);
    };

    PlotSampler.prototype.querySegTree = function(k, nl, nr, l, r) {
      if (r < nl || l > nl || l > r) {
        return {
          min : 1E100,
          max : -1E100,
          sum : 0
        };
      }
      var nm = Math.floor((nl + nr) / 2),
          kl = 2 * k + 1,
          kr = 2 * k + 2;
      var retl = this.querySegTree(kl, nl, nm, l, r),
          retr = this.querySegTree(kr, nm + 1, nr, l, r);
      return {
        min : Math.min(retl.min, retr.min),
        max : Math.max(retl.max, retr.max),
        sum : retl.sum + retr.sum,
        cnt : retl.cnt + retr.cnt
      };
    };

    PlotSampler.prototype.mapIndex = function(x) {
      // find the largest element in xs that is <= x
      var l = 0, r = this.xs.length;
      while (l <= r) {
        var m = Math.floor((l + r) / 2);
        if (this.xs[m] <= x) {
          l = m + 1;
        } else {
          r = m - 1;
        }
      }
      if (r < 0) { r = 0; } // left to everything
      return r;
    };

    return PlotSampler;
  };
  beaker.bkoFactory('PlotSampler', ['plotUtils', retfunc]);
})();