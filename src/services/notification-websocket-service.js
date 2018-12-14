import { Subject } from 'rxjs';
import { logger } from '../common/logger';
import { WebsocketService } from './websocket-service';


class NotificationWebSocketService extends WebsocketService {
  _SERVICE_ID = 'DISPATCHER_NOTIFICATION'
  _EVENT_IDS = {
    ACTIVITIES: 'activities',
    ACTIVITY: 'activity',
    MARK_AS_READ: 'mark_as_read',
    MARK_AS_UNREAD: 'mark_as_unread',
    MARK_ALL_AS_READ: 'mark_all_as_read',
  };

  /**
   * DataType: {
      dispatcherChannel: new Subject<{ status: string }>(),
      activitiesEventListener$: Observable<{
        title: string;
        body: string;
        eventType: string;
        payload: any;
      }>,
      activityEventListener$: Observable<{
        title: string;
        body: string;
        eventType: string;
        payload: any;
      }>,
  }
    */
  _notificationSubjects = {
    dispatcherChannel: new Subject(),
    activitiesEventListener: new Subject(),
    activityEventListener: new Subject(),
  };

  // channelStatus$: Observable<{ status: string }>,
  channelStatus$;
  // activities$: Observable<{
  //   title: string;
  //   body: string;
  //   eventType: string;
  //   payload: any;
  // }>,
  activities$;
  // activity$: Observable<{
  //   title: string;
  //   body: string;
  //   eventType: string;
  //   payload: any;
  // }>,
  activity$;

  constructor() {
    super();

    this.channelStatus$ = this._notificationSubjects.dispatcherChannel.asObservable();
    this.activities$ = this._notificationSubjects.activitiesEventListener.asObservable();
    this.activity$ = this._notificationSubjects.activityEventListener.asObservable();
  }

  start = ({ userId, socketToken }) => {
    const {
      _SERVICE_ID,
      _EVENT_IDS: { ACTIVITIES, ACTIVITY },
    } = this;

    if (this.isStartedService(_SERVICE_ID)) {
      this.startListeners({
        serviceId: _SERVICE_ID,
        eventIds: [
          ACTIVITIES,
          ACTIVITY,
        ],
      });
    }
    else {
      this.startService({
        serviceId: this._serviceId,
        eventIds: [
          ACTIVITIES,
          ACTIVITY,
        ],
        socketToken,
        options: { userId },
      });
    }
  }

  stop = () => {
    this.stopService(this._serviceId);
  }

  loadActivities = ({ userId, startId, pageSize }) => {
    const _channel = this._getChannel(userId);
    if (_channel) {
      _channel.push(this._EVENT_IDS.ACTIVITIES, { start_id: startId, page_size: pageSize })
        .receive('error', () => logger.error('Load activities failed'))
        .receive('timeout', () => logger.error('Load activities timeout'));
    }
  }

  markAsRead = ({ userId, activityId }) => {
    const _channel = this._getChannel(userId);
    if (_channel) {
      _channel.push(this._EVENT_IDS.MARK_AS_READ, { activity_id: activityId })
        .receive('error', () => logger.error('Mark as read failed'))
        .receive('timeout', () => logger.error('Mark as read timeout'));
    }
  }

  markAsUnread = ({ userId, activityId }) => {
    const _channel = this._getChannel(userId);
    if (_channel) {
      _channel.push(this._EVENT_IDS.MARK_AS_UNREAD, { activity_id: activityId })
        .receive('error', () => logger.error('Mark as unread failed'))
        .receive('timeout', () => logger.error('Mark as unread timeout'));
    }
  }

  markAllAsRead = (userId) => {
    const _channel = this._getChannel(userId);
    if (_channel) {
      _channel.push(this._EVENT_IDS.MARK_ALL_AS_READ)
        .receive('error', () => logger.error('Mark all as read failed'))
        .receive('timeout', () => logger.error('Mark all as read timeout'));
    }
  }

  _getChannel = (userId) => {
    return this._getExistingChannel({
      endpoint: `${this._socketDomain}/socket`,
      topic: `dispatcher:${userId}`,
    });
  }

  _handleStartService = ({ serviceId, eventIds, options }) => {
    const { _EVENT_IDS: { ACTIVITIES, ACTIVITY } } = this;
    const { userId } = options;

    this._startService({
      serviceId,
      channelInfos: [
        {
          topic: `dispatcher:${userId}`,
          channelSubject: this._notificationSubjects.dispatcherChannel,
          listenerInfos: !eventIds
            ? null
            : eventIds.reduce((listenerInfos, eventId) => {
              switch (eventId) {
                case ACTIVITIES:
                  listenerInfos.push({
                    event: eventId,
                    listenerSubject: this._notificationSubjects.activitiesEventListener,
                  });
                  break;
                case ACTIVITY:
                  listenerInfos.push({
                    event: eventId,
                    listenerSubject: this._notificationSubjects.activityEventListener,
                  });
                  break;
                default:
              }
              return listenerInfos;
            }, []),
        }
      ],
      options,
    });
  }
}

export const  notificationWebSocketService = new NotificationWebSocketService();
