import Swiper from "swiper";
import Scene from './three/story';

export default () => {
  let storySlider;

  const scene = new Scene();

  const setSlider = function () {
    if (((window.innerWidth / window.innerHeight) < 1) || window.innerWidth < 769) {
      storySlider = new Swiper(`.js-slider`, {
        pagination: {
          el: `.swiper-pagination`,
          type: `bullets`
        },
        keyboard: {
          enabled: true
        },
        on: {
          slideChange: () => {
            if (storySlider.activeIndex === 0 || storySlider.activeIndex === 1) {
              scene.changeScene(0);
            } else if (storySlider.activeIndex === 2 || storySlider.activeIndex === 3) {
              scene.changeScene(1);
            } else if (storySlider.activeIndex === 4 || storySlider.activeIndex === 5) {
              scene.changeScene(2);
            } else if (storySlider.activeIndex === 6 || storySlider.activeIndex === 7) {
              scene.changeScene(3);
            }
          },
          resize: () => {
            storySlider.update();
          }
        },
        observer: true,
        observeParents: true,
        slideActiveClass: `slider__item_current`,
        slidePrevClass: `slider__item_previous`,
        slideNextClass: `slider__item_next`,
      });
    } else {
      storySlider = new Swiper(`.js-slider`, {
        slidesPerView: 2,
        slidesPerGroup: 2,
        pagination: {
          el: `.swiper-pagination`,
          type: `fraction`
        },
        navigation: {
          nextEl: `.js-control-next`,
          prevEl: `.js-control-prev`,
        },
        keyboard: {
          enabled: true
        },
        on: {
          slideChange: () => {
            if (storySlider.activeIndex === 0) {
              scene.changeScene(0);
            } else if (storySlider.activeIndex === 2) {
              scene.changeScene(1);
            } else if (storySlider.activeIndex === 4) {
              scene.changeScene(2);
            } else if (storySlider.activeIndex === 6) {
              scene.changeScene(3);
            }
          },
          resize: () => {
            storySlider.update();
          }
        },
        observer: true,
        observeParents: true,
        slideActiveClass: `slider__item_current`,
        slidePrevClass: `slider__item_previous`,
        slideNextClass: `slider__item_next`,
      });
    }
  };

  window.addEventListener(`resize`, function () {
    if (storySlider) {
      storySlider.destroy();
    }
    setSlider();
  });

  document.body.addEventListener(`screenChanged`, (event) => {
    const {detail} = event;
    const {screenName} = detail;

    if (screenName === `story`) {
      scene.init();
    } else {
      scene.end();
    }
  });

  setSlider();
};
