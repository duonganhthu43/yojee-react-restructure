import { ACTIVITY_ACTION_TYPES as TYPES } from './notification-list.constant';


export const subscribeActivities = ({ socketToken, userId }) => ({ type: TYPES.SUBSCRIBE_ACTIVITIES, payload: { socketToken, userId } });

export const unsubscribeActivities = () => ({ type: TYPES.UNSUBSCRIBE_ACTIVITIES });

export const loadMActivities = ({ userId, startId, pageSize }) => ({
  type: TYPES.LOAD_ACTIVITIES,
  payload: { userId, startId, pageSize },
});

export const setActivities = ({
  activities,
  pagination: { start_id, page_size, hasMore },
  unread_count
}) => ({
  type: TYPES.SET_ACTIVITIES,
  payload: {
    activities,
    pagination: { start_id, page_size, hasMore },
    unread_count
  },
});

export const setActivity = (activity) => ({
  type: TYPES.SET_ACTIVITY,
  payload: { activity },
});

export const markAsRead = ({ userId, activityId }) => ({
  type: TYPES.MARK_AS_READ,
  payload: { userId, activityId },
});

export const markAsUnread = ({ userId, activityId }) => ({
  type: TYPES.MARK_AS_UNREAD,
  payload: { userId, activityId },
});

export const markAllAsRead = (userId) => ({
  type: TYPES.MARK_ALL_AS_READ,
  payload: { userId }
});

export const setAsRead = (activityId) => ({
  type: TYPES.SET_AS_READ,
  payload: { activityId },
});

export const setAsUnread = (activityId) => ({
  type: TYPES.SET_AS_UNREAD,
  payload: { activityId },
});

export const setAllAsRead = () => ({ type: TYPES.SET_ALL_AS_READ });

export const resetActivities = () => ({ type: TYPES.RESET_ACTIVITIES });
