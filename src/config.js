import {config} from 'dotenv'

config(); //leer las variables de entorno
 

export const PORT=process.env.PORT || 8080; 
export const MONGODB_URI=process.env.MONGODB_URI
export const STRIPE_SECRET_KEY=process.env.STRIPE_SECRET_KEY
export const GEMINI_API_KEY=process.env.GEMINI_API_KEY
export const CLOUDINARY_CLOUD_NAME=process.env.CLOUDINARY_CLOUD_NAME
export const CLOUDINARY_API_KEY=process.env.CLOUDINARY_API_KEY
export const CLOUDINARY_API_SECRET=process.env.CLOUDINARY_API_SECRET
export const RESEND_API_KEY=process.env.RESEND_API_KEY
export const GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID
export const SECRET_KEY=process.env.SECRET_KEY
export const REFRESH_SECRET_KEY=process.env.REFRESH_SECRET_KEY

export const EMAIL_USER=process.env.EMAIL_USER
export const EMAIL_PASS=process.env.EMAIL_PASS
export const URL=process.env.URL

