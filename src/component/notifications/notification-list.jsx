import React from 'react'
import { NonIdealState } from '@blueprintjs/core';
import componentRegistry from './../../common/redux-util/component-registry'
import { notificationReducer } from './reducer/notification-list.reducer'
import {
  ACTIVITY_STORE_ID
} from './action/notification-list.constant';
import * as activityActions from './action/notification-list.action'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { InfiniteLoader, AutoSizer, List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { NotificationItem } from './presentation/notification-item/notification-item';
import rootSaga from './saga/notification-list.saga'
import './notification-list.scss'
import {
  prefixClass,
} from './../../common/index';

export class NotificationList extends React.Component {
  _userId;
  _resolveLoadMoreNotifications;
  _hasMore = true;
  constructor(props) {
    super(props);
    this._cellMeasurerCache = new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 100,
    });

    window.addEventListener('message', this._handlePostedMessage);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.pagination && nextProps.pagination &&
      this.props.pagination.start_id !== nextProps.pagination.start_id
      && this._resolveLoadMoreNotifications
    ) {
      this._resolveLoadMoreNotifications();
      this._resolveLoadMoreNotifications = null;
    }
    if (this.props.unread_count !== nextProps.unread_count) {
      this._postMessage({
        type: 'CHANGED_UNREAD_COUNT',
        unread_count: nextProps.unread_count < 0 ? 0 : nextProps.unread_count,
      });
    }
    return this.nextProps !== nextProps;
  }

  componentDidMount() {
    this._postMessage({ type: 'FRAME_LISTENING' });
  }

  componentWillUnmount() {
    const {
      props: {
        unsubscribeNotifications,
        resetNotifications,
      },
      _handlePostedMessage,
    } = this;

    unsubscribeNotifications();
    resetNotifications();

    window.removeEventListener('message', _handlePostedMessage);
  }

  closeNotifications = () => {
    this._postMessage({ type: 'CLOSE_NOTIFICATIONS' });
  }

  render() {
    const {
      props: { notifications },
      closeNotifications,
      _cellMeasurerCache,
      _renderVirtualListRow,
      _isRowLoaded,
      _loadMoreActivities,
      _markAllAsRead,
    } = this;

    const _hasNotifications = notifications && notifications.length > 0;

    return (
      <div className={prefixClass('notifications-feature')} >
        <div className={prefixClass('notification-header')}>
          <div className={prefixClass('title')}>Notifications</div>
          {
            _hasNotifications
              ? <a className={prefixClass('link')} onClick={_markAllAsRead}>Mark All As Read</a>
              : null
          }
          <button className={prefixClass('close')} onClick={closeNotifications}><i /></button>
        </div>
        <div className={prefixClass('notification-list')} >
          {
            _hasNotifications
              ? (
                <InfiniteLoader
                  isRowLoaded={_isRowLoaded}
                  loadMoreRows={_loadMoreActivities}
                  // BE can't return exactly limit of accessible activities.
                  rowCount={notifications.length + 2}
                >
                  {({ onRowsRendered, registerChild }) => (
                    <AutoSizer>
                      {
                        ({ width, height }) => {
                          return (
                            <List
                              ref={registerChild}
                              width={width}
                              height={height}
                              rowCount={notifications.length}
                              rowHeight={_cellMeasurerCache.rowHeight}
                              deferredMeasurementCache={_cellMeasurerCache}
                              rowRenderer={_renderVirtualListRow}
                              onRowsRendered={onRowsRendered}
                              dataSource={notifications}
                            />
                          )
                        }
                      }
                    </AutoSizer>
                  )}
                </InfiniteLoader>
              )
              : (
                <NonIdealState
                  icon="notifications"
                  title={'No Notifications'}
                />
              )
          }
        </div>
      </div >
    );
  }

  _markAsRead = (activityId) => {
    if (this._userId) {
      this.props.markAsRead({ userId: this._userId, activityId });
    }
  }

  _markAsUnread = (activityId) => {
    if (this._userId) {
      this.props.markAsUnread({ userId: this._userId, activityId });
    }
  }

  _markAllAsRead = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (this._userId) {
      this.props.markAllAsRead(this._userId);
    }
  }

  _loadMoreActivities = ({ startIndex, stopIndex }) => {
    const {
      notifications,
      pagination: { start_id, page_size, hasMore },
      loadNotifications,
    } = this.props;
    if (!hasMore || (notifications && notifications.length >= stopIndex + 1) || this._resolveLoadMoreNotifications) {
      return;
    }
    loadNotifications({
      userId: this._userId,
      startId: start_id,
      pageSize: page_size,
    });

    return new Promise(resolve => {
      this._resolveLoadMoreNotifications = resolve;
    });
  }

  _isRowLoaded = ({ index }) => {
    return !!this.props.notifications[index];
  }

  _renderVirtualListRow = ({ index, key, style, parent }) => {
    const {
      props: { notifications },
      _cellMeasurerCache,
      _markAsRead,
      _markAsUnread,
    } = this;

    return (
      <CellMeasurer
        key={notifications[index].id}
        cache={_cellMeasurerCache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        <div style={style}>
          <NotificationItem
            notification={notifications[index]}
            markAsRead={_markAsRead}
            markAsUnread={_markAsUnread}
          />
        </div>
      </CellMeasurer>
    );
  }

  _postMessage = (data) => {
    if (window.parent) {
      window.parent.postMessage(data, '*');
    }
  }

  _handlePostedMessage = (message) => {
    if (!message || !message.data || !message.data.type) { return; }

    switch (message.data.type) {
      case 'SUBSCRIBE_NOTIFICATIONS': {
        this._userId = message.data.userId;
        this.props.subscribeNotifications({
          userId: message.data.userId,
          socketToken: message.data.socketToken,
        });
        break;
      }
      default:

    }
  }
}

