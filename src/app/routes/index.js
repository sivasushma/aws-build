import express from 'express';
import OTPRoutes from './otps_route';


import {
  UserSecureRoutes,
  UserOpenRoutes,
  UtilityRoutes,
} from './users_route';

const SecureRouter = express.Router();
const OpenRouter = express.Router();
const UtilityRouter = express.Router();

SecureRouter

    .use('/users', UserSecureRoutes);

UtilityRouter
    .use('/utils', UtilityRoutes);

OpenRouter
    .use('/users', UserOpenRoutes)
    .use('/otps', OTPRoutes);

export {
  SecureRouter as SecureRoutes,
  OpenRouter as OpenRoutes,
  UtilityRouter as UtilityRoutes,
};
