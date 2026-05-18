import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); //Esta id te permite poder iniciar sesión con la api de google

export default client;