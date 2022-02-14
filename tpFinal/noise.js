import {perlinNoise3d} from './perlin-noise.js';

export const noise = (function() {

  class _PerlinWrapper {
    constructor(seed,size) {
      this.noise = new perlinNoise3d();
      this.noise.noiseSeed(seed);
      this.size = size;
    }
    noise1D(x){
      return this.noise.get(x) * 2.0 - 1.0;
    }

    noise2D(x, y){
      return this.noise.get(x, y) * 2.0 - 1.0;
    }

    noise3D(x, y ,z) {
      //all positive values
      x += this.size;
      y += this.size;
      z += this.size;
      return this.noise.get(x, y, z) * 2.0 - 1.0;
    }
  }

  class _NoiseGenerator {
    constructor(params,size) {
      this._params = params;
      this._size = size;
      this._Init();
    }

    _Init() {
      this.perlin = new _PerlinWrapper(this._params.seed,this._size);
       }

    Get1(x){
      const xs = x / this._params.scale;
      const noiseFunc = this.perlin;
      const G = 2.0 ** (-this._params.persistence);
      let amplitude = 1.0;
      let frequency = 1.0;
      let normalization = 0;
      let total = 0;
      for (let o = 0; o < this._params.octaves; o++) {
        const noiseValue = noiseFunc.noise1D(
            xs * frequency) * 0.5 + 0.5;
        total += noiseValue * amplitude;
        normalization += amplitude;
        amplitude *= G;
        frequency *= this._params.lacunarity;
      }
      total /= normalization;
      return Math.pow(
          total, this._params.exponentiation) * this._params.height;
    }

    Get2(x, y) {
      const xs = x / this._params.scale;
      const ys = y / this._params.scale;
      const noiseFunc = this.perlin;
      const G = 2.0 ** (-this._params.persistence);
      let amplitude = 1.0;
      let frequency = 1.0;
      let normalization = 0;
      let total = 0;
      for (let o = 0; o < this._params.octaves; o++) {
        const noiseValue = noiseFunc.noise2D(
            xs * frequency, ys * frequency) * 0.5 + 0.5;
        total += noiseValue * amplitude;
        normalization += amplitude;
        amplitude *= G;
        frequency *= this._params.lacunarity;
      }
      total /= normalization;
      return Math.pow(
          total, this._params.exponentiation) * this._params.height;
    }
  

    Get(x, y, z) {
      const G = 2.0 ** (-this._params.persistence);
      const xs = x / this._params.scale;
      const ys = y / this._params.scale;
      const zs = z / this._params.scale;
      const noiseFunc = this.perlin;

      let amplitude = 1.0;
      let frequency = 1.0;
      let normalization = 0;
      let total = 0;
      for (let o = 0; o < this._params.octaves; o++) {
      const noiseValue = noiseFunc.noise3D(
          xs * frequency, ys * frequency, zs * frequency) * 0.5 + 0.5;
      total += noiseValue * amplitude;
      normalization += amplitude;
      amplitude *= G;
      frequency *= this._params.lacunarity;
      }
      total /= normalization;
      return Math.pow(
          total, this._params.exponentiation) * this._params.height;
      }
    }

  return {
    Noise: _NoiseGenerator
  }
})();
