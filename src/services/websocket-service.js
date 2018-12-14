import { Socket } from 'phoenix';
import { logger } from '../common/logger';

export class WebsocketService {
    get _socketDomain() {
      const _apiHost = global.environment.apiHost;

      if (_apiHost.startsWith('http://')) {
          return _apiHost.replace('http://', 'ws://');
      }
      else if (_apiHost.startsWith('https://')) {
          return _apiHost.replace('https://', 'wss://');
      }

      return null;
    }
    /**
     * Track which socket/channel is sharing for services.
     * Keep necessary info to re-start a listener.
     * DataType: Map<string, {
        socket: Socket,
        endpoint: string,
        listeners: Array<{
          event: string;
          topic: string;
          channel: Channel;
          subject: Subject<any>;
          isActive: boolean;
          setupChannelFunc?: (channel: Channel) => void;
        }>,
      }>()
     */
    _services = new Map();

    isStartedService = (serviceId) => {
      return this._services.has(serviceId);
    }

    startService = ({ serviceId, eventIds, socketToken, options }) => {
      const _service = this._services.get(serviceId);

      if (!this._handleStartService || _service) { return; }

      this._handleStartService({
        serviceId,
        eventIds,
        options: {
          socket_token: socketToken,
          company_slug: global.environment.slug,
          ...options,
        },
      });
    }

    stopService = (serviceId) => {
      const _service = this._services.get(serviceId);

      if (_service) {
        if (this._isSharingSocket({
            socket: _service.socket,
            exceptedServiceId: serviceId,
        })) {
            _service.listeners.forEach((listener) => {
                if (this._isSharingChannel({
                    channel: listener.channel,
                    exceptedServiceId: serviceId,
                })) {
                    listener.channel.off(listener.event);
                } else {
                    listener.channel.leave();
                }
            });
        } else {
            _service.socket.disconnect();
        }

        this._services.delete(serviceId);
      }
    }

    startListeners = ({ serviceId, eventIds }) => {
      const _service = this._services.get(serviceId);

      if (_service) {
        _service.listeners.forEach((listener) => {
            if (eventIds.indexOf(listener.event) > -1 && !listener.isActive) {
                listener.channel.on(listener.event, (message) => {
                    listener.subject.next(message);
                });

                if (listener.setupChannelFunc) { listener.setupChannelFunc(listener.channel); }

                listener.isActive = true;
            }
        });
      }
    }

    stopListeners = ({ serviceId, eventIds }) => {
      const _service = this._services.get(serviceId);

      if (_service) {
        _service.listeners.forEach((listener) => {
            if (eventIds.indexOf(listener.event) > -1 && listener.isActive) {
                listener.channel.off(listener.event);
                listener.isActive = false;
            }
        });
      }
    }

    _handleStartService = ({ serviceId, eventIds, options }) => {
      // _handleStartService is used inside startService. It allow driven class to handle the way to start serives itself.
      throw new Error('Require to implement _handleStartService()');
    }

    /**
     *
     * DataType: {
        serviceId: string,
        channelInfos: Array<{
            topic: string,
            channelSubject: Subject<any>,
            listenerInfos: Array<{
                event: string,
                listenerSubject: Subject<any>,
            }>,
        }>
        options?: any,
    }
     */
    _startService = ({ serviceId, channelInfos, options }) => {
      const _endpoint = `${this._socketDomain}/socket`;
      const _socket = this._getExistingSocket(_endpoint)
          || this._createSocket({
              endpoint: _endpoint,
              options: { params: { ...options } },
          });

      const _listeners = [];

      channelInfos.forEach((channelInfo) => {
          const { topic, channelSubject, listenerInfos } = channelInfo;

          const _channel = this._getExistingChannel({ endpoint: _endpoint, topic })
              || this._createChannel({
                  topic,
                  socket: _socket,
                  subject: channelSubject,
              });

          if (listenerInfos) {
              listenerInfos.forEach((listenerInfo) => {
                  const { event, listenerSubject } = listenerInfo;

                  _listeners.push(this._createListener({
                      event,
                      topic,
                      channel: _channel,
                      subject: listenerSubject,
                  }));
              });
          }
      });

      this._registerService({
          serviceId,
          socket: _socket,
          endpoint: _endpoint,
          listeners: _listeners,
      });
    }

