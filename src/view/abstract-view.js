import { createElement } from '../utils/render';

export default class AbstractView {
  #element = null;
  _callback = {};

  constructor() {
    if (new.target === AbstractView) {
      throw new Error('Can`t instantiate AbstractView, only concrete one.');
    }
  }

  get element() {
    if(!this.#element) {
      this.#element = createElement(this.template);
    }

    return this.#element;
  }

  get template() {
    throw new Error('Abstract view method bot implemented: get template.');
  }

  removeElement() {
    this.#element = null;
  }
}
