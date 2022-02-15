import {spline} from './spline.js';
import * as THREE from './three/three.module.js';

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
 
    class _ColorGenerator {
      constructor(params,generator) {
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

        this._polesEnabled = params.poles.enable;
        this._Gen = generator;

      }

      _poles(p,e){
        const core = 3;

        if (p<core || p>180-core){
            return true;
        }

        const n = this._Gen.Get(e);
        const s = this._Gen.Get(n * 11 / 7);

        if (p < n || p > (180 - s) ){
            return true;
        }

        return false;

      }
    
      get(h,phi,theta) {
        let p = THREE.MathUtils.radToDeg(phi);
        let e = THREE.MathUtils.radToDeg(theta);

        if (this._polesEnabled && this._poles(p,e)){
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
  