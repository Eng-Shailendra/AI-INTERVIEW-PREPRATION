app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://ai-interview-prepration-eta.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));