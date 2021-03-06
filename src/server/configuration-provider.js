import dotenv from 'dotenv';

export default class ConfigurationProvider {
  constructor() {
    dotenv.config({ silent: true });
  }

  getConfiguration() {
    return {
      endpointId: process.env.ENDPOINT_ID,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      imageRetriever: process.env.IMAGE_RETRIEVER,
      logoUrl: process.env.LOGO_URL,
      office365GetPersonaPhotoCookie: process.env.OFFICE_365_GET_PERSONA_PHOTO_COOKIE
    };
  }
}
