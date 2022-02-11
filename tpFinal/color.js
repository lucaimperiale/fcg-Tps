import { noise } from './noise.js';
import {spline} from './spline.js';
import * as THREE from './three.js-master/build/three.module.js';




export const color = (function() {

    const _DEEP_OCEAN = new THREE.Color(0x001FFF);
    const _SHALLOW_OCEAN = new THREE.Color(0x5065FF);

    const _BEACH = new THREE.Color(0xd9d592);
    const _PLAINS = new THREE.Color(0x9EE566);
    const _JUNGLE = new THREE.Color(0x10550D);
    const _MOUNTAIN = new THREE.Color(0xB5B5B5);
    const _SNOW = new THREE.Color(0xFFFFFF);
    const _POLEEDGE = new THREE.Color(0xAFFFFE);

    const _RED = new THREE.Color(0xFF0000);

    let paramsNorth = {
        octaves: 20,
        persistence: 0.5,
        lacunarity: 1.5,
        exponentiation: 3.5,
        height: 250.0,
        scale: 100.0,
        noiseType: 'perlin',
        seed: 434
      };
      
    let paramsSouth = paramsNorth;
    paramsSouth.seed *=11;
    paramsSouth.seed /=17;
    
  
    class _ColorGenerator {
      constructor() {
        const _colourLerp = (t, p0, p1) => {
          const c = p0.clone();    
          return c.lerp(p1, t);
        };

        this._colourSpline = new spline.LinearSpline(_colourLerp)

        this._colourSpline.AddPoint(0.35, _BEACH);
        this._colourSpline.AddPoint(0.4, _JUNGLE);
        this._colourSpline.AddPoint(0.6, _PLAINS);
        this._colourSpline.AddPoint(0.8, _MOUNTAIN);
        this._colourSpline.AddPoint(0.9, _SNOW);
    
        this._oceanSpline = new spline.LinearSpline(_colourLerp);
        this._oceanSpline.AddPoint(0, _DEEP_OCEAN);
        this._oceanSpline.AddPoint(0.3, _SHALLOW_OCEAN);

        this._polesSpline = new spline.LinearSpline(_colourLerp);
        this._polesSpline.AddPoint(15, _SNOW);
        this._polesSpline.AddPoint(60, _POLEEDGE);
        this._polesSpline.AddPoint(120, _POLEEDGE);
        this._polesSpline.AddPoint(165, _SNOW);

        this._NorthGen = new noise.Noise(paramsNorth);
        this._SouthGen = new noise.Noise(paramsSouth);

      }

      _poles(p,e){

        const core = 10;

        if (p<core || p>180-core){
            return true;
        }

        const n = this._NorthGen.Get2(e,5);
        const s = this._SouthGen.Get2(e,5);

        if (p < n || p > (180 - s) ){
            return true;
        }

        return false;

      }
    
      get(h,phi,theta) {
        let p = THREE.MathUtils.radToDeg(phi);
        let e = THREE.MathUtils.radToDeg(theta);

        if (this._poles(p,e)){
            return this._polesSpline.Get(p);
        }

        if (h < 0.3) {
          return this._oceanSpline.Get(h);
        }
        
        return this._colourSpline.Get(h);
      }
    }

    return {
      Color: _ColorGenerator
    }
  })();
  