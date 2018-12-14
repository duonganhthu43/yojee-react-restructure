import { NOTIFICATION_TYPES } from '../model/notification-type';


export class NotificationService {
  transformActivity = (data) => {
    if (!data) { return null; }
    switch (data.type) {
      case NOTIFICATION_TYPES.DRIVER_REPORTED_TASK:
        return this._transformDriverReportedTaskActivity(data);
      case NOTIFICATION_TYPES.DRIVER_REJECTED_TASK_GROUP:
        return this._transformDriverRejectedTaskGroupActivity(data);
      case NOTIFICATION_TYPES.PARTNER_REPORTED_ITEM:
        return this._transformPartnerReportedItemActivity(data);
      case NOTIFICATION_TYPES.PARTNER_REJECTED_TRANSFER:
        return this._transformPartnerRejectedTransferActivity(data);
      case NOTIFICATION_TYPES.COMPANY_CREATED_TRANSFER:
        return this._transformCompanyCreatedTransferActivity(data);
      case NOTIFICATION_TYPES.COMPANY_SENT_PARTNERSHIP_INVITATION:
        return this._transformCompanySentPartnershipInvitationActivity(data);
      case NOTIFICATION_TYPES.COMPANY_ACCEPTED_PARTNERSHIP_INVITATION:
        return this._transformCompanyAcceptedPartnershipInvitationActivity(data);
      case NOTIFICATION_TYPES.COMPANY_REJECTED_PARTNERSHIP_INVITATION:
        return this._transformCompanyRejectedPartnershipInvitationActivity(data);
      case NOTIFICATION_TYPES.BROADCAST_TIMEOUT:
        return this._transformBroadcastTimeoutActivity(data);
      default:
        return null;
    }
  }

  _transformDriverReportedTaskActivity = (data) => {
    const {
      id,
      actor,
      object,
      unread,
      published_at,
    } = data;

    let _taskType;
    switch (object.type) {
      case 'pick_up_task':
        _taskType = 'Pick up Task'
        break;
      case 'drop_off_task':
        _taskType = 'Drop off Task'
        break;
      default:
    }

    return {
      id,
      message: `<strong>Driver ${actor.name}</strong> reported <strong>${_taskType} ${object.name}</strong>.`,
      unread,
      published_at,
    };
  }

  _transformDriverRejectedTaskGroupActivity = (data) => {
    const {
      id,
      actor,
      object,
      unread,
      published_at,
    } = data;

    return {
      id,
      message: `<strong>Driver ${actor.name}</strong> rejected <strong>Task Group ${object.name}</strong>.`,
      unread,
      published_at,
    };
  }

  _transformPartnerReportedItemActivity = (data) => {
    const {
      id,
      actor,
      object,
      unread,
      published_at,
    } = data;

    let _taskType;
    switch (object.type) {
      case 'pick_up_item':
        _taskType = `Pick up of Item`
        break;
      case 'drop_off_item':
        _taskType = `Drop off of Item`
        break;
      default:
    }

    return {
      id,
      message: `<strong>Partner ${actor.name}</strong> reported <strong>${_taskType} ${object.name}</strong>.`,
      unread,
      published_at,
    };
  }

  _transformPartnerRejectedTransferActivity = (data) => {
    const {
      id,
      actor: { name },
      unread,
      published_at,
    } = data;

    return {
      id,
      message: `<strong>Partner ${name}</strong> rejected your transfer.`,
      unread,
      published_at,
    };
  }

  _transformCompanyCreatedTransferActivity = (data) => {
    const {
      id,
      actor,
      object,
      unread,
      published_at,
    } = data;

    let _transferType;
    switch (object.type) {
      case 'order':
        _transferType = `Order`;
        break;
      default:
    }

    return {
      id,
      message: `<strong>Partner ${actor.name}</strong> transferred <strong>${_transferType} ${object.name}</strong>.`,
      unread,
      published_at,
    };
  }

  _transformCompanySentPartnershipInvitationActivity = (data) => {
    const {
      id,
      actor,
      unread,
      published_at,
    } = data;

    return {
      id,
      message: `<strong>Company ${actor.name}</strong> invited you to connect. Accept invite to receive orders from <strong>Company ${actor.name}</strong>.`,
      unread,
      published_at,
    };
  }

  _transformCompanyAcceptedPartnershipInvitationActivity = (data) => {
    const {
      id,
      actor: { name },
      unread,
      published_at,
    } = data;

    return {
      id,
      message: `<strong>Company ${name}</strong> accepted your invitation to connect.`,
      unread,
      published_at,
    };
  }

  _transformCompanyRejectedPartnershipInvitationActivity = (data) => {
    const {
      id,
      actor: { name },
      unread,
      published_at,
    } = data;

    return {
      id,
      message: `<strong>Company ${name}</strong> rejected your invitation to connect.`,
      unread,
      published_at,
    };
  }

  _transformBroadcastTimeoutActivity = (data) => {
    const {
      id,
      object: { name },
      unread,
      published_at,
    } = data;

    return {
      id,
      message: `<strong>Broadcast timeout</strong> for <strong>Task Group ${name}</strong>`,
      unread,
      published_at,
    };
  }
}

export const notificationService = new NotificationService();
