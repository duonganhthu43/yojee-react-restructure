import { takeLatest } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga'
import { take, put, call, fork, cancel, cancelled } from 'redux-saga/effects';

import { unsubscribe } from '../../../common';
import * as activityActions from '../action/notification-list.action'
import {
  ACTIVITY_ACTION_TYPES as TYPES,
} from '../action/notification-list.constant';
import { notificationWebSocketService } from '../../../services/notification-websocket-service'
import { notificationService } from '../../../services/notification-service'

function* _subscribeActivitiesSaga() {
  yield takeLatest(TYPES.SUBSCRIBE_ACTIVITIES, _subscribeActivities);
}

function* _unsubscribeActivitiesSaga() {
  yield takeLatest(TYPES.UNSUBSCRIBE_ACTIVITIES, _unsubscribeActivities);
}

function* _loadActivitiesSaga() {
  yield takeLatest(TYPES.LOAD_ACTIVITIES, _loadActivities);
}

function* _markAsReadSaga() {
  yield takeLatest(TYPES.MARK_AS_READ, _markAsRead);
}

function* _markAsUnreadSaga() {
  yield takeLatest(TYPES.MARK_AS_UNREAD, _markAsUnread);
}

function* _markAllAsReadSaga() {
  yield takeLatest(TYPES.MARK_ALL_AS_READ, _markAllAsRead);
}

/* -------------------------------Workers--------------------------- */
let _subscribeActivitiesTask;

function* _subscribeActivities({ payload: { socketToken, userId } }) {
  if (_subscribeActivitiesTask) { return; }

  _subscribeActivitiesTask = yield fork(function* () {
    let _activitiesSubscription;
    let _activitySubscription;

    const _channel = yield call(() => {
      return eventChannel(emitter => {
        _activitiesSubscription = notificationWebSocketService.activities$
          .subscribe(response => {
            if (!response) { return; }
            const { data, pagination, unread_count } = response;

            const activities = data
              ? data.map(item => notificationService.transformActivity(item)).filter(item => !!item)
              : [];

            const payload = {
              activities,
              pagination: {
                start_id: activities.length > 0
                  ? activities[activities.length - 1].id
                  : null,
                page_size: pagination.limit_value,
                hasMore: pagination.total_count >= pagination.limit_value
              },
              unread_count,
            };
            emitter(activityActions.setActivities(payload));
          });

        _activitySubscription = notificationWebSocketService.activity$
          .subscribe(response => {
            if (!response) { return; }

            const payload = notificationService.transformActivity(response);
            emitter(activityActions.setActivity(payload));
          });

        return () => unsubscribe([
          _activitiesSubscription,
          _activitySubscription,
        ]);
      });
    });

    try {
      while (true) {
        const _action = yield take(_channel);
        yield put(_action);
      }
    }
    finally {
      if (yield cancelled()) { _channel.close(); }
    }
  });

  notificationWebSocketService.start({ socketToken, userId });
}

function* _unsubscribeActivities() {
  if (_subscribeActivitiesTask) {
    yield cancel(_subscribeActivitiesTask);
    _subscribeActivitiesTask = null;
  }
}
/* eslint-disable require-yield */
function* _loadActivities({ payload: { userId, startId, pageSize } }) {
  // Response will be returned in socket channel `activities`
  notificationWebSocketService.loadActivities({ userId, startId, pageSize });
  return;
}
/* eslint-enable require-yield */

function* _markAsRead({ payload: { userId, activityId } }) {
  notificationWebSocketService.markAsRead({ userId, activityId });
  // No need to wait for api response
  yield put(activityActions.setAsRead(activityId));
}

function* _markAsUnread({ payload: { userId, activityId } }) {
  notificationWebSocketService.markAsUnread({ userId, activityId });
  // No need to wait for api response
  yield put(activityActions.setAsUnread(activityId));
}

function* _markAllAsRead({ payload: { userId } }) {
  notificationWebSocketService.markAllAsRead(userId);
  // No need to wait for api response
  yield put(activityActions.setAllAsRead());
}
export default function* rootSaga() {
  yield [
    _subscribeActivitiesSaga, _unsubscribeActivitiesSaga, _loadActivitiesSaga,
    _markAsReadSaga, _markAsUnreadSaga, _markAllAsReadSaga
  ]
}

// export const subscribeActivitiesSaga = _subscribeActivitiesSaga;
// export const unsubscribeActivitiesSaga = _unsubscribeActivitiesSaga;
// export const loadActivitiesSaga = _loadActivitiesSaga;
// export const markAsReadSaga = _markAsReadSaga;
// export const markAsUnreadSaga = _markAsUnreadSaga
// export const markAllAsReadSaga = _markAllAsReadSaga
