import React from 'react';
import PropTypes from 'prop-types';
import * as moment from 'moment';
import { Position, Popover, PopoverInteractionKind } from '@blueprintjs/core';
import {
  prefixClass,
} from '../../../../common/index';
import './notification-item.scss';

export class NotificationItem extends React.PureComponent {
  markAs = () => {
    const {
      notification: { id, unread },
      markAsRead,
      markAsUnread,
    } = this.props;

    if (unread) {
      markAsRead(id);
    }
    else {
      markAsUnread(id);
    }
  }

  render() {
    const {
      props: {
        notification: { message, unread, published_at },
      },
      markAs,
      _formatDatetime,
    } = this;
    const customToolTip = (
      <div className={prefixClass('tooltip-container')}>
        <div className={prefixClass('tooltip-text')}>
          {unread ? 'Mark as Read' : 'Mark as Unread'}
        </div>
        <div className={prefixClass('triangle-up')} />
      </div>
    )

    return (
      <div className={[prefixClass('notification-item'), prefixClass(unread ? 'unread' : 'read')].join(' ')} >
        <div className={prefixClass('content')}>
          <div
            className={prefixClass('title')}
            dangerouslySetInnerHTML={{ __html: message }}
          />
          <Popover
            content={customToolTip}
            interactionKind={PopoverInteractionKind.HOVER}
            position={Position.LEFT}
            usePortal={false}
            minimal
          >
            <div
              className={prefixClass('circle-mark')}
              onClick={markAs}
            />
          </Popover>
        </div>
        <div className={prefixClass('sub-title')}>
          {_formatDatetime(published_at)}
        </div>
      </div>
    );
  }

  _formatDatetime = (date) => {
    const _date = moment(date);

    return _date.year < (new Date()).year
      ? _date.format('DD MMM YYYY, HH:mm').toUpperCase()
      : _date.format('DD MMM, HH:mm').toUpperCase()
  }
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.number,
    message: PropTypes.string,
    unread: PropTypes.bool,
    published_at: PropTypes.string,
  }).isRequired,
  markAsRead: PropTypes.func.isRequired,
  markAsUnread: PropTypes.func.isRequired,
};
