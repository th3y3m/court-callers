using BusinessObjects;
using DAOs;
using DAOs.Helper;
using DAOs.Models;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class NewsService
    {
        private readonly NewsRepository newsRepository = null;

        public NewsService()
        {
            if (newsRepository == null)
            {
                newsRepository = new NewsRepository();
            }
        }

        public async Task<(List<News>, int total)> GetNews(PageResult pageResult, string searchQuery = null) => await newsRepository.GetNews(pageResult, searchQuery);

        public async Task<(List<News>, int total)> GetNews(PageResult pageResult, bool IsHomepageSlideshow, string status, string searchQuery = null) => await newsRepository.GetNews(pageResult, IsHomepageSlideshow, status, searchQuery);

        public News GetNew(string id) => newsRepository.GetNew(id);
        public News AddNew(NewsModel news) => newsRepository.AddNew(news);
        public News UpdateNew(string id, NewsModel news) => newsRepository.UpdateNew(id, news);
        public void DeleteNew(string id) => newsRepository.DeleteNew(id);

        public List<News> ShowSlideShowImage() => newsRepository.ShowSlideShowImage();
    }
}
