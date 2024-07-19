import 'react-slideshow-image/dist/styles.css'
import React, { useEffect, useState } from 'react';
import { Fade } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css'



const SlideShowHomePage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `https://courtcaller.azurewebsites.net/api/News/SlideShowImage`
                );
                const data = await response.json();
                console.log("data", data);
                setNews(data ?? []);;
            } catch (err) {
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <div className="slide-container">
            <Fade duration={5000} transitionDuration={500}>
                {news.map((fadeImage, index) => (
                    <div key={index}>
                        <img style={{ width: '100%', height: '500px', objectFit: 'cover' }} src={fadeImage.image} />
                        {/* <h2>{fadeImage.title}</h2> */}
                    </div>
                ))}
            </Fade>
        </div>
    )
}
export default SlideShowHomePage;