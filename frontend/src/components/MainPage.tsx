import React, { useState } from "react";
import axios from "axios";

const MainPage: React.FC = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrCode, setQrCode] = useState("");

  const handleShortenUrl = async () => {
    try {
      const response = await axios({
        url: "http://localhost:3000/shorten",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { url },
      });

      const { data } = response;

      setShortUrl(data.shortUrl);
      setQrCode(data.qrCode);
    } catch (error) {
      console.error("Error shortening URL:", error);
    }
  };

  return (
    <div>
      <h1>URL Shortener</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL to shorten"
      />
      <button onClick={handleShortenUrl}>Shorten URL</button>
      {shortUrl && (
        <div>
          <h2>Shortened URL:</h2>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
            {shortUrl}
          </a>
        </div>
      )}
      {qrCode && (
        <div>
          <h2>QR Code:</h2>
          <img
            width={200}
            height={200}
            src={`data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`}
            alt="QR Code"
          />
        </div>
      )}
    </div>
  );
};

export default MainPage;
