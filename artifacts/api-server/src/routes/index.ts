import { Router, type IRouter } from "express";
import healthRouter from "./health";
import accountRouter from "./account";
import repostsRouter from "./reposts";
import automationRouter from "./automation";
import settingsRouter from "./settings";
import statsRouter from "./stats";
import logsRouter from "./logs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(accountRouter);
router.use(repostsRouter);
router.use(automationRouter);
router.use(settingsRouter);
router.use(statsRouter);
router.use(logsRouter);

export default router;
