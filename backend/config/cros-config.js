app.use(cors({
    origin: "https://ai-interview-prepration-eta.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));