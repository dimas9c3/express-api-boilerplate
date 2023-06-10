import { Router } from "express";

const appRoutes = Router();
appRoutes.get("/", (req, res) => {
    return res.status(200).json({ 'status': true, 'code': 200, message: 'Express JS API' });
});

export { appRoutes };
