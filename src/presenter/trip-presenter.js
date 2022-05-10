import { render, RenderPosition } from '../utils/render';
import EventsListView from '../view/event-list-view';
import NoTripsView from '../view/no-trips-view';
import TripSortView from '../view/trip-sort-view';
import PointPresenter from './point-presenter';
import {updateItem} from '../utils/favorite';
import {SortType} from '../utils/const';
import { sortTaskByDay, sortTaskByDuration, sortTaskByPrice} from '../utils/point';

export default class TripPresenter {
  #mainElement = null;
  #tripPointsElement = null;

  #tripSortComponent = new TripSortView();
  #noTripsComponent = new NoTripsView();
  #tripPointsListComponent = new EventsListView();

  #tripPoints = [];
  #pointPresenter = new Map();

  #currentSortType = SortType.SORT_DAY;
  #sourcedTripPoints = [];

  constructor(mainElement) {
    this.#mainElement = mainElement;
    this.#tripPointsElement = this.#mainElement.querySelector('.trip-events');
  }

  init = (tripPoints) => {
    this.#tripPoints = [...tripPoints];
    this.#sourcedTripPoints = [...tripPoints];

    this.#renderMain();
  }

  #renderNoTasks = () => {
    render(this.#tripPointsElement, this.#noTripsComponent, RenderPosition.BEFOREEND);
  }

  #renderTripPointsListElement = () => {
    render(this.#tripPointsElement, this.#tripPointsListComponent, RenderPosition.BEFOREEND);
  }

  #handleModeChange = () => {
    this.#pointPresenter.forEach((presenter) => presenter.resetView());
  }

  #handlePointChange = (updatedPoint) => {
    this.#tripPoints = updateItem(this.#tripPoints, updatedPoint);
    this.#sourcedTripPoints = updateItem(this.#sourcedTripPoints, updatedPoint);
    this.#pointPresenter.get(updatedPoint.id).init(updatedPoint);
  }

  #sortTasks = (sortType) => {
    switch(sortType) {
      case SortType.SORT_DAY:
        this.#tripPoints.sort(sortTaskByDay);
        break;
      case SortType.SORT_TIME:
        this.#tripPoints.sort(sortTaskByDuration);
        break;
      case SortType.SORT_PRICE:
        this.#tripPoints.sort(sortTaskByPrice);
        break;
      default:
        this.#tripPoints = [...this.#sourcedTripPoints];
    }

    this.#currentSortType = sortType;
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortTasks(sortType);
    this.#clearPointsList();
    this.#renderTripPointsList();
  }

  #renderSort = () => {
    render(this.#tripPointsElement, this.#tripSortComponent, RenderPosition.AFTERBEGIN);
    this.#tripSortComponent.serSortTypeChangeHandler(this.#handleSortTypeChange);
  }

  #renderTripPoint = (point) => {
    const pointPresenter = new PointPresenter(this.#tripPointsListComponent, this.#handlePointChange, this.#handleModeChange);
    pointPresenter.init(point);
    this.#pointPresenter.set(point.id, pointPresenter);
  };

  #renderTripPointsList = () => {
    for (let i = 0; i < this.#tripPoints.length; i++) {
      this.#renderTripPoint(this.#tripPoints[i]);
    }
  }

  #renderMain = () => {
    if (this.#tripPoints.length === 0) {
      this.#renderNoTasks();
    } else {
      this.#renderSort();
      this.#renderTripPointsListElement();
      this.#sortTasks(this.#currentSortType);
      this.#renderTripPointsList();
    }
  }

  #clearPointsList = () => {
    this.#pointPresenter.forEach((presenter) => presenter.destroy());
    this.#pointPresenter.clear();
  }
}