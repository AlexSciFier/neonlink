const contexts = {};

class AppContext {

  get hasAdminUser() {
    return contexts.hasAdminUser;
  }

  get hasAnyUser() {
    return contexts.hasAnyUser;
  }

  get request() {
    return contexts.request;
  }

  get secrets() {
    return contexts.secrets;
  }

  get settings() {
    return contexts.settings;
  }

  get stores() {
    return contexts.stores;
  }

  set hasAdminUser(value) {
    contexts.hasAdminUser = value;
  }

  set hasAnyUser(value) {
    contexts.hasAnyUser = value;
  }

  set request(value) {
    if (contexts.request) {
      throw new Error("Request already initialized.");
    }
    contexts.request = value;
  }

  set secrets(value) {
    if (contexts.secrets) {
      throw new Error("Secrets already initialized.");
    }
    contexts.secrets = value;
  }

  set settings(value) {
    if (contexts.settings) {
      throw new Error("Settings already initialized.");
    }
    contexts.settings = value;
  }

  set stores(value) {
    if (contexts.stores) {
      throw new Error("Stores already initialized.");
    }
    contexts.stores = value;
  }
}

export const appContext = new AppContext();