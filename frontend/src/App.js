import React, { useState } from "react";
import axios from "axios";
import background from "./assests/Movies_img.jpg"; // ✅ Import the image

function App() {
  const [movieName, setMovieName] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [directorRecommendations, setDirectorRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [directorError, setDirectorError] = useState("");

  const fetchRecommendations = async () => {
    setError("");
    setRecommendations([]);
    try {
      const response = await axios.post("http://127.0.0.1:5000/recommend_movies", { movie_name: movieName });
      setRecommendations(response.data);
    } catch (err) {
      setError("Movie not found. Try another title.");
    }
  };

  const fetchDirectorRecommendations = async () => {
    setDirectorError("");
    setDirectorRecommendations([]);
    try {
      const response = await axios.post("http://127.0.0.1:5000/director_related", { movie_name: movieName });
      setDirectorRecommendations(response.data);
    } catch (err) {
      setDirectorError("No other movies found by this director.");
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${background})`, // ✅ Set background image
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "white", // Ensure text is visible
        overflow: "hidden", // Prevent overall page overflow
      }}
    >
      <h1>Movie Recommendation System</h1>
      <input 
        type="text" 
        placeholder="Enter movie name" 
        value={movieName} 
        onChange={(e) => setMovieName(e.target.value)} 
        style={{ padding: "10px", width: "300px", fontSize: "16px" }} 
      />
      <div style={{ marginTop: "10px" }}>
        <button onClick={fetchRecommendations} style={{ padding: "10px", margin: "5px" }}>Get Recommendations</button>
        <button onClick={fetchDirectorRecommendations} style={{ padding: "10px", margin: "5px" }}>Director Related Movies</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {recommendations.length > 0 && (
        <div 
          style={{
            maxHeight: "300px", 
            overflowY: "auto", 
            backgroundColor: "rgba(0, 0, 0, 0.7)", 
            padding: "10px",
            borderRadius: "10px",
            width: "80%",
            marginTop: "20px"
          }}
        >
          <h2>Recommended Movies</h2>
          <ul>
            {recommendations.map((movie, index) => (
              <li key={index}><b>{movie.title}</b> - {movie.overview}</li>
            ))}
          </ul>
        </div>
      )}

      {directorError && <p style={{ color: "red" }}>{directorError}</p>}

      {directorRecommendations.length > 0 && (
        <div 
          style={{
            maxHeight: "300px", 
            overflowY: "auto", 
            backgroundColor: "rgba(0, 0, 0, 0.7)", 
            padding: "10px",
            borderRadius: "10px",
            width: "80%",
            marginTop: "20px"
          }}
        >
          <h2>Movies by the Same Director</h2>
          <ul>
            {directorRecommendations.map((movie, index) => (
              <li key={index}><b>{movie.title}</b> - {movie.overview}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