NotificationList.propTypes = {
  unsubscribeNotifications: PropTypes.func.isRequired,
  subscribeNotifications: PropTypes.func.isRequired,
  loadNotifications: PropTypes.func.isRequired,
  markAsRead: PropTypes.func.isRequired,
  markAsUnread: PropTypes.func.isRequired,
  markAllAsRead: PropTypes.func.isRequired,
  resetNotifications: PropTypes.func.isRequired,
  notifications: PropTypes.any,
  pagination: PropTypes.shape({
    start_id: PropTypes.number,
    page_size: PropTypes.number,
    hasMore: PropTypes.bool,
  }),
  unread_count: PropTypes.number,
}
componentRegistry.registerReducer(ACTIVITY_STORE_ID, notificationReducer);
componentRegistry.registerSaga(ACTIVITY_STORE_ID + '_SAGA', rootSaga);


const mapStateToProps = state => {
  console.log('============== mapStateToProps notifications list ', state)
  const {
    [ACTIVITY_STORE_ID]: { activities, pagination, unread_count },
  } = state;
  console.log('============== Finish mapStateToProps notifications list ')

  return { notifications: activities, pagination, unread_count };
}
const mapDispatchToProps = dispatch => {
  return {
    subscribeNotifications: ({ socketToken, userId }) => dispatch(activityActions.subscribeActivities({ socketToken, userId })),
    unsubscribeNotifications: () => dispatch(activityActions.unsubscribeActivities()),
    loadNotifications: ({ userId, startId, pageSize }) => dispatch(activityActions.loadMActivities({ userId, startId, pageSize })),
    markAsRead: ({ userId, activityId }) => dispatch(activityActions.markAsRead({ userId, activityId })),
    markAsUnread: ({ userId, activityId }) => dispatch(activityActions.markAsUnread({ userId, activityId })),
    markAllAsRead: (userId) => dispatch(activityActions.markAllAsRead(userId)),
    resetNotifications: () => dispatch(activityActions.resetActivities()),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationList)