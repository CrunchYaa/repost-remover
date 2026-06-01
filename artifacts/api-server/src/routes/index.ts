import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import licenseRouter from "./license";
import adminRouter from "./admin";
import accountRouter from "./account";
import tiktokOauthRouter from "./tiktok-oauth";
import repostsRouter from "./reposts";
import automationRouter from "./automation";
import settingsRouter from "./settings";
import statsRouter from "./stats";
import logsRouter from "./logs";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/license", licenseRouter);
router.use("/admin", adminRouter);
router.use(accountRouter);
router.use(tiktokOauthRouter);
router.use(repostsRouter);
router.use(automationRouter);
router.use(settingsRouter);
router.use(statsRouter);
router.use(logsRouter);

export default router;
