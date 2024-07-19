import React from 'react';
import './News.css';

const News = ({ news }) => {
  return (
    <div className='news-container'>
      <div className='news-image'>
        <img src={news.image} alt='news' />
      </div>
      <div className='news-content'>
        <h1>{news.title}</h1>
        <p className='publication-date'>{new Date(news.publicationDate).toLocaleDateString()}</p>
        <p>{news.content}</p>
      </div>
    </div>
  );
}

export default News;