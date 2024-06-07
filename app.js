import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoutes from './Routes/user.route.js';
import errorMiddleware from './middleware/error.middleware.js';
import CourseRoute from './Routes/course.route.js'
import PaymentRouter from './Routes/payment.route.js'
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(cookieParser());
//moragn is use to check the logs
  app.use(morgan('dev'))
app.use('/ping', (req, res) => {
    res.send('/pong');
});
app.use('/api/v1/user',userRoutes)
app.use('/api/v1/course',CourseRoute)
app.use('/api/v1/payments',PaymentRouter);

app.all('*', (req, res) => {
    res.status(404).send('Oops!! 404 page not found');
});


app.use(errorMiddleware);
export default app;
