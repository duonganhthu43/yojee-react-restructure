import {
  ACTIVITY_ACTION_TYPES as TYPES,
} from '../action/notification-list.constant';

const _INIT_ACTIVITY_STATE = {
  activities: null,
  pagination: null,
  unread_count: null,
};

export const notificationReducer = (state = _INIT_ACTIVITY_STATE, action) => {
  switch (action.type) {
    case TYPES.SET_ACTIVITIES:
      return _setActivities(state, action);
    case TYPES.SET_ACTIVITY:
      return _setActivity(state, action);
    case TYPES.SET_AS_READ:
    case TYPES.SET_AS_UNREAD:
      return _setActivityAs(state, action);
    case TYPES.SET_ALL_AS_READ:
      return _setAllActivitiesAsRead(state, action);
    case TYPES.RESET:
      return { ..._INIT_ACTIVITY_STATE };
    default:
      return state;
  }
}

function _setActivities(state, action) {
  const { activities, pagination, unread_count } = action.payload;

  return {
    ...state,
    activities: [...(state.activities || []), ...activities],
    pagination,
    unread_count,
  };
}

function _setActivity(state, action) {
  const _activity = action.payload.activity;

  return {
    ...state,
    activities: [_activity, ...(state.activities || [])],
    unread_count: _activity.unread ? (state.unread_count || 0) + 1 : state.unread_count,
  };
}

function _setActivityAs(state, action) {
  const _activityId = action.payload.activityId;
  const unread = action.type === TYPES.SET_AS_READ ? false : true;
  let unread_count = state.unread_count || 0;
  let activities = !state.activities
    ? null
    : state.activities.reduce((result, activity) => {
      if (activity.id === _activityId) {
        result.push({ ...activity, unread });
        unread_count = unread_count + (unread ? 1 : -1);
      }
      else {
        result.push(activity);
      }

      return result;
    }, []);

  return {
    ...state,
    activities,
    unread_count,
  };
}

function _setAllActivitiesAsRead(state, action) {
  return {
    ...state,
    activities: !state.activities
      ? null
      : state.activities.map(activity => ({ ...activity, unread: false })),
    unread_count: 0,
  };
}
