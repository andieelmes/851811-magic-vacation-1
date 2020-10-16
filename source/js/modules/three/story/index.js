import * as THREE from 'three';
import {animateProgress, tick} from '../../canvas/common/helpers';

import getRawShaderMaterialAttrs from '../common/get-raw-shader-material-attrs';

export default class Intro {
  constructor() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.canvasCenter = {x: this.innerWidth / 2, y: this.innerHeight / 2};

    this.canvasSelector = `screen__canvas--story`;
    this.textures = [
      {
        src: `img/screen__textures/scene-2.png`,
        options: {hueShift: -0.26, magnify: true},
      },
      {
        src: `img/screen__textures/scene-1.png`,
        options: {hueShift: 0.0},
      },
      {
        src: `img/screen__textures/scene-3.png`,
        options: {hueShift: 0.0},
      },
      {
        src: `img/screen__textures/scene-4.png`,
        options: {hueShift: 0.0},
      },
    ];
    this.textureRatio = 2048 / 1024;
    this.backgroundColor = 0x5f458c;

    this.bubblesDuration = 5000;

    this.bubbles = [
      {
        radius: 100.0,
        initialPosition: [this.canvasCenter.x, -100],
        position: [this.canvasCenter.x, -100],
        finalPosition: [this.canvasCenter.x, this.innerHeight + 100],
        positionAmplitude: 100,
      },
      {
        radius: 80.0,
        initialPosition: [this.canvasCenter.x - this.innerWidth / 3, -100],
        position: [this.canvasCenter.x - this.innerWidth / 3, -100],
        finalPosition: [this.canvasCenter.x - this.innerWidth / 3 , this.innerHeight + 100],
        positionAmplitude: 100,
      },
    ];

    this.animationRequest = null;

    this.fov = 45;
    this.aspect = this.innerWidth / this.innerHeight;
    this.near = 0.1;
    this.far = 1000;
    this.position = {
      z: 800,
    };

    this.render = this.render.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.updateScreenSize = this.updateScreenSize.bind(this);
  }

  init() {
    window.addEventListener(`resize`, this.handleResize);

    this.canvasElement = document.getElementById(this.canvasSelector);
    this.canvasElement.width = this.innerWidth;
    this.canvasElement.height = this.innerHeight;

    this.renderer = new THREE.WebGLRenderer({canvas: this.canvasElement});
    this.renderer.setClearColor(this.backgroundColor, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.innerWidth, this.innerHeight);

    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
    this.camera.position.z = this.position.z;

    this.scene = new THREE.Scene();

    const loadManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadManager);
    const loadedTextures = this.textures.map((texture) => ({src: textureLoader.load(texture.src), options: texture.options}));
    const geometry = new THREE.PlaneGeometry(1, 1);

    loadManager.onLoad = () => {
      this.materials = loadedTextures.map((loadedTexture, index) => {
        const { width, height } = this.renderer.getSize();
        const pixelRatio = this.renderer.getPixelRatio();

        const rawShaderMaterialAttrs = getRawShaderMaterialAttrs({
          map: {
            value: loadedTexture.src,
          },
          options: {
            value: loadedTexture.options,
          },
          ...loadedTexture.options.magnify && {
            magnification: {
              value: {
                bubbles: this.bubbles,
                resolution: [width * pixelRatio, width / this.textureRatio * pixelRatio],
              }
            }
          },
        });

        const material = new THREE.RawShaderMaterial(rawShaderMaterialAttrs);

        material.needsUpdate = true;

        const image = new THREE.Mesh(geometry, material);
        image.scale.x = this.innerHeight * this.textureRatio;
        image.scale.y = this.innerHeight;
        image.position.x = this.getScenePosition(index);

        this.scene.add(image);

        return material;
      });
    };

    this.animationRequest = requestAnimationFrame(this.render);
    this.animate();
  }

  end() {
    window.removeEventListener(`resize`, this.handleResize);

    this.animationRequest = null;
  }

  handleResize() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.updateScreenSize();
  }

  updateScreenSize() {
    this.canvasElement.width = this.innerWidth;
    this.canvasElement.height = this.innerHeight;

    this.camera.aspect = this.innerWidth / this.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.innerWidth, this.innerHeight);

    const magnifiedIndex = this.textures.findIndex(texture => texture.options.magnify);

    const { width, height } = this.renderer.getSize();
    const pixelRatio = this.renderer.getPixelRatio();

    this.materials[magnifiedIndex].uniforms.magnification.value.resolution = [width * pixelRatio, width / this.textureRatio * pixelRatio];
  }

  changeScene(index) {
    this.camera.position.x = this.getScenePosition(index);
  }

  getScenePosition(index) {
    return this.innerHeight * this.textureRatio * index;
  }

  bubblePositionAnimationTick(index, from, to) {
    return (progress) => {
      const pixelRatio = this.renderer.getPixelRatio();

      this.bubbles[index].position[1] = tick(from[1], to[1], progress) * pixelRatio;
      const offset = this.bubbles[index].positionAmplitude * Math.sin(progress * Math.PI * 10);
      this.bubbles[index].position[0] = (offset + this.bubbles[index].initialPosition[0]) * pixelRatio;
    };
  }

  animate() {
    this.bubbles.forEach((bubble, index) => animateProgress(this.bubblePositionAnimationTick(index, this.bubbles[index].initialPosition, this.bubbles[index].finalPosition), this.bubblesDuration));
  }

  render() {
    this.renderer.render(this.scene, this.camera);

    if (this.animationRequest) {
      requestAnimationFrame(this.render);
    }
  }
}
