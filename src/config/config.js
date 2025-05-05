const config = {
    apiBaseUrl:
      process.env.NODE_ENV === "production"
        ? "https://quizmaker-task.onrender.com/api"
        : "http://127.0.0.1:5000/api",
  };
  
  export default config;
  
