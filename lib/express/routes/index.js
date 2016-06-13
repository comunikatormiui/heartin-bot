import { Router } from 'express';
const router = new Router();

import Root       from './root';
import Webhook    from './webhook';
import Users      from './users';
import Bot        from './bot';

router.route('/').get(Root);
router.route('/webhook').get(Webhook);
router.route('/users').get(Users);
router.route('/bot').get(Bot);

export default router;
