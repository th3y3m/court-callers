using BusinessObjects;
using DAOs;
using DAOs.Helper;
using DAOs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories
{
    public class NewsRepository
    {
        private readonly NewsDAO newsDAO = null;

        public NewsRepository()
        {
            if (newsDAO == null)
            {
                newsDAO = new NewsDAO();
            }
        }

        public async Task<(List<News>, int total)> GetNews(PageResult pageResult, string searchQuery = null) => await newsDAO.GetNews(pageResult, searchQuery);

        public async Task<(List<News>, int total)> GetNews(PageResult pageResult, bool IsHomepageSlideshow, string status, string searchQuery = null) => await newsDAO.GetNews(pageResult, IsHomepageSlideshow, status, searchQuery);

        public News GetNew(string id) => newsDAO.GetNew(id);
        public News AddNew(NewsModel newsModel) 
        {
            News news = new News
            {
                NewId = "N" + GenerateId.GenerateShortBookingId(),
                Content = newsModel.Content,
                PublicationDate = DateTime.Now,
                Title = newsModel.Title,
                IsHomepageSlideshow = newsModel.IsHomepageSlideshow,
                Status = newsModel.Status,
                Image = newsModel.Image
            };
            newsDAO.AddNew(news);
            return news;
        }
        public News UpdateNew(string id, NewsModel news) => newsDAO.UpdateNew(id, news);
        public void DeleteNew(string id) => newsDAO.DeleteNew(id);

        public List<News> ShowSlideShowImage() => newsDAO.ShowSlideShowImage();
    }
}
