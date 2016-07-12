import winston from 'winston';
import AccessTokenRetriever from './access-token-retriever';
import ConfigurationProvider from './configuration-provider';
import WebServer from './web-server';
import SampleUsersRetriever from './sample-users-retriever';
import WindowsGraphUsersRetriever from './windows-graph-users-retriever';

export default class Main {
  constructor() {
    this.configuration = new ConfigurationProvider().getConfiguration();

    this.directoryItems = [];
    this.isRefreshing = false;
  }

  start() {
    return this.refreshData()
      .then(() => new WebServer(
          this.directoryItems,
          () => this.refreshData(),
          this.configuration.logoUrl)
        .start())
      .catch(err => {
        winston.error(err);
        process.exit(-1); // eslint-disable-line no-process-exit, no-magic-numbers
      });
  }

  refreshData() {
    if (!this.configuration.endpointId) {
      winston.warn('process.env.ENDPOINT_ID is not set, using SampleUsersRetriever ...');

      return new SampleUsersRetriever()
        .getUsers(50, 4) // eslint-disable-line no-magic-numbers
        .then(users => {
          this.directoryItems = users;
        });
    }

    if (this.isRefreshing) {
      return Promise.resolve(true);
    }

    this.isRefreshing = true;

    return new AccessTokenRetriever()
      .getAccessToken(
        this.configuration.endpointId,
        this.configuration.clientId,
        this.configuration.clientSecret)
      .then(accessToken => new WindowsGraphUsersRetriever()
        .getUsers(this.configuration.endpointId, accessToken))
      .then(users => {
        this.directoryItems = users;
        this.isRefreshing = false;
      })
      .catch(x => {
        this.isRefreshing = false;
        return x;
      });
  }
}
