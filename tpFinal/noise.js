import 'https://cdn.jsdelivr.net/npm/simplex-noise@2.4.0/simplex-noise.js';
import perlin from './perlin-noise.js';

export const noise = (function() {

  class _PerlinWrapper {
    constructor() {
    }
    noise1D(x){
      return perlin(x) * 2.0 - 1.0;
    }

    noise2D(x, y){
      return perlin(x, y) * 2.0 - 1.0;
    }

    noise3D(x, y ,z) {
      return perlin(x, y, z) * 2.0 - 1.0;
    }
  }

  class _NoiseGenerator {
    constructor(params) {
      this._params = params;
      this._Init();
    }

    _Init() {
      this._noise = {
        simplex: new SimplexNoise(this._params.seed),
        perlin: new _PerlinWrapper(),
      };
    }

    Get1(x){
      const xs = x / this._params.scale;
      const noiseFunc = this._noise[this._params.noiseType];
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
      const noiseFunc = this._noise[this._params.noiseType];
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
      const noiseFunc = this._noise[this._params.noiseType];

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
