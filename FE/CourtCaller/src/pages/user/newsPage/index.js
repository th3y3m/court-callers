import { memo, useEffect, useState } from "react";
import newImg from "assets/users/images/featured/news.jpg";
import "./style.scss"
import News from "./news";

const NewsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalNews, setTotalNews] = useState(0);

  const itemsPerPage = 6;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://courtcaller.azurewebsites.net/api/News/NewsPage?pageNumber=${currentPage}&pageSize=${itemsPerPage}&IsHomepageSlideshow=false&status=Active`
        );
        const data = await response.json();
        console.log("data", data);
        setNews(data.data);
        setTotalNews(data.total);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [currentPage]);

  const totalPages = Math.ceil(totalNews / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div style={{backgroundColor: "#EAECEE"}}>
      <div className="container">
        <div className="hero_banner_container">
          <div className="hero_banner">
            <div className="hero_text">
              <h2>
                {" "}
                UPDATE
                <br />
                THE LATEST NEWS
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="view_news">
        <h1>News Page</h1>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        <div className="row news_container">
          {news.map((newsItem, index) => (
            <div className="news_details" key={index}>
              <News news={newsItem} />
            </div>
          ))}
        </div>

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(NewsPage);