    _isSharingSocket = ({ socket, exceptedServiceId }) => {
      let isSharing = false;

      this._services.forEach((item, key) => {
        if (key !== exceptedServiceId && item.socket === socket) {
            isSharing = true;
        }
      });
      return isSharing;
    }

    _isSharingChannel = ({ channel, exceptedServiceId }) => {
      let isSharing = false;

      this._services.forEach((item, key) => {
        if (key !== exceptedServiceId && item.listeners) {
            item.listeners.forEach((listener) => {
                if (listener.channel === channel) { isSharing = true; }
            });
        }
      });
      return isSharing;
    }

    _getExistingSocket = (endpoint) => {
      let socket;
      this._services.forEach((item) => {
        if (item.endpoint === endpoint) { socket = item.socket; }
      });

      return socket;
    }

    _getExistingChannel = ({ endpoint, topic }) => {
      let channel;

      this._services.forEach((item) => {
        if (item.endpoint === endpoint && item.listeners) {
          item.listeners.forEach((listener) => {
              if (listener.topic === topic) {
                  channel = listener.channel;
              }
          });
        }
      });

      return channel;
    }
    /**
     *
     * DataType: {
        subject: Subject<T>,
        endpoint: string,
        options: {
            params: object,
            logger: (kind, msg, data) => void,
            transport: string,
            encode: (payload, callback) => void,
            decode: (payload, callback) => void,
            timeout: number,
            longpollerTimeout: number,
            heartbeatIntervalMs: number,
            reconnectAfterMs: number,
        },
        setupFunc: (socket: Socket) => void,
    }
     */
    _createSocket = ({
      subject,
      endpoint,
      options,
      setupFunc,
    }) => {
      const socket = new Socket(endpoint, options);
      socket.onOpen(() => {
        logger.log(endpoint, 'connection opened');
      });
      socket.onMessage((message) => {
        if (subject) { subject.next(message); }
      });
      socket.onError((error) => {
        if (subject) { subject.next({status: 'error'}); }
        logger.error(endpoint, error);
      });
      socket.onClose(() => {
        logger.log(endpoint, 'connection closed');
      });

      if (setupFunc) { setupFunc(socket); }

      socket.connect();

      return socket;
    }
    /**
     * DataType: {
        socket: Socket,
        topic: string,
        setupFunc?: (channel: Channel) => void,
        subject?: Subject<any>
    }
     */
    _createChannel = ({
      socket,
      topic,
      setupFunc,
      subject,
    }) => {
      const _logKey = {
        endpoint: socket.endPointURL().split('/websocket')[0],
        topic,
      };
      if (subject) {
        subject.next({ status: 'connecting' });
      }
      const channel = socket.channel(topic);
      channel.onError((error) => {
        if (subject) {
            subject.next({ status: 'error' });
        }
        logger.error(_logKey, error);
      });
      channel.onClose(() => {
        logger.log(_logKey, 'channel closed');
      });

      if (setupFunc) { setupFunc(channel); }

      channel.join()
      .receive('ok', () => {
        if (subject) {
            subject.next({ status: 'connected' });
        }
        logger.log(_logKey, 'joined successfully');
      })
      .receive('error', (error) => {
        if (subject) {
            subject.next({ status: 'error' });
        }
        logger.error(_logKey, 'failed join', error);
      })
      .receive('timeout', (error) => {
        if (subject) {
          subject.next({ status: 'error' });
        }
        logger.error(_logKey, 'timeout', error);
      });

      return channel;
    }
    /**
     * DataType: {
        event: string,
        topic: string,
        channel: Channel,
        subject: Subject<any>,
        setupChannelFunc?: (channel: Channel) => void,
    }
     */
    _createListener = ({
      event,
      topic,
      channel,
      subject,
      setupChannelFunc,
    }) => {
      channel.on(event, (message) => {
        if (message) {
            subject.next(message);
        }
      });

      return {
        event,
        topic,
        channel,
        subject,
        setupChannelFunc,
        isActive: true ,
      };
    }
    /**
     * DataType: {
        serviceId: string,
        socket: Socket,
        endpoint: string,
        listeners: Array<{
          event: string;
          topic: string;
          channel: Channel;
          subject: Subject<any>;
          isActive: boolean;
          setupChannelFunc?: (channel: Channel) => void;
      }>,
    }
     */
    _registerService = ({
      serviceId,
      socket,
      endpoint,
      listeners,
    }) => {
      if (this._services.has(serviceId)) { return; }

      this._services.set(serviceId, { socket, endpoint, listeners });
    }
}
