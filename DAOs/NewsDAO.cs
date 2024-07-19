using BusinessObjects;
using DAOs.Helper;
using DAOs.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs
{
    public class NewsDAO
    {
        private readonly CourtCallerDbContext _courtCallerDbContext = null;

        public NewsDAO()
        {
            if (_courtCallerDbContext == null)
            {
                _courtCallerDbContext = new CourtCallerDbContext();
            }
        }
        //public NewsDAO(CourtCallerDbContext dbContext)
        //{
        //    _courtCallerDbContext = dbContext;
        //}

        public async Task<(List<News>, int total)> GetNews(PageResult pageResult, string searchQuery = null)
        {
            var query = _courtCallerDbContext.News.OrderByDescending(News => News.PublicationDate).AsQueryable();

            var total = await _courtCallerDbContext.News.CountAsync();
            if (!string.IsNullOrEmpty(searchQuery))
            {
                query = query.Where(News => News.Content.Contains(searchQuery));
            }



            Pagination pagination = new Pagination(_courtCallerDbContext);
            List<News> reviews = await pagination.GetListAsync<News>(query, pageResult);
            return (reviews, total);
        }

        public News GetNew(string id)
        {
            return _courtCallerDbContext.News.FirstOrDefault(m => m.NewId.Equals(id));
        }

        public News AddNew(News news)
        {
            _courtCallerDbContext.News.Add(news);
            _courtCallerDbContext.SaveChanges();
            return news;
        }

        public News UpdateNew(string id, NewsModel news)
        {
            var oNews = GetNew(id);

            oNews.Title = news.Title;
            oNews.Content = news.Content;
            oNews.Image = news.Image;
            oNews.Status = news.Status;
            oNews.IsHomepageSlideshow = news.IsHomepageSlideshow;
            
            if (oNews != null)
            {
                _courtCallerDbContext.Update(oNews);
                _courtCallerDbContext.SaveChanges();
            }
            return oNews;
        }

        public void DeleteNew(string id)
        {
            News oNews = GetNew(id);
            if (oNews != null)
            {
                oNews.Status = "Deleted";
                _courtCallerDbContext.Update(oNews);
                _courtCallerDbContext.SaveChanges();
            }
        }

        public async Task<(List<News>, int total)> GetNews(PageResult pageResult, bool IsHomepageSlideshow, string status, string searchQuery = null)
        {

            var query = _courtCallerDbContext.News.Where(m => m.IsHomepageSlideshow == IsHomepageSlideshow && m.Status == status).OrderByDescending(News => News.PublicationDate).AsQueryable();

            var total = await _courtCallerDbContext.News.Where(m => m.IsHomepageSlideshow == IsHomepageSlideshow && m.Status == status).OrderByDescending(News => News.PublicationDate).CountAsync();
            if (!string.IsNullOrEmpty(searchQuery))
            {
                query = query.Where(news => news.Content.Contains(searchQuery) ||
                                            news.Title.Contains(searchQuery));
            }



            Pagination pagination = new Pagination(_courtCallerDbContext);
            List<News> reviews = await pagination.GetListAsync<News>(query, pageResult);
            return (reviews, total);
        }

        public List<News> ShowSlideShowImage()
        {
            return _courtCallerDbContext.News.Where(m => m.IsHomepageSlideshow == true && m.Status == "Active").ToList();
        }
    }
}
