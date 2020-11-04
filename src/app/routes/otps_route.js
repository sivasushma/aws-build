import express from 'express';
import {OTPSController} from '../controllers/v1/index';
import {AuthenticationMiddleware} from '../middleware/index';

const Router = express.Router();

Router.route('/')
    .post(AuthenticationMiddleware.prototype.authenticate_user);

export default Router;